"use server";

import { prisma } from "@/lib/prisma";
import { ProjectStatus } from "@prisma/client";
import type { CalculatorInput } from "@/lib/calculator";
import { parseProjectConfig, assertProjectConfig } from "@/lib/project-config-schema";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { logActivity } from "@/lib/activity";
import { hashProjectConfig } from "@/lib/project-integrity";
import { requireAdminSession, UnauthorizedError } from "@/lib/auth";

export async function getSavedProjects() {
  try {
    await requireAdminSession();
    const projects = await prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
      include: { client: true },
    });
    return projects.map((p) => {
      const config = parseProjectConfig(p.config);
      return {
        id: p.id,
        name: p.name,
        clientName:
          p.client && p.client.firstName !== "Unknown"
            ? `${p.client.firstName} ${p.client.lastName}`
            : config.proposal?.clientName || "Unknown Client",
        clientCompany: p.client?.company || null,
        config,
        lastModified: p.updatedAt.getTime(),
        isApproved: !!p.approvedAt,
        status: p.status,
        signedBy: p.signedBy,
        approvedAt: p.approvedAt,
      };
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) return [];
    console.error("Failed to fetch projects:", error);
    return [];
  }
}

export async function updateProjectStatusAction(id: string, status: string) {
  try {
    await requireAdminSession();
    const project = await prisma.project.update({
      where: { id },
      data: { status: status as ProjectStatus },
      include: { client: true },
    });

    await logActivity({
      clientId: project.clientId,
      projectId: id,
      type: "status_change",
      action: `Project status updated to ${status}`,
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof UnauthorizedError) return { success: false, error: error.message };
    console.error("Failed to update status:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function saveProjectAction(data: {
  id: string;
  name: string;
  client: string;
  config: CalculatorInput;
}) {
  try {
    await requireAdminSession();
    const config = assertProjectConfig(data.config);
    const fullClientName = config.proposal?.clientName || "Unknown Client";
    let firstName = config.proposal?.clientFirstName;
    let lastName = config.proposal?.clientLastName;

    if (!firstName || !lastName) {
      const parts = fullClientName.trim().split(/\s+/);
      if (parts.length > 0) {
        firstName = firstName || parts[0];
        lastName = lastName || (parts.slice(1).join(" ") || "Client");
      } else {
        firstName = firstName || "Unknown";
        lastName = lastName || "Client";
      }
    }

    const company = config.proposal?.clientCompany || null;

    const existingProject = await prisma.project.findUnique({ where: { id: data.id } });
    let clientId = existingProject?.clientId;

    if (clientId) {
      await prisma.client.update({
        where: { id: clientId },
        data: {
          firstName,
          lastName,
          ...(company ? { company } : {}),
        },
      });
    } else {
      const newClient = await prisma.client.create({
        data: { firstName, lastName, company },
      });
      clientId = newClient.id;
    }

    await prisma.project.upsert({
      where: { id: data.id },
      update: {
        name: data.name,
        clientId: clientId,
        config: config as object,
      },
      create: {
        id: data.id,
        name: data.name,
        clientId: clientId,
        config: config as object,
      },
    });

    await logActivity({
      clientId: clientId,
      projectId: data.id,
      type: "creation",
      action: existingProject
        ? "Project configuration updated"
        : "New project configuration saved",
    });

    revalidatePath("/");
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof UnauthorizedError) return { success: false, error: error.message };
    console.error("Failed to save project:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/** PUBLIC — client signing on /p/[id] */
export async function approveProjectAction(id: string, signatureName: string) {
  try {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) throw new Error("Project not found");

    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for") || "unknown";
    const userAgent = headerList.get("user-agent") || "unknown";

    const hash = hashProjectConfig(project.config);

    await prisma.project.update({
      where: { id },
      data: {
        approvedAt: new Date(),
        signedBy: signatureName,
        ipAddress: ip,
        userAgent: userAgent,
        snapshotHash: hash,
      },
    });

    await logActivity({
      clientId: project.clientId,
      projectId: id,
      type: "approval",
      action: `Project approved and signed by ${signatureName}`,
      details: { ip, userAgent, hash },
    });
    revalidatePath(`/p/${id}`);
    revalidatePath("/");
    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to approve project:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function deleteProjectAction(id: string) {
  try {
    await requireAdminSession();
    await prisma.project.delete({ where: { id } });
    revalidatePath("/");
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof UnauthorizedError) return { success: false, error: error.message };
    console.error("Failed to delete project:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function unlockProjectAction(id: string) {
  try {
    await requireAdminSession();
    await prisma.project.update({
      where: { id },
      data: {
        approvedAt: null,
        signedBy: null,
        snapshotHash: null,
        ipAddress: null,
        userAgent: null,
      },
    });

    const project = await prisma.project.findUnique({ where: { id } });
    if (project) {
      await logActivity({
        clientId: project.clientId,
        projectId: id,
        type: "status_change",
        action: "Project unlocked (approval revoked)",
      });
    }
    revalidatePath(`/p/${id}`);
    revalidatePath("/");
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof UnauthorizedError) return { success: false, error: error.message };
    console.error("Failed to unlock project:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

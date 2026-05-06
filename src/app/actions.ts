"use server";

import { prisma } from "@/lib/prisma";
import type { CalculatorInput } from "@/lib/calculator";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createHash } from "crypto";

export async function getSavedProjects() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { client: true }
    });
    return projects.map((p: any) => ({
      id: p.id,
      name: p.name,
      client: p.client ? (p.client.company || `${p.client.firstName} ${p.client.lastName}`) : 'Unknown Client',
      config: p.config as unknown as CalculatorInput,
      lastModified: p.updatedAt.getTime(),
      isApproved: !!p.approvedAt,
      status: p.status,
      signedBy: p.signedBy,
      approvedAt: p.approvedAt,
    }));
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return [];
  }
}

export async function updateProjectStatusAction(id: string, status: string) {
  try {
    await prisma.project.update({
      where: { id },
      data: { status }
    });
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update status:", error);
    return { success: false, error: error.message };
  }
}

export async function saveProjectAction(data: { id: string, name: string, client: string, config: any }) {
  try {
    const firstName = data.config.proposal?.clientFirstName || 'Unknown';
    const lastName = data.config.proposal?.clientLastName || 'Client';
    const company = data.config.proposal?.clientCompany || null;

    const existingProject = await prisma.project.findUnique({ where: { id: data.id } });
    let clientId = existingProject?.clientId;

    if (clientId) {
      await prisma.client.update({
        where: { id: clientId },
        data: { 
          firstName, 
          lastName, 
          ...(company ? { company } : {}) 
        }
      });
    } else {
      const newClient = await prisma.client.create({
        data: { firstName, lastName, company }
      });
      clientId = newClient.id;
    }

    await prisma.project.upsert({
      where: { id: data.id },
      update: {
        name: data.name,
        clientId: clientId,
        config: data.config,
      },
      create: {
        id: data.id,
        name: data.name,
        clientId: clientId,
        config: data.config,
      }
    });
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to save project:", error);
    return { success: false, error: error.message || String(error) };
  }
}

export async function approveProjectAction(id: string, signatureName: string) {
  try {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) throw new Error("Project not found");

    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for") || "unknown";
    const userAgent = headerList.get("user-agent") || "unknown";

    // Create a deterministic hash of the current config to ensure document integrity
    const configString = JSON.stringify(project.config);
    const hash = createHash("sha256").update(configString).digest("hex");

    await prisma.project.update({
      where: { id },
      data: {
        approvedAt: new Date(),
        signedBy: signatureName,
        ipAddress: ip,
        userAgent: userAgent,
        snapshotHash: hash,
      }
    });
    revalidatePath(`/p/${id}`);
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to approve project:", error);
    return { success: false, error: error.message || String(error) };
  }
}

export async function createPaymongoLinkAction(projectId: string, amountPHP: number, description: string) {
  try {
    const secretKey = process.env.PAYMONGO_SECRET_KEY;
    if (!secretKey) {
      return { success: false, error: "Payment gateway is not configured (missing PAYMONGO_SECRET_KEY)." };
    }

    const amountCentavos = Math.round(amountPHP * 100);
    
    const response = await fetch("https://api.paymongo.com/v1/links", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Basic " + Buffer.from(secretKey + ":").toString("base64")
      },
      body: JSON.stringify({
        data: {
          attributes: {
            amount: amountCentavos,
            description: description,
          }
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("PayMongo Error:", data);
      return { success: false, error: data.errors?.[0]?.detail || "Failed to create payment link." };
    }

    return { success: true, checkoutUrl: data.data.attributes.checkout_url };
  } catch (error: any) {
    console.error("Failed to generate PayMongo link:", error);
    return { success: false, error: error.message || String(error) };
  }
}

export async function deleteProjectAction(id: string) {
  try {
    await prisma.project.delete({ where: { id } });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete project:", error);
    return { success: false, error };
  }
}

export async function unlockProjectAction(id: string) {
  try {
    await prisma.project.update({
      where: { id },
      data: {
        approvedAt: null,
        signedBy: null,
      }
    });
    revalidatePath(`/p/${id}`);
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to unlock project:", error);
    return { success: false, error: error.message || String(error) };
  }
}

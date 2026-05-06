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
      clientName: (p.client && p.client.firstName !== 'Unknown') 
        ? `${p.client.firstName} ${p.client.lastName}` 
        : (p.config as any).proposal?.clientName || 'Unknown Client',
      clientCompany: p.client?.company || null,
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

export async function getClients() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { projects: true } } }
    });
    return clients.map((c: any) => ({
      id: c.id,
      firstName: c.firstName,
      lastName: c.lastName,
      company: c.company,
      email: c.email,
      phone: c.phone,
      status: c.status,
      projectCount: c._count.projects,
      lastModified: c.updatedAt.getTime(),
    }));
  } catch (error) {
    console.error("Failed to fetch clients:", error);
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

export async function updateClientStatusAction(id: string, status: string) {
  try {
    await prisma.client.update({
      where: { id },
      data: { status }
    });
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update client status:", error);
    return { success: false, error: error.message };
  }
}

export async function createClientAction(data: { firstName: string, lastName: string, company?: string, email?: string, phone?: string }) {
  try {
    const client = await prisma.client.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        company: data.company,
        email: data.email,
        phone: data.phone,
        status: "prospect"
      }
    });
    revalidatePath("/admin");
    return { success: true, client };
  } catch (error: any) {
    console.error("Failed to create client:", error);
    return { success: false, error: error.message };
  }
}

export async function updateClientAction(id: string, data: { firstName: string, lastName: string, company?: string, email?: string, phone?: string }) {
  try {
    await prisma.client.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        company: data.company,
        email: data.email,
        phone: data.phone
      }
    });
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update client:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteClientAction(id: string) {
  try {
    await prisma.client.delete({ where: { id } });
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete client:", error);
    return { success: false, error: error.message };
  }
}

export async function saveProjectAction(data: { id: string, name: string, client: string, config: any }) {
  try {
    const fullClientName = data.config.proposal?.clientName || "Unknown Client";
    let firstName = data.config.proposal?.clientFirstName;
    let lastName = data.config.proposal?.clientLastName;

    // Fallback if individual names are missing but full name exists
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

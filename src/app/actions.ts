"use server";

/**
 * Server action access:
 * - ADMIN (requireAdminSession): CRM, projects, email, stats, unlock/delete
 * - PUBLIC: approveProjectAction (client signing on /p/[id])
 * - PUBLIC: createPaymongoLinkAction (client checkout on /p/[id])
 */

import { prisma } from "@/lib/prisma";
import {
  ClientStatus,
  ProjectStatus,
  EmailCampaignStatus,
} from "@prisma/client";
import type { CalculatorInput } from "@/lib/calculator";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { logActivity } from "@/lib/activity";
import { hashProjectConfig } from "@/lib/project-integrity";
import { requireAdminSession, UnauthorizedError } from "@/lib/auth";
import { sendEmail, getBrandedTemplate } from "@/lib/mail";

export async function getSavedProjects() {
  try {
    await requireAdminSession();
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
    if (error instanceof UnauthorizedError) return [];
    console.error("Failed to fetch projects:", error);
    return [];
  }
}

export async function getClients() {
  try {
    await requireAdminSession();
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
    if (error instanceof UnauthorizedError) return [];
    console.error("Failed to fetch clients:", error);
    return [];
  }
}

export async function updateProjectStatusAction(id: string, status: string) {
  try {
    await requireAdminSession();
    const project = await prisma.project.update({
      where: { id },
      data: { status: status as ProjectStatus },
      include: { client: true }
    });
    
    await logActivity({
      clientId: project.clientId,
      projectId: id,
      type: "status_change",
      action: `Project status updated to ${status}`
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof UnauthorizedError) return { success: false, error: error.message };
    console.error("Failed to update status:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function updateClientStatusAction(id: string, status: string) {
  try {
    await requireAdminSession();
    await prisma.client.update({
      where: { id },
      data: { status: status as ClientStatus },
    });

    await logActivity({
      clientId: id,
      type: "status_change",
      action: `Client status updated to ${status}`
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof UnauthorizedError) return { success: false, error: error.message };
    console.error("Failed to update client status:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function createClientAction(data: { firstName: string, lastName: string, company?: string, email?: string, phone?: string }) {
  try {
    await requireAdminSession();
    const client = await prisma.client.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        company: data.company,
        email: data.email,
        phone: data.phone,
        status: ClientStatus.prospect,
      }
    });
    await logActivity({
      clientId: client.id,
      type: "creation",
      action: "New client record created"
    });

    revalidatePath("/admin");
    return { success: true, client };
  } catch (error: unknown) {
    if (error instanceof UnauthorizedError) return { success: false, error: error.message };
    console.error("Failed to create client:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function updateClientAction(id: string, data: { firstName: string, lastName: string, company?: string, email?: string, phone?: string }) {
  try {
    await requireAdminSession();
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
  } catch (error: unknown) {
    if (error instanceof UnauthorizedError) return { success: false, error: error.message };
    console.error("Failed to update client:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function deleteClientAction(id: string) {
  try {
    await requireAdminSession();
    await prisma.client.delete({ where: { id } });
    revalidatePath("/admin");
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof UnauthorizedError) return { success: false, error: error.message };
    console.error("Failed to delete client:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function saveProjectAction(data: { id: string, name: string, client: string, config: any }) {
  try {
    await requireAdminSession();
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

    await logActivity({
      clientId: clientId,
      projectId: data.id,
      type: "creation",
      action: existingProject ? "Project configuration updated" : "New project configuration saved"
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
      }
    });

    await logActivity({
      clientId: project.clientId,
      projectId: id,
      type: "approval",
      action: `Project approved and signed by ${signatureName}`,
      details: { ip, userAgent, hash }
    });
    revalidatePath(`/p/${id}`);
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to approve project:", error);
    return { success: false, error: error.message || String(error) };
  }
}

/** PUBLIC — client checkout on /p/[id] */
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
      }
    });

    const project = await prisma.project.findUnique({ where: { id } });
    if (project) {
      await logActivity({
        clientId: project.clientId,
        projectId: id,
        type: "status_change",
        action: "Project unlocked (approval revoked)"
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

export async function getStats() {
  try {
    await requireAdminSession();
    const [clients, projects, logs] = await Promise.all([
      prisma.client.findMany(),
      prisma.project.findMany(),
      prisma.activityLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { client: true }
      })
    ]);

    const stats = {
      totalClients: clients.length,
      activeClients: clients.filter(c => c.status === ClientStatus.active || c.status === ClientStatus.retainer).length,
      prospects: clients.filter(c => c.status === ClientStatus.prospect).length,
      cancelled: clients.filter(c => c.status === ClientStatus.declined).length,
      totalProjects: projects.length,
      signedProjects: projects.filter(p => p.status === ProjectStatus.signed).length,
      recentActivity: logs.map(l => ({
        id: l.id,
        type: l.type,
        action: l.action,
        clientName: `${l.client.firstName} ${l.client.lastName}`,
        createdAt: l.createdAt.getTime()
      }))
    };

    return stats;
  } catch (error) {
    if (error instanceof UnauthorizedError) return null;
    console.error("Failed to fetch stats:", error);
    return null;
  }
}

export async function getClientById(id: string) {
  try {
    await requireAdminSession();
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        projects: {
          orderBy: { updatedAt: 'desc' }
        },
        logs: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    return client;
  } catch (error) {
    if (error instanceof UnauthorizedError) return null;
    console.error("Failed to fetch client:", error);
    return null;
  }
}

export async function getEmailTemplates() {
  try {
    await requireAdminSession();
    return await prisma.emailTemplate.findMany({
      orderBy: { updatedAt: 'desc' }
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) return [];
    throw error;
  }
}

export async function saveEmailTemplate(data: { id?: string, name: string, subject: string, body: string, category: string }) {
  try {
    await requireAdminSession();
    if (data.id) {
      await prisma.emailTemplate.update({
        where: { id: data.id },
        data: { name: data.name, subject: data.subject, body: data.body, category: data.category }
      });
    } else {
      await prisma.emailTemplate.create({
        data: { name: data.name, subject: data.subject, body: data.body, category: data.category }
      });
    }
    revalidatePath("/admin");
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof UnauthorizedError) return { success: false, error: error.message };
    console.error("Failed to save template:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function sendIndividualEmailAction(clientId: string, subject: string, body: string) {
  try {
    await requireAdminSession();
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client || !client.email) throw new Error("Client has no email address");

    const html = getBrandedTemplate(body);
    const result = await sendEmail({ to: client.email, subject, html });

    if (result.success) {
      await logActivity({
        clientId,
        type: "email_sent",
        action: `Email sent: ${subject}`,
        details: { subject }
      });
      return { success: true };
    }
    return { success: false, error: "Failed to deliver email" };
  } catch (error: unknown) {
    if (error instanceof UnauthorizedError) return { success: false, error: error.message };
    console.error("Email error:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

const bulkEmailRecipientFilter = {
  email: { not: null },
  status: { not: ClientStatus.declined },
} as const;

export async function getBulkEmailRecipientCountAction() {
  try {
    await requireAdminSession();
    const count = await prisma.client.count({ where: bulkEmailRecipientFilter });
    return { success: true, count };
  } catch (error: unknown) {
    if (error instanceof UnauthorizedError) return { success: false, error: error.message, count: 0 };
    return { success: false, error: error instanceof Error ? error.message : String(error), count: 0 };
  }
}

export async function sendBulkEmailAction(campaignName: string, templateId: string) {
  try {
    await requireAdminSession();
    const [template, clients] = await Promise.all([
      prisma.emailTemplate.findUnique({ where: { id: templateId } }),
      prisma.client.findMany({ where: bulkEmailRecipientFilter }),
    ]);

    if (!template) throw new Error("Template not found");
    const emails = clients.map(c => c.email as string);
    if (emails.length === 0) throw new Error("No clients with email addresses found");

    const html = getBrandedTemplate(template.body);
    const result = await sendEmail({ to: emails, subject: template.subject, html });

    if (result.success) {
      await prisma.emailCampaign.create({
        data: {
          name: campaignName,
          subject: template.subject,
          templateId: templateId,
          status: EmailCampaignStatus.sent,
          recipients: emails.length,
          sentAt: new Date()
        }
      });
      return { success: true, count: emails.length };
    }
    return { success: false, error: "Bulk email delivery failed" };
  } catch (error: unknown) {
    if (error instanceof UnauthorizedError) return { success: false, error: error.message };
    console.error("Bulk email error:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

"use server";

import { prisma } from "@/lib/prisma";
import { ClientStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/activity";
import { requireAdminSession, UnauthorizedError } from "@/lib/auth";

export async function getClients() {
  try {
    await requireAdminSession();
    const clients = await prisma.client.findMany({
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { projects: true } } },
    });
    return clients.map((c) => ({
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
      action: `Client status updated to ${status}`,
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof UnauthorizedError) return { success: false, error: error.message };
    console.error("Failed to update client status:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function createClientAction(data: {
  firstName: string;
  lastName: string;
  company?: string;
  email?: string;
  phone?: string;
}) {
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
      },
    });
    await logActivity({
      clientId: client.id,
      type: "creation",
      action: "New client record created",
    });

    revalidatePath("/admin");
    return { success: true, client };
  } catch (error: unknown) {
    if (error instanceof UnauthorizedError) return { success: false, error: error.message };
    console.error("Failed to create client:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function updateClientAction(
  id: string,
  data: {
    firstName: string;
    lastName: string;
    company?: string;
    email?: string;
    phone?: string;
  }
) {
  try {
    await requireAdminSession();
    await prisma.client.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        company: data.company,
        email: data.email,
        phone: data.phone,
      },
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

export async function getClientById(id: string) {
  try {
    await requireAdminSession();
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        projects: { orderBy: { updatedAt: "desc" } },
        logs: { orderBy: { createdAt: "desc" } },
      },
    });
    return client;
  } catch (error) {
    if (error instanceof UnauthorizedError) return null;
    console.error("Failed to fetch client:", error);
    return null;
  }
}

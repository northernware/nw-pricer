"use server";

import { prisma } from "@/lib/prisma";
import { ClientStatus, ProjectStatus } from "@prisma/client";
import { requireAdminSession, UnauthorizedError } from "@/lib/auth";
import type { DashboardStats } from "@/types/crm";

export async function getStats(): Promise<DashboardStats | null> {
  try {
    await requireAdminSession();
    const [clients, projects, logs] = await Promise.all([
      prisma.client.findMany(),
      prisma.project.findMany(),
      prisma.activityLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { client: true },
      }),
    ]);

    return {
      totalClients: clients.length,
      activeClients: clients.filter(
        (c) => c.status === ClientStatus.active || c.status === ClientStatus.retainer
      ).length,
      prospects: clients.filter((c) => c.status === ClientStatus.prospect).length,
      cancelled: clients.filter((c) => c.status === ClientStatus.declined).length,
      totalProjects: projects.length,
      signedProjects: projects.filter((p) => p.status === ProjectStatus.signed).length,
      recentActivity: logs.map((l) => ({
        id: l.id,
        type: l.type,
        action: l.action,
        clientName: `${l.client.firstName} ${l.client.lastName}`,
        createdAt: l.createdAt.getTime(),
      })),
    };
  } catch (error) {
    if (error instanceof UnauthorizedError) return null;
    console.error("Failed to fetch stats:", error);
    return null;
  }
}

"use server";

import { prisma } from "@/lib/prisma";
import { ClientStatus, ProjectStatus } from "@prisma/client";
import { requireAdminSession, UnauthorizedError } from "@/lib/auth";
import type { DashboardStats } from "@/types/crm";

export type StatsResult =
  | { success: true; data: DashboardStats }
  | { success: false; error: string };

export async function getStats(): Promise<StatsResult> {
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
      success: true,
      data: {
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
      },
    };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return { success: false, error: "Not signed in" };
    }
    console.error("Failed to fetch stats:", error);
    const message =
      error instanceof Error ? error.message : "Could not load dashboard statistics";
    return { success: false, error: message };
  }
}

"use server";

import { prisma } from "@/lib/prisma";
import { requireAdminSession, UnauthorizedError } from "@/lib/auth";
import type { ActivityLogItem } from "@/types/crm";

export async function getActivityLogsAction(options?: {
  clientId?: string;
  projectId?: string;
  type?: string;
  limit?: number;
}): Promise<ActivityLogItem[]> {
  try {
    await requireAdminSession();
    const logs = await prisma.activityLog.findMany({
      where: {
        ...(options?.clientId ? { clientId: options.clientId } : {}),
        ...(options?.projectId ? { projectId: options.projectId } : {}),
        ...(options?.type ? { type: options.type } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: options?.limit ?? 100,
      include: { client: true },
    });

    return logs.map((l) => ({
      id: l.id,
      type: l.type,
      action: l.action,
      clientName: `${l.client.firstName} ${l.client.lastName}`,
      clientId: l.clientId,
      projectId: l.projectId,
      createdAt: l.createdAt.getTime(),
    }));
  } catch (error) {
    if (error instanceof UnauthorizedError) return [];
    console.error("Failed to fetch activity logs:", error);
    return [];
  }
}

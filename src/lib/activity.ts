import { prisma } from "./prisma";

export async function logActivity({
  clientId,
  projectId,
  type,
  action,
  details
}: {
  clientId: string;
  projectId?: string;
  type: "status_change" | "email_sent" | "note" | "approval" | "payment" | "creation";
  action: string;
  details?: any;
}) {
  try {
    await prisma.activityLog.create({
      data: {
        clientId,
        projectId,
        type,
        action,
        details
      }
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}

"use server";

import { prisma } from "@/lib/prisma";
import { ClientStatus, EmailCampaignStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/activity";
import { requireAdminSession, UnauthorizedError } from "@/lib/auth";
import { sendEmail, getBrandedTemplate } from "@/lib/mail";

const bulkEmailRecipientFilter = {
  email: { not: null },
  status: { not: ClientStatus.declined },
  marketingOptIn: true,
} as const;

export async function getEmailTemplates() {
  try {
    await requireAdminSession();
    return await prisma.emailTemplate.findMany({
      orderBy: { updatedAt: "desc" },
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) return [];
    throw error;
  }
}

export async function saveEmailTemplate(data: {
  id?: string;
  name: string;
  subject: string;
  body: string;
  category: string;
}) {
  try {
    await requireAdminSession();
    if (data.id) {
      await prisma.emailTemplate.update({
        where: { id: data.id },
        data: {
          name: data.name,
          subject: data.subject,
          body: data.body,
          category: data.category,
        },
      });
    } else {
      await prisma.emailTemplate.create({
        data: {
          name: data.name,
          subject: data.subject,
          body: data.body,
          category: data.category,
        },
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

export async function sendIndividualEmailAction(
  clientId: string,
  subject: string,
  body: string
) {
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
        details: { subject },
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

export async function getBulkEmailRecipientCountAction() {
  try {
    await requireAdminSession();
    const count = await prisma.client.count({ where: bulkEmailRecipientFilter });
    return { success: true, count };
  } catch (error: unknown) {
    if (error instanceof UnauthorizedError)
      return { success: false, error: error.message, count: 0 };
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      count: 0,
    };
  }
}

export async function sendTestEmailAction(templateId: string) {
  try {
    await requireAdminSession();
    const testEmail = process.env.CRM_TEST_EMAIL;
    if (!testEmail) {
      return {
        success: false,
        error: "Set CRM_TEST_EMAIL in environment to receive test emails.",
      };
    }

    const template = await prisma.emailTemplate.findUnique({ where: { id: templateId } });
    if (!template) throw new Error("Template not found");

    const html = getBrandedTemplate(
      `<p style="font-size:11px;color:#666;margin-bottom:16px;">[TEST — not sent to clients]</p>${template.body}`
    );
    const result = await sendEmail({
      to: testEmail,
      subject: `[TEST] ${template.subject}`,
      html,
    });

    if (result.success) {
      return { success: true, to: testEmail };
    }
    return { success: false, error: "Test email delivery failed" };
  } catch (error: unknown) {
    if (error instanceof UnauthorizedError) return { success: false, error: error.message };
    console.error("Test email error:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
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
    if (clients.length === 0) throw new Error("No clients with email addresses found");

    const html = getBrandedTemplate(template.body);
    const failures: { email: string; reason: string }[] = [];
    let sent = 0;

    for (const client of clients) {
      const email = client.email as string;
      const result = await sendEmail({ to: email, subject: template.subject, html });
      if (result.success) {
        sent++;
      } else {
        const reason =
          result.error instanceof Error
            ? result.error.message
            : typeof result.error === "string"
              ? result.error
              : "Delivery failed";
        failures.push({ email, reason });
        console.error(`Bulk email failed for ${email}:`, result.error);
      }
    }

    const status =
      sent === 0
        ? EmailCampaignStatus.draft
        : EmailCampaignStatus.sent;

    await prisma.emailCampaign.create({
      data: {
        name: campaignName,
        subject: template.subject,
        templateId: templateId,
        status,
        recipients: sent,
        sentAt: sent > 0 ? new Date() : null,
      },
    });

    await logActivity({
      clientId: clients[0].id,
      type: "email_sent",
      action: `Bulk campaign "${campaignName}": ${sent} sent, ${failures.length} failed`,
      details: { campaignName, sent, failed: failures.length, failures: failures.slice(0, 20) },
    });

    if (sent === 0) {
      return {
        success: false,
        error: "All recipients failed",
        sent: 0,
        failed: failures.length,
        failures,
      };
    }

    return {
      success: true,
      count: sent,
      sent,
      failed: failures.length,
      failures: failures.length > 0 ? failures : undefined,
    };
  } catch (error: unknown) {
    if (error instanceof UnauthorizedError) return { success: false, error: error.message };
    console.error("Bulk email error:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

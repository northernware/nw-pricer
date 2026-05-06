"use server";

import { prisma } from "@/lib/prisma";
import type { CalculatorInput } from "@/lib/calculator";
import { revalidatePath } from "next/cache";

export async function getSavedProjects() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { updatedAt: 'desc' }
    });
    return projects.map((p: any) => ({
      id: p.id,
      name: p.name,
      client: p.client,
      config: p.config as unknown as CalculatorInput,
      lastModified: p.updatedAt.getTime(),
      isApproved: !!p.approvedAt,
      signedBy: p.signedBy,
      approvedAt: p.approvedAt,
    }));
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return [];
  }
}

export async function saveProjectAction(data: { id: string, name: string, client: string, config: any }) {
  try {
    await prisma.project.upsert({
      where: { id: data.id },
      update: {
        name: data.name,
        client: data.client,
        config: data.config,
      },
      create: {
        id: data.id,
        name: data.name,
        client: data.client,
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
    await prisma.project.update({
      where: { id },
      data: {
        approvedAt: new Date(),
        signedBy: signatureName,
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

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

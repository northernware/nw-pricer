"use server";

import { prisma } from "@/lib/prisma";
import { SocialPostStatus, SocialPlatform } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireAdminSession, UnauthorizedError } from "@/lib/auth";
import type { Prisma } from "@prisma/client";

export async function getSocialPosts() {
  try {
    await requireAdminSession();
    const posts = await prisma.socialPost.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return posts;
  } catch (error) {
    if (error instanceof UnauthorizedError) return [];
    console.error("Failed to fetch social posts:", error);
    return [];
  }
}

export async function createSocialPostAction(data: {
  caption: string;
  platforms: SocialPlatform[];
  overrides?: Record<string, string>;
  scheduledAt?: Date;
  mediaUrls?: string[];
}) {
  try {
    await requireAdminSession();
    const post = await prisma.socialPost.create({
      data: {
        caption: data.caption,
        platforms: data.platforms,
        overrides: (data.overrides || {}) as Prisma.InputJsonValue,
        status: SocialPostStatus.draft,
        scheduledAt: data.scheduledAt,
        mediaUrls: data.mediaUrls || [],
      },
    });

    revalidatePath("/admin");
    return { success: true, post };
  } catch (error: unknown) {
    if (error instanceof UnauthorizedError) return { success: false, error: error.message };
    console.error("Failed to create social post:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function updateSocialPostAction(
  id: string,
  data: {
    caption?: string;
    platforms?: SocialPlatform[];
    overrides?: Record<string, string>;
    status?: SocialPostStatus;
    scheduledAt?: Date;
    mediaUrls?: string[];
  }
) {
  try {
    await requireAdminSession();
    await prisma.socialPost.update({
      where: { id },
      data: {
        ...(data.caption !== undefined && { caption: data.caption }),
        ...(data.platforms !== undefined && { platforms: data.platforms }),
        ...(data.overrides !== undefined && { overrides: data.overrides as Prisma.InputJsonValue }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.status === SocialPostStatus.published && { publishedAt: new Date() }),
        ...(data.scheduledAt !== undefined && { scheduledAt: data.scheduledAt }),
        ...(data.mediaUrls !== undefined && { mediaUrls: data.mediaUrls }),
      },
    });
    revalidatePath("/admin");
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof UnauthorizedError) return { success: false, error: error.message };
    console.error("Failed to update social post:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function deleteSocialPostAction(id: string) {
  try {
    await requireAdminSession();
    await prisma.socialPost.delete({ where: { id } });
    revalidatePath("/admin");
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof UnauthorizedError) return { success: false, error: error.message };
    console.error("Failed to delete social post:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function getSocialPostById(id: string) {
  try {
    await requireAdminSession();
    const post = await prisma.socialPost.findUnique({
      where: { id },
    });
    return post;
  } catch (error) {
    if (error instanceof UnauthorizedError) return null;
    console.error("Failed to fetch social post:", error);
    return null;
  }
}

"use client";

/* eslint-disable @next/next/no-img-element -- User-selected data URLs need immediate local previews. */

import { useEffect, useMemo, useState, useTransition } from "react";
import { Icon } from "@iconify/react";
import type { SocialPlatform, SocialPostStatus } from "@prisma/client";
import toast from "react-hot-toast";
import {
  createSocialPostAction,
  deleteSocialPostAction,
  getSocialPosts,
  updateSocialPostAction,
} from "@/app/actions/social";

type SocialPost = {
  id: string;
  caption: string;
  platforms: SocialPlatform[];
  overrides: Record<string, string> | null;
  status: SocialPostStatus;
  scheduledAt: Date | string | null;
  publishedAt: Date | string | null;
  mediaUrls: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
};

type ComposerState = {
  caption: string;
  platforms: SocialPlatform[];
  overrides: Record<string, string>;
  mediaUrls: string[];
};

const EMPTY_COMPOSER: ComposerState = {
  caption: "",
  platforms: [],
  overrides: {},
  mediaUrls: [],
};

const PLATFORMS: {
  id: SocialPlatform;
  label: string;
  icon: string;
  color: string;
  textColor: string;
  maxChars: number;
}[] = [
  {
    id: "facebook",
    label: "Facebook",
    icon: "solar:facebook-bold",
    color: "bg-blue-600",
    textColor: "text-blue-600",
    maxChars: 63206,
  },
  {
    id: "instagram",
    label: "Instagram",
    icon: "solar:instagram-bold",
    color: "bg-pink-600",
    textColor: "text-pink-600",
    maxChars: 2200,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    icon: "solar:linkedin-bold",
    color: "bg-blue-700",
    textColor: "text-blue-700",
    maxChars: 3000,
  },
];

const MAX_IMAGES = 10;
const MAX_IMAGE_SIZE = 1.5 * 1024 * 1024;

function toPlatformLabel(platform: SocialPlatform) {
  return PLATFORMS.find((item) => item.id === platform)?.label ?? platform;
}

function formatDate(value: Date | string | null) {
  if (!value) return "Not scheduled";
  return new Date(value).toLocaleDateString();
}

function getCaptionForPlatform(post: Pick<SocialPost, "caption" | "overrides">, platform: SocialPlatform) {
  const override = post.overrides?.[platform]?.trim();
  return override || post.caption;
}

function getImageGridClass(count: number) {
  if (count <= 1) return "grid grid-cols-1 place-items-center";
  if (count === 2) return "grid grid-cols-2";
  return "grid grid-cols-2";
}

function getImageClass(count: number) {
  return count <= 1 ? "aspect-square w-full max-w-72 object-cover" : "aspect-square w-full object-cover";
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function SocialMedia() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [showComposer, setShowComposer] = useState(false);
  const [editingPost, setEditingPost] = useState<SocialPost | null>(null);
  const [composerData, setComposerData] = useState<ComposerState>(EMPTY_COMPOSER);
  const [requestedPreviewPlatform, setRequestedPreviewPlatform] = useState<SocialPlatform>("facebook");

  const previewPlatform =
    composerData.platforms.includes(requestedPreviewPlatform) || composerData.platforms.length === 0
      ? requestedPreviewPlatform
      : composerData.platforms[0];

  const selectedPreview = useMemo(() => {
    return PLATFORMS.find((platform) => platform.id === previewPlatform) ?? PLATFORMS[0];
  }, [previewPlatform]);

  const loadPosts = async () => {
    setLoading(true);
    const data = await getSocialPosts();
    setPosts(data as SocialPost[]);
    setLoading(false);
  };

  useEffect(() => {
    void getSocialPosts().then((data) => {
      setPosts(data as SocialPost[]);
      setLoading(false);
    });
  }, []);

  const resetComposer = () => {
    setShowComposer(false);
    setEditingPost(null);
    setComposerData(EMPTY_COMPOSER);
    setRequestedPreviewPlatform("facebook");
  };

  const openNewComposer = () => {
    setEditingPost(null);
    setComposerData(EMPTY_COMPOSER);
    setRequestedPreviewPlatform("facebook");
    setShowComposer(true);
  };

  const openEditComposer = (post: SocialPost) => {
    setEditingPost(post);
    setComposerData({
      caption: post.caption,
      platforms: post.platforms,
      overrides: post.overrides ?? {},
      mediaUrls: post.mediaUrls,
    });
    setRequestedPreviewPlatform(post.platforms[0] ?? "facebook");
    setShowComposer(true);
  };

  const togglePlatform = (platform: SocialPlatform) => {
    setComposerData((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter((item) => item !== platform)
        : [...prev.platforms, platform],
    }));
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files?.length) return;

    const availableSlots = MAX_IMAGES - composerData.mediaUrls.length;
    const selectedFiles = Array.from(files).slice(0, availableSlots);

    if (availableSlots <= 0) {
      toast.error(`Maximum ${MAX_IMAGES} photos per post`);
      return;
    }

    const validFiles = selectedFiles.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        return false;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error(`${file.name} is larger than 1.5MB`);
        return false;
      }
      return true;
    });

    if (selectedFiles.length < files.length) {
      toast.error(`Only ${availableSlots} more photo(s) can be added`);
    }

    const dataUrls = await Promise.all(validFiles.map(readFileAsDataUrl));
    setComposerData((prev) => ({
      ...prev,
      mediaUrls: [...prev.mediaUrls, ...dataUrls],
    }));
  };

  const removeImage = (index: number) => {
    setComposerData((prev) => ({
      ...prev,
      mediaUrls: prev.mediaUrls.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    setComposerData((prev) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= prev.mediaUrls.length) return prev;
      const mediaUrls = [...prev.mediaUrls];
      const [item] = mediaUrls.splice(index, 1);
      mediaUrls.splice(nextIndex, 0, item);
      return { ...prev, mediaUrls };
    });
  };

  const getCharacterCount = (platform: SocialPlatform) => {
    const caption = composerData.overrides[platform]?.trim() || composerData.caption;
    const limit = PLATFORMS.find((item) => item.id === platform)?.maxChars ?? 0;
    return { count: caption.length, limit };
  };

  const validateComposer = () => {
    if (composerData.platforms.length === 0) {
      toast.error("Select at least one platform");
      return false;
    }

    const hasCaption = composerData.platforms.some((platform) => {
      return Boolean((composerData.overrides[platform] || composerData.caption).trim());
    });

    if (!hasCaption) {
      toast.error("Add a caption or at least one platform override");
      return false;
    }

    if (composerData.platforms.includes("instagram") && composerData.mediaUrls.length === 0) {
      toast.error("Instagram posts need at least one photo");
      return false;
    }

    const overLimit = composerData.platforms.find((platform) => {
      const { count, limit } = getCharacterCount(platform);
      return count > limit;
    });

    if (overLimit) {
      toast.error(`${toPlatformLabel(overLimit)} caption is too long`);
      return false;
    }

    return true;
  };

  const handleSavePost = () => {
    if (!validateComposer()) return;

    startTransition(async () => {
      const payload = {
        caption:
          composerData.caption.trim() ||
          composerData.platforms
            .map((platform) => composerData.overrides[platform]?.trim())
            .find(Boolean) ||
          "",
        platforms: composerData.platforms,
        overrides: composerData.overrides,
        mediaUrls: composerData.mediaUrls,
      };

      const result = editingPost
        ? await updateSocialPostAction(editingPost.id, payload)
        : await createSocialPostAction(payload);

      if (result.success) {
        toast.success(editingPost ? "Post updated" : "Draft saved");
        await loadPosts();
        resetComposer();
      } else {
        toast.error(result.error || "Unable to save post");
      }
    });
  };

  const handleDeletePost = (id: string) => {
    if (!confirm("Delete this social post?")) return;

    startTransition(async () => {
      const result = await deleteSocialPostAction(id);
      if (result.success) {
        toast.success("Post deleted");
        await loadPosts();
      } else {
        toast.error(result.error || "Unable to delete post");
      }
    });
  };

  const handleMarkPosted = (post: SocialPost) => {
    startTransition(async () => {
      const result = await updateSocialPostAction(post.id, {
        status: "published",
      });
      if (result.success) {
        toast.success("Post marked as posted");
        await loadPosts();
      } else {
        toast.error(result.error || "Unable to update status");
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-display font-black text-2xl uppercase tracking-tighter text-nw-black">
            Social Media
          </h2>
          <p className="font-mono text-[9px] uppercase tracking-widest text-nw-graphite mt-1">
            Draft posts for Facebook, Instagram, and LinkedIn
          </p>
        </div>
        <button
          type="button"
          onClick={openNewComposer}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-nw-black px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-nw-bone transition-all hover:bg-nw-acid hover:text-nw-black"
        >
          <Icon icon="solar:add-circle-linear" className="h-4 w-4" />
          New Post
        </button>
      </div>

      {showComposer && (
        <div className="rounded-2xl border border-nw-graphite/10 bg-nw-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-lg font-bold uppercase tracking-tighter text-nw-black">
                {editingPost ? "Edit Social Post" : "Create Social Post"}
              </h3>
              <p className="font-mono text-[9px] uppercase tracking-widest text-nw-graphite/60">
                Photos and captions save as an internal draft
              </p>
            </div>
            <button
              type="button"
              onClick={resetComposer}
              className="rounded-lg p-2 text-nw-graphite/50 transition-colors hover:bg-nw-bone hover:text-nw-black"
              aria-label="Close composer"
            >
              <Icon icon="solar:close-circle-linear" className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-5">
              <div>
                <label className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-nw-graphite">
                  Platforms
                </label>
                <div className="flex flex-wrap gap-3">
                  {PLATFORMS.map((platform) => (
                    <button
                      type="button"
                      key={platform.id}
                      onClick={() => togglePlatform(platform.id)}
                      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-all ${
                        composerData.platforms.includes(platform.id)
                          ? `${platform.color} text-white`
                          : "bg-nw-bone text-nw-graphite hover:bg-nw-graphite/10"
                      }`}
                    >
                      <Icon icon={platform.icon} className="h-4 w-4" />
                      {platform.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-nw-graphite">
                  Shared Caption
                </label>
                <textarea
                  value={composerData.caption}
                  onChange={(event) =>
                    setComposerData((prev) => ({ ...prev, caption: event.target.value }))
                  }
                  placeholder="Write the default caption..."
                  rows={5}
                  className="w-full resize-none rounded-xl border border-nw-graphite/10 bg-nw-bone/60 p-4 font-body text-sm text-nw-black outline-none transition-colors focus:border-nw-acid"
                />
              </div>

              {composerData.platforms.length > 0 && (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  {composerData.platforms.map((platform) => {
                    const { count, limit } = getCharacterCount(platform);
                    const warning = count > limit * 0.9;
                    return (
                      <div key={platform} className="rounded-xl border border-nw-graphite/10 bg-nw-bone/50 p-4">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <span className="font-mono text-[9px] uppercase tracking-widest text-nw-graphite">
                            {toPlatformLabel(platform)}
                          </span>
                          <span
                            className={`font-mono text-[9px] ${
                              count > limit ? "text-red-500" : warning ? "text-yellow-600" : "text-nw-graphite/50"
                            }`}
                          >
                            {count}/{limit}
                          </span>
                        </div>
                        <textarea
                          value={composerData.overrides[platform] ?? ""}
                          onChange={(event) =>
                            setComposerData((prev) => ({
                              ...prev,
                              overrides: {
                                ...prev.overrides,
                                [platform]: event.target.value,
                              },
                            }))
                          }
                          placeholder="Optional caption override"
                          rows={4}
                          className="w-full resize-none rounded-lg border border-nw-graphite/10 bg-nw-white p-3 font-body text-xs outline-none transition-colors focus:border-nw-acid"
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              <div>
                <label className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-nw-graphite">
                  Photos
                </label>
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-nw-graphite/20 bg-nw-bone/50 px-4 py-8 text-center transition-colors hover:border-nw-acid">
                  <Icon icon="solar:gallery-add-linear" className="mb-3 h-8 w-8 text-nw-graphite/40" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-nw-graphite">
                    Add photos
                  </span>
                  <span className="mt-1 font-body text-xs text-nw-graphite/50">
                    PNG, JPG, or WebP. Up to {MAX_IMAGES} images, 1.5MB each.
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="sr-only"
                    onChange={(event) => handleImageUpload(event.target.files)}
                  />
                </label>

                {composerData.mediaUrls.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                    {composerData.mediaUrls.map((url, index) => (
                      <div key={`${url.slice(0, 24)}-${index}`} className="group relative aspect-square overflow-hidden rounded-xl border border-nw-graphite/10 bg-nw-bone">
                        <img src={url} alt="" className="h-full w-full object-cover" />
                        <div className="absolute inset-x-2 bottom-2 flex justify-between opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => moveImage(index, -1)}
                            disabled={index === 0}
                            className="rounded-lg bg-nw-black/70 p-2 text-white disabled:opacity-30"
                            aria-label="Move photo left"
                          >
                            <Icon icon="solar:arrow-left-linear" className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="rounded-lg bg-red-500/80 p-2 text-white"
                            aria-label="Remove photo"
                          >
                            <Icon icon="solar:trash-bin-trash-linear" className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveImage(index, 1)}
                            disabled={index === composerData.mediaUrls.length - 1}
                            className="rounded-lg bg-nw-black/70 p-2 text-white disabled:opacity-30"
                            aria-label="Move photo right"
                          >
                            <Icon icon="solar:arrow-right-linear" className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 border-t border-nw-graphite/10 pt-5 sm:flex-row">
                <button
                  type="button"
                  onClick={resetComposer}
                  className="flex-1 rounded-xl border border-nw-graphite/20 py-3 font-mono text-[10px] uppercase tracking-widest transition-colors hover:bg-nw-bone"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePost}
                  disabled={isPending}
                  className="flex-1 rounded-xl bg-nw-black py-3 font-mono text-[10px] uppercase tracking-widest text-nw-bone transition-colors hover:bg-nw-acid hover:text-nw-black disabled:opacity-50"
                >
                  {isPending ? "Saving..." : editingPost ? "Update Draft" : "Save Draft"}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-nw-graphite/10 bg-nw-bone/50 p-4">
              <div className="mb-4 flex flex-wrap gap-2">
                {composerData.platforms.length === 0 ? (
                  <span className="font-mono text-[9px] uppercase tracking-widest text-nw-graphite/40">
                    Select a platform for preview
                  </span>
                ) : (
                  composerData.platforms.map((platform) => (
                    <button
                      type="button"
                      key={platform}
                      onClick={() => setRequestedPreviewPlatform(platform)}
                      className={`rounded-lg px-3 py-2 font-mono text-[9px] uppercase tracking-widest transition-colors ${
                        previewPlatform === platform
                          ? "bg-nw-black text-nw-bone"
                          : "bg-nw-white text-nw-graphite hover:bg-nw-graphite/10"
                      }`}
                    >
                      {toPlatformLabel(platform)}
                    </button>
                  ))
                )}
              </div>

              <div className="rounded-xl bg-nw-white p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full ${selectedPreview.color} text-white`}>
                    <Icon icon={selectedPreview.icon} className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-body text-sm font-bold text-nw-black">Northernware</div>
                    <div className="font-mono text-[8px] uppercase tracking-widest text-nw-graphite/40">
                      {selectedPreview.label} preview
                    </div>
                  </div>
                </div>
                {composerData.mediaUrls.length > 0 ? (
                  <div className={`mb-3 gap-1 overflow-hidden rounded-lg ${getImageGridClass(composerData.mediaUrls.length)}`}>
                    {composerData.mediaUrls.slice(0, 4).map((url, index) => (
                      <img
                        key={`${url.slice(0, 24)}-preview-${index}`}
                        src={url}
                        alt=""
                        className={getImageClass(composerData.mediaUrls.length)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="mb-3 flex aspect-square items-center justify-center rounded-lg bg-nw-bone text-nw-graphite/30">
                    <Icon icon="solar:gallery-minimalistic-linear" className="h-10 w-10" />
                  </div>
                )}
                <p className="whitespace-pre-wrap font-body text-sm leading-relaxed text-nw-black">
                  {composerData.overrides[previewPlatform]?.trim() || composerData.caption || "Caption preview appears here."}
                </p>
              </div>

              {composerData.platforms.includes("instagram") && composerData.mediaUrls.length === 0 && (
                <div className="mt-4 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-3 font-body text-xs text-yellow-700">
                  Instagram posts require at least one photo.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="min-h-80">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-44 animate-pulse rounded-2xl bg-nw-white" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex min-h-80 items-center justify-center rounded-2xl border border-dashed border-nw-graphite/20 bg-nw-white">
            <div className="text-center">
              <Icon icon="solar:hashtag-linear" className="mx-auto mb-4 h-10 w-10 text-nw-graphite/20" />
              <p className="font-mono text-[10px] uppercase tracking-widest text-nw-graphite/40">
                No social posts yet
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {posts.map((post) => (
              <div key={post.id} className="rounded-2xl border border-nw-graphite/10 bg-nw-white p-5 shadow-sm">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    {post.platforms.map((platform) => {
                      const platformInfo = PLATFORMS.find((item) => item.id === platform);
                      return platformInfo ? (
                        <span key={platform} className={`${platformInfo.color} inline-flex items-center gap-1 rounded-lg px-2 py-1 font-mono text-[8px] uppercase tracking-widest text-white`}>
                          <Icon icon={platformInfo.icon} className="h-3 w-3" />
                          {platformInfo.label}
                        </span>
                      ) : null;
                    })}
                  </div>
                  <span className="rounded-full bg-nw-bone px-3 py-1 font-mono text-[8px] uppercase tracking-widest text-nw-graphite">
                    {post.status}
                  </span>
                </div>

                {post.mediaUrls.length > 0 && (
                  <div className={`mb-4 gap-1 overflow-hidden rounded-xl bg-nw-bone ${getImageGridClass(post.mediaUrls.length)}`}>
                    {post.mediaUrls.slice(0, 4).map((url, index) => (
                      <img
                        key={`${post.id}-${index}`}
                        src={url}
                        alt=""
                        className={getImageClass(post.mediaUrls.length)}
                      />
                    ))}
                  </div>
                )}

                <p className="mb-4 line-clamp-4 whitespace-pre-wrap font-body text-sm leading-relaxed text-nw-black">
                  {post.caption}
                </p>

                {post.platforms.some((platform) => post.overrides?.[platform]) && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {post.platforms.map((platform) =>
                      post.overrides?.[platform] ? (
                        <span key={platform} className="rounded-lg bg-nw-bone px-2 py-1 font-mono text-[8px] uppercase tracking-widest text-nw-graphite">
                          {toPlatformLabel(platform)} override
                        </span>
                      ) : null
                    )}
                  </div>
                )}

                <div className="mb-4 grid grid-cols-1 gap-2 rounded-xl bg-nw-bone/50 p-3">
                  {post.platforms.map((platform) => (
                    <div key={platform} className="flex items-start gap-2">
                      <span className="w-20 shrink-0 font-mono text-[8px] uppercase tracking-widest text-nw-graphite/50">
                        {toPlatformLabel(platform)}
                      </span>
                      <span className="line-clamp-2 font-body text-xs text-nw-graphite">
                        {getCaptionForPlatform(post, platform)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-3 border-t border-nw-graphite/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-nw-graphite/40">
                    Updated {formatDate(post.updatedAt)}
                  </span>
                  <div className="flex gap-2">
                    {post.status !== "published" && (
                      <button
                        type="button"
                        onClick={() => handleMarkPosted(post)}
                        disabled={isPending}
                        className="rounded-lg border border-nw-graphite/20 p-2 text-nw-graphite transition-colors hover:bg-nw-bone hover:text-nw-black disabled:opacity-50"
                        aria-label="Mark post as posted"
                      >
                        <Icon icon="solar:check-circle-linear" className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => openEditComposer(post)}
                      className="rounded-lg border border-nw-graphite/20 p-2 text-nw-graphite transition-colors hover:bg-nw-bone hover:text-nw-black"
                      aria-label="Edit social post"
                    >
                      <Icon icon="solar:pen-linear" className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePost(post.id)}
                      disabled={isPending}
                      className="rounded-lg border border-red-500/20 p-2 text-red-500 transition-colors hover:bg-red-500 hover:text-white disabled:opacity-50"
                      aria-label="Delete social post"
                    >
                      <Icon icon="solar:trash-bin-trash-linear" className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

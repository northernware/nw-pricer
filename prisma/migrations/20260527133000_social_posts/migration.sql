CREATE TYPE "SocialPostStatus" AS ENUM ('draft', 'scheduled', 'published');
CREATE TYPE "SocialPlatform" AS ENUM ('facebook', 'instagram', 'linkedin');

CREATE TABLE "SocialPost" (
    "id" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "platforms" "SocialPlatform"[] NOT NULL,
    "overrides" JSONB,
    "status" "SocialPostStatus" NOT NULL DEFAULT 'draft',
    "scheduledAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "mediaUrls" TEXT[] NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialPost_pkey" PRIMARY KEY ("id")
);

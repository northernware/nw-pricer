-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('prospect', 'active', 'retainer', 'completed', 'declined');
CREATE TYPE "ProjectStatus" AS ENUM ('lead', 'quoted', 'signed');
CREATE TYPE "EmailCampaignStatus" AS ENUM ('draft', 'sent');

-- AlterTable Client.status -> enum
ALTER TABLE "Client" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Client" ALTER COLUMN "status" TYPE "ClientStatus" USING (
  CASE
    WHEN "status" IN ('prospect', 'active', 'retainer', 'completed', 'declined') THEN "status"::"ClientStatus"
    ELSE 'prospect'::"ClientStatus"
  END
);
ALTER TABLE "Client" ALTER COLUMN "status" SET DEFAULT 'prospect';

-- AlterTable Project.status -> enum
ALTER TABLE "Project" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Project" ALTER COLUMN "status" TYPE "ProjectStatus" USING (
  CASE
    WHEN "status" IN ('lead', 'quoted', 'signed') THEN "status"::"ProjectStatus"
    ELSE 'lead'::"ProjectStatus"
  END
);
ALTER TABLE "Project" ALTER COLUMN "status" SET DEFAULT 'lead';

-- AlterTable EmailCampaign.status -> enum
ALTER TABLE "EmailCampaign" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "EmailCampaign" ALTER COLUMN "status" TYPE "EmailCampaignStatus" USING (
  CASE
    WHEN "status" IN ('draft', 'sent') THEN "status"::"EmailCampaignStatus"
    ELSE 'draft'::"EmailCampaignStatus"
  END
);
ALTER TABLE "EmailCampaign" ALTER COLUMN "status" SET DEFAULT 'draft';

-- Project.clientId: RESTRICT -> CASCADE
ALTER TABLE "Project" DROP CONSTRAINT "Project_clientId_fkey";
ALTER TABLE "Project" ADD CONSTRAINT "Project_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ActivityLog.clientId: RESTRICT -> CASCADE
ALTER TABLE "ActivityLog" DROP CONSTRAINT "ActivityLog_clientId_fkey";
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- EmailCampaign.templateId -> EmailTemplate
ALTER TABLE "EmailCampaign" ADD CONSTRAINT "EmailCampaign_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "EmailTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

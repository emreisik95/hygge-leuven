-- Per-section visibility toggles for landing page
ALTER TABLE "SiteContent" ADD COLUMN "showDefinition" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "SiteContent" ADD COLUMN "showTagline" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "SiteContent" ADD COLUMN "showInvite" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "SiteContent" ADD COLUMN "showStatus" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "SiteContent" ADD COLUMN "showAddress" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "SiteContent" ADD COLUMN "showHours" BOOLEAN NOT NULL DEFAULT true;

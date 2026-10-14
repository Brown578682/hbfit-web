-- AlterTable
ALTER TABLE "Event"
  ALTER COLUMN "status" SET DEFAULT 'DRAFT',
  ADD COLUMN "cost"              TEXT,
  ADD COLUMN "deadline"         TIMESTAMP(3),
  ADD COLUMN "collaborators"    TEXT,
  ADD COLUMN "permitRequired"   BOOLEAN,
  ADD COLUMN "permitApplied"    TIMESTAMP(3),
  ADD COLUMN "permitApproved"   TIMESTAMP(3),
  ADD COLUMN "equipmentRequired" TEXT,
  ADD COLUMN "imageAssets"      JSONB,
  ADD COLUMN "postingChannels"  JSONB,
  ADD COLUMN "bookingLinks"     JSONB,
  ADD COLUMN "operationalCosts" JSONB,
  ADD COLUMN "marketingPlan"    JSONB,
  ADD COLUMN "sponsorships"     JSONB,
  ADD COLUMN "attendance"       JSONB,
  ADD COLUMN "afterActionNotes" TEXT,
  ADD COLUMN "finalCba"         JSONB;

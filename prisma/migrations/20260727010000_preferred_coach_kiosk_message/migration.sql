-- Add preferredCoachId to Member
ALTER TABLE "Member" ADD COLUMN "preferredCoachId" TEXT;

-- CreateTable KioskMessage
CREATE TABLE "KioskMessage" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "KioskMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "KioskMessage_memberId_idx" ON "KioskMessage"("memberId");
CREATE INDEX "KioskMessage_sentAt_idx" ON "KioskMessage"("sentAt");

-- AddForeignKey
ALTER TABLE "KioskMessage" ADD CONSTRAINT "KioskMessage_memberId_fkey"
    FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddColumn memberCode and memberPinHash to Member
ALTER TABLE "Member" ADD COLUMN "memberCode" TEXT;
ALTER TABLE "Member" ADD COLUMN "memberPinHash" TEXT;

-- Add unique constraint on memberCode
CREATE UNIQUE INDEX "Member_memberCode_key" ON "Member"("memberCode");

-- Add index on memberCode
CREATE INDEX "Member_memberCode_idx" ON "Member"("memberCode");

-- CreateTable KioskProduct
CREATE TABLE "KioskProduct" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priceCents" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "inStock" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KioskProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable KioskPurchase
CREATE TABLE "KioskPurchase" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "priceCents" INTEGER NOT NULL,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "settledAt" TIMESTAMP(3),

    CONSTRAINT "KioskPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "KioskPurchase_memberId_idx" ON "KioskPurchase"("memberId");
CREATE INDEX "KioskPurchase_purchasedAt_idx" ON "KioskPurchase"("purchasedAt");

-- AddForeignKey
ALTER TABLE "KioskPurchase" ADD CONSTRAINT "KioskPurchase_memberId_fkey"
    FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "KioskPurchase" ADD CONSTRAINT "KioskPurchase_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "KioskProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

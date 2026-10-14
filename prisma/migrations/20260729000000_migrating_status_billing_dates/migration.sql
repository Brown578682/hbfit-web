-- AlterEnum
ALTER TYPE "MemberStatus" ADD VALUE 'MIGRATING';

-- AlterTable
ALTER TABLE "Member" ADD COLUMN "billingStartDate" TIMESTAMP(3),
ADD COLUMN "gymDeskLastBilled" TIMESTAMP(3);

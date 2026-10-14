/**
 * One-time backfill: creates Membership rows for members who have source='homeschool-heroes'
 * but no linked Membership. Run with: npx tsx scripts/backfill-memberships.ts
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: process.env.DATABASE_URL?.includes('rds.amazonaws.com') ? { rejectUnauthorized: false } : false,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const dbPlan = await prisma.membershipPlan.findUnique({ where: { slug: 'homeschool-heroes' } });
  if (!dbPlan) { console.error('homeschool-heroes plan not found in DB'); process.exit(1); }

  const members = await prisma.member.findMany({
    where: { source: 'homeschool-heroes' },
    include: { memberships: true, user: { select: { email: true } } },
  });

  console.log(`Found ${members.length} homeschool-heroes members`);
  for (const m of members) {
    if (m.memberships.length === 0) {
      await prisma.membership.create({
        data: { memberId: m.id, planId: dbPlan.id, status: 'ACTIVE' },
      });
      console.log(`  ✓ Created Membership for ${m.firstName} ${m.lastName} (${m.user.email})`);
    } else {
      console.log(`  – ${m.firstName} ${m.lastName} already has membership`);
    }
  }
  console.log('Done.');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());

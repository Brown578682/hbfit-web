import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { PrismaClient } from '@prisma/client'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
})
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

async function run() {
  const result = await prisma.user.updateMany({
    where: { email: { equals: 'brown57@gmail.com', mode: 'insensitive' } },
    data: { role: 'ADMIN' },
  })
  console.log(`Promoted ${result.count} user(s) to ADMIN`)
  await pool.end()
}
run().catch(e => { console.error(e); process.exit(1) })

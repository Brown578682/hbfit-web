import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { PrismaClient } from '@prisma/client'
import { createSetPasswordToken } from '../src/lib/tokens'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
})
// Inject the adapter so prisma.ts singleton works in script context
;(global as any).__prismaPool = pool

async function run() {
  const targets = [
    { name: 'Dan Nichols', email: 'nicholsdan84@gmail.com' },
  ]

  for (const t of targets) {
    const token = await createSetPasswordToken(t.email.toLowerCase())
    const url   = `https://honorboundfit.com/set-password?token=${token}&migrating=1`
    console.log(`\n✅ ${t.name}`)
    console.log(`   Email:  ${t.email}`)
    console.log(`   Link:   ${url}`)
  }

  await pool.end()
}

run().catch(e => { console.error(e); process.exit(1) })

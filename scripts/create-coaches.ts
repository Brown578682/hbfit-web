import { PrismaClient, MemberStatus, Role } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: process.env.DATABASE_URL?.includes('rds.amazonaws.com')
    ? { rejectUnauthorized: false }
    : false,
})
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

const coaches = [
  {
    firstName: 'Rich',
    lastName:  'Brown',
    email:     'brown57@gmail.com',
    password:  'Roadhon5&@1',
    title:     'Head Coach',
  },
  {
    firstName: 'Randy',
    lastName:  'Franklin',
    email:     'randyfranklin30@gmail.com',
    password:  'Showtime30!',
    title:     'Coach',
  },
  {
    firstName: 'Heather',
    lastName:  'Traves',
    email:     'htraves@gmail.com',
    password:  'ERrewardsPoints1975',
    title:     'Coach',
  },
]

async function run() {
  for (const c of coaches) {
    console.log(`\nProcessing coach: ${c.firstName} ${c.lastName} (${c.email})`)

    const passwordHash = await bcrypt.hash(c.password, 12)

    // Upsert user with COACH role
    let user = await prisma.user.findFirst({
      where: { email: { equals: c.email, mode: 'insensitive' } },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email:        c.email.toLowerCase(),
          name:         `${c.firstName} ${c.lastName}`,
          role:         Role.COACH,
          passwordHash,
        },
      })
      console.log(`  Created user: ${user.id}`)
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: Role.COACH, passwordHash, name: `${c.firstName} ${c.lastName}` },
      })
      console.log(`  Updated existing user → COACH: ${user.id}`)
    }

    // Upsert Staff record
    const existingStaff = await prisma.staff.findUnique({ where: { userId: user.id } })
    if (!existingStaff) {
      await prisma.staff.create({
        data: {
          userId:    user.id,
          firstName: c.firstName,
          lastName:  c.lastName,
          title:     c.title,
          isActive:  true,
        },
      })
      console.log(`  Created Staff record`)
    } else {
      await prisma.staff.update({
        where: { userId: user.id },
        data: { firstName: c.firstName, lastName: c.lastName, title: c.title, isActive: true },
      })
      console.log(`  Updated Staff record`)
    }

    console.log(`  ✅ ${c.firstName} ${c.lastName} — role: COACH — login: ${c.email}`)
  }

  console.log('\n════════════════════════════════════')
  console.log('All coach accounts ready.')
  console.log('Login URL: https://honorboundfit.com/login')
  console.log('After login, coaches are redirected to: /coach')
  console.log('════════════════════════════════════')

  await pool.end()
}

run().catch(e => { console.error(e); process.exit(1) })

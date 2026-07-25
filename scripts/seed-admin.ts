import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@admin.com'
  const password = await bcrypt.hash('admin', 10)
  
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password,
      role: 'ADMIN',
      planTier: 'ADMIN'
    },
    create: {
      email,
      name: 'Super Admin',
      password,
      role: 'ADMIN',
      planTier: 'ADMIN'
    }
  })
  
  console.log(`✅ Admin user created/updated: ${user.email}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

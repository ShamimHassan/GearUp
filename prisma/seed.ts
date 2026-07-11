import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gearup.com' },
    update: {},
    create: {
      name: 'GearUp Admin',
      email: 'admin@gearup.com',
      password: hashedPassword,
      role: UserRole.ADMIN,
      isActive: true
    }
  })
  console.log('Admin user created:', admin.email)

  // Create sample categories
  const categories = await prisma.$transaction([
    prisma.category.upsert({
      where: { name: 'Cycling' },
      update: {},
      create: { name: 'Cycling', description: 'Bicycles and cycling equipment' }
    }),
    prisma.category.upsert({
      where: { name: 'Camping' },
      update: {},
      create: { name: 'Camping', description: 'Tents, sleeping bags, and camping gear' }
    }),
    prisma.category.upsert({
      where: { name: 'Fitness' },
      update: {},
      create: { name: 'Fitness', description: 'Gym equipment and fitness gear' }
    }),
    prisma.category.upsert({
      where: { name: 'Water Sports' },
      update: {},
      create: { name: 'Water Sports', description: 'Kayaks, paddleboards, and water equipment' }
    })
  ])
  console.log('Categories created:', categories.map(c => c.name))

  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

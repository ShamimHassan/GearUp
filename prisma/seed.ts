import { PrismaClient, UserRole, RentalStatus, PaymentMethod, PaymentStatus } from '@prisma/client'
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

  // Create provider users with Bangladeshi names
  const providerPassword = await bcrypt.hash('provider123', 10)
  const providers = await prisma.$transaction([
    prisma.user.upsert({
      where: { email: 'rahman@gearup.com' },
      update: {},
      create: {
        name: 'Abdul Rahman',
        email: 'rahman@gearup.com',
        password: providerPassword,
        role: UserRole.PROVIDER,
        phone: '01711111111',
        address: 'Dhanmondi, Dhaka',
        isActive: true
      }
    }),
    prisma.user.upsert({
      where: { email: 'khan@gearup.com' },
      update: {},
      create: {
        name: 'Fatema Khan',
        email: 'khan@gearup.com',
        password: providerPassword,
        role: UserRole.PROVIDER,
        phone: '01722222222',
        address: 'Uttara, Dhaka',
        isActive: true
      }
    }),
    prisma.user.upsert({
      where: { email: 'hossain@gearup.com' },
      update: {},
      create: {
        name: 'Sakib Hossain',
        email: 'hossain@gearup.com',
        password: providerPassword,
        role: UserRole.PROVIDER,
        phone: '01733333333',
        address: 'Agrabad, Chittagong',
        isActive: true
      }
    })
  ])
  console.log('Providers created:', providers.map(p => p.name))

  // Create customer users with Bangladeshi names
  const customerPassword = await bcrypt.hash('customer123', 10)
  const customers = await prisma.$transaction([
    prisma.user.upsert({
      where: { email: 'akter@gearup.com' },
      update: {},
      create: {
        name: 'Rina Akter',
        email: 'akter@gearup.com',
        password: customerPassword,
        role: UserRole.CUSTOMER,
        phone: '01811111111',
        address: 'Mirpur, Dhaka',
        isActive: true
      }
    }),
    prisma.user.upsert({
      where: { email: 'islam@gearup.com' },
      update: {},
      create: {
        name: 'Kamrul Islam',
        email: 'islam@gearup.com',
        password: customerPassword,
        role: UserRole.CUSTOMER,
        phone: '01822222222',
        address: 'Gulshan, Dhaka',
        isActive: true
      }
    }),
    prisma.user.upsert({
      where: { email: 'das@gearup.com' },
      update: {},
      create: {
        name: 'Priya Das',
        email: 'das@gearup.com',
        password: customerPassword,
        role: UserRole.CUSTOMER,
        phone: '01833333333',
        address: 'Nasirabad, Chittagong',
        isActive: true
      }
    })
  ])
  console.log('Customers created:', customers.map(c => c.name))

  // Create more gear items
  const gearItems = await prisma.$transaction([
    // Provider 1 (Abdul Rahman)
    prisma.gearItem.upsert({
      where: { id: 'gear1' },
      update: {},
      create: {
        id: 'gear1',
        name: 'Mountain Bike',
        description: 'High-performance mountain bike for off-road adventures',
        brand: 'Trek',
        price: 500,
        stock: 2,
        images: ['https://example.com/bike1.jpg', 'https://example.com/bike2.jpg'],
        isAvailable: true,
        providerId: providers[0].id,
        categoryId: categories[0].id // Cycling
      }
    }),
    prisma.gearItem.upsert({
      where: { id: 'gear5' },
      update: {},
      create: {
        id: 'gear5',
        name: 'City Bicycle',
        description: 'Comfortable city bike for daily commuting',
        brand: 'Hero',
        price: 200,
        stock: 5,
        images: ['https://example.com/citybike.jpg'],
        isAvailable: true,
        providerId: providers[0].id,
        categoryId: categories[0].id // Cycling
      }
    }),
    // Provider 2 (Fatema Khan)
    prisma.gearItem.upsert({
      where: { id: 'gear2' },
      update: {},
      create: {
        id: 'gear2',
        name: 'Camping Tent',
        description: '4-person waterproof camping tent',
        brand: 'Coleman',
        price: 300,
        stock: 5,
        images: ['https://example.com/tent1.jpg'],
        isAvailable: true,
        providerId: providers[1].id,
        categoryId: categories[1].id // Camping
      }
    }),
    prisma.gearItem.upsert({
      where: { id: 'gear6' },
      update: {},
      create: {
        id: 'gear6',
        name: 'Sleeping Bag',
        description: 'Warm sleeping bag for cold weather',
        brand: 'The North Face',
        price: 150,
        stock: 8,
        images: ['https://example.com/sleepingbag.jpg'],
        isAvailable: true,
        providerId: providers[1].id,
        categoryId: categories[1].id // Camping
      }
    }),
    // Provider 3 (Sakib Hossain)
    prisma.gearItem.upsert({
      where: { id: 'gear3' },
      update: {},
      create: {
        id: 'gear3',
        name: 'Yoga Mat',
        description: 'Non-slip yoga mat for fitness',
        brand: 'Lululemon',
        price: 50,
        stock: 10,
        images: ['https://example.com/yoga1.jpg'],
        isAvailable: true,
        providerId: providers[2].id,
        categoryId: categories[2].id // Fitness
      }
    }),
    prisma.gearItem.upsert({
      where: { id: 'gear7' },
      update: {},
      create: {
        id: 'gear7',
        name: 'Dumbbell Set',
        description: 'Adjustable dumbbell set (10-50kg)',
        brand: 'Bowflex',
        price: 400,
        stock: 3,
        images: ['https://example.com/dumbbell.jpg'],
        isAvailable: true,
        providerId: providers[2].id,
        categoryId: categories[2].id // Fitness
      }
    }),
    prisma.gearItem.upsert({
      where: { id: 'gear4' },
      update: {},
      create: {
        id: 'gear4',
        name: 'Kayak',
        description: '2-person touring kayak',
        brand: 'Pelican',
        price: 800,
        stock: 1,
        images: ['https://example.com/kayak1.jpg'],
        isAvailable: true,
        providerId: providers[2].id,
        categoryId: categories[3].id // Water Sports
      }
    }),
    prisma.gearItem.upsert({
      where: { id: 'gear8' },
      update: {},
      create: {
        id: 'gear8',
        name: 'Stand Up Paddleboard',
        description: 'Inflatable SUP board',
        brand: 'Red Paddle Co',
        price: 600,
        stock: 2,
        images: ['https://example.com/sup.jpg'],
        isAvailable: true,
        providerId: providers[2].id,
        categoryId: categories[3].id // Water Sports
      }
    })
  ])
  console.log('Gear items created:', gearItems.map(g => g.name))

  // Create rental orders
  const rentalOrders = await prisma.$transaction([
    prisma.rentalOrder.upsert({
      where: { id: 'rental1' },
      update: {},
      create: {
        id: 'rental1',
        startDate: new Date(Date.now() + 86400000), // Tomorrow
        endDate: new Date(Date.now() + 3 * 86400000), // 3 days from now
        totalAmount: 1500,
        status: RentalStatus.PLACED,
        customerId: customers[0].id,
        gearId: gearItems[0].id
      }
    }),
    prisma.rentalOrder.upsert({
      where: { id: 'rental2' },
      update: {},
      create: {
        id: 'rental2',
        startDate: new Date(Date.now() + 2 * 86400000),
        endDate: new Date(Date.now() + 5 * 86400000),
        totalAmount: 900,
        status: RentalStatus.CONFIRMED,
        customerId: customers[1].id,
        gearId: gearItems[2].id
      }
    }),
    prisma.rentalOrder.upsert({
      where: { id: 'rental3' },
      update: {},
      create: {
        id: 'rental3',
        startDate: new Date(Date.now() - 5 * 86400000),
        endDate: new Date(Date.now() - 2 * 86400000),
        totalAmount: 450,
        status: RentalStatus.RETURNED,
        customerId: customers[2].id,
        gearId: gearItems[4].id
      }
    })
  ])
  console.log('Rental orders created:', rentalOrders.map(r => r.id))

  // Create payments
  const payments = await prisma.$transaction([
    prisma.payment.upsert({
      where: { id: 'payment1' },
      update: {},
      create: {
        id: 'payment1',
        transactionId: 'TXN1001',
        rentalOrderId: rentalOrders[0].id,
        amount: 1500,
        method: PaymentMethod.SSLCOMMERZ,
        status: PaymentStatus.COMPLETED,
        paidAt: new Date(),
        gatewayResponse: JSON.stringify({ status: 'success', transId: 'TXN1001' })
      }
    }),
    prisma.payment.upsert({
      where: { id: 'payment2' },
      update: {},
      create: {
        id: 'payment2',
        transactionId: 'TXN1002',
        rentalOrderId: rentalOrders[1].id,
        amount: 900,
        method: PaymentMethod.SSLCOMMERZ,
        status: PaymentStatus.PENDING,
        paidAt: null,
        gatewayResponse: JSON.stringify({ status: 'pending' })
      }
    }),
    prisma.payment.upsert({
      where: { id: 'payment3' },
      update: {},
      create: {
        id: 'payment3',
        transactionId: 'TXN1003',
        rentalOrderId: rentalOrders[2].id,
        amount: 450,
        method: PaymentMethod.SSLCOMMERZ,
        status: PaymentStatus.COMPLETED,
        paidAt: new Date(Date.now() - 3 * 86400000),
        gatewayResponse: JSON.stringify({ status: 'success', transId: 'TXN1003' })
      }
    })
  ])
  console.log('Payments created:', payments.map(p => p.id))

  // Create reviews
  const reviews = await prisma.$transaction([
    prisma.review.upsert({
      where: { id: 'review1' },
      update: {},
      create: {
        id: 'review1',
        rating: 5,
        comment: 'অসাধারণ মাউন্টেন বাইক! অফ-রোড ট্রেইলের জন্য নিখুঁত।',
        userId: customers[0].id,
        gearId: gearItems[0].id
      }
    }),
    prisma.review.upsert({
      where: { id: 'review2' },
      update: {},
      create: {
        id: 'review2',
        rating: 4,
        comment: 'ভালো ক্যাম্পিং টেন্ট, তবে জিনিসটা একটু ভারী।',
        userId: customers[1].id,
        gearId: gearItems[2].id
      }
    }),
    prisma.review.upsert({
      where: { id: 'review3' },
      update: {},
      create: {
        id: 'review3',
        rating: 5,
        comment: 'যোগা ম্যাটটা খুবই কমফর্টেবল!',
        userId: customers[2].id,
        gearId: gearItems[4].id
      }
    })
  ])
  console.log('Reviews created:', reviews.map(r => r.id))

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

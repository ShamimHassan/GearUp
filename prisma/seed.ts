import { PrismaClient, UserRole, RentalStatus, PaymentMethod, PaymentStatus } from '@prisma/client'
import bcrypt from 'bcrypt'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

// Fixed UUIDs so upsert works consistently across re-runs
const IDS = {
  // Users
  admin:     'a0000001-0000-4000-a000-000000000001',
  provider1: 'b0000001-0000-4000-b000-000000000001',
  provider2: 'b0000002-0000-4000-b000-000000000002',
  provider3: 'b0000003-0000-4000-b000-000000000003',
  customer1: 'c0000001-0000-4000-c000-000000000001',
  customer2: 'c0000002-0000-4000-c000-000000000002',
  customer3: 'c0000003-0000-4000-c000-000000000003',
  // Categories
  catCycling:    'd0000001-0000-4000-d000-000000000001',
  catCamping:    'd0000002-0000-4000-d000-000000000002',
  catFitness:    'd0000003-0000-4000-d000-000000000003',
  catWater:      'd0000004-0000-4000-d000-000000000004',
  // Gear
  gear1: 'e0000001-0000-4000-e000-000000000001',
  gear2: 'e0000002-0000-4000-e000-000000000002',
  gear3: 'e0000003-0000-4000-e000-000000000003',
  gear4: 'e0000004-0000-4000-e000-000000000004',
  gear5: 'e0000005-0000-4000-e000-000000000005',
  gear6: 'e0000006-0000-4000-e000-000000000006',
  gear7: 'e0000007-0000-4000-e000-000000000007',
  gear8: 'e0000008-0000-4000-e000-000000000008',
  // Rentals
  rental1: 'f0000001-0000-4000-f000-000000000001',
  rental2: 'f0000002-0000-4000-f000-000000000002',
  rental3: 'f0000003-0000-4000-f000-000000000003',
  // Payments
  payment1: '00000001-0000-4000-0000-000000000001',
  payment2: '00000002-0000-4000-0000-000000000002',
  payment3: '00000003-0000-4000-0000-000000000003',
  // Reviews
  review1: '11000001-0000-4000-1100-000000000001',
  review2: '11000002-0000-4000-1100-000000000002',
  review3: '11000003-0000-4000-1100-000000000003',
}

async function main() {
  console.log('Seeding database...')

  // ── Admin ──────────────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gearup.com' },
    update: {},
    create: {
      id: IDS.admin,
      name: 'GearUp Admin',
      email: 'admin@gearup.com',
      password: hashedPassword,
      role: UserRole.ADMIN,
      isActive: true
    }
  })
  console.log('Admin created:', admin.email)

  // ── Categories ─────────────────────────────────────────────────────────────
  const [catCycling, catCamping, catFitness, catWater] = await prisma.$transaction([
    prisma.category.upsert({
      where: { name: 'Cycling' },
      update: {},
      create: { id: IDS.catCycling, name: 'Cycling', description: 'Bicycles and cycling equipment' }
    }),
    prisma.category.upsert({
      where: { name: 'Camping' },
      update: {},
      create: { id: IDS.catCamping, name: 'Camping', description: 'Tents, sleeping bags, and camping gear' }
    }),
    prisma.category.upsert({
      where: { name: 'Fitness' },
      update: {},
      create: { id: IDS.catFitness, name: 'Fitness', description: 'Gym equipment and fitness gear' }
    }),
    prisma.category.upsert({
      where: { name: 'Water Sports' },
      update: {},
      create: { id: IDS.catWater, name: 'Water Sports', description: 'Kayaks, paddleboards, and water equipment' }
    })
  ])
  console.log('Categories created:', [catCycling, catCamping, catFitness, catWater].map(c => c.name))

  // ── Providers ──────────────────────────────────────────────────────────────
  const providerPassword = await bcrypt.hash('provider123', 10)
  const [provider1, provider2, provider3] = await prisma.$transaction([
    prisma.user.upsert({
      where: { email: 'rahman@gearup.com' },
      update: {},
      create: {
        id: IDS.provider1,
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
        id: IDS.provider2,
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
        id: IDS.provider3,
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
  console.log('Providers created:', [provider1, provider2, provider3].map(p => p.name))

  // ── Customers ──────────────────────────────────────────────────────────────
  const customerPassword = await bcrypt.hash('customer123', 10)
  const [customer1, customer2, customer3] = await prisma.$transaction([
    prisma.user.upsert({
      where: { email: 'akter@gearup.com' },
      update: {},
      create: {
        id: IDS.customer1,
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
        id: IDS.customer2,
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
        id: IDS.customer3,
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
  console.log('Customers created:', [customer1, customer2, customer3].map(c => c.name))

  // ── Gear Items ─────────────────────────────────────────────────────────────
  const gearItems = await prisma.$transaction([
    // Provider 1 — Abdul Rahman (Cycling)
    prisma.gearItem.upsert({
      where: { id: IDS.gear1 },
      update: {},
      create: {
        id: IDS.gear1,
        name: 'Mountain Bike',
        description: 'High-performance mountain bike for off-road adventures',
        brand: 'Trek',
        price: 500,
        stock: 2,
        images: ['https://example.com/bike1.jpg', 'https://example.com/bike2.jpg'],
        isAvailable: true,
        providerId: provider1.id,
        categoryId: catCycling.id
      }
    }),
    prisma.gearItem.upsert({
      where: { id: IDS.gear5 },
      update: {},
      create: {
        id: IDS.gear5,
        name: 'City Bicycle',
        description: 'Comfortable city bike for daily commuting',
        brand: 'Hero',
        price: 200,
        stock: 5,
        images: ['https://example.com/citybike.jpg'],
        isAvailable: true,
        providerId: provider1.id,
        categoryId: catCycling.id
      }
    }),
    // Provider 2 — Fatema Khan (Camping)
    prisma.gearItem.upsert({
      where: { id: IDS.gear2 },
      update: {},
      create: {
        id: IDS.gear2,
        name: 'Camping Tent',
        description: '4-person waterproof camping tent',
        brand: 'Coleman',
        price: 300,
        stock: 5,
        images: ['https://example.com/tent1.jpg'],
        isAvailable: true,
        providerId: provider2.id,
        categoryId: catCamping.id
      }
    }),
    prisma.gearItem.upsert({
      where: { id: IDS.gear6 },
      update: {},
      create: {
        id: IDS.gear6,
        name: 'Sleeping Bag',
        description: 'Warm sleeping bag for cold weather',
        brand: 'The North Face',
        price: 150,
        stock: 8,
        images: ['https://example.com/sleepingbag.jpg'],
        isAvailable: true,
        providerId: provider2.id,
        categoryId: catCamping.id
      }
    }),
    // Provider 3 — Sakib Hossain (Fitness)
    prisma.gearItem.upsert({
      where: { id: IDS.gear3 },
      update: {},
      create: {
        id: IDS.gear3,
        name: 'Yoga Mat',
        description: 'Non-slip yoga mat for fitness',
        brand: 'Lululemon',
        price: 50,
        stock: 10,
        images: ['https://example.com/yoga1.jpg'],
        isAvailable: true,
        providerId: provider3.id,
        categoryId: catFitness.id
      }
    }),
    prisma.gearItem.upsert({
      where: { id: IDS.gear7 },
      update: {},
      create: {
        id: IDS.gear7,
        name: 'Dumbbell Set',
        description: 'Adjustable dumbbell set (10-50kg)',
        brand: 'Bowflex',
        price: 400,
        stock: 3,
        images: ['https://example.com/dumbbell.jpg'],
        isAvailable: true,
        providerId: provider3.id,
        categoryId: catFitness.id
      }
    }),
    // Provider 3 — Sakib Hossain (Water Sports)
    prisma.gearItem.upsert({
      where: { id: IDS.gear4 },
      update: {},
      create: {
        id: IDS.gear4,
        name: 'Kayak',
        description: '2-person touring kayak',
        brand: 'Pelican',
        price: 800,
        stock: 1,
        images: ['https://example.com/kayak1.jpg'],
        isAvailable: true,
        providerId: provider3.id,
        categoryId: catWater.id
      }
    }),
    prisma.gearItem.upsert({
      where: { id: IDS.gear8 },
      update: {},
      create: {
        id: IDS.gear8,
        name: 'Stand Up Paddleboard',
        description: 'Inflatable SUP board',
        brand: 'Red Paddle Co',
        price: 600,
        stock: 2,
        images: ['https://example.com/sup.jpg'],
        isAvailable: true,
        providerId: provider3.id,
        categoryId: catWater.id
      }
    })
  ])
  console.log('Gear items created:', gearItems.map(g => `${g.name} (${g.id})`))

  // ── Rental Orders ──────────────────────────────────────────────────────────
  const rentalOrders = await prisma.$transaction([
    prisma.rentalOrder.upsert({
      where: { id: IDS.rental1 },
      update: {},
      create: {
        id: IDS.rental1,
        startDate: new Date(Date.now() + 86400000),
        endDate: new Date(Date.now() + 3 * 86400000),
        totalAmount: 1500,
        status: RentalStatus.PLACED,
        customerId: customer1.id,
        gearId: gearItems[0].id
      }
    }),
    prisma.rentalOrder.upsert({
      where: { id: IDS.rental2 },
      update: {},
      create: {
        id: IDS.rental2,
        startDate: new Date(Date.now() + 2 * 86400000),
        endDate: new Date(Date.now() + 5 * 86400000),
        totalAmount: 900,
        status: RentalStatus.CONFIRMED,
        customerId: customer2.id,
        gearId: gearItems[2].id
      }
    }),
    prisma.rentalOrder.upsert({
      where: { id: IDS.rental3 },
      update: {},
      create: {
        id: IDS.rental3,
        startDate: new Date(Date.now() - 5 * 86400000),
        endDate: new Date(Date.now() - 2 * 86400000),
        totalAmount: 450,
        status: RentalStatus.RETURNED,
        customerId: customer3.id,
        gearId: gearItems[4].id
      }
    })
  ])
  console.log('Rental orders created:', rentalOrders.map(r => r.id))

  // ── Payments ───────────────────────────────────────────────────────────────
  const payments = await prisma.$transaction([
    prisma.payment.upsert({
      where: { id: IDS.payment1 },
      update: {},
      create: {
        id: IDS.payment1,
        transactionId: 'TRNX_ID_1000000001',
        rentalOrderId: rentalOrders[0].id,
        amount: 1500,
        method: PaymentMethod.SSLCOMMERZ,
        status: PaymentStatus.COMPLETED,
        paidAt: new Date(),
        gatewayResponse: { status: 'success', transId: 'TRNX_ID_1000000001' }
      }
    }),
    prisma.payment.upsert({
      where: { id: IDS.payment2 },
      update: {},
      create: {
        id: IDS.payment2,
        transactionId: 'TRNX_ID_1000000002',
        rentalOrderId: rentalOrders[1].id,
        amount: 900,
        method: PaymentMethod.SSLCOMMERZ,
        status: PaymentStatus.PENDING,
        paidAt: null,
        gatewayResponse: { status: 'pending' }
      }
    }),
    prisma.payment.upsert({
      where: { id: IDS.payment3 },
      update: {},
      create: {
        id: IDS.payment3,
        transactionId: 'TRNX_ID_1000000003',
        rentalOrderId: rentalOrders[2].id,
        amount: 450,
        method: PaymentMethod.SSLCOMMERZ,
        status: PaymentStatus.COMPLETED,
        paidAt: new Date(Date.now() - 3 * 86400000),
        gatewayResponse: { status: 'success', transId: 'TRNX_ID_1000000003' }
      }
    })
  ])
  console.log('Payments created:', payments.map(p => p.id))

  // ── Reviews ────────────────────────────────────────────────────────────────
  const reviews = await prisma.$transaction([
    prisma.review.upsert({
      where: { id: IDS.review1 },
      update: {},
      create: {
        id: IDS.review1,
        rating: 5,
        comment: 'অসাধারণ মাউন্টেন বাইক! অফ-রোড ট্রেইলের জন্য নিখুঁত।',
        userId: customer1.id,
        gearId: gearItems[0].id
      }
    }),
    prisma.review.upsert({
      where: { id: IDS.review2 },
      update: {},
      create: {
        id: IDS.review2,
        rating: 4,
        comment: 'ভালো ক্যাম্পিং টেন্ট, তবে জিনিসটা একটু ভারী।',
        userId: customer2.id,
        gearId: gearItems[2].id
      }
    }),
    prisma.review.upsert({
      where: { id: IDS.review3 },
      update: {},
      create: {
        id: IDS.review3,
        rating: 5,
        comment: 'যোগা ম্যাটটা খুবই কমফর্টেবল!',
        userId: customer3.id,
        gearId: gearItems[4].id
      }
    })
  ])
  console.log('Reviews created:', reviews.map(r => r.id))

  console.log('\n✅ Seeding complete!')
  console.log('\n📋 Gear IDs for testing:')
  gearItems.forEach(g => console.log(`  ${g.name}: ${g.id}`))
  console.log('\n📋 Category IDs for testing:')
  ;[catCycling, catCamping, catFitness, catWater].forEach(c => console.log(`  ${c.name}: ${c.id}`))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

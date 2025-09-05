import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create loyalty tiers
  console.log('📊 Creating loyalty tiers...')
  const loyaltyTiers = [
    {
      tier: 'bronze',
      name: 'Bronze',
      minSpent: 0,
      pointsMultiplier: 1.00,
      benefits: {
        description: 'Velkommen til DrawDash Rewards',
        features: [
          'Grundlæggende pointoptjening',
          'Adgang til alle lodtrækninger',
          'Points indløsning'
        ]
      },
      color: '#CD7F32',
      icon: '🥉'
    },
    {
      tier: 'silver',
      name: 'Silver',
      minSpent: 500,
      pointsMultiplier: 1.15,
      benefits: {
        description: 'Forbedret pointoptjening og fordele',
        features: [
          '15% bonus points',
          'Prioriteret kundeservice',
          'Månedlig gratis billet',
          'Fødselsdagsbonus'
        ]
      },
      color: '#C0C0C0',
      icon: '🥈'
    },
    {
      tier: 'gold',
      name: 'Gold',
      minSpent: 2000,
      pointsMultiplier: 1.30,
      benefits: {
        description: 'Premium fordele med ekstra belønninger',
        features: [
          '30% bonus points',
          'VIP kundeservice',
          'Ugentlig gratis billet',
          'Early access til nye lodder',
          'Eksklusive tilbud'
        ]
      },
      color: '#FFD700',
      icon: '🥇'
    },
    {
      tier: 'diamond',
      name: 'Diamond',
      minSpent: 10000,
      pointsMultiplier: 1.50,
      benefits: {
        description: 'Elite status med maksimale fordele',
        features: [
          '50% bonus points',
          'Personlig rådgiver',
          'Daglige gratis billetter',
          'Eksklusive Diamond lodtrækninger',
          'Premium support',
          'Invitationer til events'
        ]
      },
      color: '#B9F2FF',
      icon: '💎'
    }
  ]

  for (const tier of loyaltyTiers) {
    await prisma.loyaltyTier.upsert({
      where: { tier: tier.tier },
      update: tier,
      create: tier
    })
  }

  // Create system settings
  console.log('⚙️ Creating system settings...')
  const settings = [
    {
      key: 'site_name',
      value: 'DrawDash',
      description: 'Site name displayed in header and meta tags'
    },
    {
      key: 'contact_email',
      value: 'support@drawdash.dk',
      description: 'Contact email for customer support'
    },
    {
      key: 'min_ticket_price',
      value: 0.50,
      description: 'Minimum allowed ticket price in DKK'
    },
    {
      key: 'max_ticket_price',
      value: 100.00,
      description: 'Maximum allowed ticket price in DKK'
    },
    {
      key: 'max_tickets_per_purchase',
      value: 50,
      description: 'Maximum number of tickets a user can buy in one transaction'
    },
    {
      key: 'payment_provider',
      value: 'stripe',
      description: 'Payment provider (stripe, paypal, etc.)'
    },
    {
      key: 'loyalty_points_per_kroner',
      value: 1,
      description: 'Base points earned per Danish kroner spent'
    },
    {
      key: 'max_points_redemption_percentage',
      value: 50,
      description: 'Maximum percentage of cart value that can be paid with points'
    },
    {
      key: 'points_redemption_rate',
      value: 200,
      description: 'Points required to redeem 1 Danish krone (200 points = 1 kr)'
    }
  ]

  for (const setting of settings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value, description: setting.description },
      create: setting
    })
  }

  // Create admin user
  console.log('👤 Creating admin user...')
  const bcrypt = await import('bcryptjs')
  const passwordHash = await bcrypt.hash('admin123', 12)

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@drawdash.dk' },
    update: {},
    create: {
      email: 'admin@drawdash.dk',
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      isAdmin: true,
      isVerified: true,
      points: 0,
      totalSpent: 0,
      loyaltyTier: 'gold'
    }
  })

  // Create test user
  console.log('🧪 Creating test user...')
  const testPasswordHash = await bcrypt.hash('test123', 12)

  const testUser = await prisma.user.upsert({
    where: { email: 'test@drawdash.dk' },
    update: {},
    create: {
      email: 'test@drawdash.dk',
      passwordHash: testPasswordHash,
      firstName: 'Test',
      lastName: 'Bruger',
      isVerified: true,
      points: 1500,
      totalSpent: 750,
      loyaltyTier: 'silver',
      phone: '+4550123456'
    }
  })

  // Create sample raffle
  console.log('🎫 Creating sample raffle...')
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + 7) // 7 days from now

  const raffle = await prisma.raffle.create({
    data: {
      title: 'iPhone 15 Pro Max',
      description: 'Brand new iPhone 15 Pro Max 256GB in Titanium Blue. Komplet med original emballage og tilbehør.',
      imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800',
      ticketPrice: 25.00,
      totalTickets: 500,
      soldTickets: 47,
      endDate: endDate,
      status: 'active',
      createdBy: adminUser.id,
      prizes: {
        create: [
          {
            name: 'iPhone 15 Pro Max',
            description: '256GB Titanium Blue',
            value: 12999.00,
            imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800'
          }
        ]
      }
    }
  })

  // Create some sample entries for the test user
  console.log('🎟️ Creating sample entries...')
  await prisma.raffleEntry.create({
    data: {
      raffleId: raffle.id,
      userId: testUser.id,
      quantity: 5,
      totalAmount: 125.00,
      paymentStatus: 'completed',
      ticketNumbers: [1, 2, 3, 4, 5],
      paymentIntentId: 'pi_test_' + Math.random().toString(36).substr(2, 9)
    }
  })

  console.log('✅ Database seed completed!')
  console.log(`📧 Admin login: admin@drawdash.dk / admin123`)
  console.log(`🧪 Test user login: test@drawdash.dk / test123`)
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
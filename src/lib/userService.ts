import { prisma } from './database'
import { User, UserAddress } from '@prisma/client'
import bcrypt from 'bcryptjs'

export interface CreateUserData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  dateOfBirth?: Date
}

export interface UpdateUserData {
  firstName?: string
  lastName?: string
  phone?: string
  dateOfBirth?: Date
  isVerified?: boolean
}

export class UserService {
  // Create new user
  async createUser(userData: CreateUserData): Promise<User> {
    const passwordHash = await bcrypt.hash(userData.password, 12)
    
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        passwordHash,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        dateOfBirth: userData.dateOfBirth,
      }
    })

    return user
  }

  // Find user by email
  async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email }
    })
  }

  // Find user by ID with relations
  async findById(id: string, includeRelations = false): Promise<(User & {
    addresses?: UserAddress[]
    pointTransactions?: any[]
  }) | null> {
    return await prisma.user.findUnique({
      where: { id },
      include: includeRelations ? {
        addresses: true,
        pointTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      } : undefined
    })
  }

  // Update user
  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    return await prisma.user.update({
      where: { id },
      data
    })
  }

  // Verify password
  async verifyPassword(user: User, password: string): Promise<boolean> {
    return await bcrypt.compare(password, user.passwordHash)
  }

  // Add points to user
  async addPoints(userId: string, points: number, description: string, metadata?: any): Promise<void> {
    await prisma.$transaction([
      // Update user points
      prisma.user.update({
        where: { id: userId },
        data: {
          points: {
            increment: points
          }
        }
      }),
      
      // Create transaction record
      prisma.pointTransaction.create({
        data: {
          userId,
          type: 'earned',
          points,
          description,
          metadata
        }
      })
    ])
  }

  // Update loyalty tier based on total spent
  async updateLoyaltyTier(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return

    // Get appropriate tier based on total spent
    const tier = await prisma.loyaltyTier.findFirst({
      where: {
        minSpent: {
          lte: user.totalSpent
        }
      },
      orderBy: {
        minSpent: 'desc'
      }
    })

    if (tier && tier.tier !== user.loyaltyTier) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          loyaltyTier: tier.tier
        }
      })
    }
  }

  // Get user stats
  async getUserStats(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        raffleEntries: {
          include: {
            raffle: true
          }
        },
        pointTransactions: true
      }
    })

    if (!user) return null

    const totalRafflesEntered = user.raffleEntries.length
    const totalTicketsPurchased = user.raffleEntries.reduce((sum, entry) => sum + entry.quantity, 0)
    const totalPointsEarned = user.pointTransactions
      .filter(t => t.type === 'earned')
      .reduce((sum, t) => sum + t.points, 0)

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        points: user.points,
        totalSpent: user.totalSpent,
        loyaltyTier: user.loyaltyTier,
        createdAt: user.createdAt
      },
      stats: {
        totalRafflesEntered,
        totalTicketsPurchased,
        totalPointsEarned,
        currentPoints: user.points
      }
    }
  }

  // Search users (admin)
  async searchUsers(query: string, limit = 50) {
    return await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: query, mode: 'insensitive' } },
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: limit,
      orderBy: { createdAt: 'desc' }
    })
  }

  // Get all users with pagination (admin)
  async getAllUsers(page = 1, limit = 50) {
    const skip = (page - 1) * limit
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          raffleEntries: {
            select: { quantity: true, totalAmount: true }
          }
        }
      }),
      prisma.user.count()
    ])

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }
}

// Export singleton
export const userService = new UserService()
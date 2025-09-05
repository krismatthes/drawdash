import { prisma } from './database'
import { Raffle, RafflePrize, RaffleEntry, User } from '@prisma/client'

export interface CreateRaffleData {
  title: string
  description: string
  imageUrl?: string
  ticketPrice: number
  totalTickets: number
  endDate: Date
  createdBy: string
  prizes: {
    name: string
    description?: string
    value: number
    imageUrl?: string
  }[]
}

export interface CreateEntryData {
  raffleId: string
  userId: string
  quantity: number
  totalAmount: number
  paymentIntentId?: string
}

export class RaffleServiceDB {
  // Create new raffle with prizes
  async createRaffle(data: CreateRaffleData): Promise<Raffle & { prizes: RafflePrize[] }> {
    return await prisma.raffle.create({
      data: {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        ticketPrice: data.ticketPrice,
        totalTickets: data.totalTickets,
        endDate: data.endDate,
        createdBy: data.createdBy,
        status: 'upcoming',
        prizes: {
          create: data.prizes
        }
      },
      include: {
        prizes: true,
        creator: true
      }
    })
  }

  // Get active raffles
  async getActiveRaffles(): Promise<(Raffle & { 
    prizes: RafflePrize[]
    _count: { entries: number }
  })[]> {
    return await prisma.raffle.findMany({
      where: {
        status: {
          in: ['upcoming', 'active']
        },
        endDate: {
          gte: new Date()
        }
      },
      include: {
        prizes: true,
        _count: {
          select: { entries: true }
        }
      },
      orderBy: { endDate: 'asc' }
    })
  }

  // Get raffle by ID with full details
  async getRaffleById(id: string): Promise<(Raffle & {
    prizes: RafflePrize[]
    entries: (RaffleEntry & { user: User })[]
    creator: User
    winner?: User | null
  }) | null> {
    return await prisma.raffle.findUnique({
      where: { id },
      include: {
        prizes: true,
        entries: {
          include: {
            user: true
          },
          orderBy: { createdAt: 'desc' }
        },
        creator: true,
        winner: true
      }
    })
  }

  // Create raffle entry (buy tickets)
  async createEntry(data: CreateEntryData): Promise<RaffleEntry> {
    return await prisma.$transaction(async (tx) => {
      // Check raffle exists and is active
      const raffle = await tx.raffle.findUnique({
        where: { id: data.raffleId }
      })

      if (!raffle) {
        throw new Error('Raffle not found')
      }

      if (raffle.status !== 'active' && raffle.status !== 'upcoming') {
        throw new Error('Raffle is not available for entries')
      }

      if (raffle.endDate < new Date()) {
        throw new Error('Raffle has ended')
      }

      // Check if enough tickets available
      if (raffle.soldTickets + data.quantity > raffle.totalTickets) {
        throw new Error('Not enough tickets available')
      }

      // Get next ticket numbers
      const ticketNumbers: number[] = []
      for (let i = 0; i < data.quantity; i++) {
        ticketNumbers.push(raffle.soldTickets + i + 1)
      }

      // Create entry
      const entry = await tx.raffleEntry.create({
        data: {
          raffleId: data.raffleId,
          userId: data.userId,
          quantity: data.quantity,
          totalAmount: data.totalAmount,
          paymentIntentId: data.paymentIntentId,
          ticketNumbers,
          paymentStatus: 'pending'
        }
      })

      // Update raffle sold tickets
      await tx.raffle.update({
        where: { id: data.raffleId },
        data: {
          soldTickets: {
            increment: data.quantity
          }
        }
      })

      return entry
    })
  }

  // Complete payment for entry
  async completePayment(entryId: string, paymentIntentId: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // Update entry payment status
      const entry = await tx.raffleEntry.update({
        where: { id: entryId },
        data: {
          paymentStatus: 'completed',
          paymentIntentId
        },
        include: {
          user: true
        }
      })

      // Calculate and award points
      const basePoints = Math.floor(Number(entry.totalAmount))
      
      // Get user's loyalty tier for multiplier
      const loyaltyTier = await tx.loyaltyTier.findUnique({
        where: { tier: entry.user.loyaltyTier }
      })
      
      const multiplier = loyaltyTier?.pointsMultiplier || 1
      let totalPoints = Math.floor(basePoints * Number(multiplier))
      
      // Quantity bonus
      let bonus = 0
      if (entry.quantity >= 25) {
        bonus = Math.floor(totalPoints * 0.30)
      } else if (entry.quantity >= 10) {
        bonus = Math.floor(totalPoints * 0.20)
      } else if (entry.quantity >= 5) {
        bonus = Math.floor(totalPoints * 0.10)
      }
      
      totalPoints += bonus

      // Update user points and total spent
      await tx.user.update({
        where: { id: entry.userId },
        data: {
          points: {
            increment: totalPoints
          },
          totalSpent: {
            increment: entry.totalAmount
          }
        }
      })

      // Create point transaction record
      await tx.pointTransaction.create({
        data: {
          userId: entry.userId,
          raffleEntryId: entry.id,
          type: 'earned',
          points: totalPoints,
          description: `Points optjent for køb af ${entry.quantity} billetter`,
          metadata: {
            basePoints,
            multiplier: Number(multiplier),
            quantityBonus: bonus,
            ticketQuantity: entry.quantity,
            tier: entry.user.loyaltyTier
          }
        }
      })

      // Update user's loyalty tier if needed
      const newTotalSpent = Number(entry.user.totalSpent) + Number(entry.totalAmount)
      const newTier = await tx.loyaltyTier.findFirst({
        where: {
          minSpent: {
            lte: newTotalSpent
          }
        },
        orderBy: {
          minSpent: 'desc'
        }
      })

      if (newTier && newTier.tier !== entry.user.loyaltyTier) {
        await tx.user.update({
          where: { id: entry.userId },
          data: {
            loyaltyTier: newTier.tier
          }
        })
      }
    })
  }

  // Draw winner for raffle
  async drawWinner(raffleId: string): Promise<{ winner: User, winningTicketNumber: number }> {
    return await prisma.$transaction(async (tx) => {
      const raffle = await tx.raffle.findUnique({
        where: { id: raffleId },
        include: {
          entries: {
            where: {
              paymentStatus: 'completed'
            },
            include: {
              user: true
            }
          }
        }
      })

      if (!raffle) {
        throw new Error('Raffle not found')
      }

      if (raffle.entries.length === 0) {
        throw new Error('No valid entries for this raffle')
      }

      // Collect all ticket numbers
      const allTickets: { ticketNumber: number, userId: string, user: User }[] = []
      for (const entry of raffle.entries) {
        for (const ticketNumber of entry.ticketNumbers) {
          allTickets.push({
            ticketNumber,
            userId: entry.userId,
            user: entry.user
          })
        }
      }

      // Draw random winner
      const randomIndex = Math.floor(Math.random() * allTickets.length)
      const winningTicket = allTickets[randomIndex]

      // Update raffle with winner
      await tx.raffle.update({
        where: { id: raffleId },
        data: {
          status: 'ended',
          winnerUserId: winningTicket.userId,
          winnerTicketNumber: winningTicket.ticketNumber,
          winnerDrawnAt: new Date()
        }
      })

      return {
        winner: winningTicket.user,
        winningTicketNumber: winningTicket.ticketNumber
      }
    })
  }

  // Get user's entries for a raffle
  async getUserEntries(userId: string, raffleId?: string) {
    return await prisma.raffleEntry.findMany({
      where: {
        userId,
        ...(raffleId && { raffleId })
      },
      include: {
        raffle: {
          include: {
            prizes: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  // Get raffle statistics
  async getRaffleStats(raffleId: string) {
    const raffle = await prisma.raffle.findUnique({
      where: { id: raffleId },
      include: {
        entries: {
          where: {
            paymentStatus: 'completed'
          }
        },
        _count: {
          select: { entries: true }
        }
      }
    })

    if (!raffle) return null

    const totalTicketsSold = raffle.entries.reduce((sum, entry) => sum + entry.quantity, 0)
    const totalRevenue = raffle.entries.reduce((sum, entry) => sum + Number(entry.totalAmount), 0)
    const uniqueParticipants = new Set(raffle.entries.map(e => e.userId)).size

    return {
      totalTicketsSold,
      totalRevenue,
      uniqueParticipants,
      percentageSold: (totalTicketsSold / raffle.totalTickets) * 100,
      entries: raffle._count.entries
    }
  }

  // Get all raffles (for admin)
  async getAllRaffles(): Promise<(Raffle & { 
    prizes: RafflePrize[]
    _count: { entries: number }
  })[]> {
    return await prisma.raffle.findMany({
      include: {
        prizes: true,
        _count: {
          select: { entries: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  // Get recent entries for admin dashboard
  async getRecentEntries(limit: number = 10): Promise<any[]> {
    try {
      const entries = await prisma.raffleEntry.findMany({
        take: limit,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          raffle: {
            select: {
              title: true
            }
          }
        }
      })

      return entries
    } catch (error) {
      console.error('Error fetching recent entries:', error)
      return []
    }
  }

  // Get total entries count
  async getTotalEntriesCount(): Promise<number> {
    try {
      const count = await prisma.raffleEntry.count()
      return count
    } catch (error) {
      console.error('Error getting entries count:', error)
      return 0
    }
  }

  // Get total revenue
  async getTotalRevenue(): Promise<number> {
    try {
      const result = await prisma.raffleEntry.aggregate({
        _sum: {
          totalAmount: true
        },
        where: {
          paymentStatus: 'completed'
        }
      })

      return Number(result._sum.totalAmount) || 0
    } catch (error) {
      console.error('Error getting total revenue:', error)
      return 0
    }
  }

  // Get user raffle entries (for account page)
  async getUserRaffleEntries(userId: string): Promise<any[]> {
    try {
      const entries = await prisma.raffleEntry.findMany({
        where: {
          userId
        },
        include: {
          raffle: {
            select: {
              id: true,
              title: true,
              status: true,
              endDate: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      return entries
    } catch (error) {
      console.error('Error fetching user raffle entries:', error)
      return []
    }
  }
}

// Export singleton
export const raffleServiceDB = new RaffleServiceDB()
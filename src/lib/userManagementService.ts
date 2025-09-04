'use client'

import { bonusRewardService } from './bonusRewardService'
import { Transaction, Payout } from './financeService'

// Enhanced user interface with all needed fields
export interface AdminUser {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
  registeredAt: Date
  lastActivity: Date
  isActive: boolean
  isVerified: boolean
  isBlocked: boolean
  blockReason?: string
  blockedAt?: Date
  blockedBy?: string
  totalSpent: number
  totalTickets: number
  totalWinnings: number
  loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum'
  loyaltyPoints: number
  riskScore?: number
  fraudFlags: number
  drawPreferences: {
    highValue: number // participation in high-value raffles (>10000 kr)
    cashPrizes: number // cash/instant win games
    electronics: number // phones, laptops, etc.
    experiences: number // trips, events
    cars: number // vehicle raffles
    lifestyle: number // fashion, beauty, home
  }
  crmSegment: 'high_roller' | 'regular' | 'casual' | 'new' | 'at_risk' | 'dormant'
  acquisitionChannel?: string
  adminNotes?: string
}

// Action log for audit trail
export interface UserAction {
  id: string
  userId: string
  actionType: 'block' | 'unblock' | 'edit' | 'grant_tickets' | 'view' | 'export' | 'note_added'
  details: string
  performedBy: string
  performedAt: Date
  metadata?: {
    previousValues?: any
    newValues?: any
    raffleId?: string
    ticketsGranted?: number
    reason?: string
  }
}

// Free ticket grant record
export interface FreeTicketGrant {
  id: string
  userId: string
  raffleId: string
  ticketQuantity: number
  reason: string
  grantedBy: string
  grantedAt: Date
  status: 'active' | 'used' | 'expired'
  ticketNumbers?: number[]
  metadata?: {
    bonusId?: string
  }
}

// Draw participation record
export interface DrawParticipation {
  id: string
  userId: string
  raffleId: string
  raffleTitle: string
  raffleType: 'high_value' | 'cash' | 'electronics' | 'experiences' | 'cars' | 'lifestyle'
  ticketCount: number
  amountSpent: number
  participationDate: Date
  result?: 'won' | 'lost' | 'pending'
  winAmount?: number
}

// Payment transaction record
export interface UserTransaction {
  id: string
  userId: string
  type: 'deposit' | 'withdrawal' | 'purchase' | 'refund' | 'bonus' | 'payout' | 'fee' | 'bonus_redemption'
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'processing'
  paymentMethod: string
  description: string
  timestamp: Date
  raffleId?: string
  metadata?: any
}

// Storage keys
const USERS_STORAGE_KEY = 'drawdash_admin_users'
const USER_ACTIONS_STORAGE_KEY = 'drawdash_user_actions'
const FREE_TICKETS_STORAGE_KEY = 'drawdash_free_tickets'
const DRAW_PARTICIPATIONS_STORAGE_KEY = 'drawdash_draw_participations'
const USER_TRANSACTIONS_STORAGE_KEY = 'drawdash_user_transactions'

// Mock data initialization
const initializeMockData = () => {
  if (typeof window === 'undefined') return

  const existingUsers = localStorage.getItem(USERS_STORAGE_KEY)
  if (!existingUsers) {
    const mockUsers: AdminUser[] = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.dk',
        phone: '+45 12 34 56 78',
        address: 'Vesterbrogade 123',
        city: 'Copenhagen',
        postalCode: '1620',
        country: 'Denmark',
        registeredAt: new Date('2024-01-15'),
        isActive: true,
        isVerified: true,
        isBlocked: false,
        totalSpent: 2500,
        totalTickets: 125,
        totalWinnings: 500,
        lastActivity: new Date('2024-08-28'),
        loyaltyTier: 'gold',
        loyaltyPoints: 2500,
        riskScore: 25,
        fraudFlags: 0,
        drawPreferences: {
          highValue: 15,
          cashPrizes: 20,
          electronics: 30,
          experiences: 5,
          cars: 10,
          lifestyle: 20
        },
        crmSegment: 'regular',
        acquisitionChannel: 'organic',
        adminNotes: 'Good customer, consistent activity'
      },
      {
        id: '2',
        firstName: 'Sarah',
        lastName: 'Nielsen',
        email: 'sarah.nielsen@email.dk',
        phone: '+45 87 65 43 21',
        address: 'Nørrebrogade 456',
        city: 'Copenhagen',
        postalCode: '2200',
        country: 'Denmark',
        registeredAt: new Date('2024-02-03'),
        isActive: true,
        isVerified: true,
        isBlocked: false,
        totalSpent: 1800,
        totalTickets: 90,
        totalWinnings: 1200,
        lastActivity: new Date('2024-08-29'),
        loyaltyTier: 'silver',
        loyaltyPoints: 1800,
        riskScore: 15,
        fraudFlags: 0,
        drawPreferences: {
          highValue: 25,
          cashPrizes: 15,
          electronics: 20,
          experiences: 15,
          cars: 20,
          lifestyle: 5
        },
        crmSegment: 'high_roller',
        acquisitionChannel: 'paid_social'
      },
      {
        id: '3',
        firstName: 'Mike',
        lastName: 'Hansen',
        email: 'mike.hansen@email.dk',
        registeredAt: new Date('2024-03-12'),
        isActive: false,
        isVerified: false,
        isBlocked: true,
        blockReason: 'Suspicious activity - multiple accounts detected',
        blockedAt: new Date('2024-07-20'),
        blockedBy: 'admin@drawdash.dk',
        totalSpent: 200,
        totalTickets: 10,
        totalWinnings: 0,
        lastActivity: new Date('2024-07-15'),
        loyaltyTier: 'bronze',
        loyaltyPoints: 50,
        riskScore: 85,
        fraudFlags: 3,
        drawPreferences: {
          highValue: 0,
          cashPrizes: 100,
          electronics: 0,
          experiences: 0,
          cars: 0,
          lifestyle: 0
        },
        crmSegment: 'at_risk',
        adminNotes: 'Flagged for review - multiple payment methods used'
      },
      {
        id: '4',
        firstName: 'Emma',
        lastName: 'Larsen',
        email: 'emma.larsen@email.dk',
        phone: '+45 11 22 33 44',
        address: 'Østerbrogade 789',
        city: 'Copenhagen',
        postalCode: '2100',
        country: 'Denmark',
        registeredAt: new Date('2024-04-20'),
        isActive: true,
        isVerified: true,
        isBlocked: false,
        totalSpent: 3200,
        totalTickets: 160,
        totalWinnings: 800,
        lastActivity: new Date('2024-08-29'),
        loyaltyTier: 'platinum',
        loyaltyPoints: 3200,
        riskScore: 10,
        fraudFlags: 0,
        drawPreferences: {
          highValue: 40,
          cashPrizes: 10,
          electronics: 25,
          experiences: 15,
          cars: 10,
          lifestyle: 0
        },
        crmSegment: 'high_roller',
        acquisitionChannel: 'referral',
        adminNotes: 'VIP customer - high value participant'
      },
      {
        id: '5',
        firstName: 'David',
        lastName: 'Andersen',
        email: 'david.andersen@email.dk',
        registeredAt: new Date('2024-05-08'),
        isActive: true,
        isVerified: false,
        isBlocked: false,
        totalSpent: 450,
        totalTickets: 23,
        totalWinnings: 0,
        lastActivity: new Date('2024-08-25'),
        loyaltyTier: 'bronze',
        loyaltyPoints: 450,
        riskScore: 30,
        fraudFlags: 1,
        drawPreferences: {
          highValue: 5,
          cashPrizes: 30,
          electronics: 40,
          experiences: 0,
          cars: 0,
          lifestyle: 25
        },
        crmSegment: 'new',
        acquisitionChannel: 'direct'
      }
    ]

    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(mockUsers))
  }

  // Initialize empty arrays for other data
  if (!localStorage.getItem(USER_ACTIONS_STORAGE_KEY)) {
    localStorage.setItem(USER_ACTIONS_STORAGE_KEY, JSON.stringify([]))
  }
  if (!localStorage.getItem(FREE_TICKETS_STORAGE_KEY)) {
    localStorage.setItem(FREE_TICKETS_STORAGE_KEY, JSON.stringify([]))
  }
  if (!localStorage.getItem(DRAW_PARTICIPATIONS_STORAGE_KEY)) {
    localStorage.setItem(DRAW_PARTICIPATIONS_STORAGE_KEY, JSON.stringify([]))
  }
  if (!localStorage.getItem(USER_TRANSACTIONS_STORAGE_KEY)) {
    localStorage.setItem(USER_TRANSACTIONS_STORAGE_KEY, JSON.stringify([]))
  }
}

initializeMockData()

// Helper function to log user actions
const logUserAction = (
  userId: string,
  actionType: UserAction['actionType'],
  details: string,
  performedBy: string,
  metadata?: UserAction['metadata']
) => {
  if (typeof window === 'undefined') return

  const actions = JSON.parse(localStorage.getItem(USER_ACTIONS_STORAGE_KEY) || '[]') as UserAction[]
  const newAction: UserAction = {
    id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    actionType,
    details,
    performedBy,
    performedAt: new Date(),
    metadata
  }
  actions.unshift(newAction) // Add to beginning for recent-first display
  localStorage.setItem(USER_ACTIONS_STORAGE_KEY, JSON.stringify(actions))
}

// User Management Service
export const userManagementService = {
  // Get all users
  getAllUsers: (): AdminUser[] => {
    if (typeof window === 'undefined') return []
    
    const stored = localStorage.getItem(USERS_STORAGE_KEY)
    if (!stored) return []
    
    const users = JSON.parse(stored) as AdminUser[]
    return users.map(user => ({
      ...user,
      registeredAt: new Date(user.registeredAt),
      lastActivity: new Date(user.lastActivity),
      blockedAt: user.blockedAt ? new Date(user.blockedAt) : undefined
    }))
  },

  // Get user by ID
  getUserById: (id: string): AdminUser | null => {
    const users = userManagementService.getAllUsers()
    return users.find(user => user.id === id) || null
  },

  // Update user
  updateUser: (userId: string, updates: Partial<AdminUser>, performedBy: string): boolean => {
    const users = userManagementService.getAllUsers()
    const userIndex = users.findIndex(user => user.id === userId)
    
    if (userIndex === -1) return false

    const previousValues = { ...users[userIndex] }
    users[userIndex] = { ...users[userIndex], ...updates }
    
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))

    // Log the action
    logUserAction(
      userId,
      'edit',
      `User details updated`,
      performedBy,
      { previousValues, newValues: updates }
    )

    return true
  },

  // Block user
  blockUser: (userId: string, reason: string, performedBy: string): boolean => {
    const users = userManagementService.getAllUsers()
    const userIndex = users.findIndex(user => user.id === userId)
    
    if (userIndex === -1) return false

    users[userIndex].isBlocked = true
    users[userIndex].blockReason = reason
    users[userIndex].blockedAt = new Date()
    users[userIndex].blockedBy = performedBy
    users[userIndex].isActive = false

    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))

    logUserAction(
      userId,
      'block',
      `User blocked: ${reason}`,
      performedBy,
      { reason }
    )

    return true
  },

  // Unblock user
  unblockUser: (userId: string, performedBy: string): boolean => {
    const users = userManagementService.getAllUsers()
    const userIndex = users.findIndex(user => user.id === userId)
    
    if (userIndex === -1) return false

    const previousReason = users[userIndex].blockReason
    users[userIndex].isBlocked = false
    users[userIndex].blockReason = undefined
    users[userIndex].blockedAt = undefined
    users[userIndex].blockedBy = undefined
    users[userIndex].isActive = true

    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))

    logUserAction(
      userId,
      'unblock',
      `User unblocked (was blocked for: ${previousReason})`,
      performedBy
    )

    return true
  },

  // Grant free tickets
  grantFreeTickets: (
    userId: string,
    raffleId: string,
    ticketQuantity: number,
    reason: string,
    performedBy: string
  ): FreeTicketGrant | null => {
    const freeTickets = JSON.parse(localStorage.getItem(FREE_TICKETS_STORAGE_KEY) || '[]') as FreeTicketGrant[]
    
    const grant: FreeTicketGrant = {
      id: `grant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      raffleId,
      ticketQuantity,
      reason,
      grantedBy: performedBy,
      grantedAt: new Date(),
      status: 'active'
    }

    freeTickets.push(grant)
    localStorage.setItem(FREE_TICKETS_STORAGE_KEY, JSON.stringify(freeTickets))

    // Note: In production, this would integrate with the actual bonus system

    logUserAction(
      userId,
      'grant_tickets',
      `Granted ${ticketQuantity} free tickets for raffle ${raffleId}: ${reason}`,
      performedBy,
      { raffleId, ticketsGranted: ticketQuantity, reason }
    )

    return grant
  },

  // Get user's free ticket grants
  getUserFreeTickets: (userId: string): FreeTicketGrant[] => {
    if (typeof window === 'undefined') return []
    
    const freeTickets = JSON.parse(localStorage.getItem(FREE_TICKETS_STORAGE_KEY) || '[]') as FreeTicketGrant[]
    return freeTickets
      .filter(grant => grant.userId === userId)
      .map(grant => ({ ...grant, grantedAt: new Date(grant.grantedAt) }))
      .sort((a, b) => b.grantedAt.getTime() - a.grantedAt.getTime())
  },

  // Get user actions/audit log
  getUserActions: (userId?: string): UserAction[] => {
    if (typeof window === 'undefined') return []
    
    const actions = JSON.parse(localStorage.getItem(USER_ACTIONS_STORAGE_KEY) || '[]') as UserAction[]
    const filteredActions = userId ? actions.filter(action => action.userId === userId) : actions
    
    return filteredActions.map(action => ({
      ...action,
      performedAt: new Date(action.performedAt)
    }))
  },

  // Add admin note
  addAdminNote: (userId: string, note: string, performedBy: string): boolean => {
    const success = userManagementService.updateUser(userId, { adminNotes: note }, performedBy)
    
    if (success) {
      logUserAction(
        userId,
        'note_added',
        `Admin note added: ${note.substring(0, 50)}${note.length > 50 ? '...' : ''}`,
        performedBy
      )
    }
    
    return success
  },

  // Get user statistics
  getUserStats: () => {
    const users = userManagementService.getAllUsers()
    const actions = userManagementService.getUserActions()
    
    return {
      total: users.length,
      active: users.filter(u => u.isActive && !u.isBlocked).length,
      blocked: users.filter(u => u.isBlocked).length,
      verified: users.filter(u => u.isVerified).length,
      highRisk: users.filter(u => (u.riskScore || 0) > 70).length,
      totalRevenue: users.reduce((sum, u) => sum + u.totalSpent, 0),
      recentActions: actions.slice(0, 10),
      crmSegments: {
        high_roller: users.filter(u => u.crmSegment === 'high_roller').length,
        regular: users.filter(u => u.crmSegment === 'regular').length,
        casual: users.filter(u => u.crmSegment === 'casual').length,
        new: users.filter(u => u.crmSegment === 'new').length,
        at_risk: users.filter(u => u.crmSegment === 'at_risk').length,
        dormant: users.filter(u => u.crmSegment === 'dormant').length
      }
    }
  },

  // Get draw preferences analytics
  getDrawPreferencesAnalytics: () => {
    const users = userManagementService.getAllUsers()
    
    const totalPreferences = users.reduce((acc, user) => {
      Object.entries(user.drawPreferences).forEach(([key, value]) => {
        acc[key] = (acc[key] || 0) + value
      })
      return acc
    }, {} as Record<string, number>)

    const preferenceRankings = Object.entries(totalPreferences)
      .sort(([, a], [, b]) => b - a)
      .map(([type, count]) => ({ type, count }))

    return {
      totalUsers: users.length,
      preferenceBreakdown: totalPreferences,
      preferenceRankings,
      segmentAnalysis: {
        high_roller: users.filter(u => u.crmSegment === 'high_roller').map(u => u.drawPreferences),
        regular: users.filter(u => u.crmSegment === 'regular').map(u => u.drawPreferences),
        casual: users.filter(u => u.crmSegment === 'casual').map(u => u.drawPreferences)
      }
    }
  },

  // Export user data for CRM
  exportUserData: (performedBy: string, filters?: { segment?: string; blocked?: boolean; verified?: boolean }): string => {
    let users = userManagementService.getAllUsers()
    
    if (filters) {
      if (filters.segment) {
        users = users.filter(u => u.crmSegment === filters.segment)
      }
      if (filters.blocked !== undefined) {
        users = users.filter(u => u.isBlocked === filters.blocked)
      }
      if (filters.verified !== undefined) {
        users = users.filter(u => u.isVerified === filters.verified)
      }
    }

    const exportData = {
      exportedAt: new Date().toISOString(),
      exportedBy: performedBy,
      filters,
      totalUsers: users.length,
      users: users.map(user => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
        registeredAt: user.registeredAt,
        lastActivity: user.lastActivity,
        totalSpent: user.totalSpent,
        totalWinnings: user.totalWinnings,
        loyaltyTier: user.loyaltyTier,
        crmSegment: user.crmSegment,
        isActive: user.isActive,
        isBlocked: user.isBlocked,
        drawPreferences: user.drawPreferences,
        adminNotes: user.adminNotes
      }))
    }

    // Log export action
    logUserAction(
      'system',
      'export',
      `User data exported (${users.length} users)`,
      performedBy
    )

    return JSON.stringify(exportData, null, 2)
  },

  // Record user transaction (integration with finance)
  recordTransaction: (transaction: Omit<UserTransaction, 'id'>): UserTransaction => {
    if (typeof window === 'undefined') throw new Error('Window not available')
    
    const transactions = JSON.parse(localStorage.getItem(USER_TRANSACTIONS_STORAGE_KEY) || '[]') as UserTransaction[]
    
    const newTransaction: UserTransaction = {
      ...transaction,
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    
    transactions.push(newTransaction)
    localStorage.setItem(USER_TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions))
    
    return newTransaction
  },

  // Get user transactions
  getUserTransactions: (userId: string): UserTransaction[] => {
    if (typeof window === 'undefined') return []
    
    const transactions = JSON.parse(localStorage.getItem(USER_TRANSACTIONS_STORAGE_KEY) || '[]') as UserTransaction[]
    return transactions
      .filter(tx => tx.userId === userId)
      .map(tx => ({ ...tx, timestamp: new Date(tx.timestamp) }))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }
}

// Auto-update CRM segments based on user behavior
export const updateCRMSegments = () => {
  const users = userManagementService.getAllUsers()
  const now = new Date()
  
  users.forEach(user => {
    let newSegment: AdminUser['crmSegment'] = 'casual'
    
    const daysSinceRegistration = Math.floor((now.getTime() - user.registeredAt.getTime()) / (1000 * 60 * 60 * 24))
    const daysSinceLastActivity = Math.floor((now.getTime() - user.lastActivity.getTime()) / (1000 * 60 * 60 * 24))
    
    // Segment logic
    if (user.totalSpent >= 5000 || user.loyaltyTier === 'platinum') {
      newSegment = 'high_roller'
    } else if (user.totalSpent >= 1000 && user.loyaltyTier === 'gold') {
      newSegment = 'regular'
    } else if (daysSinceRegistration <= 30) {
      newSegment = 'new'
    } else if (daysSinceLastActivity > 60) {
      newSegment = 'dormant'
    } else if (user.fraudFlags > 0 || (user.riskScore || 0) > 50) {
      newSegment = 'at_risk'
    }
    
    if (user.crmSegment !== newSegment) {
      userManagementService.updateUser(user.id, { crmSegment: newSegment }, 'system')
    }
  })
}

// Run CRM segment updates periodically
if (typeof window !== 'undefined') {
  setInterval(updateCRMSegments, 60 * 60 * 1000) // Update every hour
}
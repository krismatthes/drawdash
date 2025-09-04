'use client'

// Types for bonus reward system
export interface BonusReward {
  id: string
  name: string
  description: string
  type: 'points' | 'free_tickets' | 'cashback' | 'multiplier' | 'free_entry' | 'discount'
  value: number // Points amount, tickets count, percentage, etc.
  isActive: boolean
  isManualOnly: boolean // Only admin can assign
  targetGroups: ('new_users' | 'inactive_users' | 'vip_users' | 'all_users' | 'custom')[]
  conditions: {
    minSpent?: number
    maxSpent?: number
    minPoints?: number
    lastLoginDays?: number // Days since last login
    registrationDays?: number // Days since registration
    loyaltyTier?: ('bronze' | 'silver' | 'gold' | 'diamond')[]
  }
  restrictions: {
    maxUsesPerUser: number
    maxTotalUses?: number
    validForDays: number
    minPurchaseAmount?: number
    excludeCategories?: string[]
    onlyFirstPurchase?: boolean
  }
  createdAt: Date
  createdBy: string
  expiresAt?: Date
  usageCount: number
  metadata?: {
    campaignId?: string
    source?: string
    notes?: string
  }
}

export interface UserBonus {
  id: string
  userId: string
  bonusId: string
  bonusSnapshot: BonusReward // Snapshot of bonus at time of assignment
  assignedAt: Date
  assignedBy: string
  usedAt?: Date
  usedInTransaction?: string
  expiresAt: Date
  status: 'active' | 'used' | 'expired' | 'cancelled'
  metadata?: {
    assignmentReason?: string
    campaignId?: string
    autoAssigned?: boolean
  }
}

export interface BonusActivity {
  id: string
  bonusId?: string
  userId?: string
  action: 'created' | 'assigned' | 'used' | 'expired' | 'cancelled' | 'bulk_assigned' | 'updated' | 'deleted'
  details: string
  timestamp: Date
  adminUser?: string
  metadata?: {
    affectedUsers?: number
    transactionId?: string
    originalValue?: number
    appliedValue?: number
    assignmentReason?: string
  }
}

export interface BonusAnalytics {
  bonusId: string
  totalAssigned: number
  totalUsed: number
  totalExpired: number
  usageRate: number
  averageTimeToUse: number // in hours
  totalValueIssued: number
  totalValueRedeemed: number
  roi: number
  topUsers: {
    userId: string
    userName: string
    usageCount: number
    valueRedeemed: number
  }[]
  usageByDay: {
    date: string
    assigned: number
    used: number
    expired: number
  }[]
}

// Storage keys
const BONUS_REWARDS_KEY = 'drawdash_bonus_rewards'
const USER_BONUSES_KEY = 'drawdash_user_bonuses'
const BONUS_ACTIVITY_KEY = 'drawdash_bonus_activity'

// Initialize storage
const initializeBonusStorage = () => {
  if (typeof window === 'undefined') return

  // Initialize with some default bonus templates
  const existingRewards = localStorage.getItem(BONUS_REWARDS_KEY)
  if (!existingRewards) {
    const defaultBonuses: BonusReward[] = [
      {
        id: 'welcome_package_001',
        name: 'Velkomst Pakke',
        description: 'Bonus til nye brugere ved registrering',
        type: 'points',
        value: 500,
        isActive: true,
        isManualOnly: false,
        targetGroups: ['new_users'],
        conditions: {
          registrationDays: 1
        },
        restrictions: {
          maxUsesPerUser: 1,
          validForDays: 30
        },
        createdAt: new Date(),
        createdBy: 'System',
        usageCount: 0
      },
      {
        id: 'reactivation_bonus_001',
        name: 'Reaktiverings Bonus',
        description: 'Bonus til brugere der ikke har været aktive i 30+ dage',
        type: 'free_tickets',
        value: 10,
        isActive: true,
        isManualOnly: true,
        targetGroups: ['inactive_users'],
        conditions: {
          lastLoginDays: 30
        },
        restrictions: {
          maxUsesPerUser: 3,
          validForDays: 14
        },
        createdAt: new Date(),
        createdBy: 'Admin',
        usageCount: 0
      },
      {
        id: 'vip_monthly_001',
        name: 'VIP Månedlig Belønning',
        description: 'Månedlig bonus til VIP kunder',
        type: 'multiplier',
        value: 2, // 2x points multiplier
        isActive: true,
        isManualOnly: true,
        targetGroups: ['vip_users'],
        conditions: {
          minSpent: 5000,
          loyaltyTier: ['gold', 'diamond']
        },
        restrictions: {
          maxUsesPerUser: 1,
          validForDays: 7
        },
        createdAt: new Date(),
        createdBy: 'Admin',
        usageCount: 0
      }
    ]
    // Add purchase bonus templates
    defaultBonuses.push(
      {
        id: 'purchase_bonus_001',
        name: 'Køb Bonus - 20 Gratis Billetter',
        description: '20 gratis lodder når du køber 5 eller flere lodder',
        type: 'free_tickets',
        value: 20,
        isActive: true,
        isManualOnly: false,
        targetGroups: ['all_users'],
        conditions: {
          minSpent: 100 // 10 kr minimum (in øre)
        },
        restrictions: {
          maxUsesPerUser: 5,
          validForDays: 7
        },
        createdAt: new Date(),
        createdBy: 'System',
        usageCount: 0
      },
      {
        id: 'vip_milestone_001',
        name: 'VIP Milepæl - Diamant Bonus',
        description: 'Special VIP bonus ved 1000 kr total forbrug',
        type: 'multiplier',
        value: 3,
        isActive: true,
        isManualOnly: false,
        targetGroups: ['all_users'],
        conditions: {
          minSpent: 100000 // 1000 kr
        },
        restrictions: {
          maxUsesPerUser: 1,
          validForDays: 30
        },
        createdAt: new Date(),
        createdBy: 'System',
        usageCount: 0
      }
    )

    localStorage.setItem(BONUS_REWARDS_KEY, JSON.stringify(defaultBonuses))
  }

  const existingUserBonuses = localStorage.getItem(USER_BONUSES_KEY)
  if (!existingUserBonuses) {
    localStorage.setItem(USER_BONUSES_KEY, JSON.stringify([]))
  }

  const existingActivity = localStorage.getItem(BONUS_ACTIVITY_KEY)
  if (!existingActivity) {
    localStorage.setItem(BONUS_ACTIVITY_KEY, JSON.stringify([]))
  }
}

// Initialize on import
initializeBonusStorage()

// Helper function to log bonus activity
const logBonusActivity = (
  action: BonusActivity['action'],
  details: string,
  bonusId?: string,
  userId?: string,
  adminUser?: string,
  metadata?: BonusActivity['metadata']
) => {
  if (typeof window === 'undefined') return

  const activities = JSON.parse(localStorage.getItem(BONUS_ACTIVITY_KEY) || '[]') as BonusActivity[]
  const newActivity: BonusActivity = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
    bonusId,
    userId,
    action,
    details,
    timestamp: new Date(),
    adminUser,
    metadata
  }
  activities.unshift(newActivity) // Add to beginning
  localStorage.setItem(BONUS_ACTIVITY_KEY, JSON.stringify(activities))
}

export const bonusRewardService = {
  // Bonus CRUD Operations
  getAllBonuses: (): BonusReward[] => {
    if (typeof window === 'undefined') return []
    
    const stored = localStorage.getItem(BONUS_REWARDS_KEY)
    if (!stored) return []
    
    const bonuses = JSON.parse(stored) as BonusReward[]
    return bonuses.map(bonus => ({
      ...bonus,
      createdAt: new Date(bonus.createdAt),
      expiresAt: bonus.expiresAt ? new Date(bonus.expiresAt) : undefined
    }))
  },

  getBonusById: (id: string): BonusReward | null => {
    const bonuses = bonusRewardService.getAllBonuses()
    return bonuses.find(bonus => bonus.id === id) || null
  },

  createBonus: (bonusData: Omit<BonusReward, 'id' | 'createdAt' | 'usageCount'>, adminUser: string): BonusReward => {
    const bonuses = bonusRewardService.getAllBonuses()
    
    const newBonus: BonusReward = {
      ...bonusData,
      id: `bonus_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date(),
      usageCount: 0
    }
    
    bonuses.push(newBonus)
    localStorage.setItem(BONUS_REWARDS_KEY, JSON.stringify(bonuses))
    
    logBonusActivity('created', `Bonus "${newBonus.name}" created`, newBonus.id, undefined, adminUser)
    
    return newBonus
  },

  updateBonus: (id: string, updates: Partial<BonusReward>, adminUser: string): BonusReward | null => {
    const bonuses = bonusRewardService.getAllBonuses()
    const index = bonuses.findIndex(bonus => bonus.id === id)
    
    if (index === -1) return null
    
    const oldBonus = bonuses[index]
    const updatedBonus = { ...oldBonus, ...updates }
    bonuses[index] = updatedBonus
    
    localStorage.setItem(BONUS_REWARDS_KEY, JSON.stringify(bonuses))
    
    logBonusActivity('updated', `Bonus "${updatedBonus.name}" updated`, id, undefined, adminUser)
    
    return updatedBonus
  },

  deleteBonus: (id: string, adminUser: string): boolean => {
    const bonuses = bonusRewardService.getAllBonuses()
    const bonus = bonuses.find(b => b.id === id)
    
    if (!bonus) return false
    
    // Check if bonus is in use
    const userBonuses = bonusRewardService.getUserBonuses()
    const activeUserBonuses = userBonuses.filter(ub => ub.bonusId === id && ub.status === 'active')
    
    if (activeUserBonuses.length > 0) {
      throw new Error(`Cannot delete bonus "${bonus.name}" - ${activeUserBonuses.length} active assignments exist`)
    }
    
    const filteredBonuses = bonuses.filter(bonus => bonus.id !== id)
    localStorage.setItem(BONUS_REWARDS_KEY, JSON.stringify(filteredBonuses))
    
    logBonusActivity('deleted', `Bonus "${bonus.name}" deleted`, id, undefined, adminUser)
    
    return true
  },

  // User bonus management
  getUserBonuses: (userId?: string): UserBonus[] => {
    if (typeof window === 'undefined') return []
    
    const stored = localStorage.getItem(USER_BONUSES_KEY)
    if (!stored) return []
    
    const userBonuses = JSON.parse(stored) as UserBonus[]
    const formattedBonuses = userBonuses.map(ub => ({
      ...ub,
      assignedAt: new Date(ub.assignedAt),
      usedAt: ub.usedAt ? new Date(ub.usedAt) : undefined,
      expiresAt: new Date(ub.expiresAt),
      bonusSnapshot: {
        ...ub.bonusSnapshot,
        createdAt: new Date(ub.bonusSnapshot.createdAt),
        expiresAt: ub.bonusSnapshot.expiresAt ? new Date(ub.bonusSnapshot.expiresAt) : undefined
      }
    }))
    
    if (userId) {
      return formattedBonuses.filter(ub => ub.userId === userId)
    }
    
    return formattedBonuses
  },

  getActiveBonusesForUser: (userId: string): UserBonus[] => {
    const userBonuses = bonusRewardService.getUserBonuses(userId)
    const now = new Date()
    
    return userBonuses.filter(ub => 
      ub.status === 'active' && 
      ub.expiresAt > now
    )
  },

  assignBonusToUser: (
    bonusId: string, 
    userId: string, 
    adminUser: string,
    customExpiryDays?: number,
    assignmentReason?: string
  ): UserBonus | null => {
    const bonus = bonusRewardService.getBonusById(bonusId)
    if (!bonus || !bonus.isActive) return null

    // Check if user already has this bonus (if single use)
    if (bonus.restrictions.maxUsesPerUser === 1) {
      const existingBonuses = bonusRewardService.getUserBonuses(userId)
      const hasBonus = existingBonuses.some(ub => 
        ub.bonusId === bonusId && 
        (ub.status === 'active' || ub.status === 'used')
      )
      if (hasBonus) {
        throw new Error(`User already has bonus "${bonus.name}"`)
      }
    }

    const userBonuses = bonusRewardService.getUserBonuses()
    const expiryDays = customExpiryDays || bonus.restrictions.validForDays
    const expiresAt = new Date(Date.now() + (expiryDays * 24 * 60 * 60 * 1000))

    const newUserBonus: UserBonus = {
      id: `user_bonus_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      userId,
      bonusId,
      bonusSnapshot: { ...bonus }, // Store snapshot for historical accuracy
      assignedAt: new Date(),
      assignedBy: adminUser,
      expiresAt,
      status: 'active',
      metadata: {
        assignmentReason,
        autoAssigned: false
      }
    }
    
    userBonuses.push(newUserBonus)
    localStorage.setItem(USER_BONUSES_KEY, JSON.stringify(userBonuses))
    
    // Update bonus usage count
    const updatedBonus = { ...bonus, usageCount: bonus.usageCount + 1 }
    bonusRewardService.updateBonus(bonusId, { usageCount: updatedBonus.usageCount }, adminUser)
    
    logBonusActivity(
      'assigned', 
      `Bonus "${bonus.name}" assigned to user ${userId}`, 
      bonusId, 
      userId, 
      adminUser,
      { assignmentReason }
    )
    
    return newUserBonus
  },

  bulkAssignBonus: (
    bonusId: string,
    userIds: string[],
    adminUser: string,
    assignmentReason?: string
  ): { successful: UserBonus[], failed: { userId: string, error: string }[] } => {
    const successful: UserBonus[] = []
    const failed: { userId: string, error: string }[] = []

    userIds.forEach(userId => {
      try {
        const assigned = bonusRewardService.assignBonusToUser(bonusId, userId, adminUser, undefined, assignmentReason)
        if (assigned) {
          successful.push(assigned)
        }
      } catch (error) {
        failed.push({
          userId,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    })

    logBonusActivity(
      'bulk_assigned',
      `Bulk assigned bonus to ${successful.length} users (${failed.length} failed)`,
      bonusId,
      undefined,
      adminUser,
      { affectedUsers: successful.length }
    )

    return { successful, failed }
  },

  useBonusInTransaction: (
    userBonusId: string,
    transactionId: string,
    appliedValue?: number
  ): boolean => {
    const userBonuses = bonusRewardService.getUserBonuses()
    const index = userBonuses.findIndex(ub => ub.id === userBonusId)
    
    if (index === -1) return false
    
    const userBonus = userBonuses[index]
    if (userBonus.status !== 'active') return false
    if (userBonus.expiresAt < new Date()) return false

    userBonuses[index] = {
      ...userBonus,
      status: 'used',
      usedAt: new Date(),
      usedInTransaction: transactionId
    }
    
    localStorage.setItem(USER_BONUSES_KEY, JSON.stringify(userBonuses))
    
    logBonusActivity(
      'used',
      `Bonus "${userBonus.bonusSnapshot.name}" used in transaction`,
      userBonus.bonusId,
      userBonus.userId,
      undefined,
      { transactionId, originalValue: userBonus.bonusSnapshot.value, appliedValue }
    )
    
    return true
  },

  cancelUserBonus: (userBonusId: string, adminUser: string, reason?: string): boolean => {
    const userBonuses = bonusRewardService.getUserBonuses()
    const index = userBonuses.findIndex(ub => ub.id === userBonusId)
    
    if (index === -1) return false
    
    const userBonus = userBonuses[index]
    if (userBonus.status !== 'active') return false

    userBonuses[index] = {
      ...userBonus,
      status: 'cancelled'
    }
    
    localStorage.setItem(USER_BONUSES_KEY, JSON.stringify(userBonuses))
    
    logBonusActivity(
      'cancelled',
      `Bonus cancelled: ${reason || 'No reason provided'}`,
      userBonus.bonusId,
      userBonus.userId,
      adminUser
    )
    
    return true
  },

  // Cleanup expired bonuses
  cleanupExpiredBonuses: (): number => {
    const userBonuses = bonusRewardService.getUserBonuses()
    const now = new Date()
    let expiredCount = 0

    const updatedBonuses = userBonuses.map(ub => {
      if (ub.status === 'active' && ub.expiresAt < now) {
        expiredCount++
        logBonusActivity(
          'expired',
          `Bonus "${ub.bonusSnapshot.name}" expired`,
          ub.bonusId,
          ub.userId
        )
        return { ...ub, status: 'expired' as const }
      }
      return ub
    })

    if (expiredCount > 0) {
      localStorage.setItem(USER_BONUSES_KEY, JSON.stringify(updatedBonuses))
    }

    return expiredCount
  },

  // Analytics and reporting
  getBonusAnalytics: (bonusId: string): BonusAnalytics => {
    const userBonuses = bonusRewardService.getUserBonuses()
    const bonusUserBonuses = userBonuses.filter(ub => ub.bonusId === bonusId)
    
    const totalAssigned = bonusUserBonuses.length
    const totalUsed = bonusUserBonuses.filter(ub => ub.status === 'used').length
    const totalExpired = bonusUserBonuses.filter(ub => ub.status === 'expired').length
    const usageRate = totalAssigned > 0 ? (totalUsed / totalAssigned) * 100 : 0

    // Calculate average time to use
    const usedBonuses = bonusUserBonuses.filter(ub => ub.status === 'used' && ub.usedAt)
    const averageTimeToUse = usedBonuses.length > 0 
      ? usedBonuses.reduce((sum, ub) => {
          const timeToUse = (ub.usedAt!.getTime() - ub.assignedAt.getTime()) / (1000 * 60 * 60) // in hours
          return sum + timeToUse
        }, 0) / usedBonuses.length
      : 0

    // Calculate value metrics
    const totalValueIssued = bonusUserBonuses.reduce((sum, ub) => sum + ub.bonusSnapshot.value, 0)
    const totalValueRedeemed = usedBonuses.reduce((sum, ub) => sum + ub.bonusSnapshot.value, 0)
    
    // Simple ROI calculation (value redeemed vs operational cost)
    const roi = totalValueRedeemed > 0 ? (totalValueRedeemed / (totalValueIssued * 0.1)) * 100 : 0

    // Top users (mock calculation)
    const userUsage = new Map<string, { count: number, value: number }>()
    usedBonuses.forEach(ub => {
      const current = userUsage.get(ub.userId) || { count: 0, value: 0 }
      userUsage.set(ub.userId, {
        count: current.count + 1,
        value: current.value + ub.bonusSnapshot.value
      })
    })

    const topUsers = Array.from(userUsage.entries())
      .sort((a, b) => b[1].value - a[1].value)
      .slice(0, 5)
      .map(([userId, stats]) => ({
        userId,
        userName: `User ${userId.substr(-4)}`, // Mock name
        usageCount: stats.count,
        valueRedeemed: stats.value
      }))

    // Usage by day (last 30 days)
    const usageByDay: BonusAnalytics['usageByDay'] = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date(Date.now() - (i * 24 * 60 * 60 * 1000))
      const dateStr = date.toISOString().split('T')[0]
      
      const assigned = bonusUserBonuses.filter(ub => 
        ub.assignedAt.toISOString().split('T')[0] === dateStr
      ).length
      
      const used = bonusUserBonuses.filter(ub => 
        ub.usedAt && ub.usedAt.toISOString().split('T')[0] === dateStr
      ).length
      
      const expired = bonusUserBonuses.filter(ub => 
        ub.status === 'expired' && ub.expiresAt.toISOString().split('T')[0] === dateStr
      ).length

      usageByDay.push({ date: dateStr, assigned, used, expired })
    }

    return {
      bonusId,
      totalAssigned,
      totalUsed,
      totalExpired,
      usageRate,
      averageTimeToUse,
      totalValueIssued,
      totalValueRedeemed,
      roi,
      topUsers,
      usageByDay
    }
  },

  // Search and filter
  searchBonuses: (query: string, filters?: {
    type?: BonusReward['type']
    isActive?: boolean
    targetGroup?: string
  }): BonusReward[] => {
    let bonuses = bonusRewardService.getAllBonuses()
    
    if (query) {
      const lowerQuery = query.toLowerCase()
      bonuses = bonuses.filter(bonus =>
        bonus.name.toLowerCase().includes(lowerQuery) ||
        bonus.description.toLowerCase().includes(lowerQuery)
      )
    }
    
    if (filters) {
      if (filters.type) {
        bonuses = bonuses.filter(bonus => bonus.type === filters.type)
      }
      if (filters.isActive !== undefined) {
        bonuses = bonuses.filter(bonus => bonus.isActive === filters.isActive)
      }
      if (filters.targetGroup) {
        bonuses = bonuses.filter(bonus => 
          bonus.targetGroups.includes(filters.targetGroup as any)
        )
      }
    }
    
    return bonuses
  },

  // Find eligible bonuses for a user
  getEligibleBonusesForUser: (userId: string, userProfile: {
    totalSpent: number
    points: number
    lastLoginDays: number
    registrationDays: number
    loyaltyTier: string
  }): BonusReward[] => {
    const bonuses = bonusRewardService.getAllBonuses().filter(bonus => bonus.isActive)
    const userBonuses = bonusRewardService.getUserBonuses(userId)
    
    return bonuses.filter(bonus => {
      // Check if user already reached max uses
      const userUsageCount = userBonuses.filter(ub => 
        ub.bonusId === bonus.id && 
        (ub.status === 'used' || ub.status === 'active')
      ).length
      
      if (userUsageCount >= bonus.restrictions.maxUsesPerUser) return false
      
      // Check conditions
      const { conditions } = bonus
      
      if (conditions.minSpent && userProfile.totalSpent < conditions.minSpent) return false
      if (conditions.maxSpent && userProfile.totalSpent > conditions.maxSpent) return false
      if (conditions.minPoints && userProfile.points < conditions.minPoints) return false
      if (conditions.lastLoginDays && userProfile.lastLoginDays < conditions.lastLoginDays) return false
      if (conditions.registrationDays && userProfile.registrationDays < conditions.registrationDays) return false
      if (conditions.loyaltyTier && !conditions.loyaltyTier.includes(userProfile.loyaltyTier as any)) return false
      
      return true
    })
  },

  // Activity log
  getBonusActivity: (bonusId?: string, userId?: string): BonusActivity[] => {
    if (typeof window === 'undefined') return []
    
    const activities = JSON.parse(localStorage.getItem(BONUS_ACTIVITY_KEY) || '[]') as BonusActivity[]
    
    const formattedActivities = activities.map(activity => ({
      ...activity,
      timestamp: new Date(activity.timestamp)
    }))
    
    let filtered = formattedActivities
    
    if (bonusId) {
      filtered = filtered.filter(activity => activity.bonusId === bonusId)
    }
    
    if (userId) {
      filtered = filtered.filter(activity => activity.userId === userId)
    }
    
    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  },

  // Statistics
  getBonusSystemStats: () => {
    const bonuses = bonusRewardService.getAllBonuses()
    const userBonuses = bonusRewardService.getUserBonuses()
    
    const activeBonuses = bonuses.filter(b => b.isActive).length
    const totalAssigned = userBonuses.length
    const totalUsed = userBonuses.filter(ub => ub.status === 'used').length
    const totalActive = userBonuses.filter(ub => ub.status === 'active').length
    const totalValue = userBonuses.reduce((sum, ub) => sum + ub.bonusSnapshot.value, 0)
    
    const usageByType = new Map<string, number>()
    userBonuses.filter(ub => ub.status === 'used').forEach(ub => {
      const current = usageByType.get(ub.bonusSnapshot.type) || 0
      usageByType.set(ub.bonusSnapshot.type, current + 1)
    })
    
    return {
      activeBonuses,
      totalAssigned,
      totalUsed,
      totalActive,
      totalValue,
      usageRate: totalAssigned > 0 ? (totalUsed / totalAssigned) * 100 : 0,
      usageByType: Object.fromEntries(usageByType)
    }
  },

  // Export data for reporting
  exportBonusData: (bonusId?: string) => {
    const bonuses = bonusId 
      ? [bonusRewardService.getBonusById(bonusId)].filter(Boolean) as BonusReward[]
      : bonusRewardService.getAllBonuses()
    
    const userBonuses = bonusId 
      ? bonusRewardService.getUserBonuses().filter(ub => ub.bonusId === bonusId)
      : bonusRewardService.getUserBonuses()
    
    const activities = bonusId
      ? bonusRewardService.getBonusActivity(bonusId)
      : bonusRewardService.getBonusActivity()
    
    return {
      bonuses,
      userBonuses,
      activities,
      systemStats: bonusRewardService.getBonusSystemStats(),
      exportDate: new Date().toISOString()
    }
  },

  // Bonus application in transactions
  getApplicableBonusesForTransaction: (
    userId: string,
    transactionAmount: number,
    ticketQuantity: number,
    raffleId?: string
  ): UserBonus[] => {
    const activeBonuses = bonusRewardService.getActiveBonusesForUser(userId)
    
    return activeBonuses.filter(userBonus => {
      const bonus = userBonus.bonusSnapshot
      
      // Check minimum purchase requirements
      if (bonus.restrictions.minPurchaseAmount && transactionAmount < bonus.restrictions.minPurchaseAmount) {
        return false
      }
      
      // Check category exclusions
      if (bonus.restrictions.excludeCategories && raffleId) {
        // In a real system, you'd check if raffleId belongs to excluded categories
        return true
      }
      
      // Check if it's only for first purchase
      if (bonus.restrictions.onlyFirstPurchase) {
        // In a real system, check if this is user's first purchase
        return true
      }
      
      return true
    })
  },

  calculateBonusDiscount: (
    userBonus: UserBonus,
    transactionAmount: number,
    ticketQuantity: number
  ): {
    discountAmount: number
    freeTickets: number
    pointMultiplier: number
    finalAmount: number
  } => {
    const bonus = userBonus.bonusSnapshot
    let discountAmount = 0
    let freeTickets = 0
    let pointMultiplier = 1

    switch (bonus.type) {
      case 'free_tickets':
        freeTickets = bonus.value
        break
      case 'discount':
        discountAmount = Math.floor(transactionAmount * (bonus.value / 100))
        break
      case 'cashback':
        // Cashback is applied after payment, not as discount
        break
      case 'multiplier':
        pointMultiplier = bonus.value
        break
      case 'free_entry':
        // Free entry means 100% discount
        discountAmount = transactionAmount
        break
      case 'points':
        // Points bonus doesn't affect transaction amount
        break
    }

    const finalAmount = Math.max(0, transactionAmount - discountAmount)

    return {
      discountAmount,
      freeTickets,
      pointMultiplier,
      finalAmount
    }
  },

  applyBonusToTransaction: (
    userBonusId: string,
    transactionAmount: number,
    ticketQuantity: number
  ): {
    success: boolean
    discountAmount: number
    freeTickets: number
    pointMultiplier: number
    finalAmount: number
    error?: string
  } => {
    const userBonuses = bonusRewardService.getUserBonuses()
    const userBonus = userBonuses.find(ub => ub.id === userBonusId)
    
    if (!userBonus) {
      return {
        success: false,
        discountAmount: 0,
        freeTickets: 0,
        pointMultiplier: 1,
        finalAmount: transactionAmount,
        error: 'Bonus not found'
      }
    }

    if (userBonus.status !== 'active') {
      return {
        success: false,
        discountAmount: 0,
        freeTickets: 0,
        pointMultiplier: 1,
        finalAmount: transactionAmount,
        error: 'Bonus is not active'
      }
    }

    if (userBonus.expiresAt < new Date()) {
      return {
        success: false,
        discountAmount: 0,
        freeTickets: 0,
        pointMultiplier: 1,
        finalAmount: transactionAmount,
        error: 'Bonus has expired'
      }
    }

    // Check if bonus is applicable
    const bonus = userBonus.bonusSnapshot
    if (bonus.restrictions.minPurchaseAmount && transactionAmount < bonus.restrictions.minPurchaseAmount) {
      return {
        success: false,
        discountAmount: 0,
        freeTickets: 0,
        pointMultiplier: 1,
        finalAmount: transactionAmount,
        error: `Minimum purchase amount is ${bonus.restrictions.minPurchaseAmount / 100} kr`
      }
    }

    const calculation = bonusRewardService.calculateBonusDiscount(userBonus, transactionAmount, ticketQuantity)

    return {
      success: true,
      ...calculation
    }
  },

  // Bonus fraud validation
  validateBonusEligibility: async (
    userId: string,
    bonusId: string,
    ip: string,
    userAgent: string
  ): Promise<{
    isEligible: boolean
    riskScore: number
    fraudFlags: string[]
    reason: string
  }> => {
    const bonus = bonusRewardService.getBonusById(bonusId)
    if (!bonus) {
      return {
        isEligible: false,
        riskScore: 100,
        fraudFlags: [],
        reason: 'Bonus not found'
      }
    }

    // Check if user already has too many bonuses
    const userBonuses = bonusRewardService.getUserBonuses(userId)
    const activeBonuses = userBonuses.filter(ub => ub.status === 'active')
    
    if (activeBonuses.length >= 5) {
      return {
        isEligible: false,
        riskScore: 60,
        fraudFlags: ['too_many_active_bonuses'],
        reason: 'User has too many active bonuses'
      }
    }

    // Check bonus assignment frequency
    const recentAssignments = userBonuses.filter(ub => 
      ub.bonusId === bonusId && 
      Date.now() - ub.assignedAt.getTime() < 24 * 60 * 60 * 1000 // Last 24 hours
    )

    if (recentAssignments.length > 0 && bonus.restrictions.maxUsesPerUser === 1) {
      return {
        isEligible: false,
        riskScore: 50,
        fraudFlags: ['recent_bonus_assignment'],
        reason: 'Bonus recently assigned to this user'
      }
    }

    // Fraud assessment would be done here using fraudRulesEngine
    // For now, return basic eligibility
    return {
      isEligible: true,
      riskScore: 10,
      fraudFlags: [],
      reason: 'User eligible for bonus'
    }
  },

  // Get bonus usage statistics for fraud detection
  getBonusAbuseMetrics: (userId?: string) => {
    const userBonuses = bonusRewardService.getUserBonuses(userId)
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    return {
      bonusesAssignedLast24h: userBonuses.filter(ub => ub.assignedAt > oneDayAgo).length,
      bonusesUsedLast24h: userBonuses.filter(ub => ub.usedAt && ub.usedAt > oneDayAgo).length,
      bonusesAssignedLastWeek: userBonuses.filter(ub => ub.assignedAt > oneWeekAgo).length,
      unusedBonusCount: userBonuses.filter(ub => ub.status === 'active').length,
      expiredUnusedCount: userBonuses.filter(ub => ub.status === 'expired').length,
      totalBonusValue: userBonuses.reduce((sum, ub) => sum + ub.bonusSnapshot.value, 0),
      usedBonusValue: userBonuses
        .filter(ub => ub.status === 'used')
        .reduce((sum, ub) => sum + ub.bonusSnapshot.value, 0),
      averageTimeToUse: userBonuses
        .filter(ub => ub.status === 'used' && ub.usedAt)
        .reduce((sum, ub) => {
          const timeToUse = (ub.usedAt!.getTime() - ub.assignedAt.getTime()) / (1000 * 60 * 60)
          return sum + timeToUse
        }, 0) / Math.max(1, userBonuses.filter(ub => ub.status === 'used').length)
    }
  }
}

// Predefined bonus templates for quick creation
export const bonusTemplates = {
  welcomePackage: {
    name: 'Velkomst Pakke',
    description: 'Bonus til nye brugere ved registrering',
    type: 'points' as const,
    value: 500,
    targetGroups: ['new_users' as const],
    conditions: { registrationDays: 1 },
    restrictions: { maxUsesPerUser: 1, validForDays: 30 }
  },
  
  reactivation: {
    name: 'Kom Tilbage Bonus',
    description: 'Bonus til inaktive brugere',
    type: 'free_tickets' as const,
    value: 10,
    targetGroups: ['inactive_users' as const],
    conditions: { lastLoginDays: 30 },
    restrictions: { maxUsesPerUser: 3, validForDays: 14 }
  },
  
  vipMonthly: {
    name: 'VIP Månedlig Belønning',
    description: 'Månedlig bonus til VIP kunder',
    type: 'multiplier' as const,
    value: 2,
    targetGroups: ['vip_users' as const],
    conditions: { minSpent: 5000, loyaltyTier: ['gold', 'diamond'] },
    restrictions: { maxUsesPerUser: 1, validForDays: 7 }
  },
  
  firstPurchase: {
    name: 'Første Køb Bonus',
    description: '20% cashback på første køb',
    type: 'cashback' as const,
    value: 20,
    targetGroups: ['new_users' as const],
    conditions: { registrationDays: 7 },
    restrictions: { maxUsesPerUser: 1, validForDays: 14, onlyFirstPurchase: true }
  },
  
  birthdaySpecial: {
    name: 'Fødselsdag Special',
    description: 'Gratis raffle entry på din fødselsdag',
    type: 'free_entry' as const,
    value: 1,
    targetGroups: ['all_users' as const],
    conditions: {},
    restrictions: { maxUsesPerUser: 1, validForDays: 3 }
  }
}

// Auto-assignment helper for triggers
const bonusAutoAssignment = {
  checkAndAssignOnRegistration: (userId: string): UserBonus[] => {
    const eligibleBonuses = bonusRewardService.getAllBonuses().filter(bonus => 
      bonus.isActive && 
      !bonus.isManualOnly &&
      bonus.targetGroups.includes('new_users') &&
      bonus.conditions.registrationDays === 1
    )

    const assigned: UserBonus[] = []
    eligibleBonuses.forEach(bonus => {
      try {
        const userBonus = bonusRewardService.assignBonusToUser(
          bonus.id, 
          userId, 
          'System Auto-Assignment',
          undefined,
          'New user registration trigger'
        )
        if (userBonus) assigned.push(userBonus)
      } catch (error) {
        console.warn(`Failed to auto-assign bonus ${bonus.id} to new user ${userId}:`, error)
      }
    })

    return assigned
  },

  checkAndAssignOnInactivity: (userId: string, daysSinceLastLogin: number): UserBonus[] => {
    const eligibleBonuses = bonusRewardService.getAllBonuses().filter(bonus => 
      bonus.isActive && 
      !bonus.isManualOnly &&
      bonus.targetGroups.includes('inactive_users') &&
      bonus.conditions.lastLoginDays && 
      daysSinceLastLogin >= bonus.conditions.lastLoginDays
    )

    const assigned: UserBonus[] = []
    eligibleBonuses.forEach(bonus => {
      try {
        const userBonus = bonusRewardService.assignBonusToUser(
          bonus.id, 
          userId, 
          'System Auto-Assignment',
          undefined,
          `Inactivity trigger: ${daysSinceLastLogin} days`
        )
        if (userBonus) assigned.push(userBonus)
      } catch (error) {
        console.warn(`Failed to auto-assign inactivity bonus ${bonus.id} to user ${userId}:`, error)
      }
    })

    return assigned
  }
}

// Export auto-assignment through service
;(bonusRewardService as any).bonusAutoAssignment = bonusAutoAssignment
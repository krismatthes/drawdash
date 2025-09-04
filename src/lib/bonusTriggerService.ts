'use client'

import { bonusRewardService, BonusReward, UserBonus } from './bonusRewardService'
import { antiFraud } from './antiFraud'

export interface BonusTrigger {
  id: string
  name: string
  description: string
  triggerType: 'registration' | 'purchase' | 'spending_milestone' | 'inactivity_return' | 'loyalty_tier_upgrade' | 'birthday'
  conditions: {
    // Registration triggers
    isNewUser?: boolean
    
    // Purchase triggers
    minPurchaseAmount?: number
    maxPurchaseAmount?: number
    ticketQuantity?: number
    raffleCategory?: string
    
    // Spending milestone triggers
    totalSpentThreshold?: number
    spentInPeriodDays?: number
    
    // Inactivity triggers
    daysSinceLastActivity?: number
    
    // Loyalty triggers
    requiredTier?: 'bronze' | 'silver' | 'gold' | 'diamond'
    
    // Time-based conditions
    validFromHour?: number // 0-23
    validToHour?: number
    validDaysOfWeek?: number[] // 0=Sunday, 1=Monday, etc.
  }
  bonusId: string
  isActive: boolean
  fraudChecksEnabled: boolean
  maxTriggersPerUser: number
  maxTriggersPerDay: number
  cooldownHours: number // Minimum hours between triggers for same user
  createdAt: Date
  createdBy: string
  triggerCount: number
  metadata?: {
    campaignId?: string
    priority?: number
    notes?: string
  }
}

export interface TriggerEvent {
  id: string
  userId: string
  triggerType: BonusTrigger['triggerType']
  eventData: {
    purchaseAmount?: number
    ticketQuantity?: number
    raffleId?: string
    totalSpent?: number
    daysSinceLastActivity?: number
    newLoyaltyTier?: string
  }
  timestamp: Date
  ip: string
  userAgent: string
}

export interface TriggerResult {
  triggered: boolean
  bonusAssigned?: UserBonus
  reason: string
  fraudFlags?: any[]
  riskAssessment?: any
}

const TRIGGERS_STORAGE_KEY = 'drawdash_bonus_triggers'
const TRIGGER_LOG_STORAGE_KEY = 'drawdash_trigger_log'
const TRIGGER_COOLDOWN_KEY = 'drawdash_trigger_cooldown'

// Initialize storage
const initializeTriggerStorage = () => {
  if (typeof window === 'undefined') return

  const existingTriggers = localStorage.getItem(TRIGGERS_STORAGE_KEY)
  if (!existingTriggers) {
    const defaultTriggers: BonusTrigger[] = [
      {
        id: 'welcome_trigger_001',
        name: 'Velkomst Bonus Trigger',
        description: 'Automatisk tildeling af velkomstbonus til nye brugere',
        triggerType: 'registration',
        conditions: {
          isNewUser: true
        },
        bonusId: 'welcome_package_001',
        isActive: true,
        fraudChecksEnabled: true,
        maxTriggersPerUser: 1,
        maxTriggersPerDay: 100,
        cooldownHours: 0,
        createdAt: new Date(),
        createdBy: 'System',
        triggerCount: 0,
        metadata: {
          priority: 1,
          notes: 'Standard velkomstbonus for alle nye brugere'
        }
      },
      {
        id: 'purchase_trigger_001',
        name: 'Køb Bonus Trigger',
        description: '20 gratis billetter ved køb over 100 kr',
        triggerType: 'purchase',
        conditions: {
          minPurchaseAmount: 100, // 10 kr minimum
          ticketQuantity: 5
        },
        bonusId: 'purchase_bonus_001',
        isActive: true,
        fraudChecksEnabled: true,
        maxTriggersPerUser: 5,
        maxTriggersPerDay: 500,
        cooldownHours: 24,
        createdAt: new Date(),
        createdBy: 'Admin',
        triggerCount: 0,
        metadata: {
          priority: 2,
          notes: 'Bonus for større indkøb'
        }
      },
      {
        id: 'spending_milestone_001',
        name: 'Forbrugs Milepæl',
        description: 'VIP bonus ved 1000 kr total forbrug',
        triggerType: 'spending_milestone',
        conditions: {
          totalSpentThreshold: 100000 // 1000 kr in øre
        },
        bonusId: 'vip_milestone_001',
        isActive: true,
        fraudChecksEnabled: true,
        maxTriggersPerUser: 1,
        maxTriggersPerDay: 50,
        cooldownHours: 0,
        createdAt: new Date(),
        createdBy: 'Admin',
        triggerCount: 0,
        metadata: {
          priority: 3,
          notes: 'VIP status belønning'
        }
      },
      {
        id: 'reactivation_trigger_001',
        name: 'Reaktiverings Trigger',
        description: 'Bonus til inaktive brugere der vender tilbage',
        triggerType: 'inactivity_return',
        conditions: {
          daysSinceLastActivity: 30
        },
        bonusId: 'reactivation_bonus_001',
        isActive: true,
        fraudChecksEnabled: true,
        maxTriggersPerUser: 3,
        maxTriggersPerDay: 100,
        cooldownHours: 720, // 30 days
        createdAt: new Date(),
        createdBy: 'Admin',
        triggerCount: 0,
        metadata: {
          priority: 2,
          notes: 'Få inaktive brugere tilbage'
        }
      }
    ]
    localStorage.setItem(TRIGGERS_STORAGE_KEY, JSON.stringify(defaultTriggers))
  }

  const existingLog = localStorage.getItem(TRIGGER_LOG_STORAGE_KEY)
  if (!existingLog) {
    localStorage.setItem(TRIGGER_LOG_STORAGE_KEY, JSON.stringify([]))
  }

  const existingCooldown = localStorage.getItem(TRIGGER_COOLDOWN_KEY)
  if (!existingCooldown) {
    localStorage.setItem(TRIGGER_COOLDOWN_KEY, JSON.stringify({}))
  }
}

// Initialize on import
initializeTriggerStorage()

// Helper function to check if user is in cooldown
const isUserInCooldown = (userId: string, triggerId: string, cooldownHours: number): boolean => {
  if (typeof window === 'undefined') return false
  
  const cooldowns = JSON.parse(localStorage.getItem(TRIGGER_COOLDOWN_KEY) || '{}')
  const key = `${userId}_${triggerId}`
  const lastTrigger = cooldowns[key]
  
  if (!lastTrigger) return false
  
  const cooldownEnd = new Date(lastTrigger).getTime() + (cooldownHours * 60 * 60 * 1000)
  return Date.now() < cooldownEnd
}

// Helper function to set cooldown
const setCooldown = (userId: string, triggerId: string): void => {
  if (typeof window === 'undefined') return
  
  const cooldowns = JSON.parse(localStorage.getItem(TRIGGER_COOLDOWN_KEY) || '{}')
  const key = `${userId}_${triggerId}`
  cooldowns[key] = new Date().toISOString()
  localStorage.setItem(TRIGGER_COOLDOWN_KEY, JSON.stringify(cooldowns))
}

// Helper function to count daily triggers
const getDailyTriggerCount = (triggerId: string): number => {
  if (typeof window === 'undefined') return 0
  
  const logs = JSON.parse(localStorage.getItem(TRIGGER_LOG_STORAGE_KEY) || '[]')
  const today = new Date().toDateString()
  
  return logs.filter((log: any) => 
    log.triggerId === triggerId && 
    new Date(log.timestamp).toDateString() === today
  ).length
}

// Helper function to count user triggers
const getUserTriggerCount = (userId: string, triggerId: string): number => {
  if (typeof window === 'undefined') return 0
  
  const logs = JSON.parse(localStorage.getItem(TRIGGER_LOG_STORAGE_KEY) || '[]')
  
  return logs.filter((log: any) => 
    log.userId === userId && 
    log.triggerId === triggerId
  ).length
}

// Helper function to log trigger event
const logTriggerEvent = (
  userId: string, 
  triggerId: string, 
  success: boolean, 
  reason: string, 
  bonusAssigned?: UserBonus
): void => {
  if (typeof window === 'undefined') return
  
  const logs = JSON.parse(localStorage.getItem(TRIGGER_LOG_STORAGE_KEY) || '[]')
  const logEntry = {
    id: `trigger_log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    userId,
    triggerId,
    success,
    reason,
    bonusAssignedId: bonusAssigned?.id,
    timestamp: new Date().toISOString()
  }
  
  logs.unshift(logEntry) // Add to beginning
  
  // Keep only last 1000 entries
  if (logs.length > 1000) {
    logs.splice(1000)
  }
  
  localStorage.setItem(TRIGGER_LOG_STORAGE_KEY, JSON.stringify(logs))
}

export const bonusTriggerService = {
  // Get all triggers
  getAllTriggers: (): BonusTrigger[] => {
    if (typeof window === 'undefined') return []
    
    const stored = localStorage.getItem(TRIGGERS_STORAGE_KEY)
    if (!stored) return []
    
    const triggers = JSON.parse(stored) as BonusTrigger[]
    return triggers.map(trigger => ({
      ...trigger,
      createdAt: new Date(trigger.createdAt)
    }))
  },

  // Get trigger by ID
  getTriggerById: (id: string): BonusTrigger | null => {
    const triggers = bonusTriggerService.getAllTriggers()
    return triggers.find(trigger => trigger.id === id) || null
  },

  // Create new trigger
  createTrigger: (triggerData: Omit<BonusTrigger, 'id' | 'createdAt' | 'triggerCount'>, adminUser: string): BonusTrigger => {
    const triggers = bonusTriggerService.getAllTriggers()
    
    const newTrigger: BonusTrigger = {
      ...triggerData,
      id: `trigger_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date(),
      triggerCount: 0
    }
    
    triggers.push(newTrigger)
    localStorage.setItem(TRIGGERS_STORAGE_KEY, JSON.stringify(triggers))
    
    return newTrigger
  },

  // Update trigger
  updateTrigger: (id: string, updates: Partial<BonusTrigger>, adminUser: string): BonusTrigger | null => {
    const triggers = bonusTriggerService.getAllTriggers()
    const index = triggers.findIndex(trigger => trigger.id === id)
    
    if (index === -1) return null
    
    const updatedTrigger = { ...triggers[index], ...updates }
    triggers[index] = updatedTrigger
    
    localStorage.setItem(TRIGGERS_STORAGE_KEY, JSON.stringify(triggers))
    
    return updatedTrigger
  },

  // Delete trigger
  deleteTrigger: (id: string, adminUser: string): boolean => {
    const triggers = bonusTriggerService.getAllTriggers()
    const filteredTriggers = triggers.filter(trigger => trigger.id !== id)
    
    if (filteredTriggers.length === triggers.length) return false
    
    localStorage.setItem(TRIGGERS_STORAGE_KEY, JSON.stringify(filteredTriggers))
    return true
  },

  // Process registration event
  processRegistrationEvent: async (
    userId: string, 
    userProfile: any, 
    ip: string, 
    userAgent: string
  ): Promise<TriggerResult[]> => {
    const triggers = bonusTriggerService.getAllTriggers().filter(
      t => t.isActive && t.triggerType === 'registration'
    )

    const results: TriggerResult[] = []

    for (const trigger of triggers) {
      const result = await bonusTriggerService.evaluateTrigger(trigger, {
        userId,
        triggerType: 'registration',
        eventData: {},
        timestamp: new Date(),
        ip,
        userAgent
      } as TriggerEvent, userProfile)

      results.push(result)

      if (result.bonusAssigned) {
        // Update trigger count
        bonusTriggerService.updateTrigger(trigger.id, {
          triggerCount: trigger.triggerCount + 1
        }, 'System')
      }
    }

    return results
  },

  // Process purchase event
  processPurchaseEvent: async (
    userId: string,
    purchaseAmount: number,
    ticketQuantity: number,
    raffleId: string,
    userProfile: any,
    ip: string,
    userAgent: string
  ): Promise<TriggerResult[]> => {
    const triggers = bonusTriggerService.getAllTriggers().filter(
      t => t.isActive && t.triggerType === 'purchase'
    )

    const results: TriggerResult[] = []

    for (const trigger of triggers) {
      const result = await bonusTriggerService.evaluateTrigger(trigger, {
        userId,
        triggerType: 'purchase',
        eventData: {
          purchaseAmount,
          ticketQuantity,
          raffleId
        },
        timestamp: new Date(),
        ip,
        userAgent
      } as TriggerEvent, userProfile)

      results.push(result)

      if (result.bonusAssigned) {
        // Update trigger count
        bonusTriggerService.updateTrigger(trigger.id, {
          triggerCount: trigger.triggerCount + 1
        }, 'System')
      }
    }

    return results
  },

  // Process spending milestone event
  processSpendingMilestoneEvent: async (
    userId: string,
    totalSpent: number,
    userProfile: any,
    ip: string,
    userAgent: string
  ): Promise<TriggerResult[]> => {
    const triggers = bonusTriggerService.getAllTriggers().filter(
      t => t.isActive && t.triggerType === 'spending_milestone'
    )

    const results: TriggerResult[] = []

    for (const trigger of triggers) {
      const result = await bonusTriggerService.evaluateTrigger(trigger, {
        userId,
        triggerType: 'spending_milestone',
        eventData: {
          totalSpent
        },
        timestamp: new Date(),
        ip,
        userAgent
      } as TriggerEvent, userProfile)

      results.push(result)

      if (result.bonusAssigned) {
        // Update trigger count
        bonusTriggerService.updateTrigger(trigger.id, {
          triggerCount: trigger.triggerCount + 1
        }, 'System')
      }
    }

    return results
  },

  // Core trigger evaluation logic
  evaluateTrigger: async (
    trigger: BonusTrigger, 
    event: TriggerEvent, 
    userProfile: any
  ): Promise<TriggerResult> => {
    // Check if trigger is active
    if (!trigger.isActive) {
      return {
        triggered: false,
        reason: 'Trigger is not active'
      }
    }

    // Check daily limits
    const dailyCount = getDailyTriggerCount(trigger.id)
    if (dailyCount >= trigger.maxTriggersPerDay) {
      return {
        triggered: false,
        reason: 'Daily trigger limit reached'
      }
    }

    // Check user limits
    const userCount = getUserTriggerCount(event.userId, trigger.id)
    if (userCount >= trigger.maxTriggersPerUser) {
      return {
        triggered: false,
        reason: 'User trigger limit reached'
      }
    }

    // Check cooldown
    if (isUserInCooldown(event.userId, trigger.id, trigger.cooldownHours)) {
      return {
        triggered: false,
        reason: 'User is in cooldown period'
      }
    }

    // Check time-based conditions
    const now = new Date()
    if (trigger.conditions.validFromHour !== undefined && now.getHours() < trigger.conditions.validFromHour) {
      return {
        triggered: false,
        reason: 'Outside valid time window'
      }
    }

    if (trigger.conditions.validToHour !== undefined && now.getHours() > trigger.conditions.validToHour) {
      return {
        triggered: false,
        reason: 'Outside valid time window'
      }
    }

    if (trigger.conditions.validDaysOfWeek && !trigger.conditions.validDaysOfWeek.includes(now.getDay())) {
      return {
        triggered: false,
        reason: 'Not a valid day of week'
      }
    }

    // Check trigger-specific conditions
    if (!bonusTriggerService.checkTriggerConditions(trigger, event, userProfile)) {
      return {
        triggered: false,
        reason: 'Trigger conditions not met'
      }
    }

    // Fraud checks if enabled
    let riskAssessment = null
    let fraudFlags: any[] = []
    
    if (trigger.fraudChecksEnabled) {
      try {
        riskAssessment = await antiFraud.assessUserRisk(event.userId, event.ip)
        
        if (riskAssessment.recommendation === 'block') {
          logTriggerEvent(event.userId, trigger.id, false, 'Blocked by fraud detection')
          return {
            triggered: false,
            reason: 'Blocked by fraud detection system',
            fraudFlags: riskAssessment.fraudFlags,
            riskAssessment
          }
        }
        
        fraudFlags = riskAssessment.fraudFlags
      } catch (error) {
        console.warn('Fraud check failed for trigger:', error)
      }
    }

    // Try to assign bonus
    try {
      const bonus = bonusRewardService.assignBonusToUser(
        trigger.bonusId,
        event.userId,
        'System Auto-Assignment',
        undefined,
        `Triggered by: ${trigger.name}`
      )

      if (bonus) {
        setCooldown(event.userId, trigger.id)
        logTriggerEvent(event.userId, trigger.id, true, 'Bonus successfully assigned', bonus)
        
        return {
          triggered: true,
          bonusAssigned: bonus,
          reason: 'Trigger conditions met and bonus assigned',
          fraudFlags,
          riskAssessment
        }
      } else {
        logTriggerEvent(event.userId, trigger.id, false, 'Bonus assignment failed')
        return {
          triggered: false,
          reason: 'Bonus assignment failed'
        }
      }
    } catch (error) {
      logTriggerEvent(event.userId, trigger.id, false, `Error: ${error}`)
      return {
        triggered: false,
        reason: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  },

  // Check trigger-specific conditions
  checkTriggerConditions: (
    trigger: BonusTrigger, 
    event: TriggerEvent, 
    userProfile: any
  ): boolean => {
    const { conditions } = trigger
    const { eventData } = event

    switch (trigger.triggerType) {
      case 'registration':
        return conditions.isNewUser === true

      case 'purchase':
        if (conditions.minPurchaseAmount && (!eventData.purchaseAmount || eventData.purchaseAmount < conditions.minPurchaseAmount)) {
          return false
        }
        if (conditions.maxPurchaseAmount && eventData.purchaseAmount && eventData.purchaseAmount > conditions.maxPurchaseAmount) {
          return false
        }
        if (conditions.ticketQuantity && (!eventData.ticketQuantity || eventData.ticketQuantity < conditions.ticketQuantity)) {
          return false
        }
        return true

      case 'spending_milestone':
        if (conditions.totalSpentThreshold && (!eventData.totalSpent || eventData.totalSpent < conditions.totalSpentThreshold)) {
          return false
        }
        return true

      case 'inactivity_return':
        if (conditions.daysSinceLastActivity && (!eventData.daysSinceLastActivity || eventData.daysSinceLastActivity < conditions.daysSinceLastActivity)) {
          return false
        }
        return true

      case 'loyalty_tier_upgrade':
        if (conditions.requiredTier && userProfile.loyaltyTier !== conditions.requiredTier) {
          return false
        }
        return true

      default:
        return false
    }
  },

  // Get trigger statistics
  getTriggerStats: () => {
    const triggers = bonusTriggerService.getAllTriggers()
    const logs = JSON.parse(localStorage.getItem(TRIGGER_LOG_STORAGE_KEY) || '[]')
    
    const totalTriggers = triggers.length
    const activeTriggers = triggers.filter(t => t.isActive).length
    const totalExecutions = logs.length
    const successfulExecutions = logs.filter((l: any) => l.success).length
    
    return {
      totalTriggers,
      activeTriggers,
      totalExecutions,
      successfulExecutions,
      successRate: totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0,
      triggers: triggers.map(t => ({
        id: t.id,
        name: t.name,
        type: t.triggerType,
        isActive: t.isActive,
        triggerCount: t.triggerCount,
        successRate: logs.filter((l: any) => l.triggerId === t.id).length > 0 
          ? (logs.filter((l: any) => l.triggerId === t.id && l.success).length / logs.filter((l: any) => l.triggerId === t.id).length) * 100
          : 0
      }))
    }
  },

  // Get trigger logs
  getTriggerLogs: (userId?: string, triggerId?: string): any[] => {
    if (typeof window === 'undefined') return []
    
    let logs = JSON.parse(localStorage.getItem(TRIGGER_LOG_STORAGE_KEY) || '[]')
    
    if (userId) {
      logs = logs.filter((log: any) => log.userId === userId)
    }
    
    if (triggerId) {
      logs = logs.filter((log: any) => log.triggerId === triggerId)
    }
    
    return logs.map((log: any) => ({
      ...log,
      timestamp: new Date(log.timestamp)
    }))
  },

  // Clean up old logs (keep only last 30 days)
  cleanupOldLogs: (): number => {
    if (typeof window === 'undefined') return 0
    
    const logs = JSON.parse(localStorage.getItem(TRIGGER_LOG_STORAGE_KEY) || '[]')
    const thirtyDaysAgo = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000))
    
    const filteredLogs = logs.filter((log: any) => new Date(log.timestamp) > thirtyDaysAgo)
    const removedCount = logs.length - filteredLogs.length
    
    localStorage.setItem(TRIGGER_LOG_STORAGE_KEY, JSON.stringify(filteredLogs))
    
    return removedCount
  }
}
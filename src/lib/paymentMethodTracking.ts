'use client'

interface PaymentMethodFingerprint {
  id: string
  hashedCardNumber: string // Last 4 digits + hash of full number
  cardType: 'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown'
  expiryHash: string // Hashed expiry date
  nameHash: string // Hashed cardholder name
  binRange: string // Bank Identification Number range (first 6 digits hashed)
  createdAt: Date
  lastUsed: Date
  usageCount: number
  associatedUserIds: string[]
  isBlacklisted: boolean
  riskScore: number // 0-100
  metadata?: {
    issuerCountry?: string
    cardBrand?: string
    fundingSource?: 'credit' | 'debit' | 'prepaid'
  }
}

interface PaymentMethodUsage {
  id: string
  paymentMethodId: string
  userId: string
  transactionId: string
  amount: number
  currency: string
  timestamp: Date
  ip: string
  userAgent: string
  result: 'success' | 'failed' | 'declined' | 'fraud_blocked'
  fraudFlags: string[]
  riskFactors: {
    newCard: boolean
    multipleUsers: boolean
    velocityFlag: boolean
    geoMismatch: boolean
    deviceMismatch: boolean
  }
}

interface CardRiskPattern {
  patternType: 'velocity' | 'multi_user' | 'geographic' | 'behavioral' | 'card_testing'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  detectedAt: Date
  affectedCards: string[]
  affectedUsers: string[]
  confidence: number // 0-1
}

const PAYMENT_METHODS_KEY = 'drawdash_payment_methods'
const PAYMENT_USAGE_KEY = 'drawdash_payment_usage'
const CARD_RISK_PATTERNS_KEY = 'drawdash_card_risk_patterns'
const BLACKLISTED_CARDS_KEY = 'drawdash_blacklisted_cards'

// Initialize storage
const initializePaymentStorage = () => {
  if (typeof window === 'undefined') return

  const methods = localStorage.getItem(PAYMENT_METHODS_KEY)
  if (!methods) {
    localStorage.setItem(PAYMENT_METHODS_KEY, JSON.stringify([]))
  }

  const usage = localStorage.getItem(PAYMENT_USAGE_KEY)
  if (!usage) {
    localStorage.setItem(PAYMENT_USAGE_KEY, JSON.stringify([]))
  }

  const patterns = localStorage.getItem(CARD_RISK_PATTERNS_KEY)
  if (!patterns) {
    localStorage.setItem(CARD_RISK_PATTERNS_KEY, JSON.stringify([]))
  }

  const blacklist = localStorage.getItem(BLACKLISTED_CARDS_KEY)
  if (!blacklist) {
    localStorage.setItem(BLACKLISTED_CARDS_KEY, JSON.stringify([]))
  }
}

// Initialize on import
initializePaymentStorage()

// Utility functions for hashing
const hashString = async (input: string): Promise<string> => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder()
    const data = encoder.encode(input)
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }
  // Fallback for environments without crypto.subtle
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return hash.toString(16)
}

// Card type detection
const getCardType = (cardNumber: string): PaymentMethodFingerprint['cardType'] => {
  const cleanNumber = cardNumber.replace(/\D/g, '')
  
  if (cleanNumber.match(/^4/)) return 'visa'
  if (cleanNumber.match(/^5[1-5]/) || cleanNumber.match(/^2[2-7]/)) return 'mastercard'
  if (cleanNumber.match(/^3[47]/)) return 'amex'
  if (cleanNumber.match(/^6/)) return 'discover'
  
  return 'unknown'
}

// BIN (Bank Identification Number) utilities
const getBinRange = (cardNumber: string): string => {
  const cleanNumber = cardNumber.replace(/\D/g, '')
  return cleanNumber.substring(0, 6) // First 6 digits
}

export const paymentMethodTracking = {
  // Create payment method fingerprint
  createPaymentMethodFingerprint: async (
    cardNumber: string,
    expiryMonth: string,
    expiryYear: string,
    cardholderName: string,
    userId: string
  ): Promise<PaymentMethodFingerprint> => {
    const cleanCardNumber = cardNumber.replace(/\D/g, '')
    const last4 = cleanCardNumber.slice(-4)
    const binRange = getBinRange(cleanCardNumber)
    
    const hashedCardNumber = await hashString(cleanCardNumber + last4)
    const expiryHash = await hashString(`${expiryMonth}/${expiryYear}`)
    const nameHash = await hashString(cardholderName.toLowerCase().trim())
    const binRangeHash = await hashString(binRange)

    const fingerprint: PaymentMethodFingerprint = {
      id: await hashString(`${hashedCardNumber}_${expiryHash}_${nameHash}`),
      hashedCardNumber,
      cardType: getCardType(cleanCardNumber),
      expiryHash,
      nameHash,
      binRange: binRangeHash,
      createdAt: new Date(),
      lastUsed: new Date(),
      usageCount: 1,
      associatedUserIds: [userId],
      isBlacklisted: false,
      riskScore: 0
    }

    // Check if this card already exists
    const existingMethods = paymentMethodTracking.getAllPaymentMethods()
    const existing = existingMethods.find(m => m.id === fingerprint.id)

    if (existing) {
      // Update existing card
      if (!existing.associatedUserIds.includes(userId)) {
        existing.associatedUserIds.push(userId)
      }
      existing.lastUsed = new Date()
      existing.usageCount += 1
      
      // Recalculate risk score if multiple users
      if (existing.associatedUserIds.length > 1) {
        existing.riskScore = Math.min(100, existing.riskScore + 25)
      }

      const updatedMethods = existingMethods.map(m => m.id === existing.id ? existing : m)
      localStorage.setItem(PAYMENT_METHODS_KEY, JSON.stringify(updatedMethods))
      
      return existing
    } else {
      // Store new fingerprint
      const allMethods = [...existingMethods, fingerprint]
      localStorage.setItem(PAYMENT_METHODS_KEY, JSON.stringify(allMethods))
      
      return fingerprint
    }
  },

  // Get all payment methods
  getAllPaymentMethods: (): PaymentMethodFingerprint[] => {
    if (typeof window === 'undefined') return []
    
    const stored = localStorage.getItem(PAYMENT_METHODS_KEY)
    if (!stored) return []
    
    const methods = JSON.parse(stored) as PaymentMethodFingerprint[]
    return methods.map(method => ({
      ...method,
      createdAt: new Date(method.createdAt),
      lastUsed: new Date(method.lastUsed)
    }))
  },

  // Get payment methods for user
  getPaymentMethodsForUser: (userId: string): PaymentMethodFingerprint[] => {
    const allMethods = paymentMethodTracking.getAllPaymentMethods()
    return allMethods.filter(method => method.associatedUserIds.includes(userId))
  },

  // Check if card is shared across multiple users
  checkCardSharing: (paymentMethodId: string): {
    isShared: boolean
    userCount: number
    users: string[]
    riskLevel: 'low' | 'medium' | 'high'
  } => {
    const allMethods = paymentMethodTracking.getAllPaymentMethods()
    const method = allMethods.find(m => m.id === paymentMethodId)
    
    if (!method) {
      return { isShared: false, userCount: 0, users: [], riskLevel: 'low' }
    }

    const userCount = method.associatedUserIds.length
    const isShared = userCount > 1
    
    let riskLevel: 'low' | 'medium' | 'high' = 'low'
    if (userCount >= 5) riskLevel = 'high'
    else if (userCount >= 3) riskLevel = 'medium'

    return {
      isShared,
      userCount,
      users: method.associatedUserIds,
      riskLevel
    }
  },

  // Record payment usage
  recordPaymentUsage: (
    paymentMethodId: string,
    userId: string,
    transactionId: string,
    amount: number,
    currency: string,
    ip: string,
    userAgent: string,
    result: PaymentMethodUsage['result'],
    fraudFlags: string[] = []
  ): PaymentMethodUsage => {
    const method = paymentMethodTracking.getAllPaymentMethods().find(m => m.id === paymentMethodId)
    const isNewCard = !method || Date.now() - method.createdAt.getTime() < 24 * 60 * 60 * 1000 // Less than 24 hours old
    const multipleUsers = method ? method.associatedUserIds.length > 1 : false

    // Check velocity (transactions in last hour)
    const recentUsage = paymentMethodTracking.getRecentUsage(paymentMethodId, 60) // Last hour
    const velocityFlag = recentUsage.length > 3

    const usage: PaymentMethodUsage = {
      id: `usage_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      paymentMethodId,
      userId,
      transactionId,
      amount,
      currency,
      timestamp: new Date(),
      ip,
      userAgent,
      result,
      fraudFlags,
      riskFactors: {
        newCard: isNewCard,
        multipleUsers,
        velocityFlag,
        geoMismatch: false, // Would need geo-IP service
        deviceMismatch: false // Would need device consistency check
      }
    }

    const allUsage = JSON.parse(localStorage.getItem(PAYMENT_USAGE_KEY) || '[]')
    allUsage.unshift(usage) // Add to beginning

    // Keep only last 10,000 usage records
    if (allUsage.length > 10000) {
      allUsage.splice(10000)
    }

    localStorage.setItem(PAYMENT_USAGE_KEY, JSON.stringify(allUsage))
    
    // Update payment method statistics
    if (method) {
      const allMethods = paymentMethodTracking.getAllPaymentMethods()
      const updatedMethods = allMethods.map(m => {
        if (m.id === paymentMethodId) {
          m.lastUsed = new Date()
          m.usageCount += 1
          
          // Update risk score based on usage patterns
          if (result === 'failed' || result === 'declined') {
            m.riskScore = Math.min(100, m.riskScore + 10)
          } else if (result === 'fraud_blocked') {
            m.riskScore = Math.min(100, m.riskScore + 50)
          }
          
          if (fraudFlags.length > 0) {
            m.riskScore = Math.min(100, m.riskScore + fraudFlags.length * 5)
          }
        }
        return m
      })
      
      localStorage.setItem(PAYMENT_METHODS_KEY, JSON.stringify(updatedMethods))
    }

    return usage
  },

  // Get recent usage for a payment method
  getRecentUsage: (paymentMethodId: string, minutesBack: number): PaymentMethodUsage[] => {
    if (typeof window === 'undefined') return []
    
    const allUsage = JSON.parse(localStorage.getItem(PAYMENT_USAGE_KEY) || '[]') as PaymentMethodUsage[]
    const cutoffTime = Date.now() - (minutesBack * 60 * 1000)
    
    return allUsage
      .filter(usage => 
        usage.paymentMethodId === paymentMethodId && 
        new Date(usage.timestamp).getTime() > cutoffTime
      )
      .map(usage => ({
        ...usage,
        timestamp: new Date(usage.timestamp)
      }))
  },

  // Detect suspicious patterns
  detectSuspiciousPatterns: (): CardRiskPattern[] => {
    const allMethods = paymentMethodTracking.getAllPaymentMethods()
    const allUsage = JSON.parse(localStorage.getItem(PAYMENT_USAGE_KEY) || '[]') as PaymentMethodUsage[]
    const patterns: CardRiskPattern[] = []

    // Pattern 1: Cards shared among too many users
    const multiUserCards = allMethods.filter(method => method.associatedUserIds.length >= 3)
    if (multiUserCards.length > 0) {
      patterns.push({
        patternType: 'multi_user',
        severity: multiUserCards.some(c => c.associatedUserIds.length >= 5) ? 'high' : 'medium',
        description: `${multiUserCards.length} payment cards shared among multiple users`,
        detectedAt: new Date(),
        affectedCards: multiUserCards.map(c => c.id),
        affectedUsers: multiUserCards.flatMap(c => c.associatedUserIds),
        confidence: 0.85
      })
    }

    // Pattern 2: High velocity usage
    const now = Date.now()
    const oneHourAgo = now - (60 * 60 * 1000)
    const recentUsage = allUsage.filter(u => new Date(u.timestamp).getTime() > oneHourAgo)
    
    const velocityCards = new Map<string, number>()
    recentUsage.forEach(usage => {
      velocityCards.set(usage.paymentMethodId, (velocityCards.get(usage.paymentMethodId) || 0) + 1)
    })

    const highVelocityCards = Array.from(velocityCards.entries()).filter(([_, count]) => count > 5)
    if (highVelocityCards.length > 0) {
      patterns.push({
        patternType: 'velocity',
        severity: 'high',
        description: `${highVelocityCards.length} cards with high transaction velocity`,
        detectedAt: new Date(),
        affectedCards: highVelocityCards.map(([cardId]) => cardId),
        affectedUsers: [],
        confidence: 0.90
      })
    }

    // Pattern 3: Failed transactions clustering
    const failedUsage = allUsage.filter(u => 
      u.result === 'failed' || u.result === 'declined'
    ).slice(0, 100) // Last 100 failed transactions

    const failedCards = new Map<string, number>()
    failedUsage.forEach(usage => {
      failedCards.set(usage.paymentMethodId, (failedCards.get(usage.paymentMethodId) || 0) + 1)
    })

    const suspiciousFailedCards = Array.from(failedCards.entries()).filter(([_, count]) => count > 3)
    if (suspiciousFailedCards.length > 0) {
      patterns.push({
        patternType: 'card_testing',
        severity: 'medium',
        description: `${suspiciousFailedCards.length} cards with multiple failed transactions`,
        detectedAt: new Date(),
        affectedCards: suspiciousFailedCards.map(([cardId]) => cardId),
        affectedUsers: [],
        confidence: 0.75
      })
    }

    // Store detected patterns
    const existingPatterns = JSON.parse(localStorage.getItem(CARD_RISK_PATTERNS_KEY) || '[]')
    const allPatterns = [...existingPatterns, ...patterns]
    localStorage.setItem(CARD_RISK_PATTERNS_KEY, JSON.stringify(allPatterns))

    return patterns
  },

  // Blacklist a payment method
  blacklistPaymentMethod: (paymentMethodId: string, reason: string, adminUser: string): boolean => {
    const allMethods = paymentMethodTracking.getAllPaymentMethods()
    const method = allMethods.find(m => m.id === paymentMethodId)
    
    if (!method) return false

    method.isBlacklisted = true
    method.riskScore = 100

    const updatedMethods = allMethods.map(m => m.id === paymentMethodId ? method : m)
    localStorage.setItem(PAYMENT_METHODS_KEY, JSON.stringify(updatedMethods))

    // Add to blacklist log
    const blacklist = JSON.parse(localStorage.getItem(BLACKLISTED_CARDS_KEY) || '[]')
    blacklist.unshift({
      paymentMethodId,
      reason,
      adminUser,
      timestamp: new Date().toISOString(),
      affectedUsers: method.associatedUserIds
    })
    localStorage.setItem(BLACKLISTED_CARDS_KEY, JSON.stringify(blacklist))

    return true
  },

  // Check if payment method is blacklisted
  isPaymentMethodBlacklisted: (paymentMethodId: string): boolean => {
    const allMethods = paymentMethodTracking.getAllPaymentMethods()
    const method = allMethods.find(m => m.id === paymentMethodId)
    return method ? method.isBlacklisted : false
  },

  // Get payment method risk score
  getPaymentMethodRiskScore: (paymentMethodId: string): number => {
    const allMethods = paymentMethodTracking.getAllPaymentMethods()
    const method = allMethods.find(m => m.id === paymentMethodId)
    return method ? method.riskScore : 0
  },

  // Get comprehensive risk assessment for payment
  assessPaymentRisk: async (
    cardNumber: string,
    expiryMonth: string,
    expiryYear: string,
    cardholderName: string,
    userId: string,
    amount: number,
    ip: string
  ): Promise<{
    riskScore: number
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
    riskFactors: string[]
    recommendation: 'allow' | 'review' | 'block'
    paymentMethodId: string
  }> => {
    const fingerprint = await paymentMethodTracking.createPaymentMethodFingerprint(
      cardNumber, expiryMonth, expiryYear, cardholderName, userId
    )

    let riskScore = fingerprint.riskScore
    const riskFactors: string[] = []

    // Check if blacklisted
    if (fingerprint.isBlacklisted) {
      riskScore = 100
      riskFactors.push('Payment method is blacklisted')
    }

    // Check card sharing
    const sharingInfo = paymentMethodTracking.checkCardSharing(fingerprint.id)
    if (sharingInfo.isShared) {
      riskScore += 20
      riskFactors.push(`Card shared among ${sharingInfo.userCount} users`)
    }

    // Check recent velocity
    const recentUsage = paymentMethodTracking.getRecentUsage(fingerprint.id, 60)
    if (recentUsage.length > 3) {
      riskScore += 15
      riskFactors.push(`High transaction velocity: ${recentUsage.length} transactions in last hour`)
    }

    // Check if new card
    const cardAge = Date.now() - fingerprint.createdAt.getTime()
    if (cardAge < 24 * 60 * 60 * 1000) { // Less than 24 hours
      riskScore += 10
      riskFactors.push('New payment method')
    }

    // Check amount thresholds
    if (amount > 50000) { // Over 500 kr
      riskScore += 10
      riskFactors.push('High transaction amount')
    }

    // Check recent failures
    const recentFailures = recentUsage.filter(u => 
      u.result === 'failed' || u.result === 'declined'
    ).length
    if (recentFailures > 0) {
      riskScore += recentFailures * 5
      riskFactors.push(`${recentFailures} recent failed transactions`)
    }

    riskScore = Math.min(100, riskScore)

    let riskLevel: 'low' | 'medium' | 'high' | 'critical'
    let recommendation: 'allow' | 'review' | 'block'

    if (riskScore >= 80) {
      riskLevel = 'critical'
      recommendation = 'block'
    } else if (riskScore >= 60) {
      riskLevel = 'high'
      recommendation = 'review'
    } else if (riskScore >= 30) {
      riskLevel = 'medium'
      recommendation = 'allow'
    } else {
      riskLevel = 'low'
      recommendation = 'allow'
    }

    return {
      riskScore,
      riskLevel,
      riskFactors,
      recommendation,
      paymentMethodId: fingerprint.id
    }
  },

  // Export payment method data for analysis
  exportPaymentMethodData: () => {
    const methods = paymentMethodTracking.getAllPaymentMethods()
    const usage = JSON.parse(localStorage.getItem(PAYMENT_USAGE_KEY) || '[]')
    const patterns = JSON.parse(localStorage.getItem(CARD_RISK_PATTERNS_KEY) || '[]')
    const blacklist = JSON.parse(localStorage.getItem(BLACKLISTED_CARDS_KEY) || '[]')

    return {
      paymentMethods: methods,
      usage,
      riskPatterns: patterns,
      blacklistedCards: blacklist,
      exportDate: new Date().toISOString(),
      stats: {
        totalPaymentMethods: methods.length,
        blacklistedMethods: methods.filter(m => m.isBlacklisted).length,
        sharedMethods: methods.filter(m => m.associatedUserIds.length > 1).length,
        averageRiskScore: methods.length > 0 ? methods.reduce((sum, m) => sum + m.riskScore, 0) / methods.length : 0
      }
    }
  },

  // Cleanup old data
  cleanupOldData: (daysToKeep: number = 90): number => {
    if (typeof window === 'undefined') return 0
    
    const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000)
    
    // Clean up usage data
    const allUsage = JSON.parse(localStorage.getItem(PAYMENT_USAGE_KEY) || '[]')
    const filteredUsage = allUsage.filter((usage: any) => 
      new Date(usage.timestamp).getTime() > cutoffTime
    )
    const usageRemoved = allUsage.length - filteredUsage.length
    localStorage.setItem(PAYMENT_USAGE_KEY, JSON.stringify(filteredUsage))
    
    // Clean up patterns
    const allPatterns = JSON.parse(localStorage.getItem(CARD_RISK_PATTERNS_KEY) || '[]')
    const filteredPatterns = allPatterns.filter((pattern: any) => 
      new Date(pattern.detectedAt).getTime() > cutoffTime
    )
    const patternsRemoved = allPatterns.length - filteredPatterns.length
    localStorage.setItem(CARD_RISK_PATTERNS_KEY, JSON.stringify(filteredPatterns))
    
    return usageRemoved + patternsRemoved
  }
}
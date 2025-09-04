'use client'

import { paymentMethodTracking } from './paymentMethodTracking'

export interface FraudRule {
  id: string
  name: string
  description: string
  category: 'account' | 'payment' | 'behavior' | 'device' | 'velocity' | 'geographic'
  isActive: boolean
  severity: 'low' | 'medium' | 'high' | 'critical'
  conditions: {
    // Account rules
    maxAccountsPerDevice?: number
    maxAccountsPerIP?: number
    maxAccountsPerPaymentMethod?: number
    minAccountAge?: number // in hours
    
    // Payment rules
    maxTransactionAmount?: number
    maxTransactionsPerHour?: number
    maxTransactionsPerDay?: number
    maxFailedPaymentsPerHour?: number
    blacklistedPaymentMethod?: boolean
    
    // Behavioral rules
    rapidActivityPattern?: boolean
    suspiciousTimeActivity?: boolean // Activity outside normal hours
    bonusAbuse?: boolean
    
    // Device rules
    deviceSimilarityThreshold?: number // 0-1
    deviceSharing?: boolean
    newDeviceRisk?: boolean
    
    // Geographic rules
    vpnDetection?: boolean
    geoInconsistency?: boolean
    highRiskCountries?: string[]
    
    // Email rules
    disposableEmail?: boolean
    suspiciousEmailPattern?: boolean
    emailSimilarity?: boolean
  }
  actions: {
    blockUser?: boolean
    flagForReview?: boolean
    requireVerification?: boolean
    limitTransactions?: boolean
    blockBonuses?: boolean
    sendAlert?: boolean
    logEvent?: boolean
  }
  weights: {
    riskScoreMultiplier: number // How much this rule contributes to overall risk
    confidenceThreshold: number // 0-1, how confident we need to be to trigger
  }
  metadata: {
    createdAt: Date
    createdBy: string
    lastTriggered?: Date
    triggerCount: number
    falsePositiveCount: number
    truePositiveCount: number
    effectiveness: number // 0-1 based on true positive rate
  }
}

export interface RuleEvaluation {
  ruleId: string
  ruleName: string
  triggered: boolean
  confidence: number // 0-1
  reason: string
  evidence: string[]
  recommendedAction: 'allow' | 'flag' | 'block'
  riskContribution: number
}

export interface FraudAssessment {
  userId: string
  overallRiskScore: number
  confidence: number
  recommendation: 'allow' | 'review' | 'block'
  triggeredRules: RuleEvaluation[]
  riskFactors: string[]
  suggestedActions: string[]
  assessmentId: string
  timestamp: Date
}

const FRAUD_RULES_KEY = 'drawdash_fraud_rules'
const RULE_EVALUATIONS_KEY = 'drawdash_rule_evaluations'
const ASSESSMENTS_KEY = 'drawdash_fraud_assessments'

// Initialize storage with default rules
const initializeRulesStorage = () => {
  if (typeof window === 'undefined') return

  const existingRules = localStorage.getItem(FRAUD_RULES_KEY)
  if (!existingRules) {
    const defaultRules: FraudRule[] = [
      {
        id: 'multiple_accounts_device',
        name: 'Multiple Accounts per Device',
        description: 'Detect when too many accounts are created from the same device',
        category: 'device',
        isActive: true,
        severity: 'high',
        conditions: {
          maxAccountsPerDevice: 3
        },
        actions: {
          flagForReview: true,
          blockBonuses: true,
          logEvent: true
        },
        weights: {
          riskScoreMultiplier: 1.5,
          confidenceThreshold: 0.8
        },
        metadata: {
          createdAt: new Date(),
          createdBy: 'System',
          triggerCount: 0,
          falsePositiveCount: 0,
          truePositiveCount: 0,
          effectiveness: 0.85
        }
      },
      {
        id: 'shared_payment_method',
        name: 'Shared Payment Method',
        description: 'Detect when payment methods are shared across multiple accounts',
        category: 'payment',
        isActive: true,
        severity: 'critical',
        conditions: {
          maxAccountsPerPaymentMethod: 2
        },
        actions: {
          blockUser: true,
          sendAlert: true,
          logEvent: true
        },
        weights: {
          riskScoreMultiplier: 2.0,
          confidenceThreshold: 0.9
        },
        metadata: {
          createdAt: new Date(),
          createdBy: 'System',
          triggerCount: 0,
          falsePositiveCount: 0,
          truePositiveCount: 0,
          effectiveness: 0.92
        }
      },
      {
        id: 'rapid_transactions',
        name: 'Rapid Transaction Pattern',
        description: 'Detect unusually high transaction velocity',
        category: 'velocity',
        isActive: true,
        severity: 'medium',
        conditions: {
          maxTransactionsPerHour: 5,
          maxTransactionsPerDay: 20
        },
        actions: {
          flagForReview: true,
          limitTransactions: true,
          logEvent: true
        },
        weights: {
          riskScoreMultiplier: 1.2,
          confidenceThreshold: 0.7
        },
        metadata: {
          createdAt: new Date(),
          createdBy: 'System',
          triggerCount: 0,
          falsePositiveCount: 0,
          truePositiveCount: 0,
          effectiveness: 0.75
        }
      },
      {
        id: 'new_account_high_spend',
        name: 'New Account High Spending',
        description: 'Detect high spending on new accounts',
        category: 'behavior',
        isActive: true,
        severity: 'high',
        conditions: {
          minAccountAge: 24, // Less than 24 hours old
          maxTransactionAmount: 50000 // 500 kr
        },
        actions: {
          flagForReview: true,
          requireVerification: true,
          logEvent: true
        },
        weights: {
          riskScoreMultiplier: 1.8,
          confidenceThreshold: 0.8
        },
        metadata: {
          createdAt: new Date(),
          createdBy: 'System',
          triggerCount: 0,
          falsePositiveCount: 0,
          truePositiveCount: 0,
          effectiveness: 0.88
        }
      },
      {
        id: 'disposable_email',
        name: 'Disposable Email Detection',
        description: 'Detect accounts using temporary/disposable email addresses',
        category: 'account',
        isActive: true,
        severity: 'medium',
        conditions: {
          disposableEmail: true
        },
        actions: {
          flagForReview: true,
          blockBonuses: true,
          requireVerification: true,
          logEvent: true
        },
        weights: {
          riskScoreMultiplier: 1.3,
          confidenceThreshold: 0.9
        },
        metadata: {
          createdAt: new Date(),
          createdBy: 'System',
          triggerCount: 0,
          falsePositiveCount: 0,
          truePositiveCount: 0,
          effectiveness: 0.82
        }
      },
      {
        id: 'vpn_detection',
        name: 'VPN/Proxy Detection',
        description: 'Detect users connecting through VPNs or proxies',
        category: 'geographic',
        isActive: true,
        severity: 'low',
        conditions: {
          vpnDetection: true
        },
        actions: {
          flagForReview: true,
          requireVerification: true,
          logEvent: true
        },
        weights: {
          riskScoreMultiplier: 1.1,
          confidenceThreshold: 0.6
        },
        metadata: {
          createdAt: new Date(),
          createdBy: 'System',
          triggerCount: 0,
          falsePositiveCount: 0,
          truePositiveCount: 0,
          effectiveness: 0.65
        }
      },
      {
        id: 'failed_payment_pattern',
        name: 'Failed Payment Pattern',
        description: 'Detect patterns of failed payments indicating card testing',
        category: 'payment',
        isActive: true,
        severity: 'high',
        conditions: {
          maxFailedPaymentsPerHour: 3
        },
        actions: {
          blockUser: true,
          sendAlert: true,
          logEvent: true
        },
        weights: {
          riskScoreMultiplier: 1.7,
          confidenceThreshold: 0.85
        },
        metadata: {
          createdAt: new Date(),
          createdBy: 'System',
          triggerCount: 0,
          falsePositiveCount: 0,
          truePositiveCount: 0,
          effectiveness: 0.90
        }
      }
    ]
    localStorage.setItem(FRAUD_RULES_KEY, JSON.stringify(defaultRules))
  }

  const existingEvaluations = localStorage.getItem(RULE_EVALUATIONS_KEY)
  if (!existingEvaluations) {
    localStorage.setItem(RULE_EVALUATIONS_KEY, JSON.stringify([]))
  }

  const existingAssessments = localStorage.getItem(ASSESSMENTS_KEY)
  if (!existingAssessments) {
    localStorage.setItem(ASSESSMENTS_KEY, JSON.stringify([]))
  }
}

// Initialize on import
initializeRulesStorage()

export const fraudRulesEngine = {
  // Rule management
  getAllRules: (): FraudRule[] => {
    if (typeof window === 'undefined') return []
    
    const stored = localStorage.getItem(FRAUD_RULES_KEY)
    if (!stored) return []
    
    const rules = JSON.parse(stored) as FraudRule[]
    return rules.map(rule => ({
      ...rule,
      metadata: {
        ...rule.metadata,
        createdAt: new Date(rule.metadata.createdAt),
        lastTriggered: rule.metadata.lastTriggered ? new Date(rule.metadata.lastTriggered) : undefined
      }
    }))
  },

  getRuleById: (id: string): FraudRule | null => {
    const rules = fraudRulesEngine.getAllRules()
    return rules.find(rule => rule.id === id) || null
  },

  createRule: (ruleData: Omit<FraudRule, 'id' | 'metadata'>, adminUser: string): FraudRule => {
    const rules = fraudRulesEngine.getAllRules()
    
    const newRule: FraudRule = {
      ...ruleData,
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      metadata: {
        createdAt: new Date(),
        createdBy: adminUser,
        triggerCount: 0,
        falsePositiveCount: 0,
        truePositiveCount: 0,
        effectiveness: 0
      }
    }
    
    rules.push(newRule)
    localStorage.setItem(FRAUD_RULES_KEY, JSON.stringify(rules))
    
    return newRule
  },

  updateRule: (id: string, updates: Partial<FraudRule>, adminUser: string): FraudRule | null => {
    const rules = fraudRulesEngine.getAllRules()
    const index = rules.findIndex(rule => rule.id === id)
    
    if (index === -1) return null
    
    const updatedRule = { ...rules[index], ...updates }
    rules[index] = updatedRule
    
    localStorage.setItem(FRAUD_RULES_KEY, JSON.stringify(rules))
    
    return updatedRule
  },

  deleteRule: (id: string): boolean => {
    const rules = fraudRulesEngine.getAllRules()
    const filteredRules = rules.filter(rule => rule.id !== id)
    
    if (filteredRules.length === rules.length) return false
    
    localStorage.setItem(FRAUD_RULES_KEY, JSON.stringify(filteredRules))
    return true
  },

  // Core fraud assessment
  assessUser: async (
    userId: string,
    context: {
      email?: string
      ip: string
      userAgent: string
      deviceFingerprint?: string
      paymentData?: {
        cardNumber: string
        expiryMonth: string
        expiryYear: string
        cardholderName: string
        amount: number
      }
      accountAge?: number // in hours
      transactionHistory?: any[]
      bonusHistory?: any[]
    }
  ): Promise<FraudAssessment> => {
    const activeRules = fraudRulesEngine.getAllRules().filter(rule => rule.isActive)
    const evaluations: RuleEvaluation[] = []
    let totalRiskScore = 0
    let totalWeightedConfidence = 0
    let totalWeight = 0

    // Evaluate each rule
    for (const rule of activeRules) {
      const evaluation = await fraudRulesEngine.evaluateRule(rule, userId, context)
      evaluations.push(evaluation)

      if (evaluation.triggered) {
        totalRiskScore += evaluation.riskContribution
        totalWeightedConfidence += evaluation.confidence * rule.weights.riskScoreMultiplier
        totalWeight += rule.weights.riskScoreMultiplier
        
        // Update rule statistics
        fraudRulesEngine.updateRuleStats(rule.id, true)
      }
    }

    const overallRiskScore = Math.min(100, totalRiskScore)
    const confidence = totalWeight > 0 ? totalWeightedConfidence / totalWeight : 0
    
    // Determine recommendation
    let recommendation: 'allow' | 'review' | 'block' = 'allow'
    const triggeredCritical = evaluations.some(e => e.triggered && e.recommendedAction === 'block')
    const triggeredHigh = evaluations.some(e => e.triggered && e.recommendedAction === 'flag')

    if (triggeredCritical || overallRiskScore >= 80) {
      recommendation = 'block'
    } else if (triggeredHigh || overallRiskScore >= 40) {
      recommendation = 'review'
    }

    // Generate risk factors and suggested actions
    const riskFactors = evaluations
      .filter(e => e.triggered)
      .map(e => e.reason)

    const suggestedActions = evaluations
      .filter(e => e.triggered)
      .map(e => {
        const rule = activeRules.find(r => r.id === e.ruleId)
        if (!rule) return []
        
        const actions: string[] = []
        if (rule.actions.blockUser) actions.push('Block user account')
        if (rule.actions.flagForReview) actions.push('Flag for manual review')
        if (rule.actions.requireVerification) actions.push('Require identity verification')
        if (rule.actions.limitTransactions) actions.push('Limit transaction amounts')
        if (rule.actions.blockBonuses) actions.push('Block bonus eligibility')
        if (rule.actions.sendAlert) actions.push('Send fraud alert')
        return actions
      })
      .flat()
      .filter((action, index, self) => self.indexOf(action) === index) // Remove duplicates

    const assessment: FraudAssessment = {
      userId,
      overallRiskScore,
      confidence,
      recommendation,
      triggeredRules: evaluations.filter(e => e.triggered),
      riskFactors,
      suggestedActions,
      assessmentId: `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date()
    }

    // Store assessment
    fraudRulesEngine.storeAssessment(assessment)

    return assessment
  },

  // Evaluate individual rule
  evaluateRule: async (
    rule: FraudRule,
    userId: string,
    context: any
  ): Promise<RuleEvaluation> => {
    const evidence: string[] = []
    let triggered = false
    let confidence = 0

    try {
      switch (rule.category) {
        case 'device':
          ({ triggered, confidence } = await fraudRulesEngine.evaluateDeviceRules(rule, userId, context, evidence))
          break
        case 'payment':
          ({ triggered, confidence } = await fraudRulesEngine.evaluatePaymentRules(rule, userId, context, evidence))
          break
        case 'account':
          ({ triggered, confidence } = await fraudRulesEngine.evaluateAccountRules(rule, userId, context, evidence))
          break
        case 'behavior':
          ({ triggered, confidence } = await fraudRulesEngine.evaluateBehaviorRules(rule, userId, context, evidence))
          break
        case 'velocity':
          ({ triggered, confidence } = await fraudRulesEngine.evaluateVelocityRules(rule, userId, context, evidence))
          break
        case 'geographic':
          ({ triggered, confidence } = await fraudRulesEngine.evaluateGeographicRules(rule, userId, context, evidence))
          break
      }
    } catch (error) {
      console.warn(`Error evaluating rule ${rule.id}:`, error)
      triggered = false
      confidence = 0
    }

    // Only trigger if confidence meets threshold
    if (triggered && confidence < rule.weights.confidenceThreshold) {
      triggered = false
    }

    let recommendedAction: 'allow' | 'flag' | 'block' = 'allow'
    if (triggered) {
      if (rule.actions.blockUser) {
        recommendedAction = 'block'
      } else if (rule.actions.flagForReview) {
        recommendedAction = 'flag'
      }
    }

    const riskContribution = triggered ? rule.weights.riskScoreMultiplier * 10 * confidence : 0

    return {
      ruleId: rule.id,
      ruleName: rule.name,
      triggered,
      confidence,
      reason: triggered ? `${rule.description} (${evidence.join(', ')})` : 'Rule not triggered',
      evidence,
      recommendedAction,
      riskContribution
    }
  },

  // Rule category evaluators
  evaluateDeviceRules: async (rule: FraudRule, userId: string, context: any, evidence: string[]): Promise<{ triggered: boolean, confidence: number }> => {
    let triggered = false
    let confidence = 0

    if (rule.conditions.maxAccountsPerDevice && context.deviceFingerprint) {
      // This would check how many accounts use this device fingerprint
      // For now, simulate
      const accountsOnDevice = 1 // Mock value
      if (accountsOnDevice > rule.conditions.maxAccountsPerDevice) {
        triggered = true
        confidence = 0.8
        evidence.push(`${accountsOnDevice} accounts on device (limit: ${rule.conditions.maxAccountsPerDevice})`)
      }
    }

    return { triggered, confidence }
  },

  evaluatePaymentRules: async (rule: FraudRule, userId: string, context: any, evidence: string[]): Promise<{ triggered: boolean, confidence: number }> => {
    let triggered = false
    let confidence = 0

    if (rule.conditions.maxAccountsPerPaymentMethod && context.paymentData) {
      try {
        const riskAssessment = await paymentMethodTracking.assessPaymentRisk(
          context.paymentData.cardNumber,
          context.paymentData.expiryMonth,
          context.paymentData.expiryYear,
          context.paymentData.cardholderName,
          userId,
          context.paymentData.amount,
          context.ip
        )

        const sharingInfo = paymentMethodTracking.checkCardSharing(riskAssessment.paymentMethodId)
        if (sharingInfo.userCount > rule.conditions.maxAccountsPerPaymentMethod) {
          triggered = true
          confidence = 0.9
          evidence.push(`Payment method shared by ${sharingInfo.userCount} users`)
        }
      } catch (error) {
        console.warn('Payment method evaluation failed:', error)
      }
    }

    if (rule.conditions.maxFailedPaymentsPerHour) {
      // Check recent failed payments for this user
      const userPaymentMethods = paymentMethodTracking.getPaymentMethodsForUser(userId)
      let recentFailures = 0
      for (const method of userPaymentMethods) {
        const recentUsage = paymentMethodTracking.getRecentUsage(method.id, 60)
        recentFailures += recentUsage.filter(u => u.result === 'failed' || u.result === 'declined').length
      }

      if (recentFailures > rule.conditions.maxFailedPaymentsPerHour) {
        triggered = true
        confidence = 0.85
        evidence.push(`${recentFailures} failed payments in last hour`)
      }
    }

    return { triggered, confidence }
  },

  evaluateAccountRules: async (rule: FraudRule, userId: string, context: any, evidence: string[]): Promise<{ triggered: boolean, confidence: number }> => {
    let triggered = false
    let confidence = 0

    if (rule.conditions.disposableEmail && context.email) {
      const disposableDomains = [
        '10minutemail.com', 'guerrillamail.com', 'mailinator.com',
        'temp-mail.org', 'tempmail.net', 'throwaway.email'
      ]
      
      const domain = context.email.split('@')[1]?.toLowerCase()
      if (disposableDomains.includes(domain)) {
        triggered = true
        confidence = 0.95
        evidence.push(`Disposable email domain: ${domain}`)
      }
    }

    if (rule.conditions.maxAccountsPerIP) {
      // This would check IP-based account creation
      // Mock implementation
      const accountsFromIP = 1
      if (accountsFromIP > rule.conditions.maxAccountsPerIP) {
        triggered = true
        confidence = 0.7
        evidence.push(`${accountsFromIP} accounts from IP`)
      }
    }

    return { triggered, confidence }
  },

  evaluateBehaviorRules: async (rule: FraudRule, userId: string, context: any, evidence: string[]): Promise<{ triggered: boolean, confidence: number }> => {
    let triggered = false
    let confidence = 0

    if (rule.conditions.minAccountAge && context.accountAge) {
      if (context.accountAge < rule.conditions.minAccountAge) {
        if (rule.conditions.maxTransactionAmount && context.paymentData?.amount > rule.conditions.maxTransactionAmount) {
          triggered = true
          confidence = 0.8
          evidence.push(`New account (${context.accountAge}h old) with high transaction (${context.paymentData.amount} øre)`)
        }
      }
    }

    return { triggered, confidence }
  },

  evaluateVelocityRules: async (rule: FraudRule, userId: string, context: any, evidence: string[]): Promise<{ triggered: boolean, confidence: number }> => {
    let triggered = false
    let confidence = 0

    if (rule.conditions.maxTransactionsPerHour) {
      const userPaymentMethods = paymentMethodTracking.getPaymentMethodsForUser(userId)
      let recentTransactions = 0
      for (const method of userPaymentMethods) {
        const recentUsage = paymentMethodTracking.getRecentUsage(method.id, 60)
        recentTransactions += recentUsage.length
      }

      if (recentTransactions > rule.conditions.maxTransactionsPerHour) {
        triggered = true
        confidence = 0.75
        evidence.push(`${recentTransactions} transactions in last hour`)
      }
    }

    return { triggered, confidence }
  },

  evaluateGeographicRules: async (rule: FraudRule, userId: string, context: any, evidence: string[]): Promise<{ triggered: boolean, confidence: number }> => {
    let triggered = false
    let confidence = 0

    if (rule.conditions.vpnDetection && context.ip) {
      // Basic VPN detection (would use proper service in production)
      const vpnPatterns = [
        /^10\./, /^172\.16\./, /^192\.168\./,  // Private ranges
        /^185\..*/, /^46\..*/, /^5\..*/ // Common VPN ranges
      ]
      
      const isVPN = vpnPatterns.some(pattern => pattern.test(context.ip))
      if (isVPN) {
        triggered = true
        confidence = 0.6
        evidence.push(`VPN/Proxy IP detected: ${context.ip}`)
      }
    }

    return { triggered, confidence }
  },

  // Store assessment
  storeAssessment: (assessment: FraudAssessment): void => {
    if (typeof window === 'undefined') return
    
    const assessments = JSON.parse(localStorage.getItem(ASSESSMENTS_KEY) || '[]')
    assessments.unshift(assessment)
    
    // Keep only last 1000 assessments
    if (assessments.length > 1000) {
      assessments.splice(1000)
    }
    
    localStorage.setItem(ASSESSMENTS_KEY, JSON.stringify(assessments))
  },

  // Update rule statistics
  updateRuleStats: (ruleId: string, wasTriggered: boolean): void => {
    const rules = fraudRulesEngine.getAllRules()
    const rule = rules.find(r => r.id === ruleId)
    
    if (!rule) return
    
    rule.metadata.triggerCount += 1
    rule.metadata.lastTriggered = new Date()
    
    // This would be updated based on manual review results in production
    if (wasTriggered) {
      // Assume 80% accuracy for now
      if (Math.random() > 0.2) {
        rule.metadata.truePositiveCount += 1
      } else {
        rule.metadata.falsePositiveCount += 1
      }
      
      const totalEvaluations = rule.metadata.truePositiveCount + rule.metadata.falsePositiveCount
      rule.metadata.effectiveness = totalEvaluations > 0 ? rule.metadata.truePositiveCount / totalEvaluations : 0
    }
    
    // Update storage
    const updatedRules = rules.map(r => r.id === ruleId ? rule : r)
    localStorage.setItem(FRAUD_RULES_KEY, JSON.stringify(updatedRules))
  },

  // Get rule performance statistics
  getRulePerformance: (): any => {
    const rules = fraudRulesEngine.getAllRules()
    const assessments = JSON.parse(localStorage.getItem(ASSESSMENTS_KEY) || '[]')
    
    return {
      totalRules: rules.length,
      activeRules: rules.filter(r => r.isActive).length,
      totalAssessments: assessments.length,
      avgRiskScore: assessments.length > 0 
        ? assessments.reduce((sum: number, a: any) => sum + a.overallRiskScore, 0) / assessments.length 
        : 0,
      blockRate: assessments.length > 0 
        ? (assessments.filter((a: any) => a.recommendation === 'block').length / assessments.length) * 100
        : 0,
      reviewRate: assessments.length > 0 
        ? (assessments.filter((a: any) => a.recommendation === 'review').length / assessments.length) * 100
        : 0,
      ruleEffectiveness: rules.map(rule => ({
        id: rule.id,
        name: rule.name,
        category: rule.category,
        triggerCount: rule.metadata.triggerCount,
        effectiveness: rule.metadata.effectiveness,
        falsePositiveRate: rule.metadata.triggerCount > 0 
          ? rule.metadata.falsePositiveCount / rule.metadata.triggerCount 
          : 0
      }))
    }
  },

  // Export data for analysis
  exportRulesData: () => {
    const rules = fraudRulesEngine.getAllRules()
    const assessments = JSON.parse(localStorage.getItem(ASSESSMENTS_KEY) || '[]')
    const evaluations = JSON.parse(localStorage.getItem(RULE_EVALUATIONS_KEY) || '[]')
    
    return {
      rules,
      assessments,
      evaluations,
      performance: fraudRulesEngine.getRulePerformance(),
      exportDate: new Date().toISOString()
    }
  },

  // Clean up old data
  cleanupOldData: (daysToKeep: number = 90): number => {
    if (typeof window === 'undefined') return 0
    
    const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000)
    
    const assessments = JSON.parse(localStorage.getItem(ASSESSMENTS_KEY) || '[]')
    const filteredAssessments = assessments.filter((assessment: any) => 
      new Date(assessment.timestamp).getTime() > cutoffTime
    )
    const removedCount = assessments.length - filteredAssessments.length
    localStorage.setItem(ASSESSMENTS_KEY, JSON.stringify(filteredAssessments))
    
    return removedCount
  }
}
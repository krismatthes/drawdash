'use client'

// Advanced User Segmentation Engine
// Rule-based system for creating dynamic user segments

import { CRMUser, CRMSegment, SegmentRule } from './crmService'

export interface SegmentBuilder {
  name: string
  description: string
  rules: SegmentRule[]
  logicalOperator: 'AND' | 'OR'
}

export interface SegmentAnalytics {
  segmentId: string
  userCount: number
  avgSpent: number
  avgTickets: number
  avgWinnings: number
  acquisitionChannels: Record<string, number>
  loyaltyDistribution: Record<string, number>
  activityLevel: {
    active: number // last 7 days
    moderate: number // 7-30 days
    inactive: number // 30+ days
  }
  revenuePotential: 'high' | 'medium' | 'low'
  churnRisk: number // percentage
}

class SegmentationEngine {
  private segments: CRMSegment[] = []
  private userSegmentCache: Map<string, string[]> = new Map()

  constructor() {
    this.loadSegments()
    console.log('🎯 Segmentation Engine initialized with', this.segments.length, 'segments')
  }

  // Create new segment with rules
  createSegment(builder: SegmentBuilder, createdBy: string): CRMSegment {
    const segment: CRMSegment = {
      id: Date.now().toString(),
      name: builder.name,
      description: builder.description,
      rules: builder.rules,
      userCount: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy
    }

    this.segments.push(segment)
    this.saveSegments()
    this.refreshSegmentUsers(segment.id)
    
    console.log('🎯 Created segment:', segment.name)
    return segment
  }

  // Evaluate if user matches segment rules
  evaluateUserForSegment(user: CRMUser, segment: CRMSegment): boolean {
    if (segment.rules.length === 0) return false

    // For AND logic, all rules must pass
    // For OR logic (default), at least one rule must pass
    const logicalOperator = segment.rules[0]?.logicalOperator || 'OR'

    if (logicalOperator === 'AND') {
      return segment.rules.every(rule => this.evaluateRule(user, rule))
    } else {
      return segment.rules.some(rule => this.evaluateRule(user, rule))
    }
  }

  // Evaluate single rule against user
  private evaluateRule(user: CRMUser, rule: SegmentRule): boolean {
    const userValue = this.getUserFieldValue(user, rule.field)
    
    switch (rule.operator) {
      case 'equals':
        return userValue === rule.value
      
      case 'not_equals':
        return userValue !== rule.value
      
      case 'greater_than':
        return Number(userValue) > Number(rule.value)
      
      case 'less_than':
        return Number(userValue) < Number(rule.value)
      
      case 'contains':
        return String(userValue).toLowerCase().includes(String(rule.value).toLowerCase())
      
      case 'not_contains':
        return !String(userValue).toLowerCase().includes(String(rule.value).toLowerCase())
      
      case 'in':
        return Array.isArray(rule.value) && rule.value.includes(userValue)
      
      case 'not_in':
        return Array.isArray(rule.value) && !rule.value.includes(userValue)
      
      default:
        console.warn('Unknown rule operator:', rule.operator)
        return false
    }
  }


  // Calculate users for all segments
  calculateAllSegments(users: CRMUser[]): void {
    console.log('🔄 Recalculating segments for', users.length, 'users...')
    
    this.segments.forEach(segment => {
      if (segment.isActive) {
        this.refreshSegmentUsers(segment.id, users)
      }
    })
  }

  // Refresh users in specific segment
  refreshSegmentUsers(segmentId: string, users?: CRMUser[]): void {
    const segment = this.segments.find(s => s.id === segmentId)
    if (!segment) return

    // Use provided users or get from storage
    const allUsers = users || this.getMockUsers()
    
    const matchingUsers = allUsers.filter(user => 
      this.evaluateUserForSegment(user, segment)
    )

    const userIds = matchingUsers.map(u => u.id)
    this.userSegmentCache.set(segmentId, userIds)
    
    // Update segment user count
    segment.userCount = userIds.length
    segment.updatedAt = new Date()
    
    this.saveSegments()
    console.log(`🎯 Segment "${segment.name}" has ${userIds.length} users`)
  }

  // Get users in segment
  getSegmentUsers(segmentId: string): string[] {
    return this.userSegmentCache.get(segmentId) || []
  }

  // Get all segments
  getAllSegments(): CRMSegment[] {
    return this.segments
  }

  // Get segment analytics
  getSegmentAnalytics(segmentId: string, users: CRMUser[]): SegmentAnalytics {
    const userIds = this.getSegmentUsers(segmentId)
    const segmentUsers = users.filter(u => userIds.includes(u.id))
    
    if (segmentUsers.length === 0) {
      return this.getEmptyAnalytics(segmentId)
    }

    const totalSpent = segmentUsers.reduce((sum, u) => sum + u.totalSpent, 0)
    const totalTickets = segmentUsers.reduce((sum, u) => sum + u.totalTickets, 0)
    const totalWinnings = segmentUsers.reduce((sum, u) => sum + u.totalWinnings, 0)

    const acquisitionChannels: Record<string, number> = {}
    const loyaltyDistribution: Record<string, number> = {}
    let active = 0, moderate = 0, inactive = 0

    segmentUsers.forEach(user => {
      // Acquisition channels
      const channel = user.acquisitionChannel || 'unknown'
      acquisitionChannels[channel] = (acquisitionChannels[channel] || 0) + 1

      // Loyalty distribution
      loyaltyDistribution[user.loyaltyTier] = (loyaltyDistribution[user.loyaltyTier] || 0) + 1

      // Activity level
      const daysSinceActivity = Math.floor((Date.now() - user.lastActivity.getTime()) / (1000 * 60 * 60 * 24))
      if (daysSinceActivity <= 7) active++
      else if (daysSinceActivity <= 30) moderate++
      else inactive++
    })

    const avgSpent = totalSpent / segmentUsers.length
    const revenuePotential: 'high' | 'medium' | 'low' = 
      avgSpent > 5000 ? 'high' : avgSpent > 1000 ? 'medium' : 'low'

    const churnRisk = (inactive / segmentUsers.length) * 100

    return {
      segmentId,
      userCount: segmentUsers.length,
      avgSpent,
      avgTickets: totalTickets / segmentUsers.length,
      avgWinnings: totalWinnings / segmentUsers.length,
      acquisitionChannels,
      loyaltyDistribution,
      activityLevel: { active, moderate, inactive },
      revenuePotential,
      churnRisk
    }
  }

  // Get predefined segment templates
  getSegmentTemplates(): SegmentBuilder[] {
    return [
      {
        name: 'High Rollers',
        description: 'Brugere med høj værdi (>10.000 DKK brugt)',
        rules: [
          { field: 'totalSpent', operator: 'greater_than', value: 10000 }
        ],
        logicalOperator: 'AND'
      },
      {
        name: 'Nye VIP Potentiale',
        description: 'Nye brugere med høj første-køb værdi',
        rules: [
          { field: 'daysSinceRegistration', operator: 'less_than', value: 30 },
          { field: 'avgSpendPerTicket', operator: 'greater_than', value: 150 }
        ],
        logicalOperator: 'AND'
      },
      {
        name: 'Churn Risk',
        description: 'Tidligere aktive brugere uden aktivitet i 30+ dage',
        rules: [
          { field: 'daysSinceLastActivity', operator: 'greater_than', value: 30 },
          { field: 'totalSpent', operator: 'greater_than', value: 500 }
        ],
        logicalOperator: 'AND'
      },
      {
        name: 'Bil Entusiaster',
        description: 'Brugere der primært deltager i bil-lodtrækninger',
        rules: [
          { field: 'drawPreferences.cars', operator: 'greater_than', value: 5 }
        ],
        logicalOperator: 'AND'
      },
      {
        name: 'København Brugere',
        description: 'Alle brugere i København området',
        rules: [
          { field: 'city', operator: 'contains', value: 'København' }
        ],
        logicalOperator: 'OR'
      },
      {
        name: 'Loyale Kunder',
        description: 'Guld/Platinum tier med høj aktivitet',
        rules: [
          { field: 'loyaltyTier', operator: 'in', value: ['gold', 'platinum'] },
          { field: 'daysSinceLastActivity', operator: 'less_than', value: 14 }
        ],
        logicalOperator: 'AND'
      }
    ]
  }

  // Auto-segment all users
  autoSegmentUsers(users: CRMUser[]): Record<string, string[]> {
    const autoSegments: Record<string, string[]> = {
      high_rollers: [],
      regulars: [],
      casuals: [],
      new_users: [],
      at_risk: [],
      dormant: [],
      vip_potential: [],
      car_enthusiasts: [],
      electronics_lovers: [],
      experience_seekers: []
    }

    users.forEach(user => {
      const daysSinceRegistration = Math.floor((Date.now() - user.registeredAt.getTime()) / (1000 * 60 * 60 * 24))
      const daysSinceActivity = Math.floor((Date.now() - user.lastActivity.getTime()) / (1000 * 60 * 60 * 24))
      const avgSpendPerTicket = user.totalTickets > 0 ? user.totalSpent / user.totalTickets : 0

      // High rollers
      if (user.totalSpent > 10000) {
        autoSegments.high_rollers.push(user.id)
      }

      // New users
      if (daysSinceRegistration <= 7) {
        autoSegments.new_users.push(user.id)
      }

      // At risk / dormant
      if (daysSinceActivity > 90) {
        autoSegments.dormant.push(user.id)
      } else if (daysSinceActivity > 30 && user.totalSpent > 500) {
        autoSegments.at_risk.push(user.id)
      }

      // VIP potential (new users with high spend)
      if (daysSinceRegistration <= 30 && avgSpendPerTicket > 150) {
        autoSegments.vip_potential.push(user.id)
      }

      // Interest-based segments
      if (user.drawPreferences.cars > 5) {
        autoSegments.car_enthusiasts.push(user.id)
      }
      if (user.drawPreferences.electronics > 5) {
        autoSegments.electronics_lovers.push(user.id)
      }
      if (user.drawPreferences.experiences > 3) {
        autoSegments.experience_seekers.push(user.id)
      }

      // Activity-based
      if (user.totalSpent > 2000 && user.totalTickets > 50) {
        autoSegments.regulars.push(user.id)
      } else if (user.totalTickets > 0) {
        autoSegments.casuals.push(user.id)
      }
    })

    // Update cache
    Object.entries(autoSegments).forEach(([segmentId, userIds]) => {
      this.userSegmentCache.set(segmentId, userIds)
    })

    console.log('🔄 Auto-segmentation complete:', Object.fromEntries(
      Object.entries(autoSegments).map(([key, value]) => [key, value.length])
    ))

    return autoSegments
  }

  // Test segment rules against sample users
  testSegmentRules(rules: SegmentRule[], sampleUsers: CRMUser[]): {
    matchingUsers: CRMUser[]
    matchCount: number
    percentage: number
    examples: { user: string, field: string, value: any }[]
  } {
    const matchingUsers = sampleUsers.filter(user => {
      return rules.every(rule => this.evaluateRule(user, rule))
    })

    const examples = matchingUsers.slice(0, 5).map(user => ({
      user: `${user.firstName} ${user.lastName}`,
      field: rules[0]?.field || '',
      value: this.getUserFieldValue(user, rules[0]?.field || '')
    }))

    return {
      matchingUsers,
      matchCount: matchingUsers.length,
      percentage: sampleUsers.length > 0 ? (matchingUsers.length / sampleUsers.length) * 100 : 0,
      examples
    }
  }

  // Get available fields for rules
  getAvailableFields(): { field: string, label: string, type: 'number' | 'string' | 'date' | 'boolean' }[] {
    return [
      { field: 'totalSpent', label: 'Total Brugt (DKK)', type: 'number' },
      { field: 'totalTickets', label: 'Total Billetter Købt', type: 'number' },
      { field: 'totalWinnings', label: 'Total Gevinster', type: 'number' },
      { field: 'loyaltyPoints', label: 'Loyalty Points', type: 'number' },
      { field: 'loyaltyTier', label: 'Loyalty Tier', type: 'string' },
      { field: 'crmSegment', label: 'CRM Segment', type: 'string' },
      { field: 'city', label: 'By', type: 'string' },
      { field: 'country', label: 'Land', type: 'string' },
      { field: 'acquisitionChannel', label: 'Akvisitionskanal', type: 'string' },
      { field: 'daysSinceRegistration', label: 'Dage siden tilmelding', type: 'number' },
      { field: 'daysSinceLastActivity', label: 'Dage siden sidste aktivitet', type: 'number' },
      { field: 'avgSpendPerTicket', label: 'Gennemsnitlig pris per billet', type: 'number' },
      { field: 'drawPreferences.cars', label: 'Bil-præference score', type: 'number' },
      { field: 'drawPreferences.electronics', label: 'Elektronik-præference score', type: 'number' },
      { field: 'drawPreferences.experiences', label: 'Oplevelse-præference score', type: 'number' },
      { field: 'drawPreferences.highValue', label: 'Høj-værdi præference score', type: 'number' }
    ]
  }

  // Get operators for field type
  getOperatorsForType(type: string): { operator: string, label: string }[] {
    const baseOperators = [
      { operator: 'equals', label: 'Er lig med' },
      { operator: 'not_equals', label: 'Er ikke lig med' }
    ]

    const numericOperators = [
      { operator: 'greater_than', label: 'Er større end' },
      { operator: 'less_than', label: 'Er mindre end' }
    ]

    const stringOperators = [
      { operator: 'contains', label: 'Indeholder' },
      { operator: 'not_contains', label: 'Indeholder ikke' }
    ]

    const arrayOperators = [
      { operator: 'in', label: 'Er i liste' },
      { operator: 'not_in', label: 'Er ikke i liste' }
    ]

    switch (type) {
      case 'number':
        return [...baseOperators, ...numericOperators]
      case 'string':
        return [...baseOperators, ...stringOperators, ...arrayOperators]
      case 'date':
        return [...baseOperators, ...numericOperators]
      case 'boolean':
        return baseOperators
      default:
        return baseOperators
    }
  }

  // Export segments for Customer.io
  exportSegments(): string {
    return JSON.stringify({
      segments: this.segments,
      userSegments: Object.fromEntries(this.userSegmentCache),
      exportedAt: new Date().toISOString()
    }, null, 2)
  }

  // Import segments from Customer.io (when available)
  importSegments(data: string): boolean {
    try {
      const imported = JSON.parse(data)
      if (imported.segments) {
        this.segments = imported.segments
        this.saveSegments()
      }
      if (imported.userSegments) {
        this.userSegmentCache = new Map(Object.entries(imported.userSegments))
      }
      console.log('📥 Imported', this.segments.length, 'segments')
      return true
    } catch (error) {
      console.error('❌ Failed to import segments:', error)
      return false
    }
  }


  // Storage helpers
  private loadSegments(): void {
    const stored = localStorage.getItem('crm_segments')
    this.segments = stored ? JSON.parse(stored) : this.getDefaultSegments()
  }

  private saveSegments(): void {
    localStorage.setItem('crm_segments', JSON.stringify(this.segments))
  }

  private getEmptyAnalytics(segmentId: string): SegmentAnalytics {
    return {
      segmentId,
      userCount: 0,
      avgSpent: 0,
      avgTickets: 0,
      avgWinnings: 0,
      acquisitionChannels: {},
      loyaltyDistribution: {},
      activityLevel: { active: 0, moderate: 0, inactive: 0 },
      revenuePotential: 'low',
      churnRisk: 0
    }
  }

  private getDefaultSegments(): CRMSegment[] {
    return [
      {
        id: 'high_rollers',
        name: 'High Rollers',
        description: 'Brugere med høj værdi (>10.000 DKK)',
        rules: [
          { field: 'totalSpent', operator: 'greater_than', value: 10000 }
        ],
        userCount: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'System'
      },
      {
        id: 'new_users',
        name: 'Nye Brugere',
        description: 'Registreret inden for de sidste 7 dage',
        rules: [
          { field: 'daysSinceRegistration', operator: 'less_than', value: 7 }
        ],
        userCount: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'System'
      },
      {
        id: 'churn_risk',
        name: 'Churn Risk',
        description: 'Værdifulde brugere uden aktivitet i 30+ dage',
        rules: [
          { field: 'daysSinceLastActivity', operator: 'greater_than', value: 30 },
          { field: 'totalSpent', operator: 'greater_than', value: 1000 }
        ],
        userCount: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'System'
      }
    ]
  }

  private getMockUsers(): CRMUser[] {
    // Get users from localStorage or return empty array
    const stored = localStorage.getItem('crm_users')
    return stored ? JSON.parse(stored) : []
  }

  private getUserFieldValue(user: CRMUser, field: string): any {
    // Same implementation as in crmService
    switch (field) {
      case 'totalSpent': return user.totalSpent
      case 'totalTickets': return user.totalTickets  
      case 'totalWinnings': return user.totalWinnings
      case 'loyaltyTier': return user.loyaltyTier
      case 'loyaltyPoints': return user.loyaltyPoints
      case 'crmSegment': return user.crmSegment
      case 'acquisitionChannel': return user.acquisitionChannel
      case 'city': return user.city
      case 'country': return user.country
      case 'registeredAt': return user.registeredAt.getTime()
      case 'lastActivity': return user.lastActivity.getTime()
      case 'daysSinceRegistration':
        return Math.floor((Date.now() - user.registeredAt.getTime()) / (1000 * 60 * 60 * 24))
      case 'daysSinceLastActivity':
        return Math.floor((Date.now() - user.lastActivity.getTime()) / (1000 * 60 * 60 * 24))
      case 'avgSpendPerTicket':
        return user.totalTickets > 0 ? user.totalSpent / user.totalTickets : 0
      case 'drawPreferences.cars': return user.drawPreferences.cars
      case 'drawPreferences.electronics': return user.drawPreferences.electronics
      case 'drawPreferences.experiences': return user.drawPreferences.experiences
      case 'drawPreferences.highValue': return user.drawPreferences.highValue
      default: return null
    }
  }
}

// Singleton instance
export const segmentationEngine = new SegmentationEngine()

// Quick access functions
export const Segments = {
  // Core functionality
  create: (builder: SegmentBuilder, createdBy: string) => 
    segmentationEngine.createSegment(builder, createdBy),
  
  getAll: () => segmentationEngine.getAllSegments(),
  
  getUsers: (segmentId: string) => segmentationEngine.getSegmentUsers(segmentId),
  
  getAnalytics: (segmentId: string, users: CRMUser[]) => 
    segmentationEngine.getSegmentAnalytics(segmentId, users),
  
  // Testing and preview
  testRules: (rules: SegmentRule[], users: CRMUser[]) => 
    segmentationEngine.testSegmentRules(rules, users),
  
  // Templates
  getTemplates: () => segmentationEngine.getSegmentTemplates(),
  
  // Auto-segmentation
  autoSegment: (users: CRMUser[]) => segmentationEngine.autoSegmentUsers(users),
  
  // Utilities
  getFields: () => segmentationEngine.getAvailableFields(),
  getOperators: (type: string) => segmentationEngine.getOperatorsForType(type),
  
  // Data management
  export: () => segmentationEngine.exportSegments(),
  import: (data: string) => segmentationEngine.importSegments(data),
  
  // Refresh
  refreshAll: (users: CRMUser[]) => segmentationEngine.calculateAllSegments(users)
}
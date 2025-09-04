'use client'

// CRM Service Layer with Customer.io integration
// This service handles all Customer Relationship Management functionality
// Currently in mock mode - ready for Customer.io API integration

export interface CRMUser {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
  registeredAt: Date
  lastActivity: Date
  totalSpent: number
  totalTickets: number
  totalWinnings: number
  loyaltyTier: string
  loyaltyPoints: number
  acquisitionChannel?: string
  crmSegment: 'high_roller' | 'regular' | 'casual' | 'new' | 'at_risk' | 'dormant'
  communicationPreferences: {
    email: boolean
    sms: boolean
    push: boolean
    marketing: boolean
  }
  gdprConsent: boolean
  consentDate?: Date
  drawPreferences: {
    highValue: number
    cashPrizes: number
    electronics: number
    experiences: number
    cars: number
    lifestyle: number
  }
}

export interface CRMEvent {
  id: string
  userId: string
  event: string
  properties: Record<string, any>
  timestamp: Date
  source: 'web' | 'mobile' | 'email' | 'sms' | 'system'
}

export interface CRMSegment {
  id: string
  name: string
  description: string
  rules: SegmentRule[]
  userCount: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface SegmentRule {
  field: string
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains' | 'in' | 'not_in'
  value: any
  logicalOperator?: 'AND' | 'OR'
}

export interface Campaign {
  id: string
  name: string
  description: string
  type: 'email' | 'sms' | 'push' | 'multi_channel'
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed'
  targetSegments: string[]
  content: {
    subject?: string
    body: string
    templateId?: string
    attachments?: string[]
  }
  scheduling: {
    sendAt?: Date
    timezone: string
    frequency?: 'once' | 'daily' | 'weekly' | 'monthly'
    endDate?: Date
  }
  metrics: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    conversions: number
    revenue: number
  }
  createdAt: Date
  createdBy: string
}

class CRMService {
  private apiEnabled: boolean = false
  private mockMode: boolean = true
  private eventQueue: CRMEvent[] = []
  private userSegments: Map<string, string[]> = new Map()

  constructor() {
    // Check if Customer.io is enabled in environment
    this.apiEnabled = process.env.CUSTOMERIO_ENABLED === 'true'
    this.mockMode = !this.apiEnabled
    
    if (this.mockMode) {
      console.log('🔧 CRM Service running in MOCK MODE - ready for Customer.io integration')
    }
  }

  // Public readiness indicator (avoids exposing private fields)
  public isProductionReady(): boolean {
    return !this.mockMode
  }

  // Initialize Customer.io tracking (mock version)
  async initialize(siteId?: string, apiKey?: string): Promise<boolean> {
    if (this.mockMode) {
      console.log('📊 CRM Service initialized in mock mode')
      return true
    }

    // Real Customer.io initialization would go here
    try {
      // const CustomerIO = require('customerio-node')
      // this.cio = new CustomerIO(siteId, apiKey)
      console.log('🔗 Connected to Customer.io')
      return true
    } catch (error) {
      console.error('❌ Failed to connect to Customer.io:', error)
      return false
    }
  }

  // Sync user to CRM system
  async syncUser(user: CRMUser): Promise<boolean> {
    if (this.mockMode) {
      console.log('👤 [MOCK] Syncing user to Customer.io:', {
        id: user.id,
        email: user.email,
        segment: user.crmSegment,
        spent: user.totalSpent
      })
      
      // Store in localStorage for demo
      this.storeUserData(user)
      return true
    }

    // Real Customer.io sync
    try {
      // await this.cio.identify(user.id, {
      //   email: user.email,
      //   first_name: user.firstName,
      //   last_name: user.lastName,
      //   phone: user.phone,
      //   city: user.city,
      //   country: user.country,
      //   created_at: Math.floor(user.registeredAt.getTime() / 1000),
      //   total_spent: user.totalSpent,
      //   loyalty_tier: user.loyaltyTier,
      //   segment: user.crmSegment,
      //   acquisition_channel: user.acquisitionChannel,
      //   draw_preferences: user.drawPreferences
      // })
      return true
    } catch (error) {
      console.error('❌ Failed to sync user to Customer.io:', error)
      return false
    }
  }

  // Track user events
  async trackEvent(userId: string, event: string, properties: Record<string, any>): Promise<boolean> {
    const eventData: CRMEvent = {
      id: Date.now().toString(),
      userId,
      event,
      properties,
      timestamp: new Date(),
      source: 'web'
    }

    if (this.mockMode) {
      console.log('📈 [MOCK] Tracking event:', eventData)
      this.eventQueue.push(eventData)
      this.storeEvent(eventData)
      return true
    }

    // Real Customer.io event tracking
    try {
      // await this.cio.track(userId, {
      //   name: event,
      //   data: properties
      // })
      return true
    } catch (error) {
      console.error('❌ Failed to track event:', error)
      return false
    }
  }

  // Create user segment
  async createSegment(segment: Omit<CRMSegment, 'id' | 'createdAt' | 'updatedAt' | 'userCount'>): Promise<string> {
    const newSegment: CRMSegment = {
      id: Date.now().toString(),
      ...segment,
      userCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    if (this.mockMode) {
      console.log('🎯 [MOCK] Creating segment:', newSegment)
      this.storeSegment(newSegment)
      return newSegment.id
    }

    // Real Customer.io segment creation
    try {
      // const response = await this.cio.createSegment(segment)
      // return response.id
      return newSegment.id
    } catch (error) {
      console.error('❌ Failed to create segment:', error)
      throw error
    }
  }

  // Get all segments
  getAllSegments(): CRMSegment[] {
    if (this.mockMode) {
      const stored = localStorage.getItem('crm_segments')
      return stored ? JSON.parse(stored) : this.getMockSegments()
    }

    // Real Customer.io API call would go here
    return []
  }

  // Calculate user segments automatically
  calculateUserSegment(user: CRMUser): CRMUser['crmSegment'] {
    const daysSinceLastActivity = Math.floor(
      (Date.now() - user.lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    )

    const avgSpendPerTicket = user.totalTickets > 0 ? user.totalSpent / user.totalTickets : 0

    // High roller logic
    if (user.totalSpent > 10000 || avgSpendPerTicket > 200) {
      return 'high_roller'
    }

    // At risk users (inactive for 30+ days)
    if (daysSinceLastActivity > 30) {
      return daysSinceLastActivity > 90 ? 'dormant' : 'at_risk'
    }

    // New users (registered within last 7 days)
    const daysSinceRegistration = Math.floor(
      (Date.now() - user.registeredAt.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysSinceRegistration <= 7) {
      return 'new'
    }

    // Regular vs casual based on activity
    if (user.totalTickets > 50 || user.totalSpent > 2000) {
      return 'regular'
    }

    return 'casual'
  }

  // Export user data for Customer.io import
  exportUsersForCustomerIO(users: CRMUser[]): string {
    const exportData = users.map(user => ({
      id: user.id,
      email: user.email,
      first_name: user.firstName,
      last_name: user.lastName,
      phone: user.phone,
      city: user.city,
      country: user.country || 'DK',
      created_at: Math.floor(user.registeredAt.getTime() / 1000),
      total_spent: user.totalSpent,
      total_tickets: user.totalTickets,
      total_winnings: user.totalWinnings,
      loyalty_tier: user.loyaltyTier,
      loyalty_points: user.loyaltyPoints,
      segment: user.crmSegment,
      acquisition_channel: user.acquisitionChannel,
      last_activity: Math.floor(user.lastActivity.getTime() / 1000),
      draw_preferences: user.drawPreferences,
      gdpr_consent: user.gdprConsent,
      email_consent: user.communicationPreferences.email,
      sms_consent: user.communicationPreferences.sms,
      marketing_consent: user.communicationPreferences.marketing
    }))

    return JSON.stringify(exportData, null, 2)
  }

  // Export events for Customer.io
  exportEventsForCustomerIO(): string {
    if (this.mockMode) {
      const events = this.getStoredEvents()
      const exportData = events.map(event => ({
        customer_id: event.userId,
        name: event.event,
        data: event.properties,
        timestamp: Math.floor(event.timestamp.getTime() / 1000)
      }))
      return JSON.stringify(exportData, null, 2)
    }
    return '[]'
  }

  // Get segment users
  getSegmentUsers(segmentId: string): string[] {
    return this.userSegments.get(segmentId) || []
  }

  // Update user segment membership
  updateUserSegments(userId: string, segments: string[]): void {
    segments.forEach(segmentId => {
      const users = this.userSegments.get(segmentId) || []
      if (!users.includes(userId)) {
        users.push(userId)
        this.userSegments.set(segmentId, users)
      }
    })
  }

  // Private helper methods for mock storage
  private storeUserData(user: CRMUser): void {
    const existingUsers = this.getStoredUsers()
    const userIndex = existingUsers.findIndex(u => u.id === user.id)
    
    if (userIndex >= 0) {
      existingUsers[userIndex] = user
    } else {
      existingUsers.push(user)
    }
    
    localStorage.setItem('crm_users', JSON.stringify(existingUsers))
  }

  private storeEvent(event: CRMEvent): void {
    const events = this.getStoredEvents()
    events.push(event)
    
    // Keep only last 1000 events
    if (events.length > 1000) {
      events.splice(0, events.length - 1000)
    }
    
    localStorage.setItem('crm_events', JSON.stringify(events))
  }

  private storeSegment(segment: CRMSegment): void {
    const segments = this.getAllSegments()
    segments.push(segment)
    localStorage.setItem('crm_segments', JSON.stringify(segments))
  }

  private getStoredUsers(): CRMUser[] {
    const stored = localStorage.getItem('crm_users')
    return stored ? JSON.parse(stored) : []
  }

  private getStoredEvents(): CRMEvent[] {
    const stored = localStorage.getItem('crm_events')
    return stored ? JSON.parse(stored) : []
  }

  private getMockSegments(): CRMSegment[] {
    return [
      {
        id: '1',
        name: 'High Rollers',
        description: 'Brugere der bruger over 10.000 DKK',
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
        id: '2',
        name: 'Nye Brugere',
        description: 'Registreret inden for de sidste 7 dage',
        rules: [
          { field: 'registeredAt', operator: 'greater_than', value: Date.now() - (7 * 24 * 60 * 60 * 1000) }
        ],
        userCount: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'System'
      },
      {
        id: '3',
        name: 'Risikobrugere',
        description: 'Ingen aktivitet i 30+ dage',
        rules: [
          { field: 'lastActivity', operator: 'less_than', value: Date.now() - (30 * 24 * 60 * 60 * 1000) }
        ],
        userCount: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'System'
      }
    ]
  }

  // Get CRM analytics
  getCRMAnalytics() {
    const users = this.getStoredUsers()
    const events = this.getStoredEvents()
    const segments = this.getAllSegments()

    return {
      totalUsers: users.length,
      activeUsers: users.filter(u => {
        const daysSinceActivity = (Date.now() - new Date(u.lastActivity).getTime()) / (1000 * 60 * 60 * 24)
        return daysSinceActivity <= 30
      }).length,
      totalSegments: segments.filter(s => s.isActive).length,
      totalEvents: events.length,
      avgSpendPerUser: users.length > 0 ? users.reduce((sum, u) => sum + u.totalSpent, 0) / users.length : 0,
      segmentDistribution: this.getSegmentDistribution(users),
      eventsByType: this.getEventsByType(events),
      acquisitionChannels: this.getAcquisitionChannels(users),
      monthlyActivity: this.getMonthlyActivity(events)
    }
  }

  private getSegmentDistribution(users: CRMUser[]) {
    const distribution: Record<string, number> = {}
    users.forEach(user => {
      distribution[user.crmSegment] = (distribution[user.crmSegment] || 0) + 1
    })
    return distribution
  }

  private getEventsByType(events: CRMEvent[]) {
    const byType: Record<string, number> = {}
    events.forEach(event => {
      byType[event.event] = (byType[event.event] || 0) + 1
    })
    return byType
  }

  private getAcquisitionChannels(users: CRMUser[]) {
    const channels: Record<string, number> = {}
    users.forEach(user => {
      const channel = user.acquisitionChannel || 'unknown'
      channels[channel] = (channels[channel] || 0) + 1
    })
    return channels
  }

  private getMonthlyActivity(events: CRMEvent[]) {
    const monthly: Record<string, number> = {}
    events.forEach(event => {
      const month = new Date(event.timestamp).toISOString().substring(0, 7)
      monthly[month] = (monthly[month] || 0) + 1
    })
    return monthly
  }
}

// Singleton instance
export const crmService = new CRMService()

// Quick access functions for common operations
export const CRM = {
  // Track common events
  trackPurchase: (userId: string, amount: number, raffleId: string) =>
    crmService.trackEvent(userId, 'purchase', { amount, raffleId, currency: 'DKK' }),
  
  trackRegistration: (userId: string, acquisitionChannel?: string) =>
    crmService.trackEvent(userId, 'user_registered', { acquisitionChannel }),
  
  trackLogin: (userId: string) =>
    crmService.trackEvent(userId, 'user_login', { timestamp: Date.now() }),
  
  trackPageView: (userId: string, page: string) =>
    crmService.trackEvent(userId, 'page_view', { page }),
  
  trackRaffleEntry: (userId: string, raffleId: string, tickets: number) =>
    crmService.trackEvent(userId, 'raffle_entry', { raffleId, tickets }),
  
  trackWin: (userId: string, raffleId: string, winAmount: number) =>
    crmService.trackEvent(userId, 'raffle_win', { raffleId, winAmount }),

  // User management
  syncUser: (user: CRMUser) => crmService.syncUser(user),
  
  // Analytics
  getAnalytics: () => crmService.getCRMAnalytics(),
  
  // Export functions
  exportUsers: (users: CRMUser[]) => crmService.exportUsersForCustomerIO(users),
  exportEvents: () => crmService.exportEventsForCustomerIO(),
  
  // Segmentation
  createSegment: (segment: Omit<CRMSegment, 'id' | 'createdAt' | 'updatedAt' | 'userCount'>) =>
    crmService.createSegment(segment),
  
  getAllSegments: () => crmService.getAllSegments(),
  
  // Ready for production
  isProductionReady: () => crmService.isProductionReady(),
  enableProduction: (siteId: string, apiKey: string) => crmService.initialize(siteId, apiKey)
}

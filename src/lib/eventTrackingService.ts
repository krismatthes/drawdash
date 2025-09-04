'use client'

// Event Tracking Service
// Comprehensive user behavior and system event tracking

import { CRM, crmService } from './crmService'
import { Automation } from './marketingAutomation'

export interface TrackingEvent {
  id: string
  userId: string
  sessionId: string
  event: string
  category: 'user_action' | 'system' | 'purchase' | 'engagement' | 'navigation' | 'error'
  properties: Record<string, any>
  timestamp: Date
  source: 'web' | 'mobile' | 'email' | 'sms' | 'admin'
  userAgent?: string
  ipAddress?: string
  referrer?: string
  url?: string
  deviceType?: 'desktop' | 'mobile' | 'tablet'
  browser?: string
  os?: string
}

export interface UserSession {
  id: string
  userId: string
  startTime: Date
  endTime?: Date
  duration?: number
  pageViews: number
  events: number
  source: string
  landingPage: string
  exitPage?: string
  converted: boolean
  conversionValue?: number
}

export interface ConversionFunnel {
  step: string
  users: number
  dropoffRate: number
  avgTimeToNext?: number
}

export interface EventAnalytics {
  totalEvents: number
  uniqueUsers: number
  avgEventsPerUser: number
  topEvents: { event: string, count: number }[]
  hourlyDistribution: Record<string, number>
  dailyDistribution: Record<string, number>
  deviceBreakdown: Record<string, number>
  sourceBreakdown: Record<string, number>
  conversionFunnel: ConversionFunnel[]
}

class EventTrackingService {
  private events: TrackingEvent[] = []
  private sessions: UserSession[] = []
  private currentSessions: Map<string, UserSession> = new Map()
  private isEnabled: boolean = true

  constructor() {
    this.loadStoredData()
    this.setupAutoTracking()
    console.log('📊 Event Tracking Service initialized')
  }

  // Track generic event
  track(
    userId: string,
    event: string,
    properties: Record<string, any> = {},
    category: TrackingEvent['category'] = 'user_action'
  ): void {
    const trackingEvent: TrackingEvent = {
      id: Date.now().toString() + Math.random(),
      userId,
      sessionId: this.getOrCreateSession(userId),
      event,
      category,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      timestamp: new Date(),
      source: 'web',
      userAgent: this.getBrowserInfo().userAgent,
      deviceType: this.getBrowserInfo().deviceType,
      browser: this.getBrowserInfo().browser,
      os: this.getBrowserInfo().os,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      referrer: typeof window !== 'undefined' ? document.referrer : undefined
    }

    this.events.push(trackingEvent)
    this.updateSession(userId, event)
    
    // Store in localStorage
    this.saveEvents()
    
    // Send to CRM system
    CRM.trackEvent(userId, event, trackingEvent.properties)
    
    // Check for automation triggers
    this.checkAutomationTriggers(userId, event, properties)
    
    if (this.isEnabled) {
      console.log('📊 Tracked:', event, properties)
    }
  }

  // Track page view
  trackPageView(userId: string, page: string, title?: string): void {
    this.track(userId, 'page_view', {
      page,
      title,
      timestamp: Date.now()
    }, 'navigation')
  }

  // Track user registration
  trackRegistration(userId: string, method: string, acquisitionChannel?: string): void {
    this.track(userId, 'user_registered', {
      method,
      acquisitionChannel
    }, 'user_action')
    
    // Trigger welcome automation
    Automation.onUserRegistered(userId, { method, acquisitionChannel })
  }

  // Track purchase
  trackPurchase(
    userId: string, 
    raffleId: string, 
    tickets: number, 
    amount: number, 
    paymentMethod: string,
    isFirstPurchase: boolean = false
  ): void {
    const purchaseData = {
      raffleId,
      tickets,
      amount,
      paymentMethod,
      currency: 'DKK',
      isFirstPurchase
    }

    this.track(userId, 'purchase', purchaseData, 'purchase')
    
    if (isFirstPurchase) {
      this.track(userId, 'first_purchase', purchaseData, 'purchase')
      Automation.onFirstPurchase(userId, purchaseData)
    } else {
      Automation.onPurchase(userId, purchaseData)
    }
  }

  // Track raffle entry
  trackRaffleEntry(userId: string, raffleId: string, tickets: number): void {
    this.track(userId, 'raffle_entry', {
      raffleId,
      tickets,
      entryMethod: 'purchase'
    }, 'engagement')
  }

  // Track raffle win
  trackRaffleWin(userId: string, raffleId: string, prizeName: string, winAmount: number): void {
    const winData = {
      raffleId,
      prizeName,
      winAmount,
      currency: 'DKK'
    }
    
    this.track(userId, 'raffle_win', winData, 'engagement')
    Automation.onRaffleWin(userId, winData)
  }

  // Track user login
  trackLogin(userId: string, method: string): void {
    this.track(userId, 'user_login', { method }, 'user_action')
    Automation.onLogin(userId, { method })
  }

  // Track engagement events
  trackEngagement(userId: string, action: string, target: string, value?: any): void {
    this.track(userId, `engagement_${action}`, {
      action,
      target,
      value
    }, 'engagement')
  }

  // Track errors
  trackError(userId: string, error: string, context: Record<string, any>): void {
    this.track(userId, 'error', {
      error,
      context,
      severity: 'error'
    }, 'error')
  }

  // Get or create user session
  private getOrCreateSession(userId: string): string {
    const existingSession = this.currentSessions.get(userId)
    
    if (existingSession && this.isSessionActive(existingSession)) {
      return existingSession.id
    }

    // Create new session
    const newSession: UserSession = {
      id: Date.now().toString() + userId,
      userId,
      startTime: new Date(),
      pageViews: 0,
      events: 0,
      source: this.getTrafficSource(),
      landingPage: typeof window !== 'undefined' ? window.location.pathname : '/',
      converted: false
    }

    this.sessions.push(newSession)
    this.currentSessions.set(userId, newSession)
    
    return newSession.id
  }

  // Update session with new event
  private updateSession(userId: string, event: string): void {
    const session = this.currentSessions.get(userId)
    if (session) {
      session.events++
      
      if (event === 'page_view') {
        session.pageViews++
      }
      
      if (event === 'purchase') {
        session.converted = true
      }
      
      // Update exit page
      if (typeof window !== 'undefined') {
        session.exitPage = window.location.pathname
      }
    }
  }

  // Check if session is still active (30 minutes timeout)
  private isSessionActive(session: UserSession): boolean {
    const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000)
    return session.startTime.getTime() > thirtyMinutesAgo
  }

  // Get traffic source
  private getTrafficSource(): string {
    if (typeof window === 'undefined') return 'server'
    
    const referrer = document.referrer
    const urlParams = new URLSearchParams(window.location.search)
    
    if (urlParams.get('utm_source')) {
      return `${urlParams.get('utm_source')}_${urlParams.get('utm_medium') || 'unknown'}`
    }
    
    if (!referrer) return 'direct'
    if (referrer.includes('google')) return 'google_organic'
    if (referrer.includes('facebook')) return 'facebook'
    if (referrer.includes('instagram')) return 'instagram'
    
    return 'referral'
  }

  // Get browser information
  private getBrowserInfo(): { userAgent: string, deviceType: string, browser: string, os: string } {
    if (typeof window === 'undefined') {
      return { userAgent: '', deviceType: 'server', browser: '', os: '' }
    }

    const userAgent = navigator.userAgent
    const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent)
    const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent)
    
    let browser = 'unknown'
    if (userAgent.includes('Chrome')) browser = 'chrome'
    else if (userAgent.includes('Firefox')) browser = 'firefox'
    else if (userAgent.includes('Safari')) browser = 'safari'
    else if (userAgent.includes('Edge')) browser = 'edge'
    
    let os = 'unknown'
    if (userAgent.includes('Mac')) os = 'mac'
    else if (userAgent.includes('Windows')) os = 'windows'
    else if (userAgent.includes('Linux')) os = 'linux'
    else if (userAgent.includes('iOS')) os = 'ios'
    else if (userAgent.includes('Android')) os = 'android'

    return {
      userAgent,
      deviceType: isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop',
      browser,
      os
    }
  }

  // Setup automatic page view tracking
  private setupAutoTracking(): void {
    if (typeof window !== 'undefined') {
      // Track page views automatically
      const originalPushState = history.pushState
      const originalReplaceState = history.replaceState

      history.pushState = function(...args) {
        originalPushState.apply(history, args)
        // Will be triggered by navigation
      }

      history.replaceState = function(...args) {
        originalReplaceState.apply(history, args)
        // Will be triggered by navigation
      }
    }
  }

  // Analytics functions
  getAnalytics(days: number = 30): EventAnalytics {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    const recentEvents = this.events.filter(e => e.timestamp > cutoffDate)
    
    const uniqueUsers = new Set(recentEvents.map(e => e.userId)).size
    const eventCounts: Record<string, number> = {}
    const hourlyDistribution: Record<string, number> = {}
    const dailyDistribution: Record<string, number> = {}
    const deviceBreakdown: Record<string, number> = {}
    const sourceBreakdown: Record<string, number> = {}

    recentEvents.forEach(event => {
      // Event counts
      eventCounts[event.event] = (eventCounts[event.event] || 0) + 1
      
      // Time distributions
      const hour = event.timestamp.getHours().toString()
      const day = event.timestamp.toLocaleDateString('da-DK')
      hourlyDistribution[hour] = (hourlyDistribution[hour] || 0) + 1
      dailyDistribution[day] = (dailyDistribution[day] || 0) + 1
      
      // Device and source breakdown
      if (event.deviceType) {
        deviceBreakdown[event.deviceType] = (deviceBreakdown[event.deviceType] || 0) + 1
      }
      sourceBreakdown[event.source] = (sourceBreakdown[event.source] || 0) + 1
    })

    const topEvents = Object.entries(eventCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([event, count]) => ({ event, count }))

    return {
      totalEvents: recentEvents.length,
      uniqueUsers,
      avgEventsPerUser: uniqueUsers > 0 ? recentEvents.length / uniqueUsers : 0,
      topEvents,
      hourlyDistribution,
      dailyDistribution,
      deviceBreakdown,
      sourceBreakdown,
      conversionFunnel: this.calculateConversionFunnel(recentEvents)
    }
  }

  // Calculate conversion funnel
  private calculateConversionFunnel(events: TrackingEvent[]): ConversionFunnel[] {
    const funnelSteps = [
      'page_view',
      'raffle_view',
      'raffle_entry',
      'purchase',
      'raffle_win'
    ]

    const usersByStep: Record<string, Set<string>> = {}
    
    funnelSteps.forEach(step => {
      usersByStep[step] = new Set(
        events.filter(e => e.event === step).map(e => e.userId)
      )
    })

    return funnelSteps.map((step, index) => {
      const users = usersByStep[step].size
      const previousUsers = index > 0 ? usersByStep[funnelSteps[index - 1]].size : users
      const dropoffRate = previousUsers > 0 ? ((previousUsers - users) / previousUsers) * 100 : 0

      return {
        step,
        users,
        dropoffRate
      }
    })
  }

  // Export events for analysis
  exportEvents(days: number = 30): string {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    const recentEvents = this.events.filter(e => e.timestamp > cutoffDate)
    
    return JSON.stringify({
      events: recentEvents,
      sessions: this.sessions.filter(s => s.startTime > cutoffDate),
      analytics: this.getAnalytics(days),
      exportedAt: new Date().toISOString()
    }, null, 2)
  }

  // Real-time event stream (mock)
  getEventStream(limit: number = 50): TrackingEvent[] {
    return this.events.slice(-limit).reverse()
  }

  // Get user journey
  getUserJourney(userId: string, days: number = 7): TrackingEvent[] {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    return this.events
      .filter(e => e.userId === userId && e.timestamp > cutoffDate)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  }

  // Get session analytics
  getSessionAnalytics(days: number = 30) {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    const recentSessions = this.sessions.filter(s => s.startTime > cutoffDate)
    
    const totalDuration = recentSessions.reduce((sum, s) => sum + (s.duration || 0), 0)
    const avgDuration = recentSessions.length > 0 ? totalDuration / recentSessions.length : 0
    
    const conversionRate = recentSessions.length > 0 ? 
      (recentSessions.filter(s => s.converted).length / recentSessions.length) * 100 : 0

    return {
      totalSessions: recentSessions.length,
      avgDuration,
      avgPageViews: recentSessions.length > 0 ? 
        recentSessions.reduce((sum, s) => sum + s.pageViews, 0) / recentSessions.length : 0,
      conversionRate,
      bounceRate: recentSessions.length > 0 ? 
        (recentSessions.filter(s => s.pageViews === 1).length / recentSessions.length) * 100 : 0
    }
  }

  // Check automation triggers
  private checkAutomationTriggers(userId: string, event: string, properties: Record<string, any>): void {
    // This would trigger marketing automation rules
    console.log(`🔄 Checking automation triggers for event: ${event}`)
  }

  // Storage helpers
  private loadStoredData(): void {
    const storedEvents = localStorage.getItem('tracking_events')
    const storedSessions = localStorage.getItem('tracking_sessions')
    
    this.events = storedEvents ? JSON.parse(storedEvents) : []
    this.sessions = storedSessions ? JSON.parse(storedSessions) : []
    
    // Clean up old events (keep last 30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
    this.events = this.events.filter(e => e.timestamp.getTime() > thirtyDaysAgo)
  }

  private saveEvents(): void {
    // Keep only last 5000 events to prevent localStorage overflow
    if (this.events.length > 5000) {
      this.events = this.events.slice(-5000)
    }
    localStorage.setItem('tracking_events', JSON.stringify(this.events))
  }

  private saveSessions(): void {
    localStorage.setItem('tracking_sessions', JSON.stringify(this.sessions))
  }

  // Enable/disable tracking
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled
    console.log(enabled ? '✅ Event tracking enabled' : '❌ Event tracking disabled')
  }

  // Clear all tracking data
  clearData(): void {
    this.events = []
    this.sessions = []
    this.currentSessions.clear()
    localStorage.removeItem('tracking_events')
    localStorage.removeItem('tracking_sessions')
    console.log('🧹 Cleared all tracking data')
  }
}

// Singleton instance
export const eventTracker = new EventTrackingService()

// Convenient tracking functions
export const Track = {
  // Page and navigation
  pageView: (userId: string, page: string, title?: string) =>
    eventTracker.trackPageView(userId, page, title),
  
  // User lifecycle
  registration: (userId: string, method: string, channel?: string) =>
    eventTracker.trackRegistration(userId, method, channel),
  
  login: (userId: string, method: string) =>
    eventTracker.trackLogin(userId, method),
  
  // E-commerce
  purchase: (userId: string, raffleId: string, tickets: number, amount: number, method: string, isFirst?: boolean) =>
    eventTracker.trackPurchase(userId, raffleId, tickets, amount, method, isFirst),
  
  raffleEntry: (userId: string, raffleId: string, tickets: number) =>
    eventTracker.trackRaffleEntry(userId, raffleId, tickets),
  
  raffleWin: (userId: string, raffleId: string, prizeName: string, amount: number) =>
    eventTracker.trackRaffleWin(userId, raffleId, prizeName, amount),
  
  // Engagement
  engagement: (userId: string, action: string, target: string, value?: any) =>
    eventTracker.trackEngagement(userId, action, target, value),
  
  // Custom events
  custom: (userId: string, event: string, properties?: Record<string, any>) =>
    eventTracker.track(userId, event, properties),
  
  // Errors
  error: (userId: string, error: string, context: Record<string, any>) =>
    eventTracker.trackError(userId, error, context),
  
  // Analytics
  getAnalytics: (days?: number) => eventTracker.getAnalytics(days),
  getSessionAnalytics: (days?: number) => eventTracker.getSessionAnalytics(days),
  getUserJourney: (userId: string, days?: number) => eventTracker.getUserJourney(userId, days),
  getEventStream: (limit?: number) => eventTracker.getEventStream(limit),
  
  // Data management
  export: (days?: number) => eventTracker.exportEvents(days),
  clear: () => eventTracker.clearData(),
  setEnabled: (enabled: boolean) => eventTracker.setEnabled(enabled),
  
  // Utilities for React components
  trackClick: (userId: string, element: string, page?: string) =>
    eventTracker.track(userId, 'click', { element, page }, 'engagement'),
  
  trackFormSubmit: (userId: string, form: string, success: boolean) =>
    eventTracker.track(userId, 'form_submit', { form, success }, 'engagement'),
  
  trackSearch: (userId: string, query: string, results: number) =>
    eventTracker.track(userId, 'search', { query, results }, 'engagement')
}
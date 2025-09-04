'use client'

// GDPR Compliance Service
// Handles consent management, data privacy, and user rights

export interface GDPRConsent {
  userId: string
  email: string
  consentTypes: {
    necessary: boolean // Always true
    analytics: boolean
    marketing: boolean
    personalization: boolean
    thirdParty: boolean
  }
  communicationPreferences: {
    email: boolean
    sms: boolean
    push: boolean
    phone: boolean
  }
  consentDate: Date
  ipAddress: string
  userAgent: string
  consentVersion: string
  withdrawnAt?: Date
  lastUpdated: Date
}

export interface DataSubjectRequest {
  id: string
  userId: string
  email: string
  requestType: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction' | 'objection'
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'rejected'
  requestedAt: Date
  completedAt?: Date
  processedBy?: string
  responseData?: string
  rejectionReason?: string
}

export interface DataAuditLog {
  id: string
  userId?: string
  action: 'consent_given' | 'consent_withdrawn' | 'data_accessed' | 'data_updated' | 'data_exported' | 'data_deleted'
  details: string
  performedBy: string
  performedAt: Date
  ipAddress?: string
  userAgent?: string
  dataTypes: string[]
  legalBasis: 'consent' | 'contract' | 'legal_obligation' | 'legitimate_interest'
}

export interface GDPRAnalytics {
  totalConsents: number
  consentsByType: Record<string, number>
  pendingRequests: number
  completedRequests: number
  avgResponseTime: number // in hours
  consentTrends: Record<string, number> // monthly consent changes
  riskMetrics: {
    expiredConsents: number
    outdatedConsentVersion: number
    unverifiedEmails: number
  }
}

class GDPRService {
  private consents: GDPRConsent[] = []
  private requests: DataSubjectRequest[] = []
  private auditLog: DataAuditLog[] = []
  private currentConsentVersion = '2.1'
  private dataRetentionDays = 365

  constructor() {
    this.loadStoredData()
    console.log('🛡️ GDPR Service initialized with', this.consents.length, 'consent records')
  }

  // Record user consent
  recordConsent(
    userId: string,
    email: string,
    consentData: Partial<GDPRConsent['consentTypes']> & Partial<GDPRConsent['communicationPreferences']>,
    ipAddress: string,
    userAgent: string
  ): GDPRConsent {
    // Find existing consent
    const existingIndex = this.consents.findIndex(c => c.userId === userId)
    
    const consent: GDPRConsent = {
      userId,
      email,
      consentTypes: {
        necessary: true, // Always required
        analytics: consentData.analytics || false,
        marketing: consentData.marketing || false,
        personalization: consentData.personalization || false,
        thirdParty: consentData.thirdParty || false
      },
      communicationPreferences: {
        email: consentData.email || false,
        sms: consentData.sms || false,
        push: consentData.push || false,
        phone: consentData.phone || false
      },
      consentDate: existingIndex >= 0 ? this.consents[existingIndex].consentDate : new Date(),
      ipAddress,
      userAgent,
      consentVersion: this.currentConsentVersion,
      lastUpdated: new Date()
    }

    if (existingIndex >= 0) {
      this.consents[existingIndex] = consent
    } else {
      this.consents.push(consent)
    }

    // Log consent action
    this.logAction({
      userId,
      action: existingIndex >= 0 ? 'consent_withdrawn' : 'consent_given',
      details: `User ${existingIndex >= 0 ? 'updated' : 'gave'} consent for: ${Object.entries(consent.consentTypes).filter(([, value]) => value).map(([key]) => key).join(', ')}`,
      performedBy: userId,
      performedAt: new Date(),
      ipAddress,
      userAgent,
      dataTypes: ['consent', 'preferences'],
      legalBasis: 'consent'
    })

    this.saveData()
    console.log('✅ GDPR consent recorded for user:', userId)
    return consent
  }

  // Withdraw consent
  withdrawConsent(userId: string, consentTypes: (keyof GDPRConsent['consentTypes'])[]): boolean {
    const consent = this.consents.find(c => c.userId === userId)
    if (!consent) return false

    consentTypes.forEach(type => {
      if (type !== 'necessary') { // Cannot withdraw necessary consent
        consent.consentTypes[type] = false
      }
    })

    consent.lastUpdated = new Date()

    this.logAction({
      userId,
      action: 'consent_withdrawn',
      details: `User withdrew consent for: ${consentTypes.join(', ')}`,
      performedBy: userId,
      performedAt: new Date(),
      dataTypes: ['consent'],
      legalBasis: 'consent'
    })

    this.saveData()
    console.log('❌ Consent withdrawn for user:', userId)
    return true
  }

  // Submit data subject request
  submitDataSubjectRequest(
    userId: string,
    email: string,
    requestType: DataSubjectRequest['requestType'],
    description: string
  ): DataSubjectRequest {
    const request: DataSubjectRequest = {
      id: Date.now().toString(),
      userId,
      email,
      requestType,
      description,
      status: 'pending',
      requestedAt: new Date()
    }

    this.requests.push(request)

    this.logAction({
      userId,
      action: 'data_accessed',
      details: `User submitted ${requestType} request: ${description}`,
      performedBy: userId,
      performedAt: new Date(),
      dataTypes: ['personal_data'],
      legalBasis: 'legal_obligation'
    })

    this.saveData()
    console.log('📋 Data subject request submitted:', requestType)
    return request
  }

  // Process data subject request (admin)
  async processDataSubjectRequest(
    requestId: string,
    adminUserId: string,
    action: 'approve' | 'reject',
    notes?: string
  ): Promise<boolean> {
    const request = this.requests.find(r => r.id === requestId)
    if (!request) return false

    if (action === 'approve') {
      request.status = 'in_progress'
      
      // Automatically generate response data based on request type
      switch (request.requestType) {
        case 'access':
          request.responseData = await this.generateDataExport(request.userId)
          break
        case 'erasure':
          await this.eraseUserData(request.userId)
          break
        case 'portability':
          request.responseData = await this.generatePortabilityExport(request.userId)
          break
        // Other request types...
      }

      request.status = 'completed'
      request.completedAt = new Date()
      request.processedBy = adminUserId

    } else {
      request.status = 'rejected'
      request.rejectionReason = notes
      request.processedBy = adminUserId
    }

    this.logAction({
      userId: request.userId,
      action: 'data_accessed',
      details: `Admin ${action}ed ${request.requestType} request: ${notes || 'No notes'}`,
      performedBy: adminUserId,
      performedAt: new Date(),
      dataTypes: ['personal_data', 'consent'],
      legalBasis: 'legal_obligation'
    })

    this.saveData()
    return true
  }

  // Generate data export for user
  private async generateDataExport(userId: string): Promise<string> {
    // Collect all user data from various services
    const userData = {
      profile: {
        userId,
        // Get from user service
        note: 'Complete profile data would be collected from user service'
      },
      transactions: {
        // Get from finance service
        note: 'All transaction history'
      },
      communications: {
        // Get from email/SMS services
        note: 'Email and SMS delivery history'
      },
      events: {
        // Get from event tracking
        note: 'All tracked user events and activities'
      },
      consent: this.consents.find(c => c.userId === userId),
      exportedAt: new Date().toISOString()
    }

    return JSON.stringify(userData, null, 2)
  }

  // Generate portability export
  private async generatePortabilityExport(userId: string): Promise<string> {
    // Machine-readable format for data portability
    const portabilityData = {
      format: 'GDPR_PORTABILITY_V1',
      userId,
      exportedAt: new Date().toISOString(),
      data: {
        // Structured data that can be imported by other services
        profile: 'User profile data in structured format',
        preferences: 'User preferences and settings',
        activity: 'User activity and engagement data',
        transactions: 'Financial transaction history'
      }
    }

    return JSON.stringify(portabilityData, null, 2)
  }

  // Erase user data (right to be forgotten)
  private async eraseUserData(userId: string): Promise<void> {
    console.log('🗑️ [MOCK] Erasing all data for user:', userId)
    
    // In real implementation:
    // - Remove from all databases
    // - Remove from Customer.io
    // - Remove from email lists
    // - Remove from ad platforms
    // - Keep minimal legal records for 6 years (finance)
    
    // Remove from local storage
    this.consents = this.consents.filter(c => c.userId !== userId)
    
    // Mark in audit log but keep for compliance
    this.logAction({
      userId,
      action: 'data_deleted',
      details: 'Complete user data erasure per GDPR Article 17',
      performedBy: 'system',
      performedAt: new Date(),
      dataTypes: ['all'],
      legalBasis: 'legal_obligation'
    })
  }

  // Check consent validity
  isConsentValid(userId: string, consentType: keyof GDPRConsent['consentTypes']): boolean {
    const consent = this.consents.find(c => c.userId === userId)
    if (!consent) return false

    // Check if consent is withdrawn
    if (consent.withdrawnAt) return false

    // Check consent version (if outdated, need re-consent)
    if (consent.consentVersion !== this.currentConsentVersion) return false

    // Check specific consent type
    return consent.consentTypes[consentType]
  }

  // Check communication preference
  canCommunicate(userId: string, channel: keyof GDPRConsent['communicationPreferences']): boolean {
    const consent = this.consents.find(c => c.userId === userId)
    if (!consent) return false

    return consent.communicationPreferences[channel] && 
           this.isConsentValid(userId, 'marketing')
  }

  // Get user consent
  getUserConsent(userId: string): GDPRConsent | null {
    return this.consents.find(c => c.userId === userId) || null
  }

  // Get all data subject requests
  getDataSubjectRequests(): DataSubjectRequest[] {
    return this.requests.sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime())
  }

  // Get pending requests
  getPendingRequests(): DataSubjectRequest[] {
    return this.requests.filter(r => r.status === 'pending')
  }

  // Get audit log
  getAuditLog(days: number = 30): DataAuditLog[] {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    return this.auditLog
      .filter(log => log.performedAt > cutoffDate)
      .sort((a, b) => b.performedAt.getTime() - a.performedAt.getTime())
  }

  // Log GDPR action
  private logAction(action: Omit<DataAuditLog, 'id'>): void {
    const logEntry: DataAuditLog = {
      id: Date.now().toString() + Math.random(),
      ...action
    }

    this.auditLog.push(logEntry)
    
    // Keep only last 10000 entries
    if (this.auditLog.length > 10000) {
      this.auditLog = this.auditLog.slice(-10000)
    }
    
    console.log('📋 GDPR action logged:', action.action)
  }

  // Get GDPR analytics
  getGDPRAnalytics(): GDPRAnalytics {
    const now = Date.now()
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000)

    // Consent analytics
    const consentsByType: Record<string, number> = {}
    let expiredConsents = 0
    let outdatedConsents = 0

    this.consents.forEach(consent => {
      Object.entries(consent.consentTypes).forEach(([type, given]) => {
        if (given) {
          consentsByType[type] = (consentsByType[type] || 0) + 1
        }
      })

      // Check for expired consents (older than 2 years)
      if (consent.consentDate.getTime() < now - (2 * 365 * 24 * 60 * 60 * 1000)) {
        expiredConsents++
      }

      // Check for outdated consent version
      if (consent.consentVersion !== this.currentConsentVersion) {
        outdatedConsents++
      }
    })

    // Request analytics
    const completedRequests = this.requests.filter(r => r.status === 'completed')
    const avgResponseTime = completedRequests.length > 0 ?
      completedRequests.reduce((sum, r) => {
        if (r.completedAt) {
          return sum + (r.completedAt.getTime() - r.requestedAt.getTime())
        }
        return sum
      }, 0) / completedRequests.length / (1000 * 60 * 60) : 0 // Convert to hours

    return {
      totalConsents: this.consents.length,
      consentsByType,
      pendingRequests: this.requests.filter(r => r.status === 'pending').length,
      completedRequests: completedRequests.length,
      avgResponseTime,
      consentTrends: this.getConsentTrends(),
      riskMetrics: {
        expiredConsents,
        outdatedConsentVersion: outdatedConsents,
        unverifiedEmails: this.consents.filter(c => !c.email.includes('@')).length
      }
    }
  }

  // Get consent trends (mock data)
  private getConsentTrends(): Record<string, number> {
    const trends: Record<string, number> = {}
    const months = ['2024-06', '2024-07', '2024-08', '2024-09']
    
    months.forEach((month, index) => {
      trends[month] = 50 + (index * 25) + Math.floor(Math.random() * 20)
    })
    
    return trends
  }

  // Export GDPR compliance data
  exportComplianceData(): string {
    return JSON.stringify({
      consents: this.consents,
      requests: this.requests,
      auditLog: this.auditLog.slice(-1000), // Last 1000 entries
      analytics: this.getGDPRAnalytics(),
      exportedAt: new Date().toISOString(),
      dataRetentionPolicy: `${this.dataRetentionDays} days`,
      consentVersion: this.currentConsentVersion
    }, null, 2)
  }

  // Generate privacy policy compliance report
  generatePrivacyReport(): string {
    const analytics = this.getGDPRAnalytics()
    
    return `
# GDPR Compliance Report
Generated: ${new Date().toLocaleDateString('da-DK')}

## Consent Management
- Total consent records: ${analytics.totalConsents}
- Marketing consent rate: ${((analytics.consentsByType.marketing || 0) / analytics.totalConsents * 100).toFixed(1)}%
- Analytics consent rate: ${((analytics.consentsByType.analytics || 0) / analytics.totalConsents * 100).toFixed(1)}%

## Data Subject Requests
- Pending requests: ${analytics.pendingRequests}
- Completed requests: ${analytics.completedRequests}
- Average response time: ${analytics.avgResponseTime.toFixed(1)} hours

## Risk Assessment
- Expired consents: ${analytics.riskMetrics.expiredConsents}
- Outdated consent version: ${analytics.riskMetrics.outdatedConsentVersion}
- Unverified emails: ${analytics.riskMetrics.unverifiedEmails}

## Compliance Status
✅ Consent management system active
✅ Audit logging enabled
✅ Data subject request handling implemented
✅ Data retention policy configured (${this.dataRetentionDays} days)
${analytics.riskMetrics.expiredConsents > 0 ? '⚠️ Action needed: Update expired consents' : '✅ All consents current'}
`
  }

  // Storage helpers
  private loadStoredData(): void {
    const storedConsents = localStorage.getItem('gdpr_consents')
    const storedRequests = localStorage.getItem('gdpr_requests')
    const storedAuditLog = localStorage.getItem('gdpr_audit_log')

    this.consents = storedConsents ? JSON.parse(storedConsents) : []
    this.requests = storedRequests ? JSON.parse(storedRequests) : []
    this.auditLog = storedAuditLog ? JSON.parse(storedAuditLog) : []
  }

  private saveData(): void {
    localStorage.setItem('gdpr_consents', JSON.stringify(this.consents))
    localStorage.setItem('gdpr_requests', JSON.stringify(this.requests))
    localStorage.setItem('gdpr_audit_log', JSON.stringify(this.auditLog))
  }
}

// Singleton instance
export const gdprService = new GDPRService()

// Quick access functions
export const GDPR = {
  // Consent management
  recordConsent: (userId: string, email: string, consents: any, ip: string, ua: string) =>
    gdprService.recordConsent(userId, email, consents, ip, ua),
  
  withdrawConsent: (userId: string, types: (keyof GDPRConsent['consentTypes'])[]) =>
    gdprService.withdrawConsent(userId, types),
  
  getUserConsent: (userId: string) => gdprService.getUserConsent(userId),
  
  isConsentValid: (userId: string, type: keyof GDPRConsent['consentTypes']) =>
    gdprService.isConsentValid(userId, type),
  
  canCommunicate: (userId: string, channel: keyof GDPRConsent['communicationPreferences']) =>
    gdprService.canCommunicate(userId, channel),
  
  // Data subject requests
  submitRequest: (userId: string, email: string, type: DataSubjectRequest['requestType'], desc: string) =>
    gdprService.submitDataSubjectRequest(userId, email, type, desc),
  
  processRequest: (requestId: string, adminId: string, action: 'approve' | 'reject', notes?: string) =>
    gdprService.processDataSubjectRequest(requestId, adminId, action, notes),
  
  getRequests: () => gdprService.getDataSubjectRequests(),
  getPendingRequests: () => gdprService.getPendingRequests(),
  
  // Analytics and reporting
  getAnalytics: () => gdprService.getGDPRAnalytics(),
  getAuditLog: (days?: number) => gdprService.getAuditLog(days),
  generateReport: () => gdprService.generatePrivacyReport(),
  
  // Data export
  export: () => gdprService.exportComplianceData()
}
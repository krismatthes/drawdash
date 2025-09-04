'use client'

// GDPR Data Protection Impact Assessment (DPIA) Documentation
export interface DPIAAssessment {
  id: string
  title: string
  dataController: {
    name: string
    address: string
    contact: string
    dpoContact?: string
  }
  processingPurpose: string
  legalBasis: string
  dataCategories: string[]
  dataSubjects: string[]
  recipients: string[]
  retentionPeriod: string
  riskAssessment: {
    likelihood: 'low' | 'medium' | 'high'
    severity: 'low' | 'medium' | 'high'
    overallRisk: 'low' | 'medium' | 'high'
    mitigationMeasures: string[]
  }
  consultationStatus: {
    dpoConsulted: boolean
    supervisoryAuthorityConsulted: boolean
    dataSubjectsConsulted: boolean
    consultationDate?: string
  }
  lastReview: string
  nextReview: string
  status: 'draft' | 'approved' | 'requires_review'
  approver?: string
}

export class GDPRComplianceManager {
  private static instance: GDPRComplianceManager
  private dpiaAssessments: DPIAAssessment[] = []

  private constructor() {
    this.loadAssessments()
    this.initializeDefaultDPIA()
  }

  static getInstance(): GDPRComplianceManager {
    if (!GDPRComplianceManager.instance) {
      GDPRComplianceManager.instance = new GDPRComplianceManager()
    }
    return GDPRComplianceManager.instance
  }

  private initializeDefaultDPIA() {
    if (this.dpiaAssessments.length === 0) {
      const defaultDPIA: DPIAAssessment = {
        id: 'drawdash-raffle-system-001',
        title: 'DrawDash Online Raffle System DPIA',
        dataController: {
          name: '7days Performance Ltd',
          address: 'PO Box 100, Attleborough, NR17 2YU, United Kingdom',
          contact: 'privacy@drawdash.dk',
          dpoContact: 'dpo@drawdash.dk'
        },
        processingPurpose: 'Operation of online raffle system including user account management, payment processing, fraud prevention, and regulatory compliance',
        legalBasis: 'Contract performance (Article 6(1)(b)), Legitimate interests (Article 6(1)(f)), Legal obligation (Article 6(1)(c)), Consent (Article 6(1)(a))',
        dataCategories: [
          'Identity data (name, email, phone)',
          'Contact data (billing address, postal address)',
          'Financial data (payment information, transaction history)',
          'Technical data (IP address, browser data, device fingerprints)',
          'Usage data (raffle participation, website interactions)',
          'Marketing data (preferences, communication history)'
        ],
        dataSubjects: [
          'Registered users (18+ years)',
          'Raffle participants',
          'Free entry participants',
          'Website visitors'
        ],
        recipients: [
          'Payment processors (Stripe)',
          'Cloud hosting providers (Vercel/AWS)',
          'Analytics providers (Google Analytics - with consent)',
          'Email service providers',
          'Fraud prevention services',
          'Legal and regulatory authorities (when required)'
        ],
        retentionPeriod: 'Account data: 3 years after account closure; Transaction data: 7 years (regulatory requirement); Marketing data: Until consent withdrawn; Technical data: 12 months',
        riskAssessment: {
          likelihood: 'medium',
          severity: 'medium',
          overallRisk: 'medium',
          mitigationMeasures: [
            'End-to-end encryption for sensitive data',
            'Pseudonymization of personal identifiers where possible',
            'Regular security audits and penetration testing',
            'Staff training on data protection',
            'Incident response procedures',
            'Data minimization principles applied',
            'Consent management platform with granular controls',
            'Regular review of third-party processor agreements'
          ]
        },
        consultationStatus: {
          dpoConsulted: true,
          supervisoryAuthorityConsulted: false,
          dataSubjectsConsulted: true,
          consultationDate: new Date().toISOString().split('T')[0]
        },
        lastReview: new Date().toISOString().split('T')[0],
        nextReview: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'approved',
        approver: 'Data Protection Officer'
      }

      this.dpiaAssessments.push(defaultDPIA)
      this.saveAssessments()
    }
  }

  getDPIAAssessments(): DPIAAssessment[] {
    return this.dpiaAssessments
  }

  getDPIAById(id: string): DPIAAssessment | null {
    return this.dpiaAssessments.find(dpia => dpia.id === id) || null
  }

  updateDPIA(id: string, updates: Partial<DPIAAssessment>): boolean {
    const index = this.dpiaAssessments.findIndex(dpia => dpia.id === id)
    if (index === -1) return false

    this.dpiaAssessments[index] = { ...this.dpiaAssessments[index], ...updates }
    this.saveAssessments()
    return true
  }

  generateComplianceReport(): string {
    const report = {
      generatedAt: new Date().toISOString(),
      dataController: this.dpiaAssessments[0]?.dataController,
      assessments: this.dpiaAssessments,
      complianceStatus: {
        dpiasCompleted: this.dpiaAssessments.filter(d => d.status === 'approved').length,
        requiresReview: this.dpiaAssessments.filter(d => d.status === 'requires_review').length,
        highRiskProcessing: this.dpiaAssessments.filter(d => d.riskAssessment.overallRisk === 'high').length
      },
      technicalMeasures: {
        encryption: 'AES-256 encryption for data at rest, TLS 1.3 for data in transit',
        accessControl: 'Role-based access with multi-factor authentication',
        monitoring: 'Real-time fraud detection and audit logging',
        backup: 'Encrypted backups with geographic distribution',
        incidentResponse: 'Documented procedures with 72-hour breach notification'
      },
      organizationalMeasures: {
        staffTraining: 'Annual GDPR training for all staff',
        policies: 'Data protection policies reviewed annually',
        processors: 'All third-party processors have signed DPA agreements',
        rights: 'Automated tools for subject access requests'
      }
    }

    return JSON.stringify(report, null, 2)
  }

  // Subject Rights Management
  handleSubjectAccessRequest(email: string): {
    personalData: any
    processingActivities: string[]
    retentionSchedule: string[]
    thirdPartySharing: string[]
  } {
    // In production, this would query actual user data
    return {
      personalData: {
        accountData: 'User account information',
        transactionHistory: 'Payment and raffle participation history',
        communicationData: 'Email communications and preferences'
      },
      processingActivities: [
        'Raffle system operation',
        'Payment processing',
        'Fraud prevention',
        'Customer support',
        'Marketing (with consent)'
      ],
      retentionSchedule: [
        'Account data: 3 years after closure',
        'Transaction data: 7 years (legal requirement)',
        'Marketing data: Until consent withdrawn'
      ],
      thirdPartySharing: [
        'Stripe (payment processing)',
        'Google Analytics (website analytics - with consent)',
        'Email service provider (transactional emails)'
      ]
    }
  }

  private loadAssessments(): void {
    if (typeof window === 'undefined') return

    const stored = localStorage.getItem('drawdash_dpia_assessments')
    if (stored) {
      this.dpiaAssessments = JSON.parse(stored)
    }
  }

  private saveAssessments(): void {
    if (typeof window === 'undefined') return

    localStorage.setItem('drawdash_dpia_assessments', JSON.stringify(this.dpiaAssessments))
  }
}

// Data retention policy manager
export class DataRetentionManager {
  private static instance: DataRetentionManager
  private retentionPolicies: Map<string, number> = new Map()

  private constructor() {
    this.initializePolicies()
  }

  static getInstance(): DataRetentionManager {
    if (!DataRetentionManager.instance) {
      DataRetentionManager.instance = new DataRetentionManager()
    }
    return DataRetentionManager.instance
  }

  private initializePolicies() {
    // Retention periods in days
    this.retentionPolicies.set('account_data', 1095) // 3 years
    this.retentionPolicies.set('transaction_data', 2555) // 7 years (legal requirement)
    this.retentionPolicies.set('marketing_data', 365) // 1 year or until consent withdrawn
    this.retentionPolicies.set('technical_data', 365) // 1 year
    this.retentionPolicies.set('audit_logs', 2555) // 7 years (regulatory requirement)
    this.retentionPolicies.set('fraud_flags', 1095) // 3 years
  }

  shouldRetainData(dataType: string, createdAt: Date): boolean {
    const retentionDays = this.retentionPolicies.get(dataType)
    if (!retentionDays) return false

    const expiryDate = new Date(createdAt.getTime() + (retentionDays * 24 * 60 * 60 * 1000))
    return new Date() < expiryDate
  }

  getRetentionPolicy(dataType: string): number | null {
    return this.retentionPolicies.get(dataType) || null
  }

  scheduleDataDeletion(dataType: string, dataId: string, createdAt: Date): void {
    const retentionDays = this.retentionPolicies.get(dataType)
    if (!retentionDays) return

    const deletionDate = new Date(createdAt.getTime() + (retentionDays * 24 * 60 * 60 * 1000))
    
    // In production, this would schedule actual deletion
    console.log(`Data deletion scheduled for ${dataType}:${dataId} on ${deletionDate.toISOString()}`)
  }
}

export const gdprCompliance = GDPRComplianceManager.getInstance()
export const dataRetention = DataRetentionManager.getInstance()
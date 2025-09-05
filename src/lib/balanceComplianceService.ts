'use client'

// Balance & Payout Compliance Service
// Ensures regulatory compliance for Danish gambling and financial regulations

import { UserBalance, BalanceTransaction } from './balanceService'
import { PayoutRequest } from './payoutService'
import { antiFraud } from './antiFraud'

export interface ComplianceCheck {
  id: string
  type: 'aml' | 'kyc' | 'transaction_limit' | 'source_of_funds' | 'risk_assessment'
  status: 'passed' | 'failed' | 'requires_review' | 'pending'
  score: number // 0-100, higher = more compliant
  flags: ComplianceFlag[]
  timestamp: Date
  userId: string
  entityId?: string // Transaction or payout ID
  details: {
    reason?: string
    requiredDocuments?: string[]
    reviewNotes?: string
    regulatoryReference?: string
  }
}

export interface ComplianceFlag {
  type: 'suspicious_pattern' | 'high_velocity' | 'unusual_source' | 'documentation_missing' | 'regulatory_limit'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  regulatoryCode?: string
}

export interface ComplianceProfile {
  userId: string
  kycLevel: 'basic' | 'enhanced' | 'verified'
  amlStatus: 'clear' | 'monitoring' | 'flagged' | 'blocked'
  riskTier: 'low' | 'medium' | 'high'
  documents: {
    id: string
    type: 'photo_id' | 'proof_of_address' | 'bank_statement' | 'source_of_funds'
    status: 'pending' | 'approved' | 'rejected'
    uploadedAt: Date
    expiresAt?: Date
  }[]
  restrictions: {
    maxDailyWithdrawal: number
    maxMonthlyWithdrawal: number
    requiresManualReview: boolean
    blockedMethods: string[]
  }
  lastReviewDate: Date
  nextReviewDue?: Date
}

class BalanceComplianceService {
  private complianceChecks: ComplianceCheck[] = []
  private complianceProfiles: ComplianceProfile[] = []

  constructor() {
    this.loadStoredData()
    console.log('⚖️ Balance Compliance Service initialized')
  }

  // AML (Anti-Money Laundering) Assessment
  async performAMLCheck(userId: string, transaction: BalanceTransaction): Promise<ComplianceCheck> {
    const flags: ComplianceFlag[] = []
    let score = 100

    // Check transaction velocity
    const recentTransactions = this.getRecentTransactions(userId, 24) // Last 24 hours
    if (recentTransactions.length > 10) {
      flags.push({
        type: 'high_velocity',
        severity: 'medium',
        description: 'High transaction velocity detected',
        regulatoryCode: 'DK-AML-001'
      })
      score -= 20
    }

    // Check unusual amounts
    if (transaction.amount > 50000) { // Over 5,000 DKK
      flags.push({
        type: 'suspicious_pattern',
        severity: 'high',
        description: 'Large transaction amount requires enhanced due diligence',
        regulatoryCode: 'DK-AML-002'
      })
      score -= 30
    }

    // Check source patterns
    if (transaction.type === 'cashback' && transaction.amount > 10000) {
      flags.push({
        type: 'unusual_source',
        severity: 'medium',
        description: 'High cashback amount may indicate promotional abuse',
        regulatoryCode: 'DK-AML-003'
      })
      score -= 15
    }

    const complianceCheck: ComplianceCheck = {
      id: `aml_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type: 'aml',
      status: score >= 70 ? 'passed' : score >= 50 ? 'requires_review' : 'failed',
      score,
      flags,
      timestamp: new Date(),
      userId,
      entityId: transaction.id,
      details: {
        reason: flags.length > 0 ? 'Automated AML screening flagged potential issues' : 'Transaction passed AML screening',
        regulatoryReference: 'Danish Anti-Money Laundering Act'
      }
    }

    this.complianceChecks.push(complianceCheck)
    this.saveData()
    
    console.log(`⚖️ AML check completed for ${userId}: ${complianceCheck.status} (score: ${score})`)
    return complianceCheck
  }

  // Enhanced KYC verification for payouts
  async performKYCCheck(userId: string, payoutRequest: PayoutRequest): Promise<ComplianceCheck> {
    const profile = this.getComplianceProfile(userId)
    const flags: ComplianceFlag[] = []
    let score = 100

    // Check KYC level requirements
    if (payoutRequest.amount > 15000 && profile.kycLevel !== 'verified') { // Over 1,500 DKK
      flags.push({
        type: 'documentation_missing',
        severity: 'high',
        description: 'Enhanced KYC verification required for withdrawal over 1,500 DKK',
        regulatoryCode: 'DK-KYC-001'
      })
      score -= 40
    }

    // Check document validity
    const expiredDocs = profile.documents.filter(doc => 
      doc.expiresAt && doc.expiresAt < new Date()
    )
    if (expiredDocs.length > 0) {
      flags.push({
        type: 'documentation_missing',
        severity: 'medium',
        description: 'Some identity documents have expired',
        regulatoryCode: 'DK-KYC-002'
      })
      score -= 25
    }

    // Check withdrawal limits
    const monthlyWithdrawals = this.getMonthlyWithdrawals(userId)
    if (monthlyWithdrawals + payoutRequest.amount > profile.restrictions.maxMonthlyWithdrawal) {
      flags.push({
        type: 'regulatory_limit',
        severity: 'critical',
        description: 'Monthly withdrawal limit exceeded',
        regulatoryCode: 'DK-LIMIT-001'
      })
      score = 0
    }

    const complianceCheck: ComplianceCheck = {
      id: `kyc_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type: 'kyc',
      status: score >= 70 ? 'passed' : score >= 50 ? 'requires_review' : 'failed',
      score,
      flags,
      timestamp: new Date(),
      userId,
      entityId: payoutRequest.id,
      details: {
        reason: flags.length > 0 ? 'KYC verification identified compliance issues' : 'KYC verification passed',
        requiredDocuments: flags.some(f => f.type === 'documentation_missing') 
          ? ['photo_id', 'proof_of_address'] : [],
        regulatoryReference: 'Danish Gambling Authority KYC Requirements'
      }
    }

    this.complianceChecks.push(complianceCheck)
    this.saveData()
    
    console.log(`🆔 KYC check completed for ${userId}: ${complianceCheck.status} (score: ${score})`)
    return complianceCheck
  }

  // Source of funds verification
  async verifySourceOfFunds(userId: string, amount: number, sourceDescription: string): Promise<ComplianceCheck> {
    const flags: ComplianceFlag[] = []
    let score = 100

    // Check for large deposits requiring verification
    if (amount > 100000) { // Over 10,000 DKK
      flags.push({
        type: 'regulatory_limit',
        severity: 'high',
        description: 'Large deposit requires source of funds verification',
        regulatoryCode: 'DK-SOF-001'
      })
      score -= 30
    }

    // Check source description adequacy
    if (!sourceDescription || sourceDescription.length < 10) {
      flags.push({
        type: 'documentation_missing',
        severity: 'medium',
        description: 'Insufficient source of funds documentation',
        regulatoryCode: 'DK-SOF-002'
      })
      score -= 20
    }

    const complianceCheck: ComplianceCheck = {
      id: `sof_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type: 'source_of_funds',
      status: score >= 70 ? 'passed' : score >= 50 ? 'requires_review' : 'failed',
      score,
      flags,
      timestamp: new Date(),
      userId,
      details: {
        reason: `Source of funds: ${sourceDescription}`,
        regulatoryReference: 'Danish Financial Supervisory Authority Guidelines'
      }
    }

    this.complianceChecks.push(complianceCheck)
    this.saveData()
    
    console.log(`💰 Source of funds check completed for ${userId}: ${complianceCheck.status}`)
    return complianceCheck
  }

  // Comprehensive risk assessment
  async performRiskAssessment(userId: string): Promise<ComplianceCheck> {
    const profile = this.getComplianceProfile(userId)
    const userTransactions = this.getRecentTransactions(userId, 168) // Last 7 days
    const flags: ComplianceFlag[] = []
    let score = 100

    // Check transaction patterns
    const totalVolume = userTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)
    if (totalVolume > 250000) { // Over 25,000 DKK in 7 days
      flags.push({
        type: 'suspicious_pattern',
        severity: 'high',
        description: 'High transaction volume in short period',
        regulatoryCode: 'DK-RISK-001'
      })
      score -= 25
    }

    // Check withdrawal patterns
    const withdrawals = userTransactions.filter(t => t.type === 'withdrawal')
    if (withdrawals.length > 5 && totalVolume < 10000) {
      flags.push({
        type: 'suspicious_pattern',
        severity: 'medium',
        description: 'Multiple small withdrawals may indicate structuring',
        regulatoryCode: 'DK-RISK-002'
      })
      score -= 15
    }

    // Check compliance profile risk factors
    if (profile.amlStatus === 'flagged') {
      score -= 30
    }
    
    if (profile.riskTier === 'high') {
      score -= 20
    }

    const complianceCheck: ComplianceCheck = {
      id: `risk_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type: 'risk_assessment',
      status: score >= 70 ? 'passed' : score >= 50 ? 'requires_review' : 'failed',
      score,
      flags,
      timestamp: new Date(),
      userId,
      details: {
        reason: 'Comprehensive risk assessment based on transaction patterns and user profile',
        regulatoryReference: 'Danish Gambling Authority Risk Management Guidelines'
      }
    }

    this.complianceChecks.push(complianceCheck)
    this.saveData()
    
    console.log(`🎯 Risk assessment completed for ${userId}: ${complianceCheck.status} (score: ${score})`)
    return complianceCheck
  }

  // Get or create compliance profile
  getComplianceProfile(userId: string): ComplianceProfile {
    let profile = this.complianceProfiles.find(p => p.userId === userId)
    
    if (!profile) {
      profile = {
        userId,
        kycLevel: 'basic',
        amlStatus: 'clear',
        riskTier: 'low',
        documents: [],
        restrictions: {
          maxDailyWithdrawal: 50000, // 5,000 DKK default
          maxMonthlyWithdrawal: 200000, // 20,000 DKK default
          requiresManualReview: false,
          blockedMethods: []
        },
        lastReviewDate: new Date(),
        nextReviewDue: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
      }
      this.complianceProfiles.push(profile)
      this.saveData()
    }
    
    return profile
  }

  // Update compliance profile
  updateComplianceProfile(userId: string, updates: Partial<ComplianceProfile>): boolean {
    const profileIndex = this.complianceProfiles.findIndex(p => p.userId === userId)
    
    if (profileIndex >= 0) {
      this.complianceProfiles[profileIndex] = {
        ...this.complianceProfiles[profileIndex],
        ...updates,
        lastReviewDate: new Date()
      }
      this.saveData()
      console.log(`📋 Compliance profile updated for ${userId}`)
      return true
    }
    
    return false
  }

  // Check if payout is compliant
  checkPayoutCompliance(userId: string, payoutRequest: PayoutRequest): {
    allowed: boolean
    reasons: string[]
    requiredActions: string[]
  } {
    const profile = this.getComplianceProfile(userId)
    const reasons: string[] = []
    const requiredActions: string[] = []

    // Check daily limits
    const dailyWithdrawals = this.getDailyWithdrawals(userId)
    if (dailyWithdrawals + payoutRequest.amount > profile.restrictions.maxDailyWithdrawal) {
      reasons.push(`Daglig udbetalingsgrænse overskredet (${profile.restrictions.maxDailyWithdrawal.toLocaleString('da-DK')} DKK)`)
      requiredActions.push('Vent til næste dag eller kontakt support for forhøjelse')
    }

    // Check monthly limits
    const monthlyWithdrawals = this.getMonthlyWithdrawals(userId)
    if (monthlyWithdrawals + payoutRequest.amount > profile.restrictions.maxMonthlyWithdrawal) {
      reasons.push(`Månedlig udbetalingsgrænse overskredet (${profile.restrictions.maxMonthlyWithdrawal.toLocaleString('da-DK')} DKK)`)
      requiredActions.push('Vent til næste måned eller gennemgå enhanced KYC')
    }

    // Check KYC requirements for large amounts
    if (payoutRequest.amount > 15000 && profile.kycLevel !== 'verified') {
      reasons.push('Enhanced KYC påkrævet for udbetalinger over 1.500 DKK')
      requiredActions.push('Upload gyldig photo ID og proof of address')
    }

    // Check AML status
    if (profile.amlStatus === 'blocked') {
      reasons.push('Konto blokeret af AML system')
      requiredActions.push('Kontakt support for review af konto')
    }

    // Check blocked payment methods
    if (profile.restrictions.blockedMethods.includes(payoutRequest.method.type)) {
      reasons.push(`${payoutRequest.method.type} er blokeret for denne konto`)
      requiredActions.push('Vælg anden betalingsmetode')
    }

    return {
      allowed: reasons.length === 0,
      reasons,
      requiredActions
    }
  }

  // Transaction monitoring for compliance
  monitorTransaction(userId: string, transaction: BalanceTransaction): ComplianceFlag[] {
    const flags: ComplianceFlag[] = []
    
    // Monitor for structuring (multiple transactions just under reporting thresholds)
    const recentTransactions = this.getRecentTransactions(userId, 24)
    const largeTransactions = recentTransactions.filter(t => Math.abs(t.amount) > 9900 && Math.abs(t.amount) < 10000)
    
    if (largeTransactions.length >= 3) {
      flags.push({
        type: 'suspicious_pattern',
        severity: 'high',
        description: 'Potential structuring detected - multiple transactions just under 10,000 DKK threshold',
        regulatoryCode: 'DK-STR-001'
      })
    }

    // Monitor rapid deposit/withdrawal cycles
    const deposits = recentTransactions.filter(t => t.type === 'deposit')
    const withdrawals = recentTransactions.filter(t => t.type === 'withdrawal')
    
    if (deposits.length > 0 && withdrawals.length > 0) {
      const avgDepositTime = deposits.reduce((sum, d) => sum + d.timestamp.getTime(), 0) / deposits.length
      const avgWithdrawalTime = withdrawals.reduce((sum, w) => sum + w.timestamp.getTime(), 0) / withdrawals.length
      
      // If average time between deposits and withdrawals is less than 1 hour
      if (Math.abs(avgDepositTime - avgWithdrawalTime) < 60 * 60 * 1000) {
        flags.push({
          type: 'suspicious_pattern',
          severity: 'medium',
          description: 'Rapid deposit/withdrawal cycle detected',
          regulatoryCode: 'DK-RDW-001'
        })
      }
    }

    return flags
  }

  // Generate compliance report
  generateComplianceReport(userId?: string): {
    summary: {
      totalChecks: number
      passedChecks: number
      flaggedUsers: number
      highRiskTransactions: number
    }
    recentFlags: ComplianceFlag[]
    riskDistribution: { low: number, medium: number, high: number }
    recommendations: string[]
  } {
    const relevantChecks = userId 
      ? this.complianceChecks.filter(c => c.userId === userId)
      : this.complianceChecks

    const totalChecks = relevantChecks.length
    const passedChecks = relevantChecks.filter(c => c.status === 'passed').length
    
    const flaggedUsers = new Set(
      relevantChecks
        .filter(c => c.flags.length > 0)
        .map(c => c.userId)
    ).size

    const highRiskTransactions = relevantChecks.filter(c => 
      c.score < 50 || c.flags.some(f => f.severity === 'critical')
    ).length

    const recentFlags = relevantChecks
      .flatMap(c => c.flags)
      .filter(f => f.severity === 'high' || f.severity === 'critical')
      .slice(-10)

    const profiles = userId 
      ? this.complianceProfiles.filter(p => p.userId === userId)
      : this.complianceProfiles

    const riskDistribution = profiles.reduce(
      (acc, p) => {
        acc[p.riskTier]++
        return acc
      },
      { low: 0, medium: 0, high: 0 }
    )

    const recommendations: string[] = []
    if (highRiskTransactions > totalChecks * 0.1) {
      recommendations.push('Consider reviewing transaction monitoring thresholds')
    }
    if (flaggedUsers > profiles.length * 0.05) {
      recommendations.push('High number of flagged users - review onboarding process')
    }
    if (riskDistribution.high > profiles.length * 0.02) {
      recommendations.push('Consider enhanced due diligence for high-risk users')
    }

    return {
      summary: {
        totalChecks,
        passedChecks,
        flaggedUsers,
        highRiskTransactions
      },
      recentFlags,
      riskDistribution,
      recommendations
    }
  }

  // Helper methods
  private getRecentTransactions(userId: string, hours: number): BalanceTransaction[] {
    // This would integrate with the actual Balance service in production
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000)
    
    // Mock implementation - in production, query from Balance service
    return []
  }

  private getDailyWithdrawals(userId: string): number {
    // Mock implementation - in production, sum from Balance service
    return 0
  }

  private getMonthlyWithdrawals(userId: string): number {
    // Mock implementation - in production, sum from Balance service
    return 0
  }

  // Storage helpers
  private loadStoredData(): void {
    if (typeof window === 'undefined') {
      // Server-side: Initialize with empty data
      this.complianceChecks = []
      this.complianceProfiles = []
      return
    }

    // Client-side: Load from localStorage
    const storedChecks = localStorage.getItem('compliance_checks')
    const storedProfiles = localStorage.getItem('compliance_profiles')
    
    this.complianceChecks = storedChecks ? JSON.parse(storedChecks) : []
    this.complianceProfiles = storedProfiles ? JSON.parse(storedProfiles) : []
  }

  private saveData(): void {
    if (typeof window === 'undefined') return
    
    localStorage.setItem('compliance_checks', JSON.stringify(this.complianceChecks))
    localStorage.setItem('compliance_profiles', JSON.stringify(this.complianceProfiles))
  }

  // Export compliance data
  exportComplianceData(): string {
    return JSON.stringify({
      complianceChecks: this.complianceChecks,
      complianceProfiles: this.complianceProfiles,
      exportedAt: new Date().toISOString(),
      regulatoryFramework: 'Danish Gambling Authority & Financial Supervisory Authority'
    }, null, 2)
  }
}

// Singleton instance
export const balanceComplianceService = new BalanceComplianceService()

// Quick access functions
export const BalanceCompliance = {
  // Perform compliance checks
  checkAML: (userId: string, transaction: BalanceTransaction) =>
    balanceComplianceService.performAMLCheck(userId, transaction),
  
  checkKYC: (userId: string, payoutRequest: PayoutRequest) =>
    balanceComplianceService.performKYCCheck(userId, payoutRequest),
  
  verifySourceOfFunds: (userId: string, amount: number, description: string) =>
    balanceComplianceService.verifySourceOfFunds(userId, amount, description),
  
  performRiskAssessment: (userId: string) =>
    balanceComplianceService.performRiskAssessment(userId),
  
  // Profile management
  getProfile: (userId: string) =>
    balanceComplianceService.getComplianceProfile(userId),
  
  updateProfile: (userId: string, updates: Partial<ComplianceProfile>) =>
    balanceComplianceService.updateComplianceProfile(userId, updates),
  
  // Payout compliance
  checkPayoutCompliance: (userId: string, payoutRequest: PayoutRequest) =>
    balanceComplianceService.checkPayoutCompliance(userId, payoutRequest),
  
  // Monitoring
  monitorTransaction: (userId: string, transaction: BalanceTransaction) =>
    balanceComplianceService.monitorTransaction(userId, transaction),
  
  // Reporting
  generateReport: (userId?: string) =>
    balanceComplianceService.generateComplianceReport(userId),
  
  export: () => balanceComplianceService.exportComplianceData()
}
'use client'

// Payout Service
// Handles withdrawal requests, bank transfers, and payout processing

import { Balance, balanceService } from './balanceService'
import { BalanceCompliance } from './balanceComplianceService'

export interface PayoutMethod {
  id: string
  type: 'bank_transfer' | 'mobilepay' | 'paypal'
  name: string
  isDefault: boolean
  details: {
    // Bank transfer
    bankName?: string
    accountNumber?: string
    registrationNumber?: string
    iban?: string
    swift?: string
    
    // MobilePay
    mobilePayNumber?: string
    
    // PayPal
    paypalEmail?: string
  }
  addedAt: Date
  lastUsed?: Date
  isVerified: boolean
}

export interface PayoutRequest {
  id: string
  userId: string
  amount: number
  currency: 'DKK'
  method: PayoutMethod
  status: 'pending' | 'processing' | 'approved' | 'completed' | 'rejected' | 'cancelled'
  requestedAt: Date
  processedAt?: Date
  completedAt?: Date
  processedBy?: string
  
  // Verification
  kycStatus: 'pending' | 'in_review' | 'approved' | 'rejected' | 'verified'
  verificationNotes?: string
  
  // Processing details
  processingFee: number
  netAmount: number
  exchangeRate?: number
  
  // Bank transfer details
  transferReference?: string
  expectedTransferDate?: Date
  
  // Admin notes
  adminNotes?: string
  rejectionReason?: string
  
  metadata?: {
    riskScore?: number
    fraudCheck?: boolean
    manualReviewRequired?: boolean
    ipAddress?: string
    userAgent?: string
  }
}

export interface KYCVerification {
  userId: string
  status: 'pending' | 'in_review' | 'approved' | 'rejected'
  submittedAt: Date
  reviewedAt?: Date
  reviewedBy?: string
  
  documents: {
    idDocument?: { type: string, url: string, verified: boolean }
    addressProof?: { type: string, url: string, verified: boolean }
    bankStatement?: { type: string, url: string, verified: boolean }
  }
  
  verificationLevel: 'basic' | 'enhanced' | 'full'
  maxWithdrawalLimit: number
  notes?: string
}

export interface PayoutLimits {
  daily: { max: number, current: number }
  weekly: { max: number, current: number }
  monthly: { max: number, current: number }
  single: { min: number, max: number }
}

class PayoutService {
  private payoutRequests: PayoutRequest[] = []
  private payoutMethods: Record<string, PayoutMethod[]> = {}
  private kycVerifications: KYCVerification[] = []
  private mockMode: boolean = true

  // Danish regulatory limits
  private readonly LIMITS = {
    MIN_WITHDRAWAL: 100,      // 100 DKK minimum
    MAX_SINGLE_WITHDRAWAL: 50000,  // 50,000 DKK per transaction
    MAX_DAILY_WITHDRAWAL: 100000,  // 100,000 DKK per day
    MAX_MONTHLY_WITHDRAWAL: 500000, // 500,000 DKK per month
    PROCESSING_FEE_RATE: 0.015,     // 1.5% processing fee
    MIN_PROCESSING_FEE: 10,         // Minimum 10 DKK fee
    MAX_PROCESSING_FEE: 100         // Maximum 100 DKK fee
  }

  constructor() {
    this.loadStoredData()
    console.log('💳 Payout Service initialized with', this.payoutRequests.length, 'payout requests')
  }

  // Submit withdrawal request
  async submitWithdrawalRequest(
    userId: string, 
    amount: number, 
    methodId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ success: boolean, requestId?: string, error?: string }> {
    
    // Validate withdrawal amount
    const validation = Balance.validateWithdrawal(userId, amount)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    // Get payout method
    const userMethods = this.getUserPayoutMethods(userId)
    const method = userMethods.find(m => m.id === methodId)
    if (!method) {
      return { success: false, error: 'Ugyldig udbetalingsmetode' }
    }

    // Check KYC status
    const kyc = this.getKYCStatus(userId)
    if (kyc.status !== 'approved' && amount > 10000) {
      return { success: false, error: 'KYC verifikation påkrævet for udbetalinger over 10.000 DKK' }
    }

    // Check payout limits
    const limits = this.getPayoutLimits(userId)
    if (amount > limits.daily.max - limits.daily.current) {
      return { success: false, error: 'Daglig udbetalingsgrænse overskredet' }
    }

    // Perform compliance checks before proceeding
    const complianceProfile = BalanceCompliance.getProfile(userId)
    const mockPayoutRequest: PayoutRequest = {
      id: 'temp_payout_check',
      userId,
      amount,
      currency: 'DKK',
      method,
      status: 'pending',
      requestedAt: new Date(),
      kycStatus: kyc.status,
      processingFee: 0,
      netAmount: amount
    }
    
    const complianceCheck = BalanceCompliance.checkPayoutCompliance(userId, mockPayoutRequest)
    if (!complianceCheck.allowed) {
      return { 
        success: false, 
        error: `Compliance fejl: ${complianceCheck.reasons.join(', ')}. ${complianceCheck.requiredActions.join(', ')}`
      }
    }

    // Perform KYC compliance check
    const kycComplianceCheck = await BalanceCompliance.checkKYC(userId, mockPayoutRequest)
    if (kycComplianceCheck.status === 'failed') {
      return { 
        success: false, 
        error: 'KYC verifikation fejlede. Kontakt support.'
      }
    }

    // Calculate fees
    const feeAmount = this.calculateProcessingFee(amount)
    const netAmount = amount - feeAmount

    // Lock balance
    const lockResult = Balance.lockForWithdrawal(userId, amount)
    if (!lockResult.success) {
      return { success: false, error: lockResult.error }
    }

    // Create payout request
    const request: PayoutRequest = {
      id: 'payout_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      userId,
      amount,
      currency: 'DKK',
      method,
      status: 'pending',
      requestedAt: new Date(),
      kycStatus: kyc.status,
      processingFee: feeAmount,
      netAmount,
      metadata: {
        riskScore: this.calculateRiskScore(userId, amount),
        fraudCheck: false,
        manualReviewRequired: amount >= 25000 || kyc.status !== 'approved',
        ipAddress,
        userAgent
      }
    }

    this.payoutRequests.push(request)
    this.saveData()

    console.log('💳 Withdrawal request submitted:', request.id, 'for', amount, 'DKK')
    
    // Notify admin if manual review required
    if (request.metadata?.manualReviewRequired) {
      console.log('⚠️ Manual review required for withdrawal:', request.id)
    }

    return { success: true, requestId: request.id }
  }

  // Process payout request (admin)
  async processPayoutRequest(
    requestId: string, 
    adminUserId: string, 
    action: 'approve' | 'reject',
    notes?: string
  ): Promise<{ success: boolean, error?: string }> {
    const request = this.payoutRequests.find(r => r.id === requestId)
    if (!request) {
      return { success: false, error: 'Udbetalingsanmodning ikke fundet' }
    }

    if (request.status !== 'pending') {
      return { success: false, error: 'Anmodning er allerede behandlet' }
    }

    if (action === 'approve') {
      request.status = 'processing'
      request.processedAt = new Date()
      request.processedBy = adminUserId
      request.adminNotes = notes

      if (this.mockMode) {
        // Simulate bank transfer processing
        setTimeout(() => {
          this.completePayoutTransfer(requestId)
        }, 5000)
      } else {
        // Real bank transfer processing would go here
        await this.initiateBankTransfer(request)
      }

    } else {
      request.status = 'rejected'
      request.processedAt = new Date()
      request.processedBy = adminUserId
      request.rejectionReason = notes

      // Unlock balance
      Balance.unlockBalance(request.userId, request.amount)
    }

    this.saveData()
    console.log('🏛️ Payout request', action, 'by admin:', adminUserId)
    
    return { success: true }
  }

  // Complete bank transfer (called after successful transfer)
  completePayoutTransfer(requestId: string): boolean {
    const request = this.payoutRequests.find(r => r.id === requestId)
    if (!request) return false

    request.status = 'completed'
    request.completedAt = new Date()
    request.transferReference = 'REF_' + Date.now()

    // Complete withdrawal in balance service
    Balance.completeWithdrawal(request.userId, request.amount)

    this.saveData()
    console.log('✅ Payout completed:', requestId)
    
    return true
  }

  // Add/update payout method
  addPayoutMethod(userId: string, method: Omit<PayoutMethod, 'id' | 'addedAt' | 'lastUsed' | 'isVerified'>): PayoutMethod {
    if (!this.payoutMethods[userId]) {
      this.payoutMethods[userId] = []
    }

    const newMethod: PayoutMethod = {
      ...method,
      id: 'method_' + Date.now(),
      addedAt: new Date(),
      isVerified: method.type === 'mobilepay', // MobilePay auto-verified
    }

    // If this is the first method or set as default, make it default
    if (this.payoutMethods[userId].length === 0 || method.isDefault) {
      this.payoutMethods[userId].forEach(m => m.isDefault = false)
      newMethod.isDefault = true
    }

    this.payoutMethods[userId].push(newMethod)
    this.saveData()

    console.log('💳 Added payout method for user:', userId, method.type)
    return newMethod
  }

  // Get user payout methods
  getUserPayoutMethods(userId: string): PayoutMethod[] {
    return this.payoutMethods[userId] || []
  }

  // Get user payout requests
  getUserPayouts(userId: string): PayoutRequest[] {
    return this.payoutRequests
      .filter(r => r.userId === userId)
      .sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime())
  }

  // Get all pending payouts (admin)
  getPendingPayouts(): PayoutRequest[] {
    return this.payoutRequests
      .filter(r => r.status === 'pending')
      .sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime())
  }

  // Get payout limits for user
  getPayoutLimits(userId: string): PayoutLimits {
    const now = new Date()
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(dayStart.getTime() - (dayStart.getDay() * 24 * 60 * 60 * 1000))
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // Calculate used limits
    const userPayouts = this.getUserPayouts(userId)
      .filter(r => r.status === 'completed' || r.status === 'processing')

    const dailyUsed = userPayouts
      .filter(r => r.requestedAt >= dayStart)
      .reduce((sum, r) => sum + r.amount, 0)

    const weeklyUsed = userPayouts
      .filter(r => r.requestedAt >= weekStart)
      .reduce((sum, r) => sum + r.amount, 0)

    const monthlyUsed = userPayouts
      .filter(r => r.requestedAt >= monthStart)
      .reduce((sum, r) => sum + r.amount, 0)

    return {
      daily: { max: this.LIMITS.MAX_DAILY_WITHDRAWAL, current: dailyUsed },
      weekly: { max: this.LIMITS.MAX_DAILY_WITHDRAWAL * 7, current: weeklyUsed },
      monthly: { max: this.LIMITS.MAX_MONTHLY_WITHDRAWAL, current: monthlyUsed },
      single: { min: this.LIMITS.MIN_WITHDRAWAL, max: this.LIMITS.MAX_SINGLE_WITHDRAWAL }
    }
  }

  // Get KYC status
  getKYCStatus(userId: string): KYCVerification {
    let kyc = this.kycVerifications.find(k => k.userId === userId)
    
    if (!kyc) {
      kyc = {
        userId,
        status: 'pending',
        submittedAt: new Date(),
        documents: {},
        verificationLevel: 'basic',
        maxWithdrawalLimit: 10000 // Basic limit before full KYC
      }
      this.kycVerifications.push(kyc)
      this.saveData()
    }
    
    return kyc
  }

  // Calculate processing fee
  private calculateProcessingFee(amount: number): number {
    const feeAmount = amount * this.LIMITS.PROCESSING_FEE_RATE
    return Math.max(
      this.LIMITS.MIN_PROCESSING_FEE, 
      Math.min(this.LIMITS.MAX_PROCESSING_FEE, feeAmount)
    )
  }

  // Calculate risk score for withdrawal
  private calculateRiskScore(userId: string, amount: number): number {
    const userPayouts = this.getUserPayouts(userId)
    const balance = Balance.getBalance(userId)
    
    let score = 0
    
    // Amount risk (higher amount = higher risk)
    if (amount > 25000) score += 30
    else if (amount > 10000) score += 15
    else if (amount > 5000) score += 5
    
    // Frequency risk
    const recentPayouts = userPayouts.filter(
      r => r.requestedAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    )
    score += recentPayouts.length * 10
    
    // Balance ratio risk (withdrawing most of balance)
    const totalBalance = balance.cashBalance + balance.bonusBalance
    if (amount > totalBalance * 0.8) score += 20
    
    // New user risk
    if (userPayouts.length === 0) score += 15
    
    return Math.min(score, 100)
  }

  // Initiate bank transfer (production)
  private async initiateBankTransfer(request: PayoutRequest): Promise<void> {
    console.log('🏦 [MOCK] Initiating bank transfer for:', request.id)
    
    // In production, integrate with:
    // - Danish bank APIs
    // - Stripe Connect
    // - Wise Business API
    // - Or manual SEPA transfer
    
    // For now, simulate processing
    request.transferReference = 'DD_' + Date.now()
    request.expectedTransferDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days
  }

  // Get payout analytics (admin)
  getPayoutAnalytics() {
    const now = Date.now()
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000)

    const recentPayouts = this.payoutRequests.filter(
      r => r.requestedAt.getTime() > thirtyDaysAgo
    )

    const completedPayouts = recentPayouts.filter(r => r.status === 'completed')
    const pendingPayouts = this.payoutRequests.filter(r => r.status === 'pending')
    
    const totalVolume = completedPayouts.reduce((sum, r) => sum + r.netAmount, 0)
    const totalFees = completedPayouts.reduce((sum, r) => sum + r.processingFee, 0)

    // Method breakdown
    const methodBreakdown: Record<string, { count: number, amount: number }> = {}
    completedPayouts.forEach(r => {
      const method = r.method.type
      if (!methodBreakdown[method]) {
        methodBreakdown[method] = { count: 0, amount: 0 }
      }
      methodBreakdown[method].count++
      methodBreakdown[method].amount += r.netAmount
    })

    // Processing time analytics
    const avgProcessingTime = completedPayouts.length > 0 ?
      completedPayouts.reduce((sum, r) => {
        if (r.completedAt && r.requestedAt) {
          return sum + (r.completedAt.getTime() - r.requestedAt.getTime())
        }
        return sum
      }, 0) / completedPayouts.length / (1000 * 60 * 60) : 0 // Convert to hours

    return {
      thirtyDayStats: {
        totalRequests: recentPayouts.length,
        completedRequests: completedPayouts.length,
        pendingRequests: pendingPayouts.length,
        totalVolume,
        totalFees,
        successRate: recentPayouts.length > 0 ? 
          (completedPayouts.length / recentPayouts.length) * 100 : 0
      },
      methodBreakdown,
      processingMetrics: {
        avgProcessingTime,
        pendingQueue: pendingPayouts.length,
        highRiskRequests: pendingPayouts.filter(r => (r.metadata?.riskScore || 0) > 50).length
      },
      kycStatus: {
        totalUsers: this.kycVerifications.length,
        pendingVerifications: this.kycVerifications.filter(k => k.status === 'pending').length,
        approvedUsers: this.kycVerifications.filter(k => k.status === 'approved').length
      }
    }
  }

  // Validate payout method details
  validatePayoutMethod(type: PayoutMethod['type'], details: PayoutMethod['details']): { valid: boolean, error?: string } {
    switch (type) {
      case 'bank_transfer':
        if (!details.accountNumber || !details.registrationNumber) {
          return { valid: false, error: 'Kontonummer og registreringsnummer påkrævet' }
        }
        if (details.accountNumber.length < 4 || details.accountNumber.length > 14) {
          return { valid: false, error: 'Ugyldigt kontonummer format' }
        }
        break

      case 'mobilepay':
        if (!details.mobilePayNumber) {
          return { valid: false, error: 'MobilePay nummer påkrævet' }
        }
        if (!/^\+45[0-9]{8}$/.test(details.mobilePayNumber)) {
          return { valid: false, error: 'Ugyldigt dansk mobilnummer format' }
        }
        break

      case 'paypal':
        if (!details.paypalEmail) {
          return { valid: false, error: 'PayPal email påkrævet' }
        }
        if (!/\S+@\S+\.\S+/.test(details.paypalEmail)) {
          return { valid: false, error: 'Ugyldig email format' }
        }
        break
    }

    return { valid: true }
  }

  // Cancel payout request
  cancelPayoutRequest(requestId: string, userId: string): boolean {
    const request = this.payoutRequests.find(r => r.id === requestId && r.userId === userId)
    if (!request || request.status !== 'pending') return false

    request.status = 'cancelled'
    
    // Unlock balance
    Balance.unlockBalance(userId, request.amount)
    
    this.saveData()
    return true
  }

  // Export payout data
  exportPayoutData(): string {
    return JSON.stringify({
      payoutRequests: this.payoutRequests,
      payoutMethods: this.payoutMethods,
      kycVerifications: this.kycVerifications,
      analytics: this.getPayoutAnalytics(),
      exportedAt: new Date().toISOString()
    }, null, 2)
  }

  // Storage helpers
  private loadStoredData(): void {
    if (typeof window === 'undefined') {
      // Server-side: Initialize with empty data
      this.payoutRequests = []
      this.payoutMethods = {}
      this.kycVerifications = []
      return
    }

    // Client-side: Load from localStorage
    const storedRequests = localStorage.getItem('payout_requests')
    const storedMethods = localStorage.getItem('payout_methods')
    const storedKyc = localStorage.getItem('kyc_verifications')

    this.payoutRequests = storedRequests ? JSON.parse(storedRequests) : []
    this.payoutMethods = storedMethods ? JSON.parse(storedMethods) : {}
    this.kycVerifications = storedKyc ? JSON.parse(storedKyc) : []

    // Initialize with mock data
    if (this.payoutRequests.length === 0) {
      this.initializeMockData()
    }
  }

  private saveData(): void {
    if (typeof window === 'undefined') return
    
    localStorage.setItem('payout_requests', JSON.stringify(this.payoutRequests))
    localStorage.setItem('payout_methods', JSON.stringify(this.payoutMethods))
    localStorage.setItem('kyc_verifications', JSON.stringify(this.kycVerifications))
  }

  private initializeMockData(): void {
    // Mock payout methods
    this.payoutMethods = {
      '1': [
        {
          id: 'method_1',
          type: 'bank_transfer',
          name: 'Danske Bank - Hovedkonto',
          isDefault: true,
          details: {
            bankName: 'Danske Bank',
            accountNumber: '12345678901',
            registrationNumber: '3000'
          },
          addedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          isVerified: true
        },
        {
          id: 'method_2',
          type: 'mobilepay',
          name: 'MobilePay',
          isDefault: false,
          details: {
            mobilePayNumber: '+4512345678'
          },
          addedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          isVerified: true
        }
      ]
    }

    // Mock KYC verification
    this.kycVerifications = [
      {
        userId: '1',
        status: 'approved',
        submittedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        reviewedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
        reviewedBy: 'admin_1',
        documents: {
          idDocument: { type: 'passport', url: 'mock_url', verified: true },
          addressProof: { type: 'bank_statement', url: 'mock_url', verified: true }
        },
        verificationLevel: 'full',
        maxWithdrawalLimit: 100000,
        notes: 'All documents verified successfully'
      }
    ]

    // Mock payout request
    this.payoutRequests = [
      {
        id: 'payout_1',
        userId: '2',
        amount: 500,
        currency: 'DKK',
        method: {
          id: 'method_bank_1',
          type: 'bank_transfer',
          name: 'Nordea',
          isDefault: true,
          details: { bankName: 'Nordea', accountNumber: '98765432109', registrationNumber: '2000' },
          addedAt: new Date(),
          isVerified: true
        },
        status: 'pending',
        requestedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        kycStatus: 'approved',
        processingFee: 10,
        netAmount: 490,
        metadata: {
          riskScore: 15,
          fraudCheck: true,
          manualReviewRequired: false
        }
      }
    ]

    this.saveData()
  }
}

// Singleton instance
export const payoutService = new PayoutService()

// Quick access functions
export const Payouts = {
  // Withdrawal requests
  submitWithdrawal: (userId: string, amount: number, methodId: string, ip?: string, ua?: string) =>
    payoutService.submitWithdrawalRequest(userId, amount, methodId, ip, ua),
  
  cancelWithdrawal: (requestId: string, userId: string) =>
    payoutService.cancelPayoutRequest(requestId, userId),
  
  // Admin processing
  processRequest: (requestId: string, adminId: string, action: 'approve' | 'reject', notes?: string) =>
    payoutService.processPayoutRequest(requestId, adminId, action, notes),
  
  completePayout: (requestId: string) =>
    payoutService.completePayoutTransfer(requestId),
  
  // Payout methods
  addMethod: (userId: string, method: Omit<PayoutMethod, 'id' | 'addedAt' | 'lastUsed' | 'isVerified'>) =>
    payoutService.addPayoutMethod(userId, method),
  
  getMethods: (userId: string) => payoutService.getUserPayoutMethods(userId),
  validateMethod: (type: PayoutMethod['type'], details: PayoutMethod['details']) =>
    payoutService.validatePayoutMethod(type, details),
  
  // User data
  getUserPayouts: (userId: string) => payoutService.getUserPayouts(userId),
  getLimits: (userId: string) => payoutService.getPayoutLimits(userId),
  getKYC: (userId: string) => payoutService.getKYCStatus(userId),
  
  // Admin data
  getPending: () => payoutService.getPendingPayouts(),
  getAnalytics: () => payoutService.getPayoutAnalytics(),
  
  // Export
  export: () => payoutService.exportPayoutData()
}
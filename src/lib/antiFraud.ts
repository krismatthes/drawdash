'use client'

import { paymentMethodTracking } from './paymentMethodTracking'

interface DeviceFingerprint {
  id: string
  userAgent: string
  screenResolution: string
  timezone: string
  language: string
  platform: string
  cookiesEnabled: boolean
  localStorageEnabled: boolean
  sessionStorageEnabled: boolean
  canvasFingerprint: string
  webglFingerprint: string
  audioFingerprint: string
  timestamp: number
}

interface FraudFlag {
  id: string
  userId: string
  type: 'duplicate_account' | 'suspicious_ip' | 'rapid_transactions' | 'device_sharing' | 'vpn_detected' | 'payment_anomaly' | 'shared_payment_method' | 'payment_velocity' | 'suspicious_email' | 'account_linking'
  severity: 'low' | 'medium' | 'high' | 'critical'
  details: string
  timestamp: number
  resolved: boolean
  investigator?: string
  metadata?: {
    paymentMethodId?: string
    associatedUsers?: string[]
    riskScore?: number
    automaticAction?: 'none' | 'flag' | 'block' | 'review'
  }
}

interface UserRiskProfile {
  userId: string
  riskScore: number // 0-100
  factors: {
    accountAge: number
    transactionHistory: number
    deviceConsistency: number
    ipConsistency: number
    verificationStatus: number
    paymentMethodRisk: number
    behavioralPatterns: number
  }
  lastUpdated: number
}

export class AntiFraudSystem {
  private static instance: AntiFraudSystem
  private fraudFlags: FraudFlag[] = []
  private deviceFingerprints: DeviceFingerprint[] = []
  private userRiskProfiles: UserRiskProfile[] = []

  private constructor() {
    this.loadData()
  }

  static getInstance(): AntiFraudSystem {
    if (!AntiFraudSystem.instance) {
      AntiFraudSystem.instance = new AntiFraudSystem()
    }
    return AntiFraudSystem.instance
  }

  // Device Fingerprinting
  async generateDeviceFingerprint(): Promise<DeviceFingerprint> {
    const canvas = this.generateCanvasFingerprint()
    const webgl = this.generateWebGLFingerprint()
    const audio = await this.generateAudioFingerprint()

    const fingerprint: DeviceFingerprint = {
      id: await this.hash(`${navigator.userAgent}-${Date.now()}-${Math.random()}`),
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}x${screen.colorDepth}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      cookiesEnabled: navigator.cookieEnabled,
      localStorageEnabled: this.testLocalStorage(),
      sessionStorageEnabled: this.testSessionStorage(),
      canvasFingerprint: canvas,
      webglFingerprint: webgl,
      audioFingerprint: audio,
      timestamp: Date.now()
    }

    this.deviceFingerprints.push(fingerprint)
    this.saveData()

    return fingerprint
  }

  private generateCanvasFingerprint(): string {
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return 'no-canvas'

      ctx.textBaseline = 'top'
      ctx.font = '14px Arial'
      ctx.fillStyle = '#f60'
      ctx.fillRect(125, 1, 62, 20)
      ctx.fillStyle = '#069'
      ctx.fillText('DrawDash Security Check 🔒', 2, 15)
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
      ctx.fillText('DrawDash Security Check 🔒', 4, 17)

      return canvas.toDataURL()
    } catch {
      return 'canvas-error'
    }
  }

  private generateWebGLFingerprint(): string {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (!gl) return 'no-webgl'

      const webglContext = gl as WebGLRenderingContext
      const debugInfo = webglContext.getExtension('WEBGL_debug_renderer_info')
      const vendor = webglContext.getParameter(debugInfo?.UNMASKED_VENDOR_WEBGL || webglContext.VENDOR)
      const renderer = webglContext.getParameter(debugInfo?.UNMASKED_RENDERER_WEBGL || webglContext.RENDERER)

      return `${vendor}-${renderer}`
    } catch {
      return 'webgl-error'
    }
  }

  private async generateAudioFingerprint(): Promise<string> {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const analyser = audioContext.createAnalyser()
      const gain = audioContext.createGain()
      const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1)

      gain.gain.value = 0 // Mute
      oscillator.connect(analyser)
      analyser.connect(scriptProcessor)
      scriptProcessor.connect(gain)
      gain.connect(audioContext.destination)

      oscillator.start(0)

      return new Promise((resolve) => {
        scriptProcessor.onaudioprocess = (e) => {
          const buffer = e.inputBuffer.getChannelData(0)
          const fingerprint = Array.from(buffer.slice(0, 50))
            .map(x => Math.round(x * 1000000))
            .join(',')
          
          oscillator.stop()
          audioContext.close()
          resolve(fingerprint.substring(0, 100))
        }
      })
    } catch {
      return 'audio-error'
    }
  }

  private testLocalStorage(): boolean {
    try {
      const testKey = 'test-' + Math.random()
      localStorage.setItem(testKey, 'test')
      localStorage.removeItem(testKey)
      return true
    } catch {
      return false
    }
  }

  private testSessionStorage(): boolean {
    try {
      const testKey = 'test-' + Math.random()
      sessionStorage.setItem(testKey, 'test')
      sessionStorage.removeItem(testKey)
      return true
    } catch {
      return false
    }
  }

  // Enhanced Duplicate Detection with Payment Method Analysis
  async checkForDuplicateAccounts(userId: string, email: string, ip: string): Promise<FraudFlag[]> {
    const flags: FraudFlag[] = []

    // Check for similar device fingerprints
    const userDevices = this.deviceFingerprints.filter(fp => 
      this.getUserDevices(userId).some(d => d.id === fp.id)
    )

    if (userDevices.length > 0) {
      const similarDevices = this.deviceFingerprints.filter(fp => 
        fp.id !== userDevices[0].id && this.calculateDeviceSimilarity(userDevices[0], fp) > 0.8
      )

      if (similarDevices.length > 0) {
        flags.push(this.createFraudFlag(
          userId,
          'device_sharing',
          'high',
          `Device fingerprint matches ${similarDevices.length} other accounts`
        ))
      }
    }

    // Check for shared payment methods
    const userPaymentMethods = paymentMethodTracking.getPaymentMethodsForUser(userId)
    for (const paymentMethod of userPaymentMethods) {
      const sharingInfo = paymentMethodTracking.checkCardSharing(paymentMethod.id)
      if (sharingInfo.isShared && sharingInfo.riskLevel === 'high') {
        flags.push(this.createFraudFlag(
          userId,
          'shared_payment_method',
          'high',
          `Payment method shared across ${sharingInfo.userCount} accounts`,
          {
            paymentMethodId: paymentMethod.id,
            associatedUsers: sharingInfo.users,
            riskScore: paymentMethod.riskScore
          }
        ))
      }
    }

    // Check IP address patterns
    const ipFlags = await this.checkIPPatterns(userId, ip)
    flags.push(...ipFlags)

    // Check email patterns with enhanced detection
    const emailFlags = this.checkEmailPatterns(email, userId)
    flags.push(...emailFlags)

    // Check account linking patterns
    const linkingFlags = this.checkAccountLinking(userId, email, ip)
    flags.push(...linkingFlags)

    return flags
  }

  private async checkIPPatterns(userId: string, ip: string): Promise<FraudFlag[]> {
    const flags: FraudFlag[] = []

    // Check for VPN/Proxy indicators
    if (await this.isVPN(ip)) {
      flags.push(this.createFraudFlag(
        userId,
        'vpn_detected',
        'medium',
        `VPN/Proxy detected from IP: ${ip}`
      ))
    }

    // Check for multiple accounts from same IP
    const sameIPCount = this.getUsersFromIP(ip).length
    if (sameIPCount > 3) {
      flags.push(this.createFraudFlag(
        userId,
        'suspicious_ip',
        'high',
        `${sameIPCount} accounts detected from IP: ${ip}`
      ))
    }

    return flags
  }

  private checkEmailPatterns(email: string, userId: string): FraudFlag[] {
    const flags: FraudFlag[] = []

    // Check for disposable email
    if (this.isDisposableEmail(email)) {
      flags.push(this.createFraudFlag(
        userId,
        'suspicious_email',
        'medium',
        `Disposable email detected: ${email}`
      ))
    }

    // Check for email variations (dots, plus signs)
    const similarEmails = this.findSimilarEmails(email)
    if (similarEmails.length > 0) {
      flags.push(this.createFraudFlag(
        userId,
        'suspicious_email',
        'high',
        `Similar email variations found: ${similarEmails.join(', ')}`
      ))
    }

    // Check for suspicious email patterns
    const suspiciousPatterns = [
      /\+[0-9]{3,}@/, // Email with numeric plus addressing
      /^[a-z]{1,2}[0-9]{3,}@/, // Very short name with many numbers
      /^(test|temp|fake|spam|admin|user)[0-9]+@/i // Suspicious prefixes with numbers
    ]

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(email)) {
        flags.push(this.createFraudFlag(
          userId,
          'suspicious_email',
          'medium',
          `Suspicious email pattern detected: ${email}`
        ))
        break
      }
    }

    return flags
  }

  // Check account linking patterns
  private checkAccountLinking(userId: string, email: string, ip: string): FraudFlag[] {
    const flags: FraudFlag[] = []

    // Check for multiple accounts from same device+IP combination
    const deviceIP = `${ip}_device_combo`
    const recentUsers = this.getRecentUsersFromDeviceIP(deviceIP, 24) // Last 24 hours
    
    if (recentUsers.length > 2) {
      flags.push(this.createFraudFlag(
        userId,
        'account_linking',
        'high',
        `Multiple accounts (${recentUsers.length}) created from same device/IP in 24 hours`,
        {
          associatedUsers: recentUsers
        }
      ))
    }

    // Check for rapid account creation pattern
    const recentRegistrations = this.getRecentRegistrationsFromIP(ip, 60) // Last hour
    if (recentRegistrations.length > 1) {
      flags.push(this.createFraudFlag(
        userId,
        'account_linking',
        'medium',
        `Multiple registrations (${recentRegistrations.length}) from same IP in 1 hour`
      ))
    }

    return flags
  }

  // Enhanced payment method validation
  async validatePaymentMethod(
    userId: string, 
    cardNumber: string, 
    expiryMonth: string, 
    expiryYear: string, 
    cardholderName: string, 
    amount: number, 
    ip: string
  ): Promise<{
    isValid: boolean
    riskAssessment: any
    fraudFlags: FraudFlag[]
  }> {
    const riskAssessment = await paymentMethodTracking.assessPaymentRisk(
      cardNumber, expiryMonth, expiryYear, cardholderName, userId, amount, ip
    )

    const flags: FraudFlag[] = []

    if (riskAssessment.riskLevel === 'critical') {
      flags.push(this.createFraudFlag(
        userId,
        'payment_anomaly',
        'critical',
        `Critical payment risk detected: ${riskAssessment.riskFactors.join(', ')}`,
        {
          paymentMethodId: riskAssessment.paymentMethodId,
          riskScore: riskAssessment.riskScore,
          automaticAction: 'block'
        }
      ))
    } else if (riskAssessment.riskLevel === 'high') {
      flags.push(this.createFraudFlag(
        userId,
        'payment_anomaly',
        'high',
        `High payment risk detected: ${riskAssessment.riskFactors.join(', ')}`,
        {
          paymentMethodId: riskAssessment.paymentMethodId,
          riskScore: riskAssessment.riskScore,
          automaticAction: 'review'
        }
      ))
    }

    // Check payment velocity
    const paymentMethods = paymentMethodTracking.getPaymentMethodsForUser(userId)
    let totalRecentTransactions = 0
    for (const method of paymentMethods) {
      const recentUsage = paymentMethodTracking.getRecentUsage(method.id, 60) // Last hour
      totalRecentTransactions += recentUsage.length
    }

    if (totalRecentTransactions > 5) {
      flags.push(this.createFraudFlag(
        userId,
        'payment_velocity',
        'high',
        `High payment velocity: ${totalRecentTransactions} transactions in last hour`
      ))
    }

    return {
      isValid: riskAssessment.recommendation !== 'block',
      riskAssessment,
      fraudFlags: flags
    }
  }

  // Transaction Monitoring
  checkTransactionPatterns(userId: string, amount: number, paymentMethod: string): FraudFlag[] {
    const flags: FraudFlag[] = []
    const userTransactions = this.getUserTransactions(userId)

    // Check for rapid transactions
    const recentTransactions = userTransactions.filter(t => 
      Date.now() - t.timestamp < 60000 // Last minute
    )

    if (recentTransactions.length > 3) {
      flags.push(this.createFraudFlag(
        userId,
        'rapid_transactions',
        'high',
        `${recentTransactions.length} transactions in the last minute`
      ))
    }

    // Check for unusual amounts
    const avgAmount = userTransactions.reduce((sum, t) => sum + t.amount, 0) / userTransactions.length
    if (amount > avgAmount * 5 && userTransactions.length > 5) {
      flags.push(this.createFraudFlag(
        userId,
        'payment_anomaly',
        'medium',
        `Transaction amount ${amount} significantly higher than average ${avgAmount.toFixed(2)}`
      ))
    }

    return flags
  }

  // Enhanced Risk Scoring
  calculateUserRiskScore(userId: string): UserRiskProfile {
    const existingProfile = this.userRiskProfiles.find(p => p.userId === userId)
    
    let factors = {
      accountAge: this.calculateAccountAgeScore(userId),
      transactionHistory: this.calculateTransactionScore(userId),
      deviceConsistency: this.calculateDeviceConsistencyScore(userId),
      ipConsistency: this.calculateIPConsistencyScore(userId),
      verificationStatus: this.calculateVerificationScore(userId),
      paymentMethodRisk: this.calculatePaymentMethodRiskScore(userId),
      behavioralPatterns: this.calculateBehavioralPatternScore(userId)
    }

    const riskScore = Object.values(factors).reduce((sum, score) => sum + score, 0) / 7

    const profile: UserRiskProfile = {
      userId,
      riskScore,
      factors,
      lastUpdated: Date.now()
    }

    if (existingProfile) {
      const index = this.userRiskProfiles.findIndex(p => p.userId === userId)
      this.userRiskProfiles[index] = profile
    } else {
      this.userRiskProfiles.push(profile)
    }

    this.saveData()
    return profile
  }

  // Helper methods
  private calculateDeviceSimilarity(device1: DeviceFingerprint, device2: DeviceFingerprint): number {
    let matches = 0
    let total = 0

    const checks = [
      device1.userAgent === device2.userAgent,
      device1.screenResolution === device2.screenResolution,
      device1.timezone === device2.timezone,
      device1.language === device2.language,
      device1.platform === device2.platform,
      device1.canvasFingerprint === device2.canvasFingerprint,
      device1.webglFingerprint === device2.webglFingerprint
    ]

    checks.forEach(check => {
      total++
      if (check) matches++
    })

    return matches / total
  }

  private async isVPN(ip: string): Promise<boolean> {
    // In production, use a VPN detection service
    // For now, basic checks for common VPN patterns
    const vpnPatterns = [
      /^10\./, /^172\.16\./, /^192\.168\./,  // Private ranges
      /^185\..*/, /^46\..*/, /^5\..*/ // Common VPN ranges
    ]
    
    return vpnPatterns.some(pattern => pattern.test(ip))
  }

  private isDisposableEmail(email: string): boolean {
    const disposableDomains = [
      '10minutemail.com', 'guerrillamail.com', 'mailinator.com',
      'temp-mail.org', 'tempmail.net', 'throwaway.email'
    ]
    
    const domain = email.split('@')[1]?.toLowerCase()
    return disposableDomains.includes(domain)
  }

  private findSimilarEmails(email: string): string[] {
    // Implement email similarity detection
    const [localPart, domain] = email.split('@')
    const normalizedLocal = localPart.replace(/\./g, '').replace(/\+.*$/, '')
    
    // Check against existing emails
    return [] // Placeholder - would check against user database
  }

  private getUserDevices(userId: string): DeviceFingerprint[] {
    // In production, this would query user-device relationships
    return []
  }

  private getUsersFromIP(ip: string): string[] {
    // In production, query users by IP
    return []
  }

  private getUserTransactions(userId: string): Array<{amount: number, timestamp: number}> {
    // In production, query transaction history
    return []
  }

  private calculateAccountAgeScore(userId: string): number {
    // 0-100 score based on account age (older = lower risk)
    return 50 // Placeholder
  }

  private calculateTransactionScore(userId: string): number {
    // 0-100 score based on transaction patterns
    return 50 // Placeholder
  }

  private calculateDeviceConsistencyScore(userId: string): number {
    // 0-100 score based on device usage consistency
    return 50 // Placeholder
  }

  private calculateIPConsistencyScore(userId: string): number {
    // 0-100 score based on IP address patterns
    return 50 // Placeholder
  }

  private calculateVerificationScore(userId: string): number {
    // 0-100 score based on verification status
    return 50 // Placeholder
  }

  private calculatePaymentMethodRiskScore(userId: string): number {
    const userPaymentMethods = paymentMethodTracking.getPaymentMethodsForUser(userId)
    if (userPaymentMethods.length === 0) return 50 // Neutral score for no payment methods
    
    const avgRiskScore = userPaymentMethods.reduce((sum, method) => sum + method.riskScore, 0) / userPaymentMethods.length
    return avgRiskScore
  }

  private calculateBehavioralPatternScore(userId: string): number {
    let riskScore = 0
    
    // Check for rapid activity patterns
    const userFlags = this.fraudFlags.filter(f => f.userId === userId && !f.resolved)
    if (userFlags.length > 3) riskScore += 30
    
    // Check for time-based patterns (e.g., only active at night)
    // This would require transaction timestamp analysis
    
    // Check for consistency in behavior
    // This would require more user activity data
    
    return Math.min(100, riskScore)
  }

  private getRecentUsersFromDeviceIP(deviceIP: string, hours: number): string[] {
    // In production, this would query a database of user sessions
    // For now, return mock data
    return []
  }

  private getRecentRegistrationsFromIP(ip: string, minutes: number): string[] {
    // In production, this would query registration logs
    // For now, return mock data
    return []
  }

  private createFraudFlag(
    userId: string,
    type: FraudFlag['type'],
    severity: FraudFlag['severity'],
    details: string,
    metadata?: FraudFlag['metadata']
  ): FraudFlag {
    const flag: FraudFlag = {
      id: `flag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type,
      severity,
      details,
      timestamp: Date.now(),
      resolved: false,
      metadata
    }

    this.fraudFlags.push(flag)
    this.saveData()

    return flag
  }

  // Public API
  async assessUserRisk(userId: string, ip: string, email?: string): Promise<{
    riskProfile: UserRiskProfile
    fraudFlags: FraudFlag[]
    recommendation: 'allow' | 'review' | 'block'
  }> {
    const riskProfile = this.calculateUserRiskScore(userId)
    const activeFlags = this.fraudFlags.filter(f => f.userId === userId && !f.resolved)
    
    let recommendation: 'allow' | 'review' | 'block' = 'allow'
    
    if (riskProfile.riskScore > 80 || activeFlags.some(f => f.severity === 'critical')) {
      recommendation = 'block'
    } else if (riskProfile.riskScore > 60 || activeFlags.some(f => f.severity === 'high')) {
      recommendation = 'review'
    }

    // Check for duplicate accounts if email provided
    if (email) {
      const duplicateFlags = await this.checkForDuplicateAccounts(userId, email, ip)
      activeFlags.push(...duplicateFlags)
      
      if (duplicateFlags.some(f => f.severity === 'critical' || f.severity === 'high')) {
        recommendation = 'review'
      }
    }

    return {
      riskProfile,
      fraudFlags: activeFlags,
      recommendation
    }
  }

  getFraudFlags(userId?: string): FraudFlag[] {
    if (userId) {
      return this.fraudFlags.filter(f => f.userId === userId)
    }
    return this.fraudFlags
  }

  resolveFraudFlag(flagId: string, investigator: string): boolean {
    const flag = this.fraudFlags.find(f => f.id === flagId)
    if (!flag) return false

    flag.resolved = true
    flag.investigator = investigator
    this.saveData()

    return true
  }

  exportFraudReport(startDate?: Date, endDate?: Date): string {
    const filteredFlags = this.fraudFlags.filter(flag => {
      if (startDate && flag.timestamp < startDate.getTime()) return false
      if (endDate && flag.timestamp > endDate.getTime()) return false
      return true
    })

    const report = {
      generatedAt: new Date().toISOString(),
      period: {
        start: startDate?.toISOString() || 'all-time',
        end: endDate?.toISOString() || 'present'
      },
      summary: {
        totalFlags: filteredFlags.length,
        resolvedFlags: filteredFlags.filter(f => f.resolved).length,
        byType: this.groupBy(filteredFlags, 'type'),
        bySeverity: this.groupBy(filteredFlags, 'severity')
      },
      flags: filteredFlags
    }

    return JSON.stringify(report, null, 2)
  }

  // Data persistence
  private loadData(): void {
    if (typeof window === 'undefined') return

    const fraudFlags = localStorage.getItem('drawdash_fraud_flags')
    if (fraudFlags) {
      this.fraudFlags = JSON.parse(fraudFlags)
    }

    const fingerprints = localStorage.getItem('drawdash_device_fingerprints')
    if (fingerprints) {
      this.deviceFingerprints = JSON.parse(fingerprints)
    }

    const riskProfiles = localStorage.getItem('drawdash_risk_profiles')
    if (riskProfiles) {
      this.userRiskProfiles = JSON.parse(riskProfiles)
    }
  }

  private saveData(): void {
    if (typeof window === 'undefined') return

    localStorage.setItem('drawdash_fraud_flags', JSON.stringify(this.fraudFlags))
    localStorage.setItem('drawdash_device_fingerprints', JSON.stringify(this.deviceFingerprints))
    localStorage.setItem('drawdash_risk_profiles', JSON.stringify(this.userRiskProfiles))
  }

  private async hash(input: string): Promise<string> {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const encoder = new TextEncoder()
      const data = encoder.encode(input)
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    }
    return input // Fallback
  }

  private groupBy<T>(array: T[], key: keyof T): Record<string, number> {
    return array.reduce((groups, item) => {
      const value = String(item[key])
      groups[value] = (groups[value] || 0) + 1
      return groups
    }, {} as Record<string, number>)
  }
}

// Enhanced rate limiting with fraud detection
export interface EnhancedRateLimitConfig {
  requests: number
  window: number
  fraudMultiplier: number // Reduce limits for high-risk users
}

export function createEnhancedRateLimit(config: EnhancedRateLimitConfig) {
  const antiFraud = AntiFraudSystem.getInstance()
  
  return async (identifier: string, userId?: string): Promise<{
    success: boolean
    limit: number
    remaining: number
    resetTime: number
    riskAdjusted: boolean
  }> => {
    let adjustedConfig = { ...config }
    
    // Adjust limits based on user risk
    if (userId) {
      const riskProfile = antiFraud.calculateUserRiskScore(userId)
      if (riskProfile.riskScore > 70) {
        adjustedConfig.requests = Math.floor(config.requests * config.fraudMultiplier)
      }
    }

    // Use existing rate limit logic with adjusted config
    const store: Record<string, { count: number; resetTime: number }> = {}
    const now = Date.now()

    if (!store[identifier] || store[identifier].resetTime < now) {
      store[identifier] = {
        count: 1,
        resetTime: now + adjustedConfig.window
      }
      return {
        success: true,
        limit: adjustedConfig.requests,
        remaining: adjustedConfig.requests - 1,
        resetTime: store[identifier].resetTime,
        riskAdjusted: adjustedConfig.requests !== config.requests
      }
    }

    store[identifier].count++
    const remaining = Math.max(0, adjustedConfig.requests - store[identifier].count)
    const success = store[identifier].count <= adjustedConfig.requests

    return {
      success,
      limit: adjustedConfig.requests,
      remaining,
      resetTime: store[identifier].resetTime,
      riskAdjusted: adjustedConfig.requests !== config.requests
    }
  }
}

export const antiFraud = AntiFraudSystem.getInstance()
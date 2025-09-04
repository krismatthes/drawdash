'use client'

// Balance & Payout Service
// Handles user balance management, withdrawals, and bonus credits

import { BalanceCompliance } from './balanceComplianceService'

export interface UserBalance {
  userId: string
  cashBalance: number        // Withdrawable funds (cash prizes, deposits)
  bonusBalance: number       // Platform credits (bonuses, cashback)
  freeTickets: number        // Non-withdrawable ticket credits
  lockedBalance: number      // Funds pending withdrawal/verification
  currency: 'DKK'
  lastUpdated: Date
}

export interface BalanceTransaction {
  id: string
  userId: string
  type: 'deposit' | 'withdrawal' | 'purchase' | 'bonus_credit' | 'cash_prize' | 'cashback' | 'free_tickets' | 'transfer' | 'fee'
  balanceType: 'cash' | 'bonus' | 'free_tickets'
  amount: number
  description: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  timestamp: Date
  processedAt?: Date
  metadata?: {
    raffleId?: string
    bonusId?: string
    payoutRequestId?: string
    feeAmount?: number
    originalAmount?: number
    conversionRate?: number
  }
}

export interface BalanceOperation {
  success: boolean
  newBalance: UserBalance
  transactionId?: string
  error?: string
}

class BalanceService {
  private balances: UserBalance[] = []
  private transactions: BalanceTransaction[] = []
  private mockMode: boolean = true

  constructor() {
    this.loadStoredData()
    this.initializeDemoData()
    console.log('💰 Balance Service initialized with', this.balances.length, 'user balances')
  }

  // Initialize demo data for testing
  private initializeDemoData(): void {
    // Only initialize if no balances exist
    if (this.balances.length === 0) {
      // Demo balance for test user
      const testUserBalance: UserBalance = {
        userId: 'user_1',
        cashBalance: 50000, // 5,000 DKK
        bonusBalance: 15000, // 1,500 DKK
        freeTickets: 5,
        lockedBalance: 0,
        currency: 'DKK',
        lastUpdated: new Date()
      }
      
      this.balances.push(testUserBalance)
      
      // Add some demo transactions
      this.transactions.push(
        this.createTransaction({
          userId: 'user_1',
          type: 'cash_prize',
          balanceType: 'cash',
          amount: 50000,
          description: 'Demo indskud til test bruger',
          metadata: { bonusId: 'demo_init' }
        }),
        this.createTransaction({
          userId: 'user_1',
          type: 'bonus_credit',
          balanceType: 'bonus',
          amount: 15000,
          description: 'Velkomstbonus - demo',
          metadata: { bonusId: 'welcome_bonus' }
        }),
        this.createTransaction({
          userId: 'user_1',
          type: 'free_tickets',
          balanceType: 'free_tickets',
          amount: 5,
          description: 'Gratis billetter - demo',
          metadata: { bonusId: 'welcome_bonus' }
        })
      )
      
      console.log('💰 Demo balance data initialized for user_1')
      this.saveData()
    }
  }

  // Get user balance
  getUserBalance(userId: string): UserBalance {
    let balance = this.balances.find(b => b.userId === userId)
    
    if (!balance) {
      balance = {
        userId,
        cashBalance: 0,
        bonusBalance: 0,
        freeTickets: 0,
        lockedBalance: 0,
        currency: 'DKK',
        lastUpdated: new Date()
      }
      this.balances.push(balance)
      this.saveData()
    }
    
    return balance
  }

  // Add cash balance (from deposits, cash prizes)
  addCashBalance(userId: string, amount: number, description: string, metadata?: any): BalanceOperation {
    if (amount <= 0) {
      return { success: false, newBalance: this.getUserBalance(userId), error: 'Beløb skal være positivt' }
    }

    const balance = this.getUserBalance(userId)
    
    const transaction = this.createTransaction({
      userId,
      type: 'cash_prize',
      balanceType: 'cash',
      amount,
      description,
      metadata
    })

    // Perform compliance monitoring
    try {
      const complianceFlags = BalanceCompliance.monitorTransaction(userId, transaction)
      if (complianceFlags.some(flag => flag.severity === 'critical')) {
        console.warn('🚨 Critical compliance flags detected for cash balance addition:', complianceFlags)
      }
      
      // Perform AML check for large amounts
      if (amount > 50000) { // Over 5,000 DKK
        BalanceCompliance.checkAML(userId, transaction)
      }
    } catch (error) {
      console.warn('Compliance check failed:', error)
    }

    balance.cashBalance += amount
    balance.lastUpdated = new Date()

    this.saveData()
    console.log('💰 Added cash balance:', amount, 'DKK to user', userId)
    
    return { success: true, newBalance: balance, transactionId: transaction.id }
  }

  // Add bonus balance (from bonuses, cashback)
  addBonusBalance(userId: string, amount: number, description: string, metadata?: any): BalanceOperation {
    if (amount <= 0) {
      return { success: false, newBalance: this.getUserBalance(userId), error: 'Beløb skal være positivt' }
    }

    const balance = this.getUserBalance(userId)
    balance.bonusBalance += amount
    balance.lastUpdated = new Date()

    const transaction = this.createTransaction({
      userId,
      type: 'bonus_credit',
      balanceType: 'bonus',
      amount,
      description,
      metadata
    })

    this.saveData()
    console.log('🎁 Added bonus balance:', amount, 'DKK to user', userId)
    
    return { success: true, newBalance: balance, transactionId: transaction.id }
  }

  // Add free tickets
  addFreeTickets(userId: string, tickets: number, description: string, metadata?: any): BalanceOperation {
    if (tickets <= 0) {
      return { success: false, newBalance: this.getUserBalance(userId), error: 'Antal billetter skal være positivt' }
    }

    const balance = this.getUserBalance(userId)
    balance.freeTickets += tickets
    balance.lastUpdated = new Date()

    const transaction = this.createTransaction({
      userId,
      type: 'free_tickets',
      balanceType: 'free_tickets',
      amount: tickets,
      description,
      metadata
    })

    this.saveData()
    console.log('🎫 Added free tickets:', tickets, 'to user', userId)
    
    return { success: true, newBalance: balance, transactionId: transaction.id }
  }

  // Deduct balance for purchases (prefers bonus balance first)
  deductForPurchase(userId: string, amount: number, description: string, metadata?: any): BalanceOperation {
    if (amount <= 0) {
      return { success: false, newBalance: this.getUserBalance(userId), error: 'Beløb skal være positivt' }
    }

    const balance = this.getUserBalance(userId)
    const totalAvailable = balance.cashBalance + balance.bonusBalance

    if (totalAvailable < amount) {
      return { 
        success: false, 
        newBalance: balance, 
        error: `Utilstrækkelig saldo. Tilgængelig: ${totalAvailable.toFixed(2)} DKK` 
      }
    }

    let remainingAmount = amount
    const transactions: BalanceTransaction[] = []

    // Use bonus balance first
    if (balance.bonusBalance > 0 && remainingAmount > 0) {
      const bonusUsed = Math.min(balance.bonusBalance, remainingAmount)
      balance.bonusBalance -= bonusUsed
      remainingAmount -= bonusUsed

      transactions.push(this.createTransaction({
        userId,
        type: 'purchase',
        balanceType: 'bonus',
        amount: -bonusUsed,
        description: `${description} (bonus balance)`,
        metadata
      }))
    }

    // Use cash balance for remainder
    if (remainingAmount > 0) {
      balance.cashBalance -= remainingAmount

      transactions.push(this.createTransaction({
        userId,
        type: 'purchase',
        balanceType: 'cash',
        amount: -remainingAmount,
        description: `${description} (cash balance)`,
        metadata
      }))
    }

    balance.lastUpdated = new Date()
    this.saveData()
    
    console.log('💸 Deducted for purchase:', amount, 'DKK from user', userId)
    return { success: true, newBalance: balance, transactionId: transactions[0]?.id }
  }

  // Use free tickets
  useFreeTickets(userId: string, tickets: number, description: string, metadata?: any): BalanceOperation {
    if (tickets <= 0) {
      return { success: false, newBalance: this.getUserBalance(userId), error: 'Antal billetter skal være positivt' }
    }

    const balance = this.getUserBalance(userId)

    if (balance.freeTickets < tickets) {
      return { 
        success: false, 
        newBalance: balance, 
        error: `Utilstrækkelige gratis billetter. Tilgængelig: ${balance.freeTickets}` 
      }
    }

    balance.freeTickets -= tickets
    balance.lastUpdated = new Date()

    const transaction = this.createTransaction({
      userId,
      type: 'purchase',
      balanceType: 'free_tickets',
      amount: -tickets,
      description,
      metadata
    })

    this.saveData()
    console.log('🎫 Used free tickets:', tickets, 'from user', userId)
    
    return { success: true, newBalance: balance, transactionId: transaction.id }
  }

  // Lock balance for pending withdrawal
  lockBalance(userId: string, amount: number): BalanceOperation {
    const balance = this.getUserBalance(userId)

    if (balance.cashBalance < amount) {
      return { 
        success: false, 
        newBalance: balance, 
        error: `Utilstrækkelig cash saldo for udbetalning: ${balance.cashBalance.toFixed(2)} DKK` 
      }
    }

    balance.cashBalance -= amount
    balance.lockedBalance += amount
    balance.lastUpdated = new Date()

    const transaction = this.createTransaction({
      userId,
      type: 'withdrawal',
      balanceType: 'cash',
      amount: -amount,
      description: 'Midler låst for udbetaling',
      status: 'pending'
    })

    this.saveData()
    return { success: true, newBalance: balance, transactionId: transaction.id }
  }

  // Unlock balance (withdrawal cancelled)
  unlockBalance(userId: string, amount: number): BalanceOperation {
    const balance = this.getUserBalance(userId)

    if (balance.lockedBalance < amount) {
      return { success: false, newBalance: balance, error: 'Ikke nok låste midler' }
    }

    balance.cashBalance += amount
    balance.lockedBalance -= amount
    balance.lastUpdated = new Date()

    this.saveData()
    return { success: true, newBalance: balance }
  }

  // Complete withdrawal (funds sent)
  completeWithdrawal(userId: string, amount: number): BalanceOperation {
    const balance = this.getUserBalance(userId)

    if (balance.lockedBalance < amount) {
      return { success: false, newBalance: balance, error: 'Ikke nok låste midler til udbetaling' }
    }

    balance.lockedBalance -= amount
    balance.lastUpdated = new Date()

    const transaction = this.createTransaction({
      userId,
      type: 'withdrawal',
      balanceType: 'cash',
      amount: -amount,
      description: 'Udbetaling gennemført',
      status: 'completed'
    })

    this.saveData()
    console.log('💳 Withdrawal completed:', amount, 'DKK for user', userId)
    
    return { success: true, newBalance: balance, transactionId: transaction.id }
  }

  // Transfer between balance types (e.g., convert bonus to cash with conditions)
  transferBalance(
    userId: string, 
    fromType: 'cash' | 'bonus', 
    toType: 'cash' | 'bonus', 
    amount: number,
    conversionRate: number = 1
  ): BalanceOperation {
    const balance = this.getUserBalance(userId)
    const convertedAmount = amount * conversionRate

    // Validate source balance
    const sourceBalance = fromType === 'cash' ? balance.cashBalance : balance.bonusBalance
    if (sourceBalance < amount) {
      return { 
        success: false, 
        newBalance: balance, 
        error: `Utilstrækkelig ${fromType} balance: ${sourceBalance.toFixed(2)} DKK` 
      }
    }

    // Perform transfer
    if (fromType === 'cash') {
      balance.cashBalance -= amount
    } else {
      balance.bonusBalance -= amount
    }

    if (toType === 'cash') {
      balance.cashBalance += convertedAmount
    } else {
      balance.bonusBalance += convertedAmount
    }

    balance.lastUpdated = new Date()

    const transaction = this.createTransaction({
      userId,
      type: 'transfer',
      balanceType: 'cash', // Primary type
      amount: convertedAmount,
      description: `Balance overførsel: ${fromType} → ${toType}${conversionRate !== 1 ? ` (${conversionRate}x rate)` : ''}`,
      metadata: { originalAmount: amount, conversionRate }
    })

    this.saveData()
    return { success: true, newBalance: balance, transactionId: transaction.id }
  }

  // Get user transactions
  getUserTransactions(userId: string, limit: number = 50): BalanceTransaction[] {
    return this.transactions
      .filter(t => t.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }

  // Get system-wide balance analytics
  getBalanceAnalytics() {
    const totalUsers = this.balances.length
    const totalCashBalance = this.balances.reduce((sum, b) => sum + b.cashBalance, 0)
    const totalBonusBalance = this.balances.reduce((sum, b) => sum + b.bonusBalance, 0)
    const totalLockedBalance = this.balances.reduce((sum, b) => sum + b.lockedBalance, 0)
    const totalFreeTickets = this.balances.reduce((sum, b) => sum + b.freeTickets, 0)

    const recentTransactions = this.transactions.filter(
      t => t.timestamp > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    )

    return {
      totalUsers,
      balanceTotals: {
        cashBalance: totalCashBalance,
        bonusBalance: totalBonusBalance,
        lockedBalance: totalLockedBalance,
        freeTickets: totalFreeTickets,
        totalBalance: totalCashBalance + totalBonusBalance
      },
      recentActivity: {
        totalTransactions: recentTransactions.length,
        totalVolume: recentTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0),
        deposits: recentTransactions.filter(t => t.type === 'deposit').length,
        withdrawals: recentTransactions.filter(t => t.type === 'withdrawal').length,
        purchases: recentTransactions.filter(t => t.type === 'purchase').length
      },
      userDistribution: {
        zeroBalance: this.balances.filter(b => b.cashBalance + b.bonusBalance === 0).length,
        lowBalance: this.balances.filter(b => (b.cashBalance + b.bonusBalance) > 0 && (b.cashBalance + b.bonusBalance) < 100).length,
        mediumBalance: this.balances.filter(b => (b.cashBalance + b.bonusBalance) >= 100 && (b.cashBalance + b.bonusBalance) < 1000).length,
        highBalance: this.balances.filter(b => (b.cashBalance + b.bonusBalance) >= 1000).length
      }
    }
  }

  // Get transaction history with filters
  getTransactionHistory(
    userId?: string, 
    type?: BalanceTransaction['type'],
    balanceType?: BalanceTransaction['balanceType'],
    limit: number = 100
  ): BalanceTransaction[] {
    let transactions = this.transactions

    if (userId) {
      transactions = transactions.filter(t => t.userId === userId)
    }
    if (type) {
      transactions = transactions.filter(t => t.type === type)
    }
    if (balanceType) {
      transactions = transactions.filter(t => t.balanceType === balanceType)
    }

    return transactions
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }

  // Calculate available balance for purchase (cash + bonus)
  getAvailableBalance(userId: string): { total: number, cash: number, bonus: number, freeTickets: number } {
    const balance = this.getUserBalance(userId)
    return {
      total: balance.cashBalance + balance.bonusBalance,
      cash: balance.cashBalance,
      bonus: balance.bonusBalance,
      freeTickets: balance.freeTickets
    }
  }

  // Validate withdrawal eligibility
  validateWithdrawal(userId: string, amount: number): { valid: boolean, error?: string } {
    if (amount < 100) {
      return { valid: false, error: 'Minimum udbetaling er 100 DKK' }
    }

    if (amount > 50000) {
      return { valid: false, error: 'Maksimum udbetaling er 50.000 DKK per transaktion' }
    }

    const balance = this.getUserBalance(userId)
    if (balance.cashBalance < amount) {
      return { 
        valid: false, 
        error: `Utilstrækkelig cash saldo: ${balance.cashBalance.toFixed(2)} DKK tilgængelig` 
      }
    }

    return { valid: true }
  }

  // Create transaction record
  private createTransaction(data: Partial<BalanceTransaction>): BalanceTransaction {
    const transaction: BalanceTransaction = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      userId: data.userId!,
      type: data.type!,
      balanceType: data.balanceType!,
      amount: data.amount!,
      description: data.description!,
      status: data.status || 'completed',
      timestamp: new Date(),
      metadata: data.metadata
    }

    this.transactions.push(transaction)
    return transaction
  }

  // Export balance data
  exportBalanceData(): string {
    return JSON.stringify({
      balances: this.balances,
      transactions: this.transactions.slice(-1000), // Last 1000 transactions
      analytics: this.getBalanceAnalytics(),
      exportedAt: new Date().toISOString()
    }, null, 2)
  }

  // Storage helpers
  private loadStoredData(): void {
    if (typeof window === 'undefined') return

    const storedBalances = localStorage.getItem('user_balances')
    const storedTransactions = localStorage.getItem('balance_transactions')

    this.balances = storedBalances ? JSON.parse(storedBalances) : []
    this.transactions = storedTransactions ? JSON.parse(storedTransactions) : []

    // Initialize with some mock data
    if (this.balances.length === 0) {
      this.initializeMockData()
    }
  }

  private saveData(): void {
    if (typeof window === 'undefined') return
    
    localStorage.setItem('user_balances', JSON.stringify(this.balances))
    localStorage.setItem('balance_transactions', JSON.stringify(this.transactions))
  }

  private initializeMockData(): void {
    // Mock balance for test user
    this.balances = [
      {
        userId: '1',
        cashBalance: 750.50,
        bonusBalance: 125.00,
        freeTickets: 3,
        lockedBalance: 0,
        currency: 'DKK',
        lastUpdated: new Date()
      },
      {
        userId: '2', 
        cashBalance: 2340.75,
        bonusBalance: 67.50,
        freeTickets: 1,
        lockedBalance: 500, // Pending withdrawal
        currency: 'DKK',
        lastUpdated: new Date()
      }
    ]

    // Mock transactions
    this.transactions = [
      {
        id: 'tx_1',
        userId: '1',
        type: 'cash_prize',
        balanceType: 'cash',
        amount: 500,
        description: 'Vundet i iPhone 15 Pro lodtrækning',
        status: 'completed',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        metadata: { raffleId: '2' }
      },
      {
        id: 'tx_2',
        userId: '1',
        type: 'bonus_credit',
        balanceType: 'bonus',
        amount: 25,
        description: '5% cashback på køb',
        status: 'completed',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        metadata: { originalAmount: 500 }
      },
      {
        id: 'tx_3',
        userId: '1',
        type: 'free_tickets',
        balanceType: 'free_tickets',
        amount: 3,
        description: 'Velkomstbonus - gratis billetter',
        status: 'completed',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ]

    this.saveData()
  }
}

// Singleton instance
export const balanceService = new BalanceService()

// Quick access functions
export const Balance = {
  // Balance management
  getBalance: (userId: string) => balanceService.getUserBalance(userId),
  getAvailable: (userId: string) => balanceService.getAvailableBalance(userId),
  
  // Add balance
  addCash: (userId: string, amount: number, description: string, metadata?: any) =>
    balanceService.addCashBalance(userId, amount, description, metadata),
  
  addBonus: (userId: string, amount: number, description: string, metadata?: any) =>
    balanceService.addBonusBalance(userId, amount, description, metadata),
  
  addTickets: (userId: string, tickets: number, description: string, metadata?: any) =>
    balanceService.addFreeTickets(userId, tickets, description, metadata),
  
  // Use balance
  deductForPurchase: (userId: string, amount: number, description: string, metadata?: any) =>
    balanceService.deductForPurchase(userId, amount, description, metadata),
  
  useTickets: (userId: string, tickets: number, description: string, metadata?: any) =>
    balanceService.useFreeTickets(userId, tickets, description, metadata),
  
  // Withdrawal operations
  validateWithdrawal: (userId: string, amount: number) =>
    balanceService.validateWithdrawal(userId, amount),
  
  lockForWithdrawal: (userId: string, amount: number) =>
    balanceService.lockBalance(userId, amount),
  
  unlockBalance: (userId: string, amount: number) =>
    balanceService.unlockBalance(userId, amount),
  
  completeWithdrawal: (userId: string, amount: number) =>
    balanceService.completeWithdrawal(userId, amount),
  
  // History and analytics
  getTransactions: (userId: string, limit?: number) =>
    balanceService.getUserTransactions(userId, limit),
  
  getHistory: (userId?: string, type?: BalanceTransaction['type'], balanceType?: BalanceTransaction['balanceType'], limit?: number) =>
    balanceService.getTransactionHistory(userId, type, balanceType, limit),
  
  getAnalytics: () => balanceService.getBalanceAnalytics(),
  
  // Data export
  export: () => balanceService.exportBalanceData()
}
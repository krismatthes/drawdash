'use client'

// Types for finance system
export interface Transaction {
  id: string
  type: 'TICKET_PURCHASE' | 'BONUS_REDEMPTION' | 'PAYOUT' | 'REFUND' | 'ADJUSTMENT' | 'FEE' | 'INSTANT_WIN'
  amount: number
  currency: 'DKK' | 'GBP' | 'EUR'
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded'
  userId?: string
  raffleId?: string
  description: string
  createdAt: Date
  completedAt?: Date
  metadata: {
    paymentMethod?: 'card' | 'bank_transfer' | 'points' | 'bonus'
    paymentIntentId?: string
    refundReason?: string
    adminUser?: string
    ticketNumbers?: number[]
    pointsUsed?: number
    bonusUsed?: string[]
    feeType?: 'stripe' | 'bank' | 'exchange'
    exchangeRate?: number
    originalAmount?: number
    ipAddress?: string
    userAgent?: string
    riskScore?: number
  }
}

export interface Payout {
  id: string
  userId: string
  raffleId: string
  winningTicketNumber: number
  amount: number
  currency: 'DKK' | 'GBP' | 'EUR'
  status: 'pending_verification' | 'pending_payout' | 'processing' | 'completed' | 'failed' | 'cancelled'
  requestedAt: Date
  processedAt?: Date
  completedAt?: Date
  verificationStatus: {
    identityVerified: boolean
    addressVerified: boolean
    paymentMethodVerified: boolean
    taxFormSubmitted: boolean
    kycCompleted: boolean
  }
  paymentDetails: {
    method: 'bank_transfer' | 'paypal' | 'check' | 'crypto'
    accountDetails?: string
    bankDetails?: {
      accountNumber: string
      routingNumber: string
      bankName: string
      accountHolderName: string
    }
  }
  taxInfo: {
    withholdingRequired: boolean
    withholdingAmount?: number
    taxFormType?: string
    socialSecurityNumber?: string
  }
  notes?: string
  processedBy?: string
  failureReason?: string
}

export interface RevenueMetrics {
  period: 'daily' | 'weekly' | 'monthly'
  date: string
  grossRevenue: number
  netRevenue: number
  totalTransactions: number
  averageTransactionValue: number
  refunds: number
  fees: number
  profit: number
  profitMargin: number
  paymentMethodBreakdown: {
    card: { count: number; amount: number }
    points: { count: number; amount: number }
    bonus: { count: number; amount: number }
  }
}

export interface ExpenseRecord {
  id: string
  type: 'PRIZE_COST' | 'PLATFORM_FEE' | 'MARKETING' | 'OPERATIONAL' | 'LEGAL' | 'TAX'
  amount: number
  currency: 'DKK' | 'GBP' | 'EUR'
  description: string
  category: string
  raffleId?: string
  date: Date
  approvedBy?: string
  receiptUrl?: string
  taxDeductible: boolean
  vatAmount?: number
  metadata: {
    vendor?: string
    invoiceNumber?: string
    costCenter?: string
    accountCode?: string
  }
}

export interface ReconciliationRecord {
  id: string
  date: string
  expectedRevenue: number
  actualRevenue: number
  discrepancy: number
  status: 'balanced' | 'discrepancy' | 'under_review' | 'resolved'
  transactions: string[] // Transaction IDs
  adjustments: {
    id: string
    amount: number
    reason: string
    approvedBy: string
    createdAt: Date
  }[]
  notes?: string
  reviewedBy?: string
  reviewedAt?: Date
}

export interface CustomerMetrics {
  userId: string
  registrationDate: Date
  totalSpent: number
  totalTransactions: number
  averageOrderValue: number
  daysSinceRegistration: number
  daysSinceLastTransaction: number
  isActive: boolean
  acquisitionChannel: 'organic' | 'paid_social' | 'paid_search' | 'email' | 'referral' | 'direct'
  acquisitionCost: number
  lifetimeValue: number
  predictedChurnDate?: Date
  churnRisk: 'low' | 'medium' | 'high'
  cohort: string
}

export interface CohortAnalysis {
  cohort: string
  registrationDate: Date
  initialSize: number
  currentSize: number
  retentionRates: {
    day1: number
    day7: number
    day30: number
    day90: number
    day365: number
  }
  revenueMetrics: {
    totalRevenue: number
    averageRevenue: number
    cumulativeRevenue: number[]
  }
  cac: number
  ltv: number
  paybackPeriod: number
}

export interface BusinessMetrics {
  period: { start: Date; end: Date }
  overview: {
    totalCustomers: number
    activeCustomers: number
    newCustomers: number
    churnedCustomers: number
    retentionRate: number
    churnRate: number
  }
  financial: {
    totalRevenue: number
    arr: number // Annual Recurring Revenue estimate
    arpu: number // Average Revenue Per User
    cac: number // Customer Acquisition Cost
    ltv: number // Average Lifetime Value
    ltvCacRatio: number
    paybackPeriod: number
  }
  engagement: {
    averageSessionsPerUser: number
    averageTicketsPerUser: number
    conversionRate: number
    repeatPurchaseRate: number
  }
}

export interface FinancialReport {
  id: string
  type: 'P_AND_L' | 'CASH_FLOW' | 'TAX_REPORT' | 'CUSTOMER_STATEMENT' | 'RAFFLE_PERFORMANCE' | 'CUSTOMER_METRICS' | 'COHORT_ANALYSIS'
  period: {
    start: Date
    end: Date
  }
  data: any
  generatedAt: Date
  generatedBy: string
  format: 'json' | 'csv' | 'pdf'
  downloadUrl?: string
}

// Storage keys
const TRANSACTIONS_KEY = 'drawdash_transactions'
const PAYOUTS_KEY = 'drawdash_payouts'
const EXPENSES_KEY = 'drawdash_expenses'
const RECONCILIATION_KEY = 'drawdash_reconciliation'
const REPORTS_KEY = 'drawdash_reports'
const CUSTOMER_METRICS_KEY = 'drawdash_customer_metrics'

// Initialize with mock data
const initializeFinanceStorage = () => {
  if (typeof window === 'undefined') return

  // Initialize transactions
  const existingTransactions = localStorage.getItem(TRANSACTIONS_KEY)
  if (!existingTransactions) {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(generateMockTransactions()))
  }

  // Initialize payouts
  const existingPayouts = localStorage.getItem(PAYOUTS_KEY)
  if (!existingPayouts) {
    localStorage.setItem(PAYOUTS_KEY, JSON.stringify(generateMockPayouts()))
  }

  // Initialize expenses
  const existingExpenses = localStorage.getItem(EXPENSES_KEY)
  if (!existingExpenses) {
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(generateMockExpenses()))
  }

  // Initialize reconciliation
  const existingReconciliation = localStorage.getItem(RECONCILIATION_KEY)
  if (!existingReconciliation) {
    localStorage.setItem(RECONCILIATION_KEY, JSON.stringify([]))
  }

  // Initialize reports
  const existingReports = localStorage.getItem(REPORTS_KEY)
  if (!existingReports) {
    localStorage.setItem(REPORTS_KEY, JSON.stringify([]))
  }

  // Initialize customer metrics
  const existingCustomerMetrics = localStorage.getItem(CUSTOMER_METRICS_KEY)
  if (!existingCustomerMetrics) {
    localStorage.setItem(CUSTOMER_METRICS_KEY, JSON.stringify(generateMockCustomerMetrics()))
  }
}

// Generate realistic mock data
function generateMockTransactions(): Transaction[] {
  const transactions: Transaction[] = []
  const now = Date.now()
  
  // Generate 200 transactions over last 90 days
  for (let i = 0; i < 200; i++) {
    const daysAgo = Math.floor(Math.random() * 90)
    const date = new Date(now - (daysAgo * 24 * 60 * 60 * 1000))
    
    const types: Transaction['type'][] = ['TICKET_PURCHASE', 'BONUS_REDEMPTION', 'PAYOUT', 'REFUND', 'FEE']
    const type = types[Math.floor(Math.random() * types.length)]
    
    let amount = 0
    let description = ''
    
    switch (type) {
      case 'TICKET_PURCHASE':
        amount = Math.floor(Math.random() * 500) + 25 // 25-525 kr
        description = `Raffle ticket purchase - ${Math.floor(amount / 25)} tickets`
        break
      case 'BONUS_REDEMPTION':
        amount = Math.floor(Math.random() * 200) + 10 // 10-210 kr
        description = 'Points/bonus redemption'
        break
      case 'PAYOUT':
        amount = Math.floor(Math.random() * 100000) + 1000 // 1000-101000 kr
        description = 'Prize payout to winner'
        break
      case 'REFUND':
        amount = Math.floor(Math.random() * 300) + 25 // 25-325 kr
        description = 'Ticket refund'
        break
      case 'FEE':
        amount = Math.floor(Math.random() * 50) + 5 // 5-55 kr
        description = 'Payment processing fee'
        break
    }

    transactions.push({
      id: `txn_${Date.now()}_${i}`,
      type,
      amount,
      currency: 'DKK',
      status: Math.random() > 0.1 ? 'completed' : (Math.random() > 0.5 ? 'pending' : 'failed'),
      userId: `user_${Math.floor(Math.random() * 100) + 1}`,
      raffleId: `raffle_${Math.floor(Math.random() * 10) + 1}`,
      description,
      createdAt: date,
      completedAt: Math.random() > 0.2 ? new Date(date.getTime() + Math.random() * 60 * 60 * 1000) : undefined,
      metadata: {
        paymentMethod: ['card', 'bank_transfer', 'points'][Math.floor(Math.random() * 3)] as any,
        paymentIntentId: `pi_${Date.now()}_${i}`,
        pointsUsed: type === 'BONUS_REDEMPTION' ? Math.floor(Math.random() * 1000) : 0,
        riskScore: Math.random() * 100
      }
    })
  }
  
  return transactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

function generateMockPayouts(): Payout[] {
  const payouts: Payout[] = []
  const now = Date.now()
  
  // Generate 25 payouts over last 60 days
  for (let i = 0; i < 25; i++) {
    const daysAgo = Math.floor(Math.random() * 60)
    const date = new Date(now - (daysAgo * 24 * 60 * 60 * 1000))
    
    const statuses: Payout['status'][] = ['pending_verification', 'pending_payout', 'processing', 'completed', 'failed']
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    
    const amount = Math.floor(Math.random() * 95000) + 5000 // 5000-100000 kr

    payouts.push({
      id: `payout_${Date.now()}_${i}`,
      userId: `user_${Math.floor(Math.random() * 100) + 1}`,
      raffleId: `raffle_${Math.floor(Math.random() * 10) + 1}`,
      winningTicketNumber: Math.floor(Math.random() * 10000) + 1,
      amount,
      currency: 'DKK',
      status,
      requestedAt: date,
      processedAt: status !== 'pending_verification' ? new Date(date.getTime() + Math.random() * 48 * 60 * 60 * 1000) : undefined,
      completedAt: status === 'completed' ? new Date(date.getTime() + Math.random() * 72 * 60 * 60 * 1000) : undefined,
      verificationStatus: {
        identityVerified: Math.random() > 0.2,
        addressVerified: Math.random() > 0.3,
        paymentMethodVerified: Math.random() > 0.4,
        taxFormSubmitted: amount > 20000 ? Math.random() > 0.1 : true,
        kycCompleted: Math.random() > 0.2
      },
      paymentDetails: {
        method: ['bank_transfer', 'paypal', 'check'][Math.floor(Math.random() * 3)] as any,
        accountDetails: `****${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
      },
      taxInfo: {
        withholdingRequired: amount > 20000,
        withholdingAmount: amount > 20000 ? amount * 0.27 : 0
      },
      processedBy: status !== 'pending_verification' ? 'Admin User' : undefined
    })
  }
  
  return payouts.sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime())
}

function generateMockExpenses(): ExpenseRecord[] {
  const expenses: ExpenseRecord[] = []
  const now = Date.now()
  
  // Generate 50 expenses over last 30 days
  for (let i = 0; i < 50; i++) {
    const daysAgo = Math.floor(Math.random() * 30)
    const date = new Date(now - (daysAgo * 24 * 60 * 60 * 1000))
    
    const types: ExpenseRecord['type'][] = ['PRIZE_COST', 'PLATFORM_FEE', 'MARKETING', 'OPERATIONAL', 'LEGAL', 'TAX']
    const type = types[Math.floor(Math.random() * types.length)]
    
    let amount = 0
    let description = ''
    let category = ''
    
    switch (type) {
      case 'PRIZE_COST':
        amount = Math.floor(Math.random() * 80000) + 5000 // 5000-85000 kr
        description = 'Prize procurement cost'
        category = 'Cost of Goods Sold'
        break
      case 'PLATFORM_FEE':
        amount = Math.floor(Math.random() * 5000) + 100 // 100-5100 kr
        description = 'Payment processing fees'
        category = 'Platform Costs'
        break
      case 'MARKETING':
        amount = Math.floor(Math.random() * 15000) + 1000 // 1000-16000 kr
        description = 'Digital marketing campaign'
        category = 'Marketing'
        break
      case 'OPERATIONAL':
        amount = Math.floor(Math.random() * 10000) + 500 // 500-10500 kr
        description = 'Operational expenses'
        category = 'Operations'
        break
      case 'LEGAL':
        amount = Math.floor(Math.random() * 20000) + 2000 // 2000-22000 kr
        description = 'Legal and compliance costs'
        category = 'Legal'
        break
      case 'TAX':
        amount = Math.floor(Math.random() * 30000) + 5000 // 5000-35000 kr
        description = 'Tax payments'
        category = 'Taxes'
        break
    }

    expenses.push({
      id: `exp_${Date.now()}_${i}`,
      type,
      amount,
      currency: 'DKK',
      description,
      category,
      raffleId: type === 'PRIZE_COST' ? `raffle_${Math.floor(Math.random() * 10) + 1}` : undefined,
      date,
      approvedBy: 'Admin User',
      taxDeductible: type !== 'TAX',
      vatAmount: type !== 'TAX' ? amount * 0.25 : 0,
      metadata: {
        vendor: `Vendor ${Math.floor(Math.random() * 20) + 1}`,
        invoiceNumber: `INV-${Date.now()}-${i}`,
        costCenter: category,
        accountCode: `${Math.floor(Math.random() * 9000) + 1000}`
      }
    })
  }
  
  return expenses.sort((a, b) => b.date.getTime() - a.date.getTime())
}

function generateMockCustomerMetrics(): CustomerMetrics[] {
  const customers: CustomerMetrics[] = []
  const now = Date.now()
  const channels: CustomerMetrics['acquisitionChannel'][] = ['organic', 'paid_social', 'paid_search', 'email', 'referral', 'direct']
  
  // Generate 150 customers over last 12 months
  for (let i = 0; i < 150; i++) {
    const daysAgo = Math.floor(Math.random() * 365)
    const registrationDate = new Date(now - (daysAgo * 24 * 60 * 60 * 1000))
    const userId = `user_${i + 1}`
    const acquisitionChannel = channels[Math.floor(Math.random() * channels.length)]
    
    // Generate transaction history for this user
    const userTransactions = Math.floor(Math.random() * 15) + 1 // 1-15 transactions
    const totalSpent = userTransactions * (Math.floor(Math.random() * 300) + 50) // 50-350 kr per transaction
    const daysSinceLastTransaction = Math.floor(Math.random() * 60)
    const daysSinceRegistration = Math.floor((now - registrationDate.getTime()) / (24 * 60 * 60 * 1000))
    
    // Calculate acquisition cost based on channel
    let acquisitionCost = 0
    switch (acquisitionChannel) {
      case 'paid_social': acquisitionCost = Math.floor(Math.random() * 200) + 100; break
      case 'paid_search': acquisitionCost = Math.floor(Math.random() * 150) + 80; break
      case 'email': acquisitionCost = Math.floor(Math.random() * 50) + 10; break
      case 'referral': acquisitionCost = Math.floor(Math.random() * 75) + 25; break
      case 'organic': acquisitionCost = 0; break
      case 'direct': acquisitionCost = Math.floor(Math.random() * 30) + 5; break
    }

    // Calculate LTV (simple model: current spend * projected lifetime)
    const averageOrderValue = totalSpent / userTransactions
    const projectedLifetimeMonths = 18 - (daysSinceLastTransaction / 30) // Decay based on inactivity
    const lifetimeValue = averageOrderValue * (userTransactions / Math.max(daysSinceRegistration / 30, 1)) * projectedLifetimeMonths

    // Determine churn risk
    let churnRisk: CustomerMetrics['churnRisk'] = 'low'
    if (daysSinceLastTransaction > 30) churnRisk = 'medium'
    if (daysSinceLastTransaction > 60) churnRisk = 'high'

    // Create cohort (year-month of registration)
    const cohort = `${registrationDate.getFullYear()}-${(registrationDate.getMonth() + 1).toString().padStart(2, '0')}`

    customers.push({
      userId,
      registrationDate,
      totalSpent,
      totalTransactions: userTransactions,
      averageOrderValue,
      daysSinceRegistration,
      daysSinceLastTransaction,
      isActive: daysSinceLastTransaction <= 30,
      acquisitionChannel,
      acquisitionCost,
      lifetimeValue,
      predictedChurnDate: churnRisk === 'high' ? new Date(now + (Math.random() * 30 * 24 * 60 * 60 * 1000)) : undefined,
      churnRisk,
      cohort
    })
  }
  
  return customers.sort((a, b) => b.registrationDate.getTime() - a.registrationDate.getTime())
}

// Initialize on import
initializeFinanceStorage()

export const financeService = {
  // Transaction Management
  getAllTransactions: (): Transaction[] => {
    if (typeof window === 'undefined') return []
    
    const stored = localStorage.getItem(TRANSACTIONS_KEY)
    if (!stored) return []
    
    const transactions = JSON.parse(stored) as Transaction[]
    return transactions.map(txn => ({
      ...txn,
      createdAt: new Date(txn.createdAt),
      completedAt: txn.completedAt ? new Date(txn.completedAt) : undefined
    }))
  },

  getTransactionById: (id: string): Transaction | null => {
    const transactions = financeService.getAllTransactions()
    return transactions.find(txn => txn.id === id) || null
  },

  createTransaction: (transactionData: Omit<Transaction, 'id' | 'createdAt'>): Transaction => {
    const transactions = financeService.getAllTransactions()
    
    const newTransaction: Transaction = {
      ...transactionData,
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date()
    }
    
    transactions.unshift(newTransaction)
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions))
    
    return newTransaction
  },

  updateTransaction: (id: string, updates: Partial<Transaction>): Transaction | null => {
    const transactions = financeService.getAllTransactions()
    const index = transactions.findIndex(txn => txn.id === id)
    
    if (index === -1) return null
    
    transactions[index] = { ...transactions[index], ...updates }
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions))
    
    return transactions[index]
  },

  // Payout Management
  getAllPayouts: (): Payout[] => {
    if (typeof window === 'undefined') return []
    
    const stored = localStorage.getItem(PAYOUTS_KEY)
    if (!stored) return []
    
    const payouts = JSON.parse(stored) as Payout[]
    return payouts.map(payout => ({
      ...payout,
      requestedAt: new Date(payout.requestedAt),
      processedAt: payout.processedAt ? new Date(payout.processedAt) : undefined,
      completedAt: payout.completedAt ? new Date(payout.completedAt) : undefined
    }))
  },

  getPayoutById: (id: string): Payout | null => {
    const payouts = financeService.getAllPayouts()
    return payouts.find(payout => payout.id === id) || null
  },

  updatePayout: (id: string, updates: Partial<Payout>): Payout | null => {
    const payouts = financeService.getAllPayouts()
    const index = payouts.findIndex(payout => payout.id === id)
    
    if (index === -1) return null
    
    payouts[index] = { ...payouts[index], ...updates }
    localStorage.setItem(PAYOUTS_KEY, JSON.stringify(payouts))
    
    return payouts[index]
  },

  approvePayout: (id: string, adminUser: string): boolean => {
    const payout = financeService.getPayoutById(id)
    if (!payout || payout.status !== 'pending_verification') return false

    // Check verification requirements
    const verification = payout.verificationStatus
    const allVerified = verification.identityVerified && 
                       verification.addressVerified && 
                       verification.paymentMethodVerified && 
                       verification.kycCompleted &&
                       (payout.amount <= 20000 || verification.taxFormSubmitted)

    if (!allVerified) {
      throw new Error('All verification requirements must be completed before approval')
    }

    return financeService.updatePayout(id, {
      status: 'pending_payout',
      processedAt: new Date(),
      processedBy: adminUser
    }) !== null
  },

  // Expense Management
  getAllExpenses: (): ExpenseRecord[] => {
    if (typeof window === 'undefined') return []
    
    const stored = localStorage.getItem(EXPENSES_KEY)
    if (!stored) return []
    
    const expenses = JSON.parse(stored) as ExpenseRecord[]
    return expenses.map(expense => ({
      ...expense,
      date: new Date(expense.date)
    }))
  },

  createExpense: (expenseData: Omit<ExpenseRecord, 'id'>): ExpenseRecord => {
    const expenses = financeService.getAllExpenses()
    
    const newExpense: ExpenseRecord = {
      ...expenseData,
      id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    }
    
    expenses.unshift(newExpense)
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses))
    
    return newExpense
  },

  // Revenue Analytics
  getRevenueMetrics: (period: 'daily' | 'weekly' | 'monthly', days: number = 30): RevenueMetrics[] => {
    const transactions = financeService.getAllTransactions()
    const cutoffDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000))
    
    const recentTransactions = transactions.filter(txn => 
      txn.createdAt >= cutoffDate && 
      txn.status === 'completed' &&
      ['TICKET_PURCHASE', 'BONUS_REDEMPTION'].includes(txn.type)
    )

    const metrics: RevenueMetrics[] = []
    
    // Group by period
    const groupedData = new Map<string, Transaction[]>()
    
    recentTransactions.forEach(txn => {
      let periodKey = ''
      
      switch (period) {
        case 'daily':
          periodKey = txn.createdAt.toISOString().split('T')[0]
          break
        case 'weekly':
          const weekStart = new Date(txn.createdAt)
          weekStart.setDate(weekStart.getDate() - weekStart.getDay())
          periodKey = weekStart.toISOString().split('T')[0]
          break
        case 'monthly':
          periodKey = txn.createdAt.toISOString().substring(0, 7)
          break
      }
      
      if (!groupedData.has(periodKey)) {
        groupedData.set(periodKey, [])
      }
      groupedData.get(periodKey)!.push(txn)
    })

    // Calculate metrics for each period
    groupedData.forEach((periodTransactions, date) => {
      const grossRevenue = periodTransactions.reduce((sum, txn) => sum + txn.amount, 0)
      const refundTransactions = transactions.filter(txn => 
        txn.type === 'REFUND' && 
        txn.createdAt.toISOString().split('T')[0] === date
      )
      const feeTransactions = transactions.filter(txn => 
        txn.type === 'FEE' && 
        txn.createdAt.toISOString().split('T')[0] === date
      )
      
      const refunds = refundTransactions.reduce((sum, txn) => sum + txn.amount, 0)
      const fees = feeTransactions.reduce((sum, txn) => sum + txn.amount, 0)
      const netRevenue = grossRevenue - refunds - fees
      
      const paymentMethodBreakdown = {
        card: { count: 0, amount: 0 },
        points: { count: 0, amount: 0 },
        bonus: { count: 0, amount: 0 }
      }

      periodTransactions.forEach(txn => {
        const method = txn.metadata.paymentMethod || 'card'
        if (method in paymentMethodBreakdown) {
          paymentMethodBreakdown[method as keyof typeof paymentMethodBreakdown].count++
          paymentMethodBreakdown[method as keyof typeof paymentMethodBreakdown].amount += txn.amount
        }
      })

      metrics.push({
        period,
        date,
        grossRevenue,
        netRevenue,
        totalTransactions: periodTransactions.length,
        averageTransactionValue: periodTransactions.length > 0 ? grossRevenue / periodTransactions.length : 0,
        refunds,
        fees,
        profit: netRevenue - (grossRevenue * 0.3), // Estimate 30% cost
        profitMargin: netRevenue > 0 ? ((netRevenue - (grossRevenue * 0.3)) / netRevenue) * 100 : 0,
        paymentMethodBreakdown
      })
    })

    return metrics.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  },

  // Financial Statistics
  getFinancialOverview: (days: number = 30) => {
    const transactions = financeService.getAllTransactions()
    const payouts = financeService.getAllPayouts()
    const expenses = financeService.getAllExpenses()
    const cutoffDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000))

    const recentTransactions = transactions.filter(txn => txn.createdAt >= cutoffDate)
    const completedTransactions = recentTransactions.filter(txn => txn.status === 'completed')

    const grossRevenue = completedTransactions
      .filter(txn => ['TICKET_PURCHASE', 'BONUS_REDEMPTION'].includes(txn.type))
      .reduce((sum, txn) => sum + txn.amount, 0)

    const totalRefunds = completedTransactions
      .filter(txn => txn.type === 'REFUND')
      .reduce((sum, txn) => sum + txn.amount, 0)

    const totalFees = completedTransactions
      .filter(txn => txn.type === 'FEE')
      .reduce((sum, txn) => sum + txn.amount, 0)

    const recentPayouts = payouts.filter(payout => payout.requestedAt >= cutoffDate)
    const totalPayouts = recentPayouts
      .filter(payout => payout.status === 'completed')
      .reduce((sum, payout) => sum + payout.amount, 0)

    const recentExpenses = expenses.filter(expense => expense.date >= cutoffDate)
    const totalExpenses = recentExpenses.reduce((sum, expense) => sum + expense.amount, 0)

    const netRevenue = grossRevenue - totalRefunds - totalFees
    const totalCosts = totalPayouts + totalExpenses
    const profit = netRevenue - totalCosts

    return {
      grossRevenue,
      netRevenue,
      totalRefunds,
      totalFees,
      totalPayouts,
      totalExpenses,
      totalCosts,
      profit,
      profitMargin: netRevenue > 0 ? (profit / netRevenue) * 100 : 0,
      transactionCount: completedTransactions.length,
      averageTransactionValue: completedTransactions.length > 0 ? grossRevenue / completedTransactions.length : 0,
      pendingPayouts: payouts.filter(p => ['pending_verification', 'pending_payout', 'processing'].includes(p.status)).length,
      pendingPayoutAmount: payouts
        .filter(p => ['pending_verification', 'pending_payout', 'processing'].includes(p.status))
        .reduce((sum, p) => sum + p.amount, 0)
    }
  },

  // Search and Filter
  searchTransactions: (query: string, filters?: {
    type?: Transaction['type']
    status?: Transaction['status']
    userId?: string
    dateRange?: { start: Date; end: Date }
    minAmount?: number
    maxAmount?: number
  }): Transaction[] => {
    let transactions = financeService.getAllTransactions()
    
    if (query) {
      const lowerQuery = query.toLowerCase()
      transactions = transactions.filter(txn =>
        txn.description.toLowerCase().includes(lowerQuery) ||
        txn.id.toLowerCase().includes(lowerQuery) ||
        txn.userId?.toLowerCase().includes(lowerQuery) ||
        txn.metadata.paymentIntentId?.toLowerCase().includes(lowerQuery)
      )
    }
    
    if (filters) {
      if (filters.type) {
        transactions = transactions.filter(txn => txn.type === filters.type)
      }
      if (filters.status) {
        transactions = transactions.filter(txn => txn.status === filters.status)
      }
      if (filters.userId) {
        transactions = transactions.filter(txn => txn.userId === filters.userId)
      }
      if (filters.dateRange) {
        transactions = transactions.filter(txn => 
          txn.createdAt >= filters.dateRange!.start && 
          txn.createdAt <= filters.dateRange!.end
        )
      }
      if (filters.minAmount) {
        transactions = transactions.filter(txn => txn.amount >= filters.minAmount!)
      }
      if (filters.maxAmount) {
        transactions = transactions.filter(txn => txn.amount <= filters.maxAmount!)
      }
    }
    
    return transactions
  },

  searchPayouts: (query: string, filters?: {
    status?: Payout['status']
    dateRange?: { start: Date; end: Date }
    minAmount?: number
    maxAmount?: number
  }): Payout[] => {
    let payouts = financeService.getAllPayouts()
    
    if (query) {
      const lowerQuery = query.toLowerCase()
      payouts = payouts.filter(payout =>
        payout.id.toLowerCase().includes(lowerQuery) ||
        payout.userId.toLowerCase().includes(lowerQuery) ||
        payout.raffleId.toLowerCase().includes(lowerQuery)
      )
    }
    
    if (filters) {
      if (filters.status) {
        payouts = payouts.filter(payout => payout.status === filters.status)
      }
      if (filters.dateRange) {
        payouts = payouts.filter(payout => 
          payout.requestedAt >= filters.dateRange!.start && 
          payout.requestedAt <= filters.dateRange!.end
        )
      }
      if (filters.minAmount) {
        payouts = payouts.filter(payout => payout.amount >= filters.minAmount!)
      }
      if (filters.maxAmount) {
        payouts = payouts.filter(payout => payout.amount <= filters.maxAmount!)
      }
    }
    
    return payouts
  },

  // Reconciliation
  performDailyReconciliation: (date: string): ReconciliationRecord => {
    const targetDate = new Date(date)
    const nextDay = new Date(targetDate.getTime() + 24 * 60 * 60 * 1000)
    
    const dayTransactions = financeService.getAllTransactions().filter(txn =>
      txn.createdAt >= targetDate && 
      txn.createdAt < nextDay &&
      txn.status === 'completed'
    )

    const expectedRevenue = dayTransactions
      .filter(txn => ['TICKET_PURCHASE', 'BONUS_REDEMPTION'].includes(txn.type))
      .reduce((sum, txn) => sum + txn.amount, 0)

    // Simulate some discrepancies for demo
    const actualRevenue = expectedRevenue + (Math.random() > 0.8 ? Math.floor(Math.random() * 200) - 100 : 0)
    const discrepancy = actualRevenue - expectedRevenue

    const reconciliation: ReconciliationRecord = {
      id: `recon_${date.replace(/-/g, '')}_${Date.now()}`,
      date,
      expectedRevenue,
      actualRevenue,
      discrepancy,
      status: Math.abs(discrepancy) < 10 ? 'balanced' : 'discrepancy',
      transactions: dayTransactions.map(txn => txn.id),
      adjustments: [],
      reviewedBy: 'System',
      reviewedAt: new Date()
    }

    // Store reconciliation
    const reconciliations = JSON.parse(localStorage.getItem(RECONCILIATION_KEY) || '[]') as ReconciliationRecord[]
    reconciliations.unshift(reconciliation)
    localStorage.setItem(RECONCILIATION_KEY, JSON.stringify(reconciliations))

    return reconciliation
  },

  // Reporting
  generateReport: (
    type: FinancialReport['type'], 
    period: { start: Date; end: Date },
    adminUser: string
  ): FinancialReport => {
    const transactions = financeService.getAllTransactions()
    const payouts = financeService.getAllPayouts()
    const expenses = financeService.getAllExpenses()

    let reportData: any = {}

    switch (type) {
      case 'P_AND_L':
        const revenue = transactions
          .filter(txn => 
            txn.createdAt >= period.start && 
            txn.createdAt <= period.end &&
            txn.status === 'completed' &&
            ['TICKET_PURCHASE', 'BONUS_REDEMPTION'].includes(txn.type)
          )
          .reduce((sum, txn) => sum + txn.amount, 0)

        const costs = expenses
          .filter(exp => exp.date >= period.start && exp.date <= period.end)
          .reduce((sum, exp) => sum + exp.amount, 0)

        reportData = {
          revenue,
          costs,
          profit: revenue - costs,
          profitMargin: revenue > 0 ? ((revenue - costs) / revenue) * 100 : 0
        }
        break

      case 'CASH_FLOW':
        reportData = {
          inflows: transactions
            .filter(txn => 
              txn.createdAt >= period.start && 
              txn.createdAt <= period.end &&
              txn.status === 'completed' &&
              ['TICKET_PURCHASE', 'BONUS_REDEMPTION'].includes(txn.type)
            )
            .reduce((sum, txn) => sum + txn.amount, 0),
          
          outflows: [
            ...payouts.filter(p => 
              p.completedAt && 
              p.completedAt >= period.start && 
              p.completedAt <= period.end &&
              p.status === 'completed'
            ).map(p => p.amount),
            ...expenses.filter(e => e.date >= period.start && e.date <= period.end).map(e => e.amount)
          ].reduce((sum, amount) => sum + amount, 0)
        }
        break
    }

    const report: FinancialReport = {
      id: `report_${type.toLowerCase()}_${Date.now()}`,
      type,
      period,
      data: reportData,
      generatedAt: new Date(),
      generatedBy: adminUser,
      format: 'json'
    }

    // Store report
    const reports = JSON.parse(localStorage.getItem(REPORTS_KEY) || '[]') as FinancialReport[]
    reports.unshift(report)
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports))

    return report
  },

  // Export functions
  exportToCSV: (data: any[], filename: string) => {
    if (data.length === 0) return

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header]
        if (value instanceof Date) {
          return value.toISOString()
        }
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`
        }
        return value
      }).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  },

  // Bulk operations
  bulkUpdateTransactionStatus: (ids: string[], status: Transaction['status'], adminUser: string): number => {
    let updatedCount = 0
    ids.forEach(id => {
      const updated = financeService.updateTransaction(id, { 
        status,
        completedAt: status === 'completed' ? new Date() : undefined
      })
      if (updated) updatedCount++
    })
    return updatedCount
  },

  bulkApprovePayout: (ids: string[], adminUser: string): { successful: number; failed: string[] } => {
    const successful: number[] = []
    const failed: string[] = []

    ids.forEach(id => {
      try {
        if (financeService.approvePayout(id, adminUser)) {
          successful.push(1)
        } else {
          failed.push(id)
        }
      } catch (error) {
        failed.push(id)
      }
    })

    return {
      successful: successful.length,
      failed
    }
  },

  // Customer Metrics
  getAllCustomerMetrics: (): CustomerMetrics[] => {
    if (typeof window === 'undefined') return []
    
    const stored = localStorage.getItem(CUSTOMER_METRICS_KEY)
    if (!stored) return []
    
    const customers = JSON.parse(stored) as CustomerMetrics[]
    return customers.map(customer => ({
      ...customer,
      registrationDate: new Date(customer.registrationDate),
      predictedChurnDate: customer.predictedChurnDate ? new Date(customer.predictedChurnDate) : undefined
    }))
  },

  getBusinessMetrics: (days: number = 30): BusinessMetrics => {
    const customers = financeService.getAllCustomerMetrics()
    const transactions = financeService.getAllTransactions()
    const cutoffDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000))
    
    // Customer Overview
    const totalCustomers = customers.length
    const activeCustomers = customers.filter(c => c.isActive).length
    const newCustomers = customers.filter(c => c.registrationDate >= cutoffDate).length
    const churnedCustomers = customers.filter(c => c.churnRisk === 'high').length
    const retentionRate = totalCustomers > 0 ? ((totalCustomers - churnedCustomers) / totalCustomers) * 100 : 0
    const churnRate = totalCustomers > 0 ? (churnedCustomers / totalCustomers) * 100 : 0

    // Financial Metrics
    const recentTransactions = transactions.filter(txn => 
      txn.createdAt >= cutoffDate && 
      txn.status === 'completed' &&
      ['TICKET_PURCHASE', 'BONUS_REDEMPTION'].includes(txn.type)
    )
    
    const totalRevenue = recentTransactions.reduce((sum, txn) => sum + txn.amount, 0)
    const totalAcquisitionCost = customers
      .filter(c => c.registrationDate >= cutoffDate)
      .reduce((sum, c) => sum + c.acquisitionCost, 0)
    
    const averageLTV = customers.length > 0 
      ? customers.reduce((sum, c) => sum + c.lifetimeValue, 0) / customers.length 
      : 0
    
    const averageCAC = newCustomers > 0 ? totalAcquisitionCost / newCustomers : 0
    const ltvCacRatio = averageCAC > 0 ? averageLTV / averageCAC : 0
    const arpu = activeCustomers > 0 ? totalRevenue / activeCustomers : 0
    const arr = arpu * 12 * activeCustomers // Simplified ARR calculation
    
    // Engagement Metrics
    const ticketPurchaseTransactions = recentTransactions.filter(t => t.type === 'TICKET_PURCHASE')
    const uniqueUsers = new Set(ticketPurchaseTransactions.map(t => t.userId)).size
    const averageTicketsPerUser = uniqueUsers > 0 ? ticketPurchaseTransactions.length / uniqueUsers : 0
    const repeatCustomers = customers.filter(c => c.totalTransactions > 1).length
    const repeatPurchaseRate = totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0

    return {
      period: { start: cutoffDate, end: new Date() },
      overview: {
        totalCustomers,
        activeCustomers,
        newCustomers,
        churnedCustomers,
        retentionRate,
        churnRate
      },
      financial: {
        totalRevenue,
        arr,
        arpu,
        cac: averageCAC,
        ltv: averageLTV,
        ltvCacRatio,
        paybackPeriod: averageCAC > 0 ? averageCAC / (arpu || 1) : 0
      },
      engagement: {
        averageSessionsPerUser: Math.random() * 3 + 1, // Mock data
        averageTicketsPerUser,
        conversionRate: (ticketPurchaseTransactions.length / Math.max(totalCustomers, 1)) * 100,
        repeatPurchaseRate
      }
    }
  },

  getCohortAnalysis: (): CohortAnalysis[] => {
    const customers = financeService.getAllCustomerMetrics()
    const cohorts = new Map<string, CustomerMetrics[]>()

    // Group customers by cohort
    customers.forEach(customer => {
      if (!cohorts.has(customer.cohort)) {
        cohorts.set(customer.cohort, [])
      }
      cohorts.get(customer.cohort)!.push(customer)
    })

    const analyses: CohortAnalysis[] = []

    cohorts.forEach((cohortCustomers, cohortId) => {
      const initialSize = cohortCustomers.length
      const currentActiveSize = cohortCustomers.filter(c => c.isActive).length
      const totalRevenue = cohortCustomers.reduce((sum, c) => sum + c.totalSpent, 0)
      const totalAcquisitionCost = cohortCustomers.reduce((sum, c) => sum + c.acquisitionCost, 0)
      
      // Calculate retention rates (simplified)
      const day1Retention = currentActiveSize / initialSize
      const day7Retention = cohortCustomers.filter(c => c.daysSinceLastTransaction <= 7).length / initialSize
      const day30Retention = cohortCustomers.filter(c => c.daysSinceLastTransaction <= 30).length / initialSize
      const day90Retention = cohortCustomers.filter(c => c.daysSinceLastTransaction <= 90).length / initialSize
      const day365Retention = currentActiveSize / initialSize

      const averageLTV = cohortCustomers.reduce((sum, c) => sum + c.lifetimeValue, 0) / initialSize
      const averageCAC = totalAcquisitionCost / initialSize

      analyses.push({
        cohort: cohortId,
        registrationDate: new Date(cohortId + '-01'),
        initialSize,
        currentSize: currentActiveSize,
        retentionRates: {
          day1: day1Retention * 100,
          day7: day7Retention * 100,
          day30: day30Retention * 100,
          day90: day90Retention * 100,
          day365: day365Retention * 100
        },
        revenueMetrics: {
          totalRevenue,
          averageRevenue: totalRevenue / initialSize,
          cumulativeRevenue: [totalRevenue] // Simplified
        },
        cac: averageCAC,
        ltv: averageLTV,
        paybackPeriod: averageCAC > 0 ? averageCAC / (totalRevenue / initialSize / 12) : 0
      })
    })

    return analyses.sort((a, b) => new Date(b.cohort).getTime() - new Date(a.cohort).getTime())
  },

  getTopCustomers: (limit: number = 10): CustomerMetrics[] => {
    const customers = financeService.getAllCustomerMetrics()
    return customers
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, limit)
  },

  getChurnRiskCustomers: (): CustomerMetrics[] => {
    const customers = financeService.getAllCustomerMetrics()
    return customers
      .filter(c => c.churnRisk === 'high')
      .sort((a, b) => b.totalSpent - a.totalSpent)
  },

  getAcquisitionChannelMetrics: () => {
    const customers = financeService.getAllCustomerMetrics()
    const channels: Record<string, { count: number; totalCAC: number; totalLTV: number; totalRevenue: number }> = {}

    customers.forEach(customer => {
      if (!channels[customer.acquisitionChannel]) {
        channels[customer.acquisitionChannel] = { count: 0, totalCAC: 0, totalLTV: 0, totalRevenue: 0 }
      }
      channels[customer.acquisitionChannel].count++
      channels[customer.acquisitionChannel].totalCAC += customer.acquisitionCost
      channels[customer.acquisitionChannel].totalLTV += customer.lifetimeValue
      channels[customer.acquisitionChannel].totalRevenue += customer.totalSpent
    })

    return Object.entries(channels).map(([channel, data]) => ({
      channel,
      customerCount: data.count,
      averageCAC: data.totalCAC / data.count,
      averageLTV: data.totalLTV / data.count,
      totalRevenue: data.totalRevenue,
      ltvCacRatio: (data.totalLTV / data.count) / (data.totalCAC / data.count),
      roi: ((data.totalRevenue - data.totalCAC) / data.totalCAC) * 100
    })).sort((a, b) => b.totalRevenue - a.totalRevenue)
  }
}
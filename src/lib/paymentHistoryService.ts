'use client'

import { userManagementService, UserTransaction } from './userManagementService'

export interface PaymentRecord {
  id: string
  userId: string
  type: 'deposit' | 'withdrawal' | 'purchase' | 'refund' | 'payout' | 'fee' | 'bonus_redemption'
  amount: number
  currency: 'DKK' | 'GBP' | 'EUR'
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  paymentMethod: 'card' | 'bank_transfer' | 'paypal' | 'points' | 'bonus'
  description: string
  timestamp: Date
  processedAt?: Date
  failureReason?: string
  metadata: {
    paymentIntentId?: string
    raffleId?: string
    ticketsQuantity?: number
    originalAmount?: number
    exchangeRate?: number
    cardLast4?: string
    bankAccount?: string
    ipAddress?: string
    userAgent?: string
    feeAmount?: number
    riskScore?: number
  }
}

export interface PaymentSummary {
  totalDeposits: number
  totalWithdrawals: number
  totalPurchases: number
  totalRefunds: number
  netBalance: number
  transactionCount: number
  averageTransaction: number
  paymentMethodBreakdown: {
    card: { count: number; amount: number }
    bank_transfer: { count: number; amount: number }
    paypal: { count: number; amount: number }
    points: { count: number; amount: number }
    bonus: { count: number; amount: number }
  }
  monthlyBreakdown: {
    month: string
    deposits: number
    withdrawals: number
    purchases: number
    net: number
  }[]
}

const PAYMENT_HISTORY_STORAGE_KEY = 'drawdash_payment_history'

// Initialize with mock data
const initializePaymentHistory = () => {
  if (typeof window === 'undefined') return

  const existing = localStorage.getItem(PAYMENT_HISTORY_STORAGE_KEY)
  if (!existing) {
    const mockPayments: PaymentRecord[] = [
      // User 1 - John Doe
      {
        id: 'pay_1_1',
        userId: '1',
        type: 'deposit',
        amount: 500,
        currency: 'DKK',
        status: 'completed',
        paymentMethod: 'card',
        description: 'Indskud via kreditkort',
        timestamp: new Date('2024-01-20'),
        processedAt: new Date('2024-01-20'),
        metadata: {
          paymentIntentId: 'pi_123',
          cardLast4: '4242',
          ipAddress: '192.168.1.1',
          feeAmount: 15
        }
      },
      {
        id: 'pay_1_2',
        userId: '1',
        type: 'purchase',
        amount: 125,
        currency: 'DKK',
        status: 'completed',
        paymentMethod: 'card',
        description: 'Køb af 5 billetter til iPhone 15 Pro Max',
        timestamp: new Date('2024-01-25'),
        processedAt: new Date('2024-01-25'),
        metadata: {
          raffleId: '2',
          ticketsQuantity: 5,
          cardLast4: '4242'
        }
      },
      {
        id: 'pay_1_3',
        userId: '1',
        type: 'purchase',
        amount: 250,
        currency: 'DKK',
        status: 'completed',
        paymentMethod: 'points',
        description: 'Køb med loyalitetspoint',
        timestamp: new Date('2024-02-10'),
        processedAt: new Date('2024-02-10'),
        metadata: {
          raffleId: '1',
          ticketsQuantity: 10
        }
      },
      {
        id: 'pay_1_4',
        userId: '1',
        type: 'payout',
        amount: 500,
        currency: 'DKK',
        status: 'completed',
        paymentMethod: 'bank_transfer',
        description: 'Udbetaling af gevinst - Apple Watch',
        timestamp: new Date('2024-02-15'),
        processedAt: new Date('2024-02-18'),
        metadata: {
          raffleId: 'old2',
          bankAccount: '****1234'
        }
      },

      // User 2 - Sarah Nielsen  
      {
        id: 'pay_2_1',
        userId: '2',
        type: 'deposit',
        amount: 1000,
        currency: 'DKK',
        status: 'completed',
        paymentMethod: 'bank_transfer',
        description: 'Bankoverførsel',
        timestamp: new Date('2024-02-05'),
        processedAt: new Date('2024-02-06'),
        metadata: {
          bankAccount: '****5678',
          feeAmount: 0
        }
      },
      {
        id: 'pay_2_2',
        userId: '2',
        type: 'purchase',
        amount: 800,
        currency: 'DKK',
        status: 'completed',
        paymentMethod: 'card',
        description: 'Køb af 32 billetter til BMW M4',
        timestamp: new Date('2024-02-10'),
        processedAt: new Date('2024-02-10'),
        metadata: {
          raffleId: '1',
          ticketsQuantity: 32,
          cardLast4: '1234'
        }
      },
      {
        id: 'pay_2_3',
        userId: '2',
        type: 'payout',
        amount: 1200,
        currency: 'DKK',
        status: 'completed',
        paymentMethod: 'paypal',
        description: 'Udbetaling - Amazon gavekort gevinst',
        timestamp: new Date('2024-03-01'),
        processedAt: new Date('2024-03-02'),
        metadata: {
          raffleId: 'old3'
        }
      },

      // User 3 - Mike Hansen (blocked user)
      {
        id: 'pay_3_1',
        userId: '3',
        type: 'deposit',
        amount: 200,
        currency: 'DKK',
        status: 'completed',
        paymentMethod: 'card',
        description: 'Indskud via kreditkort',
        timestamp: new Date('2024-03-15'),
        processedAt: new Date('2024-03-15'),
        metadata: {
          cardLast4: '9999',
          ipAddress: '192.168.1.1', // Same IP as user 1 - fraud flag
          riskScore: 85,
          feeAmount: 6
        }
      },
      {
        id: 'pay_3_2',
        userId: '3',
        type: 'purchase',
        amount: 200,
        currency: 'DKK',
        status: 'failed',
        paymentMethod: 'card',
        description: 'Forsøg på køb blokeret af sikkerhedssystem',
        timestamp: new Date('2024-07-15'),
        failureReason: 'Blocked due to fraud suspicion',
        metadata: {
          cardLast4: '9999',
          riskScore: 95
        }
      },

      // User 4 - Emma Larsen (VIP)
      {
        id: 'pay_4_1',
        userId: '4',
        type: 'deposit',
        amount: 2000,
        currency: 'DKK',
        status: 'completed',
        paymentMethod: 'bank_transfer',
        description: 'VIP bankoverførsel',
        timestamp: new Date('2024-04-22'),
        processedAt: new Date('2024-04-22'),
        metadata: {
          bankAccount: '****9999',
          feeAmount: 0
        }
      },
      {
        id: 'pay_4_2',
        userId: '4',
        type: 'purchase',
        amount: 1200,
        currency: 'DKK',
        status: 'completed',
        paymentMethod: 'card',
        description: 'VIP purchase - Multiple raffles',
        timestamp: new Date('2024-05-01'),
        processedAt: new Date('2024-05-01'),
        metadata: {
          cardLast4: '1111',
          ticketsQuantity: 48
        }
      },
      {
        id: 'pay_4_3',
        userId: '4',
        type: 'payout',
        amount: 800,
        currency: 'DKK',
        status: 'processing',
        paymentMethod: 'bank_transfer',
        description: 'VIP payout - Electronics raffle win',
        timestamp: new Date('2024-08-25'),
        metadata: {
          raffleId: 'electronics_1',
          bankAccount: '****9999'
        }
      }
    ]

    localStorage.setItem(PAYMENT_HISTORY_STORAGE_KEY, JSON.stringify(mockPayments))
  }
}

initializePaymentHistory()

export const paymentHistoryService = {
  // Get all payment records
  getAllPayments: (): PaymentRecord[] => {
    if (typeof window === 'undefined') return []
    
    const stored = localStorage.getItem(PAYMENT_HISTORY_STORAGE_KEY)
    if (!stored) return []
    
    const payments = JSON.parse(stored) as PaymentRecord[]
    return payments.map(payment => ({
      ...payment,
      timestamp: new Date(payment.timestamp),
      processedAt: payment.processedAt ? new Date(payment.processedAt) : undefined
    }))
  },

  // Get payment history for specific user
  getUserPaymentHistory: (userId: string): PaymentRecord[] => {
    const allPayments = paymentHistoryService.getAllPayments()
    return allPayments
      .filter(payment => payment.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  },

  // Get payment summary for user
  getUserPaymentSummary: (userId: string): PaymentSummary => {
    const payments = paymentHistoryService.getUserPaymentHistory(userId)
    
    const deposits = payments.filter(p => p.type === 'deposit' && p.status === 'completed')
    const withdrawals = payments.filter(p => p.type === 'withdrawal' || p.type === 'payout')
    const purchases = payments.filter(p => p.type === 'purchase' && p.status === 'completed')
    const refunds = payments.filter(p => p.type === 'refund' && p.status === 'completed')

    const totalDeposits = deposits.reduce((sum, p) => sum + p.amount, 0)
    const totalWithdrawals = withdrawals.reduce((sum, p) => sum + p.amount, 0)
    const totalPurchases = purchases.reduce((sum, p) => sum + p.amount, 0)
    const totalRefunds = refunds.reduce((sum, p) => sum + p.amount, 0)

    // Payment method breakdown
    const paymentMethodBreakdown = payments.reduce((acc, payment) => {
      const method = payment.paymentMethod
      if (!acc[method]) {
        acc[method] = { count: 0, amount: 0 }
      }
      acc[method].count++
      acc[method].amount += payment.amount
      return acc
    }, {} as any)

    // Monthly breakdown for last 12 months
    const monthlyBreakdown: any[] = []
    for (let i = 0; i < 12; i++) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      const monthPayments = payments.filter(p => {
        const paymentMonth = `${p.timestamp.getFullYear()}-${String(p.timestamp.getMonth() + 1).padStart(2, '0')}`
        return paymentMonth === monthKey && p.status === 'completed'
      })

      monthlyBreakdown.push({
        month: monthKey,
        deposits: monthPayments.filter(p => p.type === 'deposit').reduce((sum, p) => sum + p.amount, 0),
        withdrawals: monthPayments.filter(p => p.type === 'withdrawal' || p.type === 'payout').reduce((sum, p) => sum + p.amount, 0),
        purchases: monthPayments.filter(p => p.type === 'purchase').reduce((sum, p) => sum + p.amount, 0),
        net: monthPayments.filter(p => p.type === 'deposit').reduce((sum, p) => sum + p.amount, 0) - 
             monthPayments.filter(p => p.type === 'withdrawal' || p.type === 'payout').reduce((sum, p) => sum + p.amount, 0)
      })
    }

    return {
      totalDeposits,
      totalWithdrawals,
      totalPurchases,
      totalRefunds,
      netBalance: totalDeposits - totalWithdrawals,
      transactionCount: payments.length,
      averageTransaction: payments.length > 0 ? payments.reduce((sum, p) => sum + p.amount, 0) / payments.length : 0,
      paymentMethodBreakdown,
      monthlyBreakdown: monthlyBreakdown.reverse()
    }
  },

  // Record new payment
  recordPayment: (payment: Omit<PaymentRecord, 'id'>): PaymentRecord => {
    if (typeof window === 'undefined') throw new Error('Window not available')
    
    const payments = paymentHistoryService.getAllPayments()
    
    const newPayment: PaymentRecord = {
      ...payment,
      id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    
    payments.push(newPayment)
    localStorage.setItem(PAYMENT_HISTORY_STORAGE_KEY, JSON.stringify(payments))
    
    // Also record in user transaction system
    userManagementService.recordTransaction({
      userId: newPayment.userId,
      type: newPayment.type,
      amount: newPayment.amount,
      currency: newPayment.currency,
      status: newPayment.status,
      paymentMethod: newPayment.paymentMethod,
      description: newPayment.description,
      timestamp: newPayment.timestamp,
      raffleId: newPayment.metadata.raffleId,
      metadata: newPayment.metadata
    })
    
    return newPayment
  },

  // Update payment status
  updatePaymentStatus: (
    paymentId: string, 
    status: PaymentRecord['status'], 
    failureReason?: string,
    processedAt?: Date
  ): boolean => {
    const payments = paymentHistoryService.getAllPayments()
    const paymentIndex = payments.findIndex(p => p.id === paymentId)
    
    if (paymentIndex === -1) return false

    payments[paymentIndex].status = status
    if (failureReason) payments[paymentIndex].failureReason = failureReason
    if (processedAt) payments[paymentIndex].processedAt = processedAt

    localStorage.setItem(PAYMENT_HISTORY_STORAGE_KEY, JSON.stringify(payments))
    return true
  },

  // Get payments by status
  getPaymentsByStatus: (status: PaymentRecord['status']): PaymentRecord[] => {
    const payments = paymentHistoryService.getAllPayments()
    return payments.filter(p => p.status === status)
  },

  // Get payments by type and date range
  getPaymentsByTypeAndDateRange: (
    type: PaymentRecord['type'],
    startDate: Date,
    endDate: Date
  ): PaymentRecord[] => {
    const payments = paymentHistoryService.getAllPayments()
    return payments.filter(p => 
      p.type === type && 
      p.timestamp >= startDate && 
      p.timestamp <= endDate
    )
  },

  // Export payment data
  exportUserPaymentHistory: (userId: string): string => {
    const payments = paymentHistoryService.getUserPaymentHistory(userId)
    const summary = paymentHistoryService.getUserPaymentSummary(userId)
    const user = userManagementService.getUserById(userId)

    const exportData = {
      exportedAt: new Date().toISOString(),
      user: user ? {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email
      } : null,
      summary,
      payments: payments.map(p => ({
        id: p.id,
        type: p.type,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        paymentMethod: p.paymentMethod,
        description: p.description,
        timestamp: p.timestamp,
        processedAt: p.processedAt,
        metadata: p.metadata
      }))
    }

    return JSON.stringify(exportData, null, 2)
  },

  // Analytics functions
  getPaymentTrends: (userId?: string): {
    dailyVolume: { date: string; amount: number; count: number }[]
    popularPaymentMethods: { method: string; percentage: number }[]
    averageTransactionByType: { type: string; average: number }[]
  } => {
    const payments = userId 
      ? paymentHistoryService.getUserPaymentHistory(userId)
      : paymentHistoryService.getAllPayments()

    // Daily volume for last 30 days
    const dailyVolume = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayPayments = payments.filter(p => 
        p.timestamp.toISOString().split('T')[0] === dateStr && 
        p.status === 'completed'
      )
      
      dailyVolume.push({
        date: dateStr,
        amount: dayPayments.reduce((sum, p) => sum + p.amount, 0),
        count: dayPayments.length
      })
    }

    // Payment method popularity
    const methodCounts = payments.reduce((acc, payment) => {
      acc[payment.paymentMethod] = (acc[payment.paymentMethod] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const totalPayments = payments.length
    const popularPaymentMethods = Object.entries(methodCounts).map(([method, count]) => ({
      method,
      percentage: (count / totalPayments) * 100
    }))

    // Average transaction by type
    const typeAverages = payments.reduce((acc, payment) => {
      if (!acc[payment.type]) {
        acc[payment.type] = { total: 0, count: 0 }
      }
      acc[payment.type].total += payment.amount
      acc[payment.type].count += 1
      return acc
    }, {} as Record<string, { total: number; count: number }>)

    const averageTransactionByType = Object.entries(typeAverages).map(([type, data]) => ({
      type,
      average: data.total / data.count
    }))

    return {
      dailyVolume,
      popularPaymentMethods,
      averageTransactionByType
    }
  }
}
'use client'

// Balance & Payout Notification Service
// Handles notifications for balance changes, payouts, and related events

import { emailService } from './emailService'
import { smsService } from './smsService'
import { UserBalance, BalanceTransaction } from './balanceService'
import { PayoutRequest } from './payoutService'

export interface BalanceNotification {
  id: string
  userId: string
  type: 'balance_credit' | 'payout_requested' | 'payout_completed' | 'payout_failed' | 'balance_low' | 'bonus_expiring'
  title: string
  message: string
  amount?: number
  currency?: string
  timestamp: Date
  read: boolean
  channels: ('email' | 'sms' | 'push')[]
  metadata?: {
    transactionId?: string
    payoutRequestId?: string
    balanceType?: string
  }
}

class BalanceNotificationService {
  private notifications: BalanceNotification[] = []
  private emailService = emailService
  private smsService = smsService

  constructor() {
    this.loadStoredData()
    console.log('🔔 Balance Notification Service initialized')
  }

  // Send balance credit notification
  async notifyBalanceCredit(
    userId: string, 
    amount: number, 
    balanceType: 'cash' | 'bonus' | 'free_tickets',
    description: string,
    transactionId: string
  ): Promise<void> {
    const notification = this.createNotification({
      userId,
      type: 'balance_credit',
      title: 'Balance Opdateret',
      message: `${description}. ${balanceType === 'cash' ? 'Du kan nu hæve pengene' : 'Brugebare til køb'}`,
      amount,
      currency: balanceType === 'free_tickets' ? undefined : 'DKK',
      channels: ['email'],
      metadata: { transactionId, balanceType }
    })

    // Send email notification
    if (balanceType === 'cash' && amount >= 100) {
      const emailSent = await this.emailService.sendTransactionalEmail(
        userId,
        'user@example.com', // Would get from user service
        'balance_credit_cash',
        {
          amount: amount.toLocaleString('da-DK'),
          description,
          withdrawalUrl: `${process.env.NEXT_PUBLIC_APP_URL}/account/balance`
        }
      )
      console.log('📧 Cash credit notification sent:', emailSent)
    }

    console.log('🔔 Balance credit notification created:', notification.id)
  }

  // Send payout notification
  async notifyPayoutRequest(userId: string, payoutRequest: PayoutRequest): Promise<void> {
    const notification = this.createNotification({
      userId,
      type: 'payout_requested',
      title: 'Udbetaling Anmodet',
      message: `Din udbetaling på ${payoutRequest.netAmount.toLocaleString('da-DK')} DKK er sendt til behandling`,
      amount: payoutRequest.netAmount,
      currency: 'DKK',
      channels: ['email'],
      metadata: { payoutRequestId: payoutRequest.id }
    })

    // Send confirmation email
    const emailSent = await this.emailService.sendTransactionalEmail(
      userId,
      'user@example.com',
      'payout_requested',
      {
        amount: payoutRequest.amount.toLocaleString('da-DK'),
        netAmount: payoutRequest.netAmount.toLocaleString('da-DK'),
        fee: payoutRequest.processingFee.toLocaleString('da-DK'),
        method: payoutRequest.method.name,
        expectedDate: payoutRequest.expectedTransferDate?.toLocaleDateString('da-DK') || 'Inden for 3 arbejdsdage',
        requestId: payoutRequest.id
      }
    )

    console.log('🔔 Payout request notification sent:', notification.id)
  }

  // Send payout completion notification
  async notifyPayoutCompleted(userId: string, payoutRequest: PayoutRequest): Promise<void> {
    const notification = this.createNotification({
      userId,
      type: 'payout_completed',
      title: 'Udbetaling Gennemført',
      message: `${payoutRequest.netAmount.toLocaleString('da-DK')} DKK er overført til ${payoutRequest.method.name}`,
      amount: payoutRequest.netAmount,
      currency: 'DKK',
      channels: ['email', 'sms'],
      metadata: { payoutRequestId: payoutRequest.id }
    })

    // Send confirmation email and SMS
    const emailSent = await this.emailService.sendTransactionalEmail(
      userId,
      'user@example.com',
      'payout_completed',
      {
        amount: payoutRequest.netAmount.toLocaleString('da-DK'),
        method: payoutRequest.method.name,
        transferReference: payoutRequest.transferReference || 'N/A',
        completedAt: payoutRequest.completedAt?.toLocaleDateString('da-DK') || 'I dag'
      }
    )

    // Send SMS for high amounts
    if (payoutRequest.netAmount >= 1000) {
      const smsSent = await this.smsService.sendSMS(
        '+4512345678', // Would get from user service
        `DrawDash: ${payoutRequest.netAmount.toLocaleString('da-DK')} DKK overført til ${payoutRequest.method.name}. Ref: ${payoutRequest.transferReference}`
      )
      console.log('📱 High amount payout SMS sent:', smsSent)
    }

    console.log('🔔 Payout completion notification sent:', notification.id)
  }

  // Send low balance warning
  async notifyLowBalance(userId: string, balance: UserBalance): Promise<void> {
    if (balance.cashBalance + balance.bonusBalance < 10) {
      const notification = this.createNotification({
        userId,
        type: 'balance_low',
        title: 'Lav Balance',
        message: 'Din balance er lav. Indskyd penge for at fortsætte med at spille',
        amount: balance.cashBalance + balance.bonusBalance,
        currency: 'DKK',
        channels: ['email']
      })

      console.log('⚠️ Low balance notification created:', notification.id)
    }
  }

  // Send bonus expiring warning
  async notifyBonusExpiring(userId: string, bonusAmount: number, expiryDate: Date): Promise<void> {
    const daysLeft = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    
    if (daysLeft <= 3 && daysLeft > 0) {
      const notification = this.createNotification({
        userId,
        type: 'bonus_expiring',
        title: 'Bonus Udløber Snart',
        message: `${bonusAmount.toLocaleString('da-DK')} DKK bonus udløber om ${daysLeft} dag${daysLeft !== 1 ? 'e' : ''}`,
        amount: bonusAmount,
        currency: 'DKK',
        channels: ['email']
      })

      const emailSent = await this.emailService.sendTransactionalEmail(
        userId,
        'user@example.com',
        'bonus_expiring',
        {
          amount: bonusAmount.toLocaleString('da-DK'),
          daysLeft,
          expiryDate: expiryDate.toLocaleDateString('da-DK'),
          useNowUrl: `${process.env.NEXT_PUBLIC_APP_URL}/raffles`
        }
      )

      console.log('⏰ Bonus expiring notification sent:', notification.id)
    }
  }

  // Get user notifications
  getUserNotifications(userId: string, limit: number = 20): BalanceNotification[] {
    return this.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }

  // Mark notification as read
  markAsRead(notificationId: string): boolean {
    const notification = this.notifications.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
      this.saveData()
      return true
    }
    return false
  }

  // Get unread count
  getUnreadCount(userId: string): number {
    return this.notifications.filter(n => n.userId === userId && !n.read).length
  }

  // Create notification helper
  private createNotification(data: Partial<BalanceNotification>): BalanceNotification {
    const notification: BalanceNotification = {
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      userId: data.userId!,
      type: data.type!,
      title: data.title!,
      message: data.message!,
      amount: data.amount,
      currency: data.currency,
      timestamp: new Date(),
      read: false,
      channels: data.channels || ['email'],
      metadata: data.metadata
    }

    this.notifications.push(notification)
    
    // Keep only last 1000 notifications
    if (this.notifications.length > 1000) {
      this.notifications = this.notifications.slice(-1000)
    }
    
    this.saveData()
    return notification
  }

  // Export notification data
  exportNotificationData(): string {
    return JSON.stringify({
      notifications: this.notifications.slice(-500), // Last 500 notifications
      exportedAt: new Date().toISOString()
    }, null, 2)
  }

  // Storage helpers
  private loadStoredData(): void {
    if (typeof window === 'undefined') return

    const storedNotifications = localStorage.getItem('balance_notifications')
    this.notifications = storedNotifications ? JSON.parse(storedNotifications) : []
  }

  private saveData(): void {
    if (typeof window === 'undefined') return
    localStorage.setItem('balance_notifications', JSON.stringify(this.notifications))
  }
}

// Singleton instance
export const balanceNotificationService = new BalanceNotificationService()

// Quick access functions
export const BalanceNotifications = {
  // Send notifications
  notifyCredit: (userId: string, amount: number, type: 'cash' | 'bonus' | 'free_tickets', description: string, transactionId: string) =>
    balanceNotificationService.notifyBalanceCredit(userId, amount, type, description, transactionId),
  
  notifyPayoutRequest: (userId: string, payoutRequest: PayoutRequest) =>
    balanceNotificationService.notifyPayoutRequest(userId, payoutRequest),
  
  notifyPayoutCompleted: (userId: string, payoutRequest: PayoutRequest) =>
    balanceNotificationService.notifyPayoutCompleted(userId, payoutRequest),
  
  notifyLowBalance: (userId: string, balance: UserBalance) =>
    balanceNotificationService.notifyLowBalance(userId, balance),
  
  notifyBonusExpiring: (userId: string, amount: number, expiryDate: Date) =>
    balanceNotificationService.notifyBonusExpiring(userId, amount, expiryDate),
  
  // Get notifications
  getNotifications: (userId: string, limit?: number) =>
    balanceNotificationService.getUserNotifications(userId, limit),
  
  getUnreadCount: (userId: string) =>
    balanceNotificationService.getUnreadCount(userId),
  
  markRead: (notificationId: string) =>
    balanceNotificationService.markAsRead(notificationId),
  
  // Export
  export: () => balanceNotificationService.exportNotificationData()
}

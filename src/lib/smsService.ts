'use client'

// SMS Communication Service  
// Mock implementation ready for Twilio/Customer.io integration

export interface SMSTemplate {
  id: string
  name: string
  message: string
  type: 'transactional' | 'marketing' | 'system'
  variables: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface SMSCampaign {
  id: string
  name: string
  description: string
  templateId: string
  message: string
  segmentIds: string[]
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused'
  scheduledAt?: Date
  sentAt?: Date
  metrics: {
    sent: number
    delivered: number
    clicked: number
    failed: number
    optouts: number
  }
  createdBy: string
  createdAt: Date
}

export interface SMSDelivery {
  id: string
  campaignId?: string
  userId: string
  phoneNumber: string
  templateId?: string
  message: string
  status: 'queued' | 'sent' | 'delivered' | 'clicked' | 'failed' | 'optout'
  sentAt?: Date
  deliveredAt?: Date
  clickedAt?: Date
  errorMessage?: string
  cost: number
  segments: number
}

class SMSService {
  private isEnabled: boolean = false
  private mockMode: boolean = true
  private deliveryQueue: SMSDelivery[] = []
  private optOutList: Set<string> = new Set()

  constructor() {
    this.isEnabled = process.env.SMS_SERVICE_ENABLED === 'true'
    this.mockMode = !this.isEnabled
    
    if (this.mockMode) {
      console.log('📱 SMS Service running in MOCK MODE - ready for Twilio integration')
    }
    
    // Load opt-out list (client-side only)
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sms_optouts')
      if (stored) {
        this.optOutList = new Set(JSON.parse(stored))
      }
    }
  }

  // Initialize SMS service
  async initialize(): Promise<boolean> {
    if (this.mockMode) {
      console.log('📱 SMS Service initialized in mock mode')
      return true
    }

    // Real Twilio initialization
    try {
      // const twilio = require('twilio')
      // this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
      return true
    } catch (error) {
      console.error('❌ Failed to initialize SMS service:', error)
      return false
    }
  }

  // Send transactional SMS
  async sendTransactionalSMS(
    userId: string,
    phoneNumber: string,
    templateId: string,
    data: Record<string, any>
  ): Promise<boolean> {
    // Check opt-out status
    if (this.optOutList.has(phoneNumber)) {
      console.log('📱 SMS blocked - user opted out:', phoneNumber)
      return false
    }

    const delivery: SMSDelivery = {
      id: Date.now().toString(),
      userId,
      phoneNumber,
      templateId,
      message: this.getTemplateMessage(templateId, data),
      status: 'queued',
      cost: this.calculateSMSCost(this.getTemplateMessage(templateId, data)),
      segments: Math.ceil(this.getTemplateMessage(templateId, data).length / 160)
    }

    if (this.mockMode) {
      console.log('📲 [MOCK] Sending SMS:', {
        to: phoneNumber,
        template: templateId,
        message: delivery.message,
        segments: delivery.segments
      })
      
      // Simulate delivery
      setTimeout(() => {
        delivery.status = 'sent'
        delivery.sentAt = new Date()
        
        setTimeout(() => {
          delivery.status = 'delivered'
          delivery.deliveredAt = new Date()
        }, 2000)
      }, 500)
      
      this.storeDelivery(delivery)
      return true
    }

    // Real SMS sending
    try {
      // await this.client.messages.create({
      //   body: delivery.message,
      //   from: process.env.TWILIO_PHONE_NUMBER,
      //   to: phoneNumber
      // })
      return true
    } catch (error) {
      console.error('❌ Failed to send SMS:', error)
      return false
    }
  }

  // Send SMS campaign
  async sendCampaign(campaign: SMSCampaign): Promise<boolean> {
    if (this.mockMode) {
      console.log('📢 [MOCK] Sending SMS campaign:', campaign.name)
      
      // Simulate campaign metrics
      const mockMetrics = {
        sent: Math.floor(Math.random() * 500) + 200,
        delivered: 0,
        clicked: 0,
        failed: 0,
        optouts: 0
      }
      
      mockMetrics.delivered = Math.floor(mockMetrics.sent * 0.98)
      mockMetrics.clicked = Math.floor(mockMetrics.delivered * 0.05)
      mockMetrics.failed = mockMetrics.sent - mockMetrics.delivered
      mockMetrics.optouts = Math.floor(mockMetrics.delivered * 0.01)
      
      campaign.metrics = mockMetrics
      campaign.status = 'sent'
      campaign.sentAt = new Date()
      
      this.storeCampaign(campaign)
      return true
    }

    // Real campaign sending would go here
    return true
  }

  // Handle opt-out
  handleOptOut(phoneNumber: string): void {
    this.optOutList.add(phoneNumber)
    localStorage.setItem('sms_optouts', JSON.stringify(Array.from(this.optOutList)))
    console.log('📱 User opted out of SMS:', phoneNumber)
  }

  // Handle opt-in
  handleOptIn(phoneNumber: string): void {
    this.optOutList.delete(phoneNumber)
    localStorage.setItem('sms_optouts', JSON.stringify(Array.from(this.optOutList)))
    console.log('📱 User opted in to SMS:', phoneNumber)
  }

  // Create SMS template
  createTemplate(template: Omit<SMSTemplate, 'id' | 'createdAt' | 'updatedAt'>): SMSTemplate {
    const newTemplate: SMSTemplate = {
      id: Date.now().toString(),
      ...template,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    if (this.mockMode) {
      this.storeTemplate(newTemplate)
    }

    return newTemplate
  }

  // Get all templates
  getAllTemplates(): SMSTemplate[] {
    if (this.mockMode) {
      const stored = localStorage.getItem('sms_templates')
      return stored ? JSON.parse(stored) : this.getDefaultTemplates()
    }
    return []
  }

  // Calculate SMS cost (based on Danish SMS pricing)
  private calculateSMSCost(message: string): number {
    const segments = Math.ceil(message.length / 160)
    return segments * 0.15 // ~0.15 DKK per segment
  }

  // Get template message with variable substitution
  private getTemplateMessage(templateId: string, data: Record<string, any>): string {
    const templates: Record<string, string> = {
      'purchase_confirmation': 'DrawDash: Tak for køb! {{tickets}} billetter til {{raffleName}}. Lykke til! 🍀',
      'winner_notification': '🎉 TILLYKKE {{firstName}}! Du har vundet {{prizeName}} på DrawDash! Vi kontakter dig snart.',
      'reminder': 'DrawDash: Husk at deltage! {{raffleName}} udløber om {{hours}} timer. God luck!',
      'bonus_notification': '🎁 {{firstName}}, du har fået en bonus: {{bonusName}}! Log ind for at se den.',
      'flash_sale': '⚡ FLASH SALE: 50% rabat på alle billetter! Kun i {{hours}} timer. drawdash.dk',
      'win_back': 'Hej {{firstName}}! Vi savner dig på DrawDash. Kom tilbage med 20% rabat: {{promoCode}}'
    }
    
    let message = templates[templateId] || 'DrawDash besked'
    
    // Replace variables
    Object.keys(data).forEach(key => {
      message = message.replace(new RegExp(`{{${key}}}`, 'g'), data[key])
    })
    
    return message
  }

  private getDefaultTemplates(): SMSTemplate[] {
    return [
      {
        id: 'purchase_confirmation',
        name: 'Købsbekræftelse SMS',
        message: 'DrawDash: Tak for køb! {{tickets}} billetter til {{raffleName}}. Lykke til! 🍀',
        type: 'transactional',
        variables: ['tickets', 'raffleName'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'winner_notification',
        name: 'Vinder SMS',
        message: '🎉 TILLYKKE {{firstName}}! Du har vundet {{prizeName}} på DrawDash!',
        type: 'transactional',
        variables: ['firstName', 'prizeName'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'flash_sale',
        name: 'Flash Sale SMS',
        message: '⚡ FLASH SALE: 50% rabat på alle billetter! Kun i {{hours}} timer. drawdash.dk',
        type: 'marketing',
        variables: ['hours'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  }

  private storeTemplate(template: SMSTemplate): void {
    const templates = this.getAllTemplates()
    templates.push(template)
    localStorage.setItem('sms_templates', JSON.stringify(templates))
  }

  private storeCampaign(campaign: SMSCampaign): void {
    const campaigns = this.getAllCampaigns()
    campaigns.push(campaign)
    localStorage.setItem('sms_campaigns', JSON.stringify(campaigns))
  }

  private storeDelivery(delivery: SMSDelivery): void {
    const deliveries = this.getDeliveryHistory()
    deliveries.push(delivery)
    localStorage.setItem('sms_deliveries', JSON.stringify(deliveries))
  }

  getAllCampaigns(): SMSCampaign[] {
    if (this.mockMode) {
      const stored = localStorage.getItem('sms_campaigns')
      return stored ? JSON.parse(stored) : []
    }
    return []
  }

  getDeliveryHistory(limit: number = 100): SMSDelivery[] {
    if (this.mockMode) {
      const stored = localStorage.getItem('sms_deliveries')
      const deliveries = stored ? JSON.parse(stored) : []
      return deliveries.slice(-limit).reverse()
    }
    return []
  }
}

// Singleton instance
export const smsService = new SMSService()

// Quick access functions
export const SMS = {
  // Common transactional SMS
  sendPurchaseConfirmation: (userId: string, phone: string, tickets: number, raffleName: string) =>
    smsService.sendTransactionalSMS(userId, phone, 'purchase_confirmation', { tickets, raffleName }),
  
  sendWinnerNotification: (userId: string, phone: string, firstName: string, prizeName: string) =>
    smsService.sendTransactionalSMS(userId, phone, 'winner_notification', { firstName, prizeName }),
  
  sendFlashSale: (userId: string, phone: string, hours: number) =>
    smsService.sendTransactionalSMS(userId, phone, 'flash_sale', { hours }),
  
  // Opt management
  optOut: (phone: string) => smsService.handleOptOut(phone),
  optIn: (phone: string) => smsService.handleOptIn(phone),
  
  // Campaign management
  sendCampaign: (campaign: SMSCampaign) => smsService.sendCampaign(campaign),
  
  // Templates
  createTemplate: (template: Omit<SMSTemplate, 'id' | 'createdAt' | 'updatedAt'>) =>
    smsService.createTemplate(template),
  
  getAllTemplates: () => smsService.getAllTemplates(),
  getAllCampaigns: () => smsService.getAllCampaigns(),
  getDeliveryHistory: (limit?: number) => smsService.getDeliveryHistory(limit)
}
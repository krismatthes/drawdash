'use client'

// Email Communication Service
// Mock implementation ready for Customer.io/SendGrid integration

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  htmlContent: string
  textContent: string
  type: 'transactional' | 'marketing' | 'system'
  variables: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface EmailCampaign {
  id: string
  name: string
  description: string
  templateId: string
  subject: string
  segmentIds: string[]
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused'
  scheduledAt?: Date
  sentAt?: Date
  metrics: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    bounced: number
    unsubscribed: number
    revenue: number
  }
  createdBy: string
  createdAt: Date
}

export interface EmailDelivery {
  id: string
  campaignId?: string
  userId: string
  email: string
  templateId?: string
  subject: string
  status: 'queued' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed'
  sentAt?: Date
  deliveredAt?: Date
  openedAt?: Date
  clickedAt?: Date
  errorMessage?: string
  trackingData: {
    userAgent?: string
    ipAddress?: string
    location?: string
  }
}

class EmailService {
  private isEnabled: boolean = false
  private mockMode: boolean = true
  private deliveryQueue: EmailDelivery[] = []

  constructor() {
    this.isEnabled = process.env.EMAIL_SERVICE_ENABLED === 'true'
    this.mockMode = !this.isEnabled
    
    if (this.mockMode) {
      console.log('📧 Email Service running in MOCK MODE - ready for Customer.io integration')
    }
  }

  // Initialize email service
  async initialize(): Promise<boolean> {
    if (this.mockMode) {
      console.log('📧 Email Service initialized in mock mode')
      return true
    }

    // Real initialization would go here
    try {
      // Customer.io email service setup
      // or SendGrid setup as backup
      return true
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error)
      return false
    }
  }

  // Send transactional email (immediate)
  async sendTransactionalEmail(
    userId: string,
    email: string,
    templateId: string,
    data: Record<string, any>
  ): Promise<boolean> {
    const delivery: EmailDelivery = {
      id: Date.now().toString(),
      userId,
      email,
      templateId,
      subject: this.getTemplateSubject(templateId, data),
      status: 'queued',
      trackingData: {}
    }

    if (this.mockMode) {
      console.log('📨 [MOCK] Sending transactional email:', {
        to: email,
        template: templateId,
        data
      })
      
      // Simulate delivery process
      setTimeout(() => {
        delivery.status = 'sent'
        delivery.sentAt = new Date()
        
        setTimeout(() => {
          delivery.status = 'delivered'
          delivery.deliveredAt = new Date()
        }, 1000)
      }, 100)
      
      this.storeDelivery(delivery)
      return true
    }

    // Real email sending would go here
    try {
      // await customerio.sendTransactionalEmail(userId, templateId, data)
      return true
    } catch (error) {
      console.error('❌ Failed to send email:', error)
      return false
    }
  }

  // Send marketing campaign
  async sendCampaign(campaign: EmailCampaign): Promise<boolean> {
    if (this.mockMode) {
      console.log('📢 [MOCK] Sending campaign:', campaign.name)
      
      // Simulate campaign delivery
      const mockMetrics = {
        sent: Math.floor(Math.random() * 1000) + 500,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        unsubscribed: 0,
        revenue: 0
      }
      
      mockMetrics.delivered = Math.floor(mockMetrics.sent * 0.95)
      mockMetrics.opened = Math.floor(mockMetrics.delivered * 0.25)
      mockMetrics.clicked = Math.floor(mockMetrics.opened * 0.1)
      mockMetrics.bounced = mockMetrics.sent - mockMetrics.delivered
      mockMetrics.unsubscribed = Math.floor(mockMetrics.opened * 0.02)
      
      campaign.metrics = mockMetrics
      campaign.status = 'sent'
      campaign.sentAt = new Date()
      
      this.storeCampaign(campaign)
      return true
    }

    // Real campaign sending
    try {
      // await customerio.sendCampaign(campaign)
      return true
    } catch (error) {
      console.error('❌ Failed to send campaign:', error)
      return false
    }
  }

  // Create email template
  createTemplate(template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>): EmailTemplate {
    const newTemplate: EmailTemplate = {
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
  getAllTemplates(): EmailTemplate[] {
    if (this.mockMode) {
      const stored = localStorage.getItem('email_templates')
      return stored ? JSON.parse(stored) : this.getDefaultTemplates()
    }
    return []
  }

  // Get campaigns
  getAllCampaigns(): EmailCampaign[] {
    if (this.mockMode) {
      const stored = localStorage.getItem('email_campaigns')
      return stored ? JSON.parse(stored) : []
    }
    return []
  }

  // Get delivery history
  getDeliveryHistory(limit: number = 100): EmailDelivery[] {
    if (this.mockMode) {
      const stored = localStorage.getItem('email_deliveries')
      const deliveries = stored ? JSON.parse(stored) : []
      return deliveries.slice(-limit).reverse()
    }
    return []
  }

  // Get campaign analytics
  getCampaignAnalytics(campaignId: string) {
    const deliveries = this.getDeliveryHistory().filter(d => d.campaignId === campaignId)
    
    return {
      sent: deliveries.length,
      delivered: deliveries.filter(d => d.status === 'delivered' || d.status === 'opened' || d.status === 'clicked').length,
      opened: deliveries.filter(d => d.status === 'opened' || d.status === 'clicked').length,
      clicked: deliveries.filter(d => d.status === 'clicked').length,
      bounced: deliveries.filter(d => d.status === 'bounced').length,
      openRate: deliveries.length > 0 ? (deliveries.filter(d => d.status === 'opened' || d.status === 'clicked').length / deliveries.length) * 100 : 0,
      clickRate: deliveries.length > 0 ? (deliveries.filter(d => d.status === 'clicked').length / deliveries.length) * 100 : 0
    }
  }

  // Export for Customer.io
  exportCampaignData(): string {
    const campaigns = this.getAllCampaigns()
    const deliveries = this.getDeliveryHistory(1000)
    
    return JSON.stringify({
      campaigns,
      deliveries,
      exportedAt: new Date().toISOString()
    }, null, 2)
  }

  // Helper methods for mock mode
  private getTemplateSubject(templateId: string, data: Record<string, any>): string {
    const templates: Record<string, string> = {
      'welcome': 'Velkommen til DrawDash, {{firstName}}!',
      'purchase_confirmation': 'Tak for dit køb - {{tickets}} billetter til {{raffleName}}',
      'winner_notification': 'Tillykke! Du har vundet {{prizeName}}',
      'win_back': 'Vi savner dig, {{firstName}} - Kom tilbage med 50% rabat',
      'weekly_newsletter': 'Ugens bedste gevinster på DrawDash',
      'bonus_notification': 'Du har modtaget en bonus: {{bonusName}}'
    }
    
    let subject = templates[templateId] || 'DrawDash Besked'
    
    // Simple template variable replacement
    Object.keys(data).forEach(key => {
      subject = subject.replace(new RegExp(`{{${key}}}`, 'g'), data[key])
    })
    
    return subject
  }

  private getDefaultTemplates(): EmailTemplate[] {
    return [
      {
        id: 'welcome',
        name: 'Velkommen Email',
        subject: 'Velkommen til DrawDash, {{firstName}}!',
        htmlContent: '<h1>Velkommen {{firstName}}!</h1><p>Tak fordi du tilmeldte dig DrawDash...</p>',
        textContent: 'Velkommen {{firstName}}! Tak fordi du tilmeldte dig DrawDash...',
        type: 'transactional',
        variables: ['firstName', 'lastName'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'purchase_confirmation',
        name: 'Købsbekræftelse',
        subject: 'Tak for dit køb - {{tickets}} billetter',
        htmlContent: '<h2>Købsbekræftelse</h2><p>Du har købt {{tickets}} billetter...</p>',
        textContent: 'Købsbekræftelse: Du har købt {{tickets}} billetter...',
        type: 'transactional',
        variables: ['tickets', 'raffleName', 'amount'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'winner_notification',
        name: 'Vinder Notifikation',
        subject: 'Tillykke! Du har vundet {{prizeName}}',
        htmlContent: '<h1>🎉 TILLYKKE!</h1><p>Du har vundet {{prizeName}}!</p>',
        textContent: 'TILLYKKE! Du har vundet {{prizeName}}!',
        type: 'transactional',
        variables: ['prizeName', 'raffleId', 'winAmount'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  }

  private storeTemplate(template: EmailTemplate): void {
    const templates = this.getAllTemplates()
    const existingIndex = templates.findIndex(t => t.id === template.id)
    
    if (existingIndex >= 0) {
      templates[existingIndex] = template
    } else {
      templates.push(template)
    }
    
    localStorage.setItem('email_templates', JSON.stringify(templates))
  }

  private storeCampaign(campaign: EmailCampaign): void {
    const campaigns = this.getAllCampaigns()
    const existingIndex = campaigns.findIndex(c => c.id === campaign.id)
    
    if (existingIndex >= 0) {
      campaigns[existingIndex] = campaign
    } else {
      campaigns.push(campaign)
    }
    
    localStorage.setItem('email_campaigns', JSON.stringify(campaigns))
  }

  private storeDelivery(delivery: EmailDelivery): void {
    const deliveries = this.getDeliveryHistory()
    deliveries.push(delivery)
    
    // Keep only last 1000 deliveries
    if (deliveries.length > 1000) {
      deliveries.splice(0, deliveries.length - 1000)
    }
    
    localStorage.setItem('email_deliveries', JSON.stringify(deliveries))
  }
}

// Singleton instance
export const emailService = new EmailService()

// Quick access functions
export const Email = {
  // Common transactional emails
  sendWelcome: (userId: string, email: string, firstName: string) =>
    emailService.sendTransactionalEmail(userId, email, 'welcome', { firstName }),
  
  sendPurchaseConfirmation: (userId: string, email: string, tickets: number, raffleName: string, amount: number) =>
    emailService.sendTransactionalEmail(userId, email, 'purchase_confirmation', { tickets, raffleName, amount }),
  
  sendWinnerNotification: (userId: string, email: string, prizeName: string, raffleId: string, winAmount?: number) =>
    emailService.sendTransactionalEmail(userId, email, 'winner_notification', { prizeName, raffleId, winAmount }),
  
  // Campaign management
  createCampaign: (campaign: Omit<EmailCampaign, 'id' | 'createdAt'>) => {
    const newCampaign: EmailCampaign = {
      id: Date.now().toString(),
      ...campaign,
      createdAt: new Date()
    }
    return newCampaign
  },
  
  sendCampaign: (campaign: EmailCampaign) => emailService.sendCampaign(campaign),
  
  // Templates
  createTemplate: (template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>) =>
    emailService.createTemplate(template),
  
  getAllTemplates: () => emailService.getAllTemplates(),
  
  // Analytics
  getCampaignAnalytics: (campaignId: string) => emailService.getCampaignAnalytics(campaignId),
  getDeliveryHistory: (limit?: number) => emailService.getDeliveryHistory(limit),
  
  // Export
  exportData: () => emailService.exportCampaignData(),
  
  // Production ready check
  isProductionReady: () => !emailService.mockMode
}
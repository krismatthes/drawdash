'use client'

// Marketing Automation Service
// Handles automated campaigns, triggers, and communication workflows

import { Email, emailService } from './emailService'
import { SMS, smsService } from './smsService'
import { CRM, crmService } from './crmService'
import { Segments } from './segmentationEngine'

export interface AutomationRule {
  id: string
  name: string
  description: string
  trigger: AutomationTrigger
  actions: AutomationAction[]
  conditions: AutomationCondition[]
  isActive: boolean
  fireCount: number
  lastFired?: Date
  createdAt: Date
  createdBy: string
}

export interface AutomationTrigger {
  type: 'event' | 'schedule' | 'segment_enter' | 'segment_exit' | 'date_based'
  event?: string
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly'
    time: string
    dayOfWeek?: number
    dayOfMonth?: number
  }
  segmentId?: string
  dateField?: string
  offsetDays?: number
}

export interface AutomationAction {
  type: 'send_email' | 'send_sms' | 'add_to_segment' | 'remove_from_segment' | 'update_user' | 'wait'
  templateId?: string
  segmentId?: string
  delayMinutes?: number
  userUpdates?: Record<string, any>
  customData?: Record<string, any>
}

export interface AutomationCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains'
  value: any
}

export interface AutomationExecution {
  id: string
  ruleId: string
  userId: string
  triggeredAt: Date
  completedAt?: Date
  status: 'running' | 'completed' | 'failed' | 'paused'
  currentStep: number
  totalSteps: number
  errorMessage?: string
  executionLog: string[]
}

class MarketingAutomationService {
  private rules: AutomationRule[] = []
  private executions: AutomationExecution[] = []
  private isRunning: boolean = false

  constructor() {
    this.loadRules()
    this.loadDefaultRules()
    console.log('🤖 Marketing Automation Service initialized with', this.rules.length, 'rules')
  }

  // Create automation rule
  createRule(rule: Omit<AutomationRule, 'id' | 'fireCount' | 'createdAt'>): AutomationRule {
    const newRule: AutomationRule = {
      id: Date.now().toString(),
      ...rule,
      fireCount: 0,
      createdAt: new Date()
    }

    this.rules.push(newRule)
    this.saveRules()
    
    console.log('🤖 Created automation rule:', newRule.name)
    return newRule
  }

  // Process automation triggers
  async processUserEvent(userId: string, event: string, properties: Record<string, any>): Promise<void> {
    const applicableRules = this.rules.filter(rule => 
      rule.isActive && 
      rule.trigger.type === 'event' && 
      rule.trigger.event === event
    )

    for (const rule of applicableRules) {
      if (this.evaluateConditions(rule.conditions, userId, properties)) {
        await this.executeRule(rule, userId, properties)
      }
    }
  }

  // Execute automation rule
  private async executeRule(rule: AutomationRule, userId: string, triggerData: Record<string, any>): Promise<void> {
    const execution: AutomationExecution = {
      id: Date.now().toString(),
      ruleId: rule.id,
      userId,
      triggeredAt: new Date(),
      status: 'running',
      currentStep: 0,
      totalSteps: rule.actions.length,
      executionLog: []
    }

    this.executions.push(execution)
    rule.fireCount++
    rule.lastFired = new Date()

    console.log(`🚀 Executing automation rule: ${rule.name} for user ${userId}`)
    execution.executionLog.push(`Started execution at ${new Date().toISOString()}`)

    try {
      for (let i = 0; i < rule.actions.length; i++) {
        const action = rule.actions[i]
        execution.currentStep = i + 1
        
        await this.executeAction(action, userId, triggerData, execution)
        execution.executionLog.push(`Completed step ${i + 1}: ${action.type}`)
      }

      execution.status = 'completed'
      execution.completedAt = new Date()
      execution.executionLog.push(`Completed execution at ${new Date().toISOString()}`)
      
    } catch (error) {
      execution.status = 'failed'
      execution.errorMessage = error instanceof Error ? error.message : 'Unknown error'
      execution.executionLog.push(`Failed at step ${execution.currentStep}: ${execution.errorMessage}`)
      console.error('❌ Automation execution failed:', error)
    }

    this.saveRules()
    this.saveExecutions()
  }

  // Execute single automation action
  private async executeAction(
    action: AutomationAction, 
    userId: string, 
    triggerData: Record<string, any>,
    execution: AutomationExecution
  ): Promise<void> {
    switch (action.type) {
      case 'send_email':
        if (action.templateId) {
          // Get user email (in real implementation, fetch from database)
          const userEmail = `user${userId}@example.com` // Mock email
          await Email.sendWelcome(userId, userEmail, triggerData.firstName || 'Bruger')
          execution.executionLog.push(`Sent email template: ${action.templateId}`)
        }
        break

      case 'send_sms':
        if (action.templateId) {
          // Get user phone (in real implementation, fetch from database)
          const userPhone = '+4512345678' // Mock phone
          await SMS.sendPurchaseConfirmation(userId, userPhone, triggerData.tickets || 1, triggerData.raffleName || 'Lodtrækning')
          execution.executionLog.push(`Sent SMS template: ${action.templateId}`)
        }
        break

      case 'add_to_segment':
        if (action.segmentId) {
          // In real implementation, add user to segment
          execution.executionLog.push(`Added user to segment: ${action.segmentId}`)
        }
        break

      case 'wait':
        if (action.delayMinutes) {
          // In real implementation, schedule next action
          execution.executionLog.push(`Waiting ${action.delayMinutes} minutes`)
          await new Promise(resolve => setTimeout(resolve, 100)) // Mock delay
        }
        break

      case 'update_user':
        if (action.userUpdates) {
          // In real implementation, update user fields
          execution.executionLog.push(`Updated user fields: ${Object.keys(action.userUpdates).join(', ')}`)
        }
        break

      default:
        execution.executionLog.push(`Unknown action type: ${action.type}`)
    }
  }

  // Evaluate automation conditions
  private evaluateConditions(conditions: AutomationCondition[], userId: string, data: Record<string, any>): boolean {
    if (conditions.length === 0) return true

    return conditions.every(condition => {
      const value = data[condition.field] || this.getUserField(userId, condition.field)
      
      switch (condition.operator) {
        case 'equals':
          return value === condition.value
        case 'not_equals':
          return value !== condition.value
        case 'greater_than':
          return Number(value) > Number(condition.value)
        case 'less_than':
          return Number(value) < Number(condition.value)
        case 'contains':
          return String(value).toLowerCase().includes(String(condition.value).toLowerCase())
        default:
          return false
      }
    })
  }

  // Get user field for condition evaluation (mock)
  private getUserField(userId: string, field: string): any {
    // In real implementation, fetch from database
    const mockUserData: Record<string, any> = {
      totalSpent: 1500,
      totalTickets: 45,
      loyaltyTier: 'silver',
      daysSinceRegistration: 30,
      daysSinceLastActivity: 2
    }
    return mockUserData[field]
  }

  // Get all automation rules
  getAllRules(): AutomationRule[] {
    return this.rules
  }

  // Get automation executions
  getExecutions(limit: number = 100): AutomationExecution[] {
    return this.executions.slice(-limit).reverse()
  }

  // Get automation analytics
  getAnalytics() {
    const activeRules = this.rules.filter(r => r.isActive)
    const recentExecutions = this.executions.filter(e => 
      e.triggeredAt.getTime() > Date.now() - (30 * 24 * 60 * 60 * 1000)
    )

    return {
      totalRules: this.rules.length,
      activeRules: activeRules.length,
      totalExecutions: this.executions.length,
      recentExecutions: recentExecutions.length,
      successRate: recentExecutions.length > 0 ? 
        (recentExecutions.filter(e => e.status === 'completed').length / recentExecutions.length) * 100 : 0,
      avgExecutionTime: recentExecutions.length > 0 ?
        recentExecutions.reduce((sum, e) => {
          if (e.completedAt) {
            return sum + (e.completedAt.getTime() - e.triggeredAt.getTime())
          }
          return sum
        }, 0) / recentExecutions.filter(e => e.completedAt).length : 0,
      ruleFireCounts: activeRules.map(r => ({
        ruleName: r.name,
        fireCount: r.fireCount
      }))
    }
  }

  // Load default automation rules
  private loadDefaultRules(): void {
    const defaultRules = this.getDefaultRules()
    
    defaultRules.forEach(rule => {
      const exists = this.rules.some(r => r.name === rule.name)
      if (!exists) {
        this.rules.push({
          ...rule,
          id: Date.now().toString() + Math.random(),
          fireCount: 0,
          createdAt: new Date()
        })
      }
    })
    
    this.saveRules()
  }

  // Default automation rules
  private getDefaultRules(): Omit<AutomationRule, 'id' | 'fireCount' | 'createdAt'>[] {
    return [
      {
        name: 'Velkomst E-mail Serie',
        description: 'Send velkomst e-mail til nye brugere',
        trigger: {
          type: 'event',
          event: 'user_registered'
        },
        actions: [
          {
            type: 'send_email',
            templateId: 'welcome'
          },
          {
            type: 'wait',
            delayMinutes: 1440 // 24 timer
          },
          {
            type: 'send_email',
            templateId: 'getting_started'
          }
        ],
        conditions: [],
        isActive: true,
        createdBy: 'System'
      },
      {
        name: 'Første Køb Bekræftelse',
        description: 'Send bekræftelse når bruger køber første gang',
        trigger: {
          type: 'event',
          event: 'first_purchase'
        },
        actions: [
          {
            type: 'send_email',
            templateId: 'purchase_confirmation'
          },
          {
            type: 'send_sms',
            templateId: 'purchase_confirmation'
          }
        ],
        conditions: [],
        isActive: true,
        createdBy: 'System'
      },
      {
        name: 'Vinder Notifikation',
        description: 'Send notifikation til vindere',
        trigger: {
          type: 'event',
          event: 'raffle_win'
        },
        actions: [
          {
            type: 'send_email',
            templateId: 'winner_notification'
          },
          {
            type: 'send_sms',
            templateId: 'winner_notification'
          },
          {
            type: 'add_to_segment',
            segmentId: 'winners'
          }
        ],
        conditions: [],
        isActive: true,
        createdBy: 'System'
      },
      {
        name: 'Inaktive Bruger Reaktivering',
        description: 'Send win-back kampagne til inaktive brugere',
        trigger: {
          type: 'segment_enter',
          segmentId: 'at_risk'
        },
        actions: [
          {
            type: 'send_email',
            templateId: 'win_back'
          }
        ],
        conditions: [
          {
            field: 'totalSpent',
            operator: 'greater_than',
            value: 500
          }
        ],
        isActive: true,
        createdBy: 'System'
      },
      {
        name: 'VIP Velkomst',
        description: 'Speciel velkomst til high-roller segmentet',
        trigger: {
          type: 'segment_enter',
          segmentId: 'high_rollers'
        },
        actions: [
          {
            type: 'send_email',
            templateId: 'vip_welcome'
          },
          {
            type: 'update_user',
            userUpdates: {
              vipStatus: true,
              personalAccountManager: true
            }
          }
        ],
        conditions: [],
        isActive: true,
        createdBy: 'System'
      },
      {
        name: 'Ugentlig Newsletter',
        description: 'Send ugentlig newsletter til aktive brugere',
        trigger: {
          type: 'schedule',
          schedule: {
            frequency: 'weekly',
            time: '10:00',
            dayOfWeek: 1 // Mandag
          }
        },
        actions: [
          {
            type: 'send_email',
            templateId: 'weekly_newsletter'
          }
        ],
        conditions: [
          {
            field: 'daysSinceLastActivity',
            operator: 'less_than',
            value: 30
          },
          {
            field: 'communicationPreferences.marketing',
            operator: 'equals',
            value: true
          }
        ],
        isActive: true,
        createdBy: 'System'
      }
    ]
  }

  // Manual trigger for testing
  async triggerRule(ruleId: string, userId: string, testData?: Record<string, any>): Promise<AutomationExecution> {
    const rule = this.rules.find(r => r.id === ruleId)
    if (!rule) {
      throw new Error(`Rule ${ruleId} not found`)
    }

    console.log(`🧪 Manual trigger for rule: ${rule.name}`)
    
    const execution: AutomationExecution = {
      id: Date.now().toString(),
      ruleId: rule.id,
      userId,
      triggeredAt: new Date(),
      status: 'running',
      currentStep: 0,
      totalSteps: rule.actions.length,
      executionLog: [`Manual trigger by admin for testing`]
    }

    this.executions.push(execution)

    try {
      for (let i = 0; i < rule.actions.length; i++) {
        const action = rule.actions[i]
        execution.currentStep = i + 1
        
        // Execute action (simplified for mock mode)
        switch (action.type) {
          case 'send_email':
            execution.executionLog.push(`[MOCK] Would send email template: ${action.templateId}`)
            break
          case 'send_sms':
            execution.executionLog.push(`[MOCK] Would send SMS template: ${action.templateId}`)
            break
          case 'wait':
            execution.executionLog.push(`[MOCK] Would wait ${action.delayMinutes} minutes`)
            break
          default:
            execution.executionLog.push(`[MOCK] Would execute: ${action.type}`)
        }
      }

      execution.status = 'completed'
      execution.completedAt = new Date()
      rule.fireCount++
      rule.lastFired = new Date()

    } catch (error) {
      execution.status = 'failed'
      execution.errorMessage = error instanceof Error ? error.message : 'Unknown error'
    }

    this.saveRules()
    this.saveExecutions()
    
    return execution
  }

  // Evaluate conditions
  private evaluateConditions(conditions: AutomationCondition[], userId: string, data: Record<string, any>): boolean {
    if (conditions.length === 0) return true

    return conditions.every(condition => {
      const value = data[condition.field] || this.getUserField(userId, condition.field)
      
      switch (condition.operator) {
        case 'equals':
          return value === condition.value
        case 'not_equals':
          return value !== condition.value
        case 'greater_than':
          return Number(value) > Number(condition.value)
        case 'less_than':
          return Number(value) < Number(condition.value)
        case 'contains':
          return String(value).toLowerCase().includes(String(condition.value).toLowerCase())
        default:
          return false
      }
    })
  }

  // Mock user field getter
  private getUserField(userId: string, field: string): any {
    const mockData: Record<string, any> = {
      totalSpent: Math.floor(Math.random() * 5000) + 500,
      totalTickets: Math.floor(Math.random() * 100) + 10,
      loyaltyTier: ['bronze', 'silver', 'gold'][Math.floor(Math.random() * 3)],
      daysSinceLastActivity: Math.floor(Math.random() * 60),
      'communicationPreferences.marketing': Math.random() > 0.3
    }
    return mockData[field]
  }

  // Pause/resume automation
  pauseRule(ruleId: string): void {
    const rule = this.rules.find(r => r.id === ruleId)
    if (rule) {
      rule.isActive = false
      this.saveRules()
      console.log(`⏸️ Paused automation rule: ${rule.name}`)
    }
  }

  resumeRule(ruleId: string): void {
    const rule = this.rules.find(r => r.id === ruleId)
    if (rule) {
      rule.isActive = true
      this.saveRules()
      console.log(`▶️ Resumed automation rule: ${rule.name}`)
    }
  }

  // Delete automation rule
  deleteRule(ruleId: string): boolean {
    const index = this.rules.findIndex(r => r.id === ruleId)
    if (index >= 0) {
      const deletedRule = this.rules.splice(index, 1)[0]
      this.saveRules()
      console.log(`🗑️ Deleted automation rule: ${deletedRule.name}`)
      return true
    }
    return false
  }

  // Export automation data
  exportData(): string {
    return JSON.stringify({
      rules: this.rules,
      executions: this.executions.slice(-100), // Last 100 executions
      exportedAt: new Date().toISOString()
    }, null, 2)
  }

  // Storage helpers
  private loadRules(): void {
    const stored = localStorage.getItem('automation_rules')
    this.rules = stored ? JSON.parse(stored) : []
  }

  private saveRules(): void {
    localStorage.setItem('automation_rules', JSON.stringify(this.rules))
  }

  private saveExecutions(): void {
    localStorage.setItem('automation_executions', JSON.stringify(this.executions))
  }
}

// Singleton instance
export const marketingAutomation = new MarketingAutomationService()

// Quick access functions for common automations
export const Automation = {
  // Event triggers
  onUserRegistered: (userId: string, data: Record<string, any>) =>
    marketingAutomation.processUserEvent(userId, 'user_registered', data),
  
  onFirstPurchase: (userId: string, data: Record<string, any>) =>
    marketingAutomation.processUserEvent(userId, 'first_purchase', data),
  
  onPurchase: (userId: string, data: Record<string, any>) =>
    marketingAutomation.processUserEvent(userId, 'purchase', data),
  
  onRaffleWin: (userId: string, data: Record<string, any>) =>
    marketingAutomation.processUserEvent(userId, 'raffle_win', data),
  
  onLogin: (userId: string, data: Record<string, any>) =>
    marketingAutomation.processUserEvent(userId, 'user_login', data),

  // Rule management
  createRule: (rule: Omit<AutomationRule, 'id' | 'fireCount' | 'createdAt'>) =>
    marketingAutomation.createRule(rule),
  
  getAllRules: () => marketingAutomation.getAllRules(),
  
  triggerRule: (ruleId: string, userId: string, testData?: Record<string, any>) =>
    marketingAutomation.triggerRule(ruleId, userId, testData),
  
  pauseRule: (ruleId: string) => marketingAutomation.pauseRule(ruleId),
  resumeRule: (ruleId: string) => marketingAutomation.resumeRule(ruleId),
  deleteRule: (ruleId: string) => marketingAutomation.deleteRule(ruleId),
  
  // Analytics
  getAnalytics: () => marketingAutomation.getAnalytics(),
  getExecutions: (limit?: number) => marketingAutomation.getExecutions(limit),
  
  // Export
  export: () => marketingAutomation.exportData()
}
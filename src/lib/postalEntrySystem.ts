'use client'

interface PostalEntry {
  id: string
  raffleId: string
  participantInfo: {
    name: string
    email: string
    phone?: string
    address: {
      street: string
      city: string
      postalCode: string
      country: string
    }
  }
  postcardInfo: {
    receivedDate: Date
    postmarkDate?: Date
    legible: boolean
    completeInformation: boolean
    matchesAccount: boolean
  }
  processingStatus: 'pending' | 'verified' | 'rejected' | 'entered'
  ticketNumbers: number[]
  rejectionReason?: string
  processedBy?: string
  processedAt?: Date
  entryDeadline: Date
  drawDeadline: Date
}

interface PostalEntryStats {
  totalReceived: number
  verified: number
  rejected: number
  pending: number
  enteredInDraws: number
}

export class PostalEntrySystem {
  private static instance: PostalEntrySystem
  private postalEntries: PostalEntry[] = []

  private constructor() {
    this.loadEntries()
  }

  static getInstance(): PostalEntrySystem {
    if (!PostalEntrySystem.instance) {
      PostalEntrySystem.instance = new PostalEntrySystem()
    }
    return PostalEntrySystem.instance
  }

  // Register a new postal entry
  registerPostalEntry(entryData: {
    raffleId: string
    name: string
    email: string
    phone?: string
    address: {
      street: string
      city: string
      postalCode: string
      country: string
    }
    receivedDate: Date
    postmarkDate?: Date
    entryDeadline: Date
    drawDeadline: Date
  }): PostalEntry {
    const entry: PostalEntry = {
      id: `postal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      raffleId: entryData.raffleId,
      participantInfo: {
        name: entryData.name,
        email: entryData.email,
        phone: entryData.phone,
        address: entryData.address
      },
      postcardInfo: {
        receivedDate: entryData.receivedDate,
        postmarkDate: entryData.postmarkDate,
        legible: true, // To be verified manually
        completeInformation: true, // To be verified manually
        matchesAccount: false // To be verified against user accounts
      },
      processingStatus: 'pending',
      ticketNumbers: [],
      entryDeadline: entryData.entryDeadline,
      drawDeadline: entryData.drawDeadline
    }

    this.postalEntries.push(entry)
    this.saveEntries()

    return entry
  }

  // Verify postal entry against user account
  async verifyPostalEntry(entryId: string, userAccountData?: any): Promise<boolean> {
    const entry = this.postalEntries.find(e => e.id === entryId)
    if (!entry) return false

    // Check if received before deadline
    if (entry.postcardInfo.receivedDate > entry.entryDeadline) {
      this.rejectEntry(entryId, 'Received after entry deadline')
      return false
    }

    // Check postmark if available
    if (entry.postcardInfo.postmarkDate && entry.postcardInfo.postmarkDate > entry.entryDeadline) {
      this.rejectEntry(entryId, 'Postmarked after entry deadline')
      return false
    }

    // Verify against user account (if provided)
    if (userAccountData) {
      const addressMatch = this.compareAddresses(entry.participantInfo.address, userAccountData.address)
      const emailMatch = entry.participantInfo.email.toLowerCase() === userAccountData.email.toLowerCase()
      const nameMatch = this.compareNames(entry.participantInfo.name, userAccountData.name)

      if (!addressMatch || !emailMatch || !nameMatch) {
        this.rejectEntry(entryId, 'Information does not match user account')
        return false
      }

      entry.postcardInfo.matchesAccount = true
    }

    // All checks passed
    entry.processingStatus = 'verified'
    entry.processedAt = new Date()
    this.saveEntries()

    return true
  }

  // Enter verified postal entries into raffle draw
  enterIntoDrawPool(raffleId: string): PostalEntry[] {
    const verifiedEntries = this.postalEntries.filter(e => 
      e.raffleId === raffleId && 
      e.processingStatus === 'verified' &&
      e.postcardInfo.receivedDate <= e.drawDeadline
    )

    // Assign ticket numbers
    let nextTicketNumber = this.getNextTicketNumber(raffleId)
    
    verifiedEntries.forEach(entry => {
      entry.ticketNumbers = [nextTicketNumber]
      entry.processingStatus = 'entered'
      nextTicketNumber++
    })

    this.saveEntries()
    return verifiedEntries
  }

  // Reject postal entry
  rejectEntry(entryId: string, reason: string, processedBy: string = 'System'): boolean {
    const entry = this.postalEntries.find(e => e.id === entryId)
    if (!entry) return false

    entry.processingStatus = 'rejected'
    entry.rejectionReason = reason
    entry.processedBy = processedBy
    entry.processedAt = new Date()

    this.saveEntries()
    return true
  }

  // Get statistics
  getPostalEntryStats(raffleId?: string): PostalEntryStats {
    const entries = raffleId 
      ? this.postalEntries.filter(e => e.raffleId === raffleId)
      : this.postalEntries

    return {
      totalReceived: entries.length,
      verified: entries.filter(e => e.processingStatus === 'verified').length,
      rejected: entries.filter(e => e.processingStatus === 'rejected').length,
      pending: entries.filter(e => e.processingStatus === 'pending').length,
      enteredInDraws: entries.filter(e => e.processingStatus === 'entered').length
    }
  }

  // Get entries for processing
  getPendingEntries(raffleId?: string): PostalEntry[] {
    let entries = this.postalEntries.filter(e => e.processingStatus === 'pending')
    
    if (raffleId) {
      entries = entries.filter(e => e.raffleId === raffleId)
    }

    return entries.sort((a, b) => a.postcardInfo.receivedDate.getTime() - b.postcardInfo.receivedDate.getTime())
  }

  getEntriesForDraw(raffleId: string): PostalEntry[] {
    return this.postalEntries.filter(e => 
      e.raffleId === raffleId && 
      e.processingStatus === 'entered'
    )
  }

  // Utility methods
  private compareAddresses(addr1: any, addr2: any): boolean {
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '')
    
    return (
      normalize(addr1.street) === normalize(addr2.street) &&
      normalize(addr1.city) === normalize(addr2.city) &&
      normalize(addr1.postalCode) === normalize(addr2.postalCode) &&
      normalize(addr1.country) === normalize(addr2.country)
    )
  }

  private compareNames(name1: string, name2: string): boolean {
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z]/g, '')
    return normalize(name1) === normalize(name2)
  }

  private getNextTicketNumber(raffleId: string): number {
    // In production, this would coordinate with the main ticket numbering system
    const existingTickets = this.postalEntries
      .filter(e => e.raffleId === raffleId && e.ticketNumbers.length > 0)
      .flatMap(e => e.ticketNumbers)
    
    return existingTickets.length > 0 ? Math.max(...existingTickets) + 1 : 1000000 // Start postal entries at 1M
  }

  // Export methods for compliance
  exportPostalEntryReport(raffleId?: string): string {
    const entries = raffleId 
      ? this.postalEntries.filter(e => e.raffleId === raffleId)
      : this.postalEntries

    const report = {
      generatedAt: new Date().toISOString(),
      raffleId: raffleId || 'all',
      entries: entries.map(entry => ({
        ...entry,
        // Anonymize for export
        participantInfo: {
          ...entry.participantInfo,
          email: entry.participantInfo.email.replace(/(.{2}).*(@.*)/, '$1***$2'),
          phone: entry.participantInfo.phone ? '***-***-' + entry.participantInfo.phone.slice(-4) : undefined
        }
      })),
      stats: this.getPostalEntryStats(raffleId),
      compliance: {
        equalTreatment: 'All postal entries receive same draw treatment as paid entries',
        deadlineEnforcement: 'Strict deadline enforcement ensures fairness',
        verificationProcess: 'Manual verification against user accounts required'
      }
    }

    return JSON.stringify(report, null, 2)
  }

  // Automated processing helpers
  async processReceivedPostcards(): Promise<{processed: number, errors: string[]}> {
    const pendingEntries = this.getPendingEntries()
    let processed = 0
    const errors: string[] = []

    for (const entry of pendingEntries) {
      try {
        // Check basic requirements
        if (!entry.postcardInfo.legible) {
          this.rejectEntry(entry.id, 'Postcard not legible')
          continue
        }

        if (!entry.postcardInfo.completeInformation) {
          this.rejectEntry(entry.id, 'Incomplete information provided')
          continue
        }

        // Try to find matching user account
        const userAccount = await this.findMatchingUserAccount(entry.participantInfo.email)
        
        if (userAccount) {
          const verified = await this.verifyPostalEntry(entry.id, userAccount)
          if (verified) {
            processed++
          }
        } else {
          this.rejectEntry(entry.id, 'No matching DrawDash account found')
        }
      } catch (error) {
        errors.push(`Error processing entry ${entry.id}: ${error}`)
      }
    }

    return { processed, errors }
  }

  private async findMatchingUserAccount(email: string): Promise<any | null> {
    // In production, this would query the user database
    // For now, return mock data to simulate account lookup
    return {
      email: email,
      name: 'Mock User',
      address: {
        street: 'Mock Street 123',
        city: 'Mock City',
        postalCode: '12345',
        country: 'Denmark'
      }
    }
  }

  private loadEntries(): void {
    if (typeof window === 'undefined') return

    const stored = localStorage.getItem('drawdash_postal_entries')
    if (stored) {
      this.postalEntries = JSON.parse(stored).map((entry: any) => ({
        ...entry,
        postcardInfo: {
          ...entry.postcardInfo,
          receivedDate: new Date(entry.postcardInfo.receivedDate),
          postmarkDate: entry.postcardInfo.postmarkDate ? new Date(entry.postcardInfo.postmarkDate) : undefined
        },
        entryDeadline: new Date(entry.entryDeadline),
        drawDeadline: new Date(entry.drawDeadline),
        processedAt: entry.processedAt ? new Date(entry.processedAt) : undefined
      }))
    }
  }

  private saveEntries(): void {
    if (typeof window === 'undefined') return

    localStorage.setItem('drawdash_postal_entries', JSON.stringify(this.postalEntries))
  }
}

export const postalEntrySystem = PostalEntrySystem.getInstance()
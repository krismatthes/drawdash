'use client'

interface DrawSeed {
  publicSeed: string
  privateSeed: string
  timestamp: number
  blockHash?: string
}

interface DrawResult {
  winningNumber: number
  seed: DrawSeed
  proof: string
  timestamp: number
  drawId: string
}

interface DrawAuditLog {
  drawId: string
  raffleId: string
  method: 'crypto' | 'external'
  seed: DrawSeed
  result: number
  totalTickets: number
  participantCount: number
  timestamp: number
  verification: {
    seedHash: string
    resultHash: string
    videoUrl?: string
    witnessSignature?: string
  }
}

export class SecureRNG {
  private static instance: SecureRNG
  private auditLogs: DrawAuditLog[] = []

  private constructor() {
    this.loadAuditLogs()
  }

  static getInstance(): SecureRNG {
    if (!SecureRNG.instance) {
      SecureRNG.instance = new SecureRNG()
    }
    return SecureRNG.instance
  }

  private async generateCryptoRandom(): Promise<number> {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      // Browser environment
      const array = new Uint32Array(1)
      window.crypto.getRandomValues(array)
      return array[0] / (0xFFFFFFFF + 1)
    } else {
      // Node.js environment
      const crypto = await import('crypto')
      const buffer = crypto.randomBytes(4)
      return buffer.readUInt32BE(0) / (0xFFFFFFFF + 1)
    }
  }

  private async generateSecureSeed(): Promise<DrawSeed> {
    // Generate public seed from current timestamp and crypto random
    const timestamp = Date.now()
    const randomBytes = await this.generateCryptoRandom()
    
    // Public seed - visible to all participants before draw
    const publicSeed = `${timestamp}-${Math.floor(randomBytes * 1000000)}`
    
    // Private seed - only revealed after draw
    const privateSeed = await this.hash(`${publicSeed}-${await this.generateCryptoRandom()}-${timestamp}`)
    
    // Optional: Use external randomness source (e.g., latest Bitcoin block hash)
    let blockHash: string | undefined
    try {
      // In production, fetch from blockchain API
      blockHash = await this.getLatestBlockHash()
    } catch {
      // Fallback if external source unavailable
      blockHash = undefined
    }

    return {
      publicSeed,
      privateSeed,
      timestamp,
      blockHash
    }
  }

  private async getLatestBlockHash(): Promise<string> {
    // In production, implement actual blockchain API call
    // For now, return a mock hash
    return `000000000000000${Math.floor(Math.random() * 10000000).toString(16)}`
  }

  private async hash(input: string): Promise<string> {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      // Browser environment
      const encoder = new TextEncoder()
      const data = encoder.encode(input)
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    } else {
      // Node.js environment
      const crypto = await import('crypto')
      return crypto.createHash('sha256').update(input).digest('hex')
    }
  }

  async conductProvableFairDraw(
    raffleId: string,
    totalTickets: number,
    participantCount: number,
    options: {
      preCommittedSeed?: string
      externalWitness?: boolean
      recordVideo?: boolean
    } = {}
  ): Promise<DrawResult> {
    const drawId = `draw_${raffleId}_${Date.now()}`
    
    // Generate or use pre-committed seed
    const seed = options.preCommittedSeed 
      ? await this.reconstructSeed(options.preCommittedSeed)
      : await this.generateSecureSeed()

    // Combine all entropy sources
    const combinedInput = `${seed.publicSeed}-${seed.privateSeed}-${seed.blockHash || ''}-${totalTickets}-${participantCount}`
    const finalHash = await this.hash(combinedInput)
    
    // Convert hash to winning number (1 to totalTickets)
    const hashNum = parseInt(finalHash.substring(0, 8), 16)
    const winningNumber = (hashNum % totalTickets) + 1

    // Generate proof
    const proof = await this.generateProof(seed, finalHash, winningNumber)

    const result: DrawResult = {
      winningNumber,
      seed,
      proof,
      timestamp: Date.now(),
      drawId
    }

    // Create audit log
    await this.logDraw(raffleId, drawId, seed, winningNumber, totalTickets, participantCount)

    return result
  }

  private async reconstructSeed(preCommittedSeed: string): Promise<DrawSeed> {
    // Reconstruct seed from pre-committed data
    // This would be used when seeds are published in advance
    const parts = preCommittedSeed.split('-')
    return {
      publicSeed: parts[0] + '-' + parts[1],
      privateSeed: parts[2],
      timestamp: parseInt(parts[3]),
      blockHash: parts[4] || undefined
    }
  }

  private async generateProof(seed: DrawSeed, finalHash: string, result: number): Promise<string> {
    const proofData = {
      publicSeed: seed.publicSeed,
      privateSeed: seed.privateSeed,
      blockHash: seed.blockHash,
      finalHash,
      result,
      timestamp: seed.timestamp
    }
    
    return btoa(JSON.stringify(proofData))
  }

  async verifyDraw(drawResult: DrawResult, totalTickets: number, participantCount: number): Promise<boolean> {
    try {
      // Recreate the draw with same parameters
      const combinedInput = `${drawResult.seed.publicSeed}-${drawResult.seed.privateSeed}-${drawResult.seed.blockHash || ''}-${totalTickets}-${participantCount}`
      const finalHash = await this.hash(combinedInput)
      const hashNum = parseInt(finalHash.substring(0, 8), 16)
      const expectedWinning = (hashNum % totalTickets) + 1

      return expectedWinning === drawResult.winningNumber
    } catch {
      return false
    }
  }

  private async logDraw(
    raffleId: string,
    drawId: string,
    seed: DrawSeed,
    result: number,
    totalTickets: number,
    participantCount: number
  ): Promise<void> {
    const seedHash = await this.hash(JSON.stringify(seed))
    const resultHash = await this.hash(`${result}-${totalTickets}-${participantCount}`)

    const auditLog: DrawAuditLog = {
      drawId,
      raffleId,
      method: 'crypto',
      seed,
      result,
      totalTickets,
      participantCount,
      timestamp: Date.now(),
      verification: {
        seedHash,
        resultHash
      }
    }

    this.auditLogs.push(auditLog)
    this.saveAuditLogs()
  }

  private loadAuditLogs(): void {
    if (typeof window === 'undefined') return
    
    const stored = localStorage.getItem('drawdash_audit_logs')
    if (stored) {
      this.auditLogs = JSON.parse(stored)
    }
  }

  private saveAuditLogs(): void {
    if (typeof window === 'undefined') return
    
    localStorage.setItem('drawdash_audit_logs', JSON.stringify(this.auditLogs))
  }

  getAuditLogs(raffleId?: string): DrawAuditLog[] {
    if (raffleId) {
      return this.auditLogs.filter(log => log.raffleId === raffleId)
    }
    return this.auditLogs
  }

  async exportAuditLog(raffleId: string): Promise<string> {
    const logs = this.getAuditLogs(raffleId)
    const exportData = {
      raffleId,
      exportTimestamp: new Date().toISOString(),
      draws: logs,
      verification: 'All draws can be independently verified using the provided seeds and hashes'
    }
    
    return JSON.stringify(exportData, null, 2)
  }

  // Pre-commit seed publication (for transparency)
  async publishDrawSeed(raffleId: string, drawTime: Date): Promise<string> {
    const seed = await this.generateSecureSeed()
    const commitment = await this.hash(JSON.stringify(seed))
    
    // In production, this would be published to a public ledger or website
    console.log(`Draw commitment for raffle ${raffleId}: ${commitment}`)
    
    // Store commitment for later verification
    localStorage.setItem(`seed_commitment_${raffleId}`, JSON.stringify({
      commitment,
      seed,
      drawTime: drawTime.toISOString(),
      published: new Date().toISOString()
    }))
    
    return commitment
  }
}

// Singleton instance
export const secureRNG = SecureRNG.getInstance()
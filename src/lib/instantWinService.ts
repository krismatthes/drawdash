export interface InstantWinConfig {
  totalPrizes: number
  prizeDistribution: {
    grandPrize: { count: number; value: number; name: string }
    majorPrizes: { count: number; value: number; name: string }
    minorPrizes: { count: number; value: number; name: string }
  }
  overallWinRate: number // Percentage (e.g., 15 = 15% chance to win)
}

export interface InstantWinResult {
  isWinner: boolean
  prizeWon?: {
    type: 'grand' | 'major' | 'minor'
    value: number
    name: string
  }
  timestamp: Date
  entryId: string
}

export class InstantWinService {
  private static readonly DEFAULT_CONFIG: InstantWinConfig = {
    totalPrizes: 1000,
    prizeDistribution: {
      grandPrize: { count: 1, value: 15999, name: 'iPhone 15 Pro Max' },
      majorPrizes: { count: 10, value: 500, name: '500 kr kontant' },
      minorPrizes: { count: 100, value: 50, name: '50 kr rabat' }
    },
    overallWinRate: 12 // 12% win rate
  }

  static generateInstantWinResult(
    raffleId: string,
    userId: string,
    entryId: string,
    config: InstantWinConfig = this.DEFAULT_CONFIG,
    entryType: 'paid' | 'free' = 'paid'
  ): InstantWinResult {
    // Create deterministic but unpredictable seed based on raffle, user, and entry
    // NOTE: entryType is NOT used in calculation - free and paid entries have identical odds
    const seed = this.createSeed(raffleId, userId, entryId)
    const random = this.seededRandom(seed)
    
    // Determine if this entry wins based on overall win rate
    // IMPORTANT: Both free and paid entries use the same win rate
    const winChance = random() * 100
    const isWinner = winChance < config.overallWinRate
    
    if (!isWinner) {
      return {
        isWinner: false,
        timestamp: new Date(),
        entryId
      }
    }

    // Determine prize tier using weighted distribution
    const prizeRandom = random() * 100
    
    let prizeWon: InstantWinResult['prizeWon']
    
    // Grand prize: 1% of all wins (very rare)
    if (prizeRandom < 1) {
      prizeWon = {
        type: 'grand',
        value: config.prizeDistribution.grandPrize.value,
        name: config.prizeDistribution.grandPrize.name
      }
    }
    // Major prizes: 9% of all wins
    else if (prizeRandom < 10) {
      prizeWon = {
        type: 'major',
        value: config.prizeDistribution.majorPrizes.value,
        name: config.prizeDistribution.majorPrizes.name
      }
    }
    // Minor prizes: 90% of all wins
    else {
      prizeWon = {
        type: 'minor',
        value: config.prizeDistribution.minorPrizes.value,
        name: config.prizeDistribution.minorPrizes.name
      }
    }

    return {
      isWinner: true,
      prizeWon,
      timestamp: new Date(),
      entryId
    }
  }

  private static createSeed(raffleId: string, userId: string, entryId: string): number {
    // Create a hash-like seed from the combined IDs
    const combined = `${raffleId}-${userId}-${entryId}`
    let hash = 0
    
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    
    return Math.abs(hash)
  }

  private static seededRandom(seed: number): () => number {
    // Linear congruential generator for deterministic randomness
    let current = seed
    
    return function() {
      current = (current * 1664525 + 1013904223) % 4294967296
      return current / 4294967296
    }
  }

  static getWinOdds(config: InstantWinConfig = this.DEFAULT_CONFIG): string {
    return `1 af ${Math.round(100 / config.overallWinRate)}`
  }

  static getRemainingPrizes(raffleId: string, config: InstantWinConfig = this.DEFAULT_CONFIG): {
    grand: number
    major: number
    minor: number
    total: number
  } {
    // In a real implementation, this would query the database
    // For demo purposes, return static values
    return {
      grand: 1,
      major: 8,
      minor: 75,
      total: 84
    }
  }

  static calculateInstantWinStats(entries: any[]): {
    totalWins: number
    totalWinValue: number
    winRate: number
  } {
    const wins = entries.filter(entry => entry.instantWinResult?.isWinner)
    const totalWinValue = wins.reduce((sum, entry) => 
      sum + (entry.instantWinResult?.prizeWon?.value || 0), 0
    )

    return {
      totalWins: wins.length,
      totalWinValue,
      winRate: entries.length > 0 ? (wins.length / entries.length) * 100 : 0
    }
  }
}
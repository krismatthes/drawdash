import { LOYALTY_TIERS, LOYALTY_SETTINGS, LoyaltyTier, PointsCalculation, PointsRedemption } from '@/types/loyalty'

export class LoyaltyCalculator {
  /**
   * Calculate points earned for a purchase
   */
  static calculatePointsEarned(
    amount: number,
    ticketQuantity: number,
    userTier: 'bronze' | 'silver' | 'gold' | 'diamond' = 'bronze'
  ): PointsCalculation {
    const tier = LOYALTY_TIERS[userTier]
    const basePoints = Math.floor(amount * LOYALTY_SETTINGS.POINTS_PER_KRONER)
    const tierMultiplier = tier.pointsMultiplier
    
    // Apply tier multiplier
    const tierBonusPoints = Math.floor(basePoints * tierMultiplier) - basePoints
    
    // Apply amount bonus (new system)
    let amountBonusPercentage = 0
    for (const [minAmount, bonus] of Object.entries(LOYALTY_SETTINGS.AMOUNT_BONUSES)) {
      if (amount >= parseInt(minAmount)) {
        amountBonusPercentage = bonus
      }
    }
    
    const totalWithTier = Math.floor(basePoints * tierMultiplier)
    const amountBonus = Math.floor(totalWithTier * amountBonusPercentage)
    const totalPoints = totalWithTier + amountBonus
    
    const breakdown: PointsCalculation['breakdown'] = {
      base: `${basePoints} points (${amount} kr × ${LOYALTY_SETTINGS.POINTS_PER_KRONER})`
    }
    
    if (tierBonusPoints > 0) {
      breakdown.tierBonus = `+${tierBonusPoints} points (${tier.name} ${Math.round((tierMultiplier - 1) * 100)}% bonus)`
    }
    
    if (amountBonus > 0) {
      breakdown.quantityBonus = `+${amountBonus} points (${amount}+ kr køb ${Math.round(amountBonusPercentage * 100)}% bonus)`
    }
    
    return {
      basePoints,
      tierMultiplier,
      quantityBonus: amountBonus,
      totalPoints,
      breakdown
    }
  }

  /**
   * Calculate points redemption for a given amount
   */
  static calculatePointsRedemption(
    userPoints: number,
    cartAmount: number,
    pointsToRedeem: number
  ): PointsRedemption {
    const maxRedeemableAmount = Math.floor(cartAmount * (LOYALTY_SETTINGS.MAX_REDEMPTION_PERCENTAGE / 100))
    const maxRedeemablePoints = Math.min(
      userPoints,
      maxRedeemableAmount * LOYALTY_SETTINGS.REDEMPTION_RATE
    )
    
    const actualPointsToRedeem = Math.min(pointsToRedeem, maxRedeemablePoints)
    const discountAmount = Math.floor(actualPointsToRedeem / LOYALTY_SETTINGS.REDEMPTION_RATE)
    const remainingPoints = userPoints - actualPointsToRedeem
    
    return {
      pointsToRedeem: actualPointsToRedeem,
      discountAmount,
      remainingPoints,
      maxRedeemable: maxRedeemablePoints,
      redemptionRate: LOYALTY_SETTINGS.REDEMPTION_RATE
    }
  }

  /**
   * Get user's loyalty tier based on total spent
   */
  static getUserTier(totalSpent: number): LoyaltyTier {
    const tiers = Object.values(LOYALTY_TIERS).sort((a, b) => b.minSpent - a.minSpent)
    return tiers.find(tier => totalSpent >= tier.minSpent) || LOYALTY_TIERS.bronze
  }

  /**
   * Get next tier and progress towards it
   */
  static getNextTierProgress(totalSpent: number): {
    currentTier: LoyaltyTier
    nextTier: LoyaltyTier | null
    progress: number
    remaining: number
  } {
    const currentTier = this.getUserTier(totalSpent)
    const allTiers = Object.values(LOYALTY_TIERS).sort((a, b) => a.minSpent - b.minSpent)
    
    const currentIndex = allTiers.findIndex(tier => tier.tier === currentTier.tier)
    const nextTier = currentIndex < allTiers.length - 1 ? allTiers[currentIndex + 1] : null
    
    if (!nextTier) {
      return {
        currentTier,
        nextTier: null,
        progress: 100,
        remaining: 0
      }
    }
    
    const progress = Math.min(100, (totalSpent / nextTier.minSpent) * 100)
    const remaining = Math.max(0, nextTier.minSpent - totalSpent)
    
    return {
      currentTier,
      nextTier,
      progress,
      remaining
    }
  }

  /**
   * Format points for display
   */
  static formatPoints(points: number): string {
    if (points >= 1000000) {
      return `${(points / 1000000).toFixed(1)}M`
    } else if (points >= 1000) {
      return `${(points / 1000).toFixed(1)}K`
    }
    return points.toLocaleString('da-DK')
  }

  /**
   * Format currency for display
   */
  static formatCurrency(amount: number): string {
    return `${amount.toLocaleString('da-DK')} kr`
  }

  /**
   * Get tier color with opacity
   */
  static getTierColor(tier: string, opacity: number = 1): string {
    const tierData = LOYALTY_TIERS[tier]
    if (!tierData) return LOYALTY_TIERS.bronze.color
    
    if (opacity === 1) return tierData.color
    
    // Convert hex to rgb with opacity
    const hex = tierData.color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
  }
}
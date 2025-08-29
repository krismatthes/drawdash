export interface LoyaltyTier {
  tier: 'bronze' | 'silver' | 'gold' | 'diamond'
  name: string
  minSpent: number
  pointsMultiplier: number
  benefits: {
    description: string
    features: string[]
  }
  color: string
  icon: string
  createdAt?: Date
}

export interface PointTransaction {
  id: string
  userId: string
  raffleEntryId?: string
  type: 'earned' | 'redeemed' | 'bonus' | 'refunded'
  points: number
  description: string
  metadata?: {
    basePoints?: number
    tierMultiplier?: number
    quantityBonus?: number
    ticketQuantity?: number
    tier?: string
    redemptionAmount?: number
    [key: string]: any
  }
  createdAt: Date
}

export interface LoyaltyUser {
  points: number
  totalSpent: number
  loyaltyTier: 'bronze' | 'silver' | 'gold' | 'diamond'
}

export interface PointsCalculation {
  basePoints: number
  tierMultiplier: number
  quantityBonus: number
  totalPoints: number
  breakdown: {
    base: string
    tierBonus?: string
    quantityBonus?: string
  }
}

export interface PointsRedemption {
  pointsToRedeem: number
  discountAmount: number
  remainingPoints: number
  maxRedeemable: number
  redemptionRate: number
}

export const LOYALTY_TIERS: Record<string, LoyaltyTier> = {
  bronze: {
    tier: 'bronze',
    name: 'Bronze',
    minSpent: 0,
    pointsMultiplier: 1.0,
    benefits: {
      description: 'Velkommen til DrawDash Rewards',
      features: ['Grundlæggende pointoptjening', 'Adgang til alle lodtrækninger', 'Points indløsning']
    },
    color: '#CD7F32',
    icon: '🥉'
  },
  silver: {
    tier: 'silver',
    name: 'Silver',
    minSpent: 500,
    pointsMultiplier: 1.15,
    benefits: {
      description: 'Forbedret pointoptjening og fordele',
      features: ['15% bonus points', 'Prioriteret kundeservice', 'Månedlig gratis billet', 'Fødselsdagsbonus']
    },
    color: '#C0C0C0',
    icon: '🥈'
  },
  gold: {
    tier: 'gold',
    name: 'Gold',
    minSpent: 2000,
    pointsMultiplier: 1.3,
    benefits: {
      description: 'Premium fordele med ekstra belønninger',
      features: ['30% bonus points', 'VIP kundeservice', 'Ugentlig gratis billet', 'Early access til nye lodder', 'Eksklusive tilbud']
    },
    color: '#FFD700',
    icon: '🥇'
  },
  diamond: {
    tier: 'diamond',
    name: 'Diamond',
    minSpent: 10000,
    pointsMultiplier: 1.5,
    benefits: {
      description: 'Elite status med maksimale fordele',
      features: ['50% bonus points', 'Personlig rådgiver', 'Daglige gratis billetter', 'Eksklusive Diamond lodtrækninger', 'Premium support', 'Invitationer til events']
    },
    color: '#B9F2FF',
    icon: '💎'
  }
}

export const LOYALTY_SETTINGS = {
  POINTS_PER_KRONER: 1,
  MAX_REDEMPTION_PERCENTAGE: 50,
  REDEMPTION_RATE: 200, // 200 points = 1 kr
  AMOUNT_BONUSES: {
    100: 0.05,  // 5% bonus for 100+ kr purchases
    250: 0.10,  // 10% bonus for 250+ kr purchases
    500: 0.15,  // 15% bonus for 500+ kr purchases
    1000: 0.20  // 20% bonus for 1000+ kr purchases
  }
}
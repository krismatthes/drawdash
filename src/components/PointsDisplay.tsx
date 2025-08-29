'use client'

import { motion } from 'framer-motion'
import { LoyaltyCalculator } from '@/lib/loyalty'
import { LOYALTY_TIERS } from '@/types/loyalty'

interface PointsDisplayProps {
  points: number
  tier: 'bronze' | 'silver' | 'gold' | 'diamond'
  size?: 'sm' | 'md' | 'lg'
  showTier?: boolean
  animate?: boolean
}

export default function PointsDisplay({ 
  points, 
  tier, 
  size = 'md', 
  showTier = true,
  animate = false
}: PointsDisplayProps) {
  const tierData = LOYALTY_TIERS[tier]
  
  const sizeClasses = {
    sm: 'text-sm px-2 py-1 gap-1',
    md: 'text-base px-3 py-2 gap-2',
    lg: 'text-lg px-4 py-2.5 gap-2'
  }
  
  const iconSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  const component = (
    <div 
      className={`inline-flex items-center rounded-xl font-bold text-white shadow-lg ${sizeClasses[size]}`}
      style={{ 
        background: `linear-gradient(135deg, ${tierData.color}dd, ${tierData.color})`
      }}
    >
      {showTier && (
        <span className={iconSizes[size]}>{tierData.icon}</span>
      )}
      <span className="font-black">{LoyaltyCalculator.formatPoints(points)}</span>
      <span className="opacity-80 text-xs">points</span>
    </div>
  )

  if (animate) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {component}
      </motion.div>
    )
  }

  return component
}
'use client'

import { motion } from 'framer-motion'
import { LOYALTY_TIERS } from '@/types/loyalty'

interface TierBadgeProps {
  tier: 'bronze' | 'silver' | 'gold' | 'diamond'
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
  animate?: boolean
}

export default function TierBadge({ 
  tier, 
  size = 'md', 
  showName = true,
  animate = false
}: TierBadgeProps) {
  const tierData = LOYALTY_TIERS[tier]
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-1 gap-1',
    md: 'text-sm px-3 py-1.5 gap-2',
    lg: 'text-base px-4 py-2 gap-2'
  }
  
  const iconSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  const component = (
    <div 
      className={`inline-flex items-center rounded-full font-bold text-white shadow-md border-2 border-white/20 ${sizeClasses[size]}`}
      style={{ 
        background: `linear-gradient(135deg, ${tierData.color}, ${tierData.color}cc)`
      }}
    >
      <span className={iconSizes[size]}>{tierData.icon}</span>
      {showName && <span>{tierData.name}</span>}
    </div>
  )

  if (animate) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        {component}
      </motion.div>
    )
  }

  return component
}
'use client'

import { motion } from 'framer-motion'
import { LoyaltyCalculator } from '@/lib/loyalty'
import { LOYALTY_TIERS } from '@/types/loyalty'
import TierBadge from './TierBadge'

interface TierProgressProps {
  totalSpent: number
  showDetails?: boolean
  animate?: boolean
}

export default function TierProgress({ 
  totalSpent, 
  showDetails = true,
  animate = false 
}: TierProgressProps) {
  const { currentTier, nextTier, progress, remaining } = LoyaltyCalculator.getNextTierProgress(totalSpent)

  if (!nextTier) {
    return (
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 text-center text-white">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-2xl">👑</span>
          <span className="font-bold">Maksimal Tier Opnået!</span>
        </div>
        <TierBadge tier={currentTier.tier} size="lg" animate={animate} />
        <p className="text-sm opacity-80 mt-2">Du har nået det højeste niveau</p>
      </div>
    )
  }

  const progressComponent = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <TierBadge tier={currentTier.tier} size="md" animate={animate} />
        <div className="text-sm text-slate-500">
          <span className="font-medium">{LoyaltyCalculator.formatCurrency(remaining)}</span> til næste tier
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">{currentTier.name}</span>
          <span className="text-slate-600">{nextTier.name}</span>
        </div>
        
        <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${currentTier.color}, ${nextTier.color})`
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: animate ? 1.5 : 0, ease: "easeOut" }}
          />
          
          {/* Glowing effect */}
          <motion.div
            className="absolute top-0 h-full w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: `${progress * 3}%` }}
            transition={{ 
              duration: animate ? 2 : 0, 
              ease: "easeInOut",
              delay: animate ? 0.5 : 0
            }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-slate-500">
          <span>{LoyaltyCalculator.formatCurrency(currentTier.minSpent)}</span>
          <span className="font-medium">{Math.round(progress)}%</span>
          <span>{LoyaltyCalculator.formatCurrency(nextTier.minSpent)}</span>
        </div>
      </div>

      {showDetails && (
        <div className="bg-slate-50 rounded-lg p-3 space-y-2">
          <div className="text-xs font-medium text-slate-700 uppercase tracking-wide">
            Næste Tier Fordele:
          </div>
          <ul className="text-xs text-slate-600 space-y-1">
            {nextTier.benefits.features.slice(0, 2).map((feature, index) => (
              <li key={index} className="flex items-center gap-1">
                <span className="text-green-500">✓</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {progressComponent}
      </motion.div>
    )
  }

  return progressComponent
}
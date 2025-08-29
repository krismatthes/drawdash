'use client'

import { motion } from 'framer-motion'
import { PointsCalculation } from '@/types/loyalty'

interface PointsCalculationDisplayProps {
  calculation: PointsCalculation
  animate?: boolean
}

export default function PointsCalculationDisplay({ 
  calculation, 
  animate = false 
}: PointsCalculationDisplayProps) {
  const component = (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
          🎯 Points Optjent
        </h4>
        <div className="text-2xl font-black text-blue-600">
          +{calculation.totalPoints.toLocaleString('da-DK')}
        </div>
      </div>
      
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-600">{calculation.breakdown.base}</span>
          <span className="font-medium text-slate-900">+{calculation.basePoints}</span>
        </div>
        
        {calculation.breakdown.tierBonus && (
          <div className="flex justify-between text-green-600">
            <span>{calculation.breakdown.tierBonus}</span>
            <span className="font-medium">+{Math.floor(calculation.basePoints * calculation.tierMultiplier) - calculation.basePoints}</span>
          </div>
        )}
        
        {calculation.breakdown.quantityBonus && (
          <div className="flex justify-between text-purple-600">
            <span>{calculation.breakdown.quantityBonus}</span>
            <span className="font-medium">+{calculation.quantityBonus}</span>
          </div>
        )}
        
        <div className="border-t border-slate-200 pt-2">
          <div className="flex justify-between font-bold text-slate-900">
            <span>Total Points</span>
            <span className="text-blue-600">+{calculation.totalPoints.toLocaleString('da-DK')}</span>
          </div>
        </div>
      </div>
    </div>
  )

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, type: 'spring', stiffness: 300, damping: 20 }}
      >
        {component}
      </motion.div>
    )
  }

  return component
}
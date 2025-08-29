'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LoyaltyCalculator } from '@/lib/loyalty'
import { PointsRedemption } from '@/types/loyalty'
import PointsDisplay from './PointsDisplay'

interface PointsRedemptionProps {
  userPoints: number
  userTier: 'bronze' | 'silver' | 'gold' | 'diamond'
  cartAmount: number
  onRedemptionChange: (redemption: PointsRedemption | null) => void
}

export default function PointsRedemptionComponent({ 
  userPoints, 
  userTier,
  cartAmount, 
  onRedemptionChange 
}: PointsRedemptionProps) {
  const [isEnabled, setIsEnabled] = useState(false)
  const [pointsToRedeem, setPointsToRedeem] = useState(0)
  const [redemption, setRedemption] = useState<PointsRedemption | null>(null)

  // Calculate maximum redeemable points
  const maxRedeemable = LoyaltyCalculator.calculatePointsRedemption(
    userPoints,
    cartAmount,
    userPoints
  ).maxRedeemable

  const hasPoints = userPoints > 0 && maxRedeemable > 0

  useEffect(() => {
    if (isEnabled && pointsToRedeem > 0) {
      const calculatedRedemption = LoyaltyCalculator.calculatePointsRedemption(
        userPoints,
        cartAmount,
        pointsToRedeem
      )
      setRedemption(calculatedRedemption)
      onRedemptionChange(calculatedRedemption)
    } else {
      setRedemption(null)
      onRedemptionChange(null)
    }
  }, [isEnabled, pointsToRedeem, userPoints, cartAmount, onRedemptionChange])

  const handleToggle = () => {
    const newEnabled = !isEnabled
    setIsEnabled(newEnabled)
    if (!newEnabled) {
      setPointsToRedeem(0)
    } else {
      // Default to 25% of available points
      const defaultPoints = Math.min(Math.floor(maxRedeemable * 0.25), userPoints)
      setPointsToRedeem(defaultPoints)
    }
  }

  const quickRedemptionOptions = [25, 50, 75, 100].map(percentage => ({
    percentage,
    points: Math.floor(maxRedeemable * (percentage / 100)),
    label: percentage === 100 ? 'Max' : `${percentage}%`
  })).filter(option => option.points > 0)

  if (!hasPoints) {
    return (
      <div className="bg-slate-50 rounded-xl p-4 text-center">
        <div className="text-slate-400 mb-2">💰</div>
        <div className="text-sm text-slate-600">
          Du har ikke nok points til at indløse rabat på dette køb
        </div>
        <div className="text-xs text-slate-500 mt-1">
          Minimum {Math.ceil(cartAmount * 0.005 * 200)} points krævet (op til 50% rabat)
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Toggle Switch */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            💰
          </div>
          <div>
            <div className="font-semibold text-slate-900">Brug DrawDash Points</div>
            <div className="text-sm text-slate-600">
              Du har <PointsDisplay points={userPoints} tier={userTier} size="sm" showTier={false} /> tilgængelig
            </div>
          </div>
        </div>
        
        <motion.button
          onClick={handleToggle}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            isEnabled ? 'bg-blue-500' : 'bg-slate-300'
          }`}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md"
            animate={{ x: isEnabled ? 26 : 2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          />
        </motion.button>
      </div>

      {/* Redemption Controls */}
      <AnimatePresence>
        {isEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Quick Selection Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {quickRedemptionOptions.map((option) => (
                <button
                  key={option.percentage}
                  onClick={() => setPointsToRedeem(option.points)}
                  className={`py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                    pointsToRedeem === option.points
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Points Slider */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Points at indløse:</span>
                <span className="font-semibold text-blue-600">
                  {pointsToRedeem.toLocaleString('da-DK')}
                </span>
              </div>
              
              <input
                type="range"
                min="0"
                max={maxRedeemable}
                step="100"
                value={pointsToRedeem}
                onChange={(e) => setPointsToRedeem(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${(pointsToRedeem / maxRedeemable) * 100}%, #E2E8F0 ${(pointsToRedeem / maxRedeemable) * 100}%, #E2E8F0 100%)`
                }}
              />
              
              <div className="flex justify-between text-xs text-slate-500">
                <span>0</span>
                <span className="font-medium">Max: {maxRedeemable.toLocaleString('da-DK')}</span>
              </div>
            </div>

            {/* Redemption Summary */}
            {redemption && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 rounded-xl p-4 border border-green-200"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-green-600 font-medium mb-1">Rabat</div>
                    <div className="text-xl font-bold text-green-700">
                      -{redemption.discountAmount.toLocaleString('da-DK')} kr
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm text-slate-600 font-medium mb-1">Ny pris</div>
                    <div className="text-xl font-bold text-slate-900">
                      {(cartAmount - redemption.discountAmount).toLocaleString('da-DK')} kr
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-green-200 text-center">
                  <div className="text-sm text-slate-600">
                    Resterende points: <span className="font-semibold text-slate-900">{redemption.remainingPoints.toLocaleString('da-DK')}</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Terms */}
            <div className="text-xs text-slate-500 text-center">
              Maksimalt 50% af købebeløbet kan betales med points
              <br />
              200 points = 1 kr
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
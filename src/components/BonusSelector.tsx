'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { bonusRewardService, UserBonus } from '@/lib/bonusRewardService'

interface BonusSelectorProps {
  userId: string
  transactionAmount: number // in øre
  ticketQuantity: number
  raffleId?: string
  onBonusSelected: (bonusId: string | null, calculatedDiscount: any) => void
  className?: string
}

interface BonusCalculation {
  bonusId: string
  discountAmount: number
  freeTickets: number
  pointMultiplier: number
  finalAmount: number
  savings: number
}

export default function BonusSelector({ 
  userId, 
  transactionAmount, 
  ticketQuantity, 
  raffleId, 
  onBonusSelected,
  className = ''
}: BonusSelectorProps) {
  const [availableBonuses, setAvailableBonuses] = useState<UserBonus[]>([])
  const [selectedBonusId, setSelectedBonusId] = useState<string | null>(null)
  const [bonusCalculations, setBonusCalculations] = useState<Record<string, BonusCalculation>>({})
  const [isExpanded, setIsExpanded] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAvailableBonuses()
  }, [userId, transactionAmount, ticketQuantity, raffleId])

  const loadAvailableBonuses = () => {
    setLoading(true)
    
    // Get applicable bonuses for this transaction
    const applicable = bonusRewardService.getApplicableBonusesForTransaction(
      userId,
      transactionAmount,
      ticketQuantity,
      raffleId
    )

    setAvailableBonuses(applicable)

    // Calculate discount for each bonus
    const calculations: Record<string, BonusCalculation> = {}
    applicable.forEach(userBonus => {
      const calculation = bonusRewardService.calculateBonusDiscount(
        userBonus,
        transactionAmount,
        ticketQuantity
      )
      
      calculations[userBonus.id] = {
        bonusId: userBonus.id,
        discountAmount: calculation.discountAmount,
        freeTickets: calculation.freeTickets,
        pointMultiplier: calculation.pointMultiplier,
        finalAmount: calculation.finalAmount,
        savings: transactionAmount - calculation.finalAmount
      }
    })

    setBonusCalculations(calculations)
    setLoading(false)

    // Auto-expand if bonuses are available
    if (applicable.length > 0) {
      setIsExpanded(true)
    }
  }

  const handleBonusSelection = (bonusId: string | null) => {
    setSelectedBonusId(bonusId)
    
    if (bonusId && bonusCalculations[bonusId]) {
      onBonusSelected(bonusId, bonusCalculations[bonusId])
    } else {
      onBonusSelected(null, null)
    }
  }

  const getBonusTypeIcon = (type: string) => {
    switch (type) {
      case 'free_tickets': return '🎫'
      case 'discount': return '🏷️'
      case 'cashback': return '💰'
      case 'multiplier': return '⚡'
      case 'free_entry': return '🆓'
      case 'points': return '🎯'
      default: return '🎁'
    }
  }

  const getBonusTypeLabel = (type: string) => {
    switch (type) {
      case 'free_tickets': return 'Gratis Billetter'
      case 'discount': return 'Rabat'
      case 'cashback': return 'Cashback'
      case 'multiplier': return 'Point Multiplier'
      case 'free_entry': return 'Gratis Entry'
      case 'points': return 'Bonus Points'
      default: return 'Bonus'
    }
  }

  const formatExpiryDate = (date: Date) => {
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays <= 0) {
      return 'Udløbet'
    } else if (diffDays === 1) {
      return 'Udløber i dag'
    } else if (diffDays <= 7) {
      return `Udløber om ${diffDays} dage`
    } else {
      return date.toLocaleDateString('da-DK')
    }
  }

  const formatCurrency = (amount: number) => {
    return `${(amount / 100).toFixed(2)} kr`
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-xl border border-slate-200 p-4 ${className}`}>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-slate-600">Tjekker tilgængelige bonusser...</span>
        </div>
      </div>
    )
  }

  if (availableBonuses.length === 0) {
    return (
      <div className={`bg-slate-50 rounded-xl border border-slate-200 p-4 ${className}`}>
        <div className="text-center">
          <span className="text-2xl block mb-2">🎁</span>
          <p className="text-sm text-slate-600">
            Ingen bonusser tilgængelige for denne køb
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-xl border border-slate-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg">🎁</span>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Anvend Bonus</h3>
            <p className="text-sm text-slate-600">
              {availableBonuses.length} bonusser tilgængelige
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {selectedBonusId && bonusCalculations[selectedBonusId] && (
            <div className="text-right">
              <div className="text-sm font-semibold text-green-600">
                Spar {formatCurrency(bonusCalculations[selectedBonusId].savings)}
              </div>
            </div>
          )}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </div>
      </div>

      {/* Bonus Options */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-slate-200"
          >
            <div className="p-4">
              {/* No bonus option */}
              <div className="mb-3">
                <label className="flex items-center p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="radio"
                    name="bonus"
                    value=""
                    checked={selectedBonusId === null}
                    onChange={() => handleBonusSelection(null)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                  />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-slate-900">
                      Ingen bonus
                    </div>
                    <div className="text-sm text-slate-600">
                      Betal fuld pris: {formatCurrency(transactionAmount)}
                    </div>
                  </div>
                </label>
              </div>

              {/* Available bonuses */}
              <div className="space-y-3">
                {availableBonuses.map((userBonus, index) => {
                  const bonus = userBonus.bonusSnapshot
                  const calculation = bonusCalculations[userBonus.id]
                  const isSelected = selectedBonusId === userBonus.id
                  const isExpired = userBonus.expiresAt < new Date()

                  return (
                    <motion.div
                      key={userBonus.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <label 
                        className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-green-500 bg-green-50 shadow-sm' 
                            : isExpired
                              ? 'border-red-200 bg-red-50 opacity-60 cursor-not-allowed'
                              : 'border-slate-200 hover:border-green-300 hover:bg-green-50/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="bonus"
                          value={userBonus.id}
                          checked={isSelected}
                          disabled={isExpired}
                          onChange={() => !isExpired && handleBonusSelection(userBonus.id)}
                          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 focus:ring-green-500 mt-1"
                        />
                        
                        <div className="ml-3 flex-1">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">{getBonusTypeIcon(bonus.type)}</span>
                                <h4 className="font-semibold text-slate-900">{bonus.name}</h4>
                                {isExpired && (
                                  <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                                    Udløbet
                                  </span>
                                )}
                              </div>
                              
                              <p className="text-sm text-slate-600 mb-2">{bonus.description}</p>
                              
                              <div className="flex items-center gap-4 text-xs text-slate-500">
                                <span>Type: {getBonusTypeLabel(bonus.type)}</span>
                                <span>Værdi: {bonus.value}</span>
                                <span>Udløber: {formatExpiryDate(userBonus.expiresAt)}</span>
                              </div>
                            </div>
                            
                            {calculation && !isExpired && (
                              <div className="text-right ml-4">
                                {calculation.discountAmount > 0 && (
                                  <div className="text-lg font-bold text-green-600">
                                    -{formatCurrency(calculation.discountAmount)}
                                  </div>
                                )}
                                {calculation.freeTickets > 0 && (
                                  <div className="text-sm text-blue-600">
                                    +{calculation.freeTickets} gratis billetter
                                  </div>
                                )}
                                {calculation.pointMultiplier > 1 && (
                                  <div className="text-sm text-purple-600">
                                    {calculation.pointMultiplier}x points
                                  </div>
                                )}
                                <div className="text-sm text-slate-600 mt-1">
                                  Ny pris: {formatCurrency(calculation.finalAmount)}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </label>
                    </motion.div>
                  )
                })}
              </div>

              {/* Selected bonus summary */}
              {selectedBonusId && bonusCalculations[selectedBonusId] && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg"
                >
                  <h4 className="font-semibold text-green-800 mb-2">Bonus Opsummering</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Original pris:</span>
                      <span className="font-medium">{formatCurrency(transactionAmount)}</span>
                    </div>
                    
                    {bonusCalculations[selectedBonusId].discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Rabat:</span>
                        <span className="font-medium">
                          -{formatCurrency(bonusCalculations[selectedBonusId].discountAmount)}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between border-t border-green-200 pt-1 font-semibold text-green-800">
                      <span>Ny pris:</span>
                      <span>{formatCurrency(bonusCalculations[selectedBonusId].finalAmount)}</span>
                    </div>
                    
                    {bonusCalculations[selectedBonusId].freeTickets > 0 && (
                      <div className="text-blue-600">
                        + {bonusCalculations[selectedBonusId].freeTickets} gratis billetter
                      </div>
                    )}
                    
                    {bonusCalculations[selectedBonusId].pointMultiplier > 1 && (
                      <div className="text-purple-600">
                        {bonusCalculations[selectedBonusId].pointMultiplier}x loyalty points
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
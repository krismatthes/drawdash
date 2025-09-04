'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { UserBonus } from '@/lib/bonusRewardService'

interface BonusWalletProps {
  showCompact?: boolean
  maxDisplay?: number
}

export default function BonusWallet({ showCompact = false, maxDisplay }: BonusWalletProps) {
  const { user, refreshUserBonuses } = useAuth()
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    if (user) {
      refreshUserBonuses()
    }
  }, [user?.id])

  if (!user?.activeBonuses || user.activeBonuses.length === 0) {
    if (showCompact) return null
    
    return (
      <div className="bg-slate-50 rounded-lg p-4 text-center">
        <span className="text-3xl mb-2 block">🎁</span>
        <p className="text-slate-600 text-sm">Ingen aktive bonusser</p>
      </div>
    )
  }

  const activeBonuses = user.activeBonuses.filter(bonus => {
    const now = new Date()
    return bonus.status === 'active' && bonus.expiresAt > now
  })

  const displayBonuses = showAll || !maxDisplay 
    ? activeBonuses 
    : activeBonuses.slice(0, maxDisplay)

  const getBonusIcon = (type: string) => {
    switch (type) {
      case 'points': return '🎯'
      case 'free_tickets': return '🎫'
      case 'cashback': return '💰'
      case 'multiplier': return '⚡'
      case 'free_entry': return '🆓'
      case 'discount': return '🏷️'
      default: return '🎁'
    }
  }

  const getBonusValue = (bonus: UserBonus) => {
    const { type, value } = bonus.bonusSnapshot
    switch (type) {
      case 'points':
        return `${value.toLocaleString('da-DK')} points`
      case 'free_tickets':
        return `${value} gratis billetter`
      case 'cashback':
        return `${value}% cashback`
      case 'multiplier':
        return `${value}x point multiplier`
      case 'free_entry':
        return `${value} gratis entries`
      case 'discount':
        return `${value}% rabat`
      default:
        return `${value}`
    }
  }

  const getDaysUntilExpiry = (expiresAt: Date) => {
    const now = new Date()
    const timeDiff = expiresAt.getTime() - now.getTime()
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
    return daysDiff
  }

  const getExpiryColor = (daysLeft: number) => {
    if (daysLeft <= 1) return 'text-red-600'
    if (daysLeft <= 3) return 'text-orange-600'
    if (daysLeft <= 7) return 'text-yellow-600'
    return 'text-green-600'
  }

  if (showCompact) {
    return (
      <div className="space-y-2">
        {displayBonuses.map((bonus, index) => {
          const daysLeft = getDaysUntilExpiry(bonus.expiresAt)
          
          return (
            <motion.div
              key={bonus.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{getBonusIcon(bonus.bonusSnapshot.type)}</span>
                <div>
                  <div className="text-sm font-medium text-slate-900">{bonus.bonusSnapshot.name}</div>
                  <div className="text-xs text-blue-600">{getBonusValue(bonus)}</div>
                </div>
              </div>
              <div className={`text-xs font-medium ${getExpiryColor(daysLeft)}`}>
                {daysLeft <= 0 ? 'Udløbet!' : `${daysLeft}d`}
              </div>
            </motion.div>
          )
        })}
        
        {activeBonuses.length > displayBonuses.length && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {showAll ? 'Vis færre' : `+${activeBonuses.length - displayBonuses.length} flere`}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Dine Aktive Bonusser</h2>
        <span className="text-sm text-slate-600">{activeBonuses.length} aktive</span>
      </div>
      
      <AnimatePresence>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayBonuses.map((bonus, index) => {
            const daysLeft = getDaysUntilExpiry(bonus.expiresAt)
            const isUrgent = daysLeft <= 3
            
            return (
              <motion.div
                key={bonus.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className={`relative overflow-hidden rounded-xl border-2 ${
                  isUrgent 
                    ? 'border-red-200 bg-gradient-to-r from-red-50 to-orange-50' 
                    : 'border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50'
                }`}
              >
                {isUrgent && (
                  <div className="absolute top-2 right-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 animate-pulse">
                      Udløber snart!
                    </span>
                  </div>
                )}
                
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{getBonusIcon(bonus.bonusSnapshot.type)}</div>
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-900 mb-1">{bonus.bonusSnapshot.name}</h3>
                      <p className="text-sm text-slate-600 mb-2">{bonus.bonusSnapshot.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-blue-600">
                          {getBonusValue(bonus)}
                        </div>
                        <div className={`text-sm font-medium ${getExpiryColor(daysLeft)}`}>
                          {daysLeft <= 0 ? 'Udløbet!' : `${daysLeft} dag${daysLeft !== 1 ? 'e' : ''} tilbage`}
                        </div>
                      </div>
                      
                      <div className="mt-3 flex gap-2">
                        {bonus.bonusSnapshot.type === 'free_tickets' && (
                          <button className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Brug Nu
                          </button>
                        )}
                        {bonus.bonusSnapshot.type === 'free_entry' && (
                          <button className="px-3 py-1 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                            Gratis Entry
                          </button>
                        )}
                        <button className="px-3 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                          Detaljer
                        </button>
                      </div>
                      
                      <div className="mt-2 text-xs text-slate-500">
                        Tildelt: {bonus.assignedAt.toLocaleDateString('da-DK')} • 
                        Grund: {bonus.metadata?.assignmentReason || 'Ikke angivet'}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </AnimatePresence>
      
      {activeBonuses.length > displayBonuses.length && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full py-3 text-center text-blue-600 hover:text-blue-700 font-medium border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
        >
          {showAll ? 'Vis færre bonusser' : `Vis alle ${activeBonuses.length} bonusser`}
        </button>
      )}
    </div>
  )
}

export function BonusWalletCompact() {
  return <BonusWallet showCompact={true} maxDisplay={3} />
}
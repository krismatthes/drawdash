'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { UserBonus } from '@/lib/bonusRewardService'

interface BonusNotificationProps {
  bonus: UserBonus
  onDismiss: () => void
  onUse?: () => void
  autoHideMs?: number
}

export default function BonusNotification({ 
  bonus, 
  onDismiss, 
  onUse, 
  autoHideMs = 8000 
}: BonusNotificationProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (autoHideMs > 0) {
      const timer = setTimeout(() => {
        setVisible(false)
        setTimeout(onDismiss, 300) // Wait for animation
      }, autoHideMs)
      
      return () => clearTimeout(timer)
    }
  }, [autoHideMs, onDismiss])

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

  const getBonusValue = () => {
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

  const getDaysUntilExpiry = () => {
    const now = new Date()
    const timeDiff = bonus.expiresAt.getTime() - now.getTime()
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
    return daysDiff
  }

  const getExpiryColor = (daysLeft: number) => {
    if (daysLeft <= 0) return 'text-red-600'
    if (daysLeft <= 3) return 'text-orange-600'
    if (daysLeft <= 7) return 'text-yellow-600'
    return 'text-green-600'
  }

  const daysLeft = getDaysUntilExpiry()
  const isUrgent = daysLeft <= 3

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: 300, scale: 0.3 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.3 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30
          }}
          className="fixed top-4 right-4 z-50 w-80 max-w-sm"
        >
          <div className={`relative overflow-hidden rounded-xl shadow-lg border-2 ${
            isUrgent 
              ? 'border-orange-300 bg-gradient-to-r from-orange-50 to-red-50' 
              : 'border-blue-300 bg-gradient-to-r from-blue-50 to-purple-50'
          }`}>
            {/* Sparkle animation background */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-300 rounded-full opacity-20 animate-ping"></div>
              <div className="absolute top-1/2 -left-2 w-4 h-4 bg-blue-300 rounded-full opacity-30 animate-bounce"></div>
              <div className="absolute bottom-2 right-1/3 w-3 h-3 bg-purple-300 rounded-full opacity-25 animate-pulse"></div>
            </div>
            
            {/* Close button */}
            <button
              onClick={() => {
                setVisible(false)
                setTimeout(onDismiss, 300)
              }}
              className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600 transition-colors z-10"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="relative p-4">
              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 0.6, repeat: 2 }}
                  className="text-3xl"
                >
                  {getBonusIcon(bonus.bonusSnapshot.type)}
                </motion.div>
                <div>
                  <h3 className="font-bold text-slate-900">Ny Bonus Modtaget!</h3>
                  <p className="text-sm text-slate-600">{bonus.bonusSnapshot.name}</p>
                </div>
              </div>
              
              {/* Value display */}
              <div className="bg-white/70 rounded-lg p-3 mb-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {getBonusValue()}
                  </div>
                  <div className="text-sm text-slate-600">{bonus.bonusSnapshot.description}</div>
                </div>
              </div>
              
              {/* Expiry info */}
              <div className="flex items-center justify-between text-sm mb-4">
                <span className="text-slate-600">Udløber om:</span>
                <span className={`font-medium ${getExpiryColor(daysLeft)}`}>
                  {daysLeft <= 0 ? 'Udløbet!' : `${daysLeft} dag${daysLeft !== 1 ? 'e' : ''}`}
                </span>
              </div>
              
              {/* Actions */}
              <div className="flex gap-2">
                {(bonus.bonusSnapshot.type === 'free_tickets' || bonus.bonusSnapshot.type === 'free_entry') && onUse && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onUse}
                    className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium text-sm hover:from-blue-700 hover:to-purple-700 transition-all"
                  >
                    Brug Nu
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setVisible(false)
                    setTimeout(onDismiss, 300)
                  }}
                  className="px-3 py-2 bg-white text-slate-700 rounded-lg font-medium text-sm border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  Senere
                </motion.button>
              </div>
              
              {/* Assignment info */}
              {bonus.metadata?.assignmentReason && (
                <div className="mt-3 pt-3 border-t border-white/50">
                  <div className="text-xs text-slate-600">
                    <strong>Grund:</strong> {bonus.metadata.assignmentReason}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Notification manager for handling multiple bonuses
export function BonusNotificationManager() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<UserBonus[]>([])
  const [shownBonuses, setShownBonuses] = useState<Set<string>>(new Set())

  const getExpiryColor = (daysLeft: number) => {
    if (daysLeft <= 1) return 'text-red-600'
    if (daysLeft <= 3) return 'text-orange-600'
    if (daysLeft <= 7) return 'text-yellow-600'
    return 'text-green-600'
  }

  useEffect(() => {
    if (user?.activeBonuses) {
      // Check for new bonuses that haven't been shown yet
      const newBonuses = user.activeBonuses.filter((bonus: UserBonus) => {
        // Only show bonuses assigned in the last 5 minutes that haven't been shown
        const assignedRecently = (Date.now() - bonus.assignedAt.getTime()) < (5 * 60 * 1000)
        const notShown = !shownBonuses.has(bonus.id)
        return assignedRecently && notShown && bonus.status === 'active'
      })

      if (newBonuses.length > 0) {
        // Show one notification at a time
        const nextBonus = newBonuses[0]
        setNotifications(prev => [...prev, nextBonus])
        setShownBonuses(prev => new Set([...Array.from(prev), nextBonus.id]))
      }
    }
  }, [user?.activeBonuses, shownBonuses])

  const dismissNotification = (bonusId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== bonusId))
  }

  return (
    <>
      {notifications.map((bonus, index) => (
        <motion.div
          key={bonus.id}
          style={{ top: `${1 + (index * 320)}px` }} // Stack notifications
        >
          <BonusNotification
            bonus={bonus}
            onDismiss={() => dismissNotification(bonus.id)}
            onUse={() => {
              // Handle immediate use
              console.log('Using bonus immediately:', bonus.id)
              dismissNotification(bonus.id)
            }}
          />
        </motion.div>
      ))}
    </>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import PremiumHeader from '@/components/PremiumHeader'
import GradientMesh from '@/components/GradientMesh'
import PremiumButton from '@/components/PremiumButton'
import TierBadge from '@/components/TierBadge'
import PointsDisplay from '@/components/PointsDisplay'
import { raffleServiceDB } from '@/lib/raffleServiceDB'
import { userService } from '@/lib/userService'
import Link from 'next/link'

interface RaffleEntry {
  id: string
  raffle: {
    id: string
    title: string
    status: string
    endDate: Date
  }
  quantity: number
  totalAmount: number
  paymentStatus: string
  ticketNumbers: number[]
  createdAt: Date
}

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [userEntries, setUserEntries] = useState<RaffleEntry[]>([])
  const [entriesLoading, setEntriesLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    const loadUserEntries = async () => {
      if (user?.id) {
        try {
          const entries = await raffleServiceDB.getUserRaffleEntries(user.id)
          setUserEntries(entries)
        } catch (error) {
          console.error('Failed to load user entries:', error)
        } finally {
          setEntriesLoading(false)
        }
      }
    }

    if (user) {
      loadUserEntries()
    }
  }, [user])

  if (isLoading) {
    return (
      <div className="min-h-screen relative">
        <GradientMesh variant="hero" />
        <PremiumHeader />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-slate-600">Indlæser...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen relative">
      <GradientMesh variant="hero" />
      <PremiumHeader />
      
      <main className="relative py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-black text-slate-900 mb-2">
              Hej {user.firstName}! 👋
            </h1>
            <p className="text-xl text-slate-600">
              Velkommen til din personlige dashboard
            </p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="card-premium p-6 text-center"
            >
              <div className="flex items-center justify-center mb-4">
                <TierBadge tier={user.loyaltyTier} size="large" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Loyalty Status
              </h3>
              <p className="text-sm text-slate-600 capitalize">
                {user.loyaltyTier} medlem
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="card-premium p-6 text-center"
            >
              <PointsDisplay points={user.points} size="large" className="mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Dine Points
              </h3>
              <p className="text-sm text-slate-600">
                Værd ca. {Math.round(user.points / 200)} kr
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="card-premium p-6 text-center"
            >
              <div className="text-3xl font-black text-blue-600 mb-2">
                {new Intl.NumberFormat('da-DK', {
                  style: 'currency',
                  currency: 'DKK',
                  minimumFractionDigits: 0
                }).format(user.totalSpent)}
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Total Brugt
              </h3>
              <p className="text-sm text-slate-600">
                Siden du startede
              </p>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="card-premium p-6 mb-8"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Hurtige Handlinger
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/raffles">
                <PremiumButton
                  variant="outline"
                  size="lg"
                  icon="🎯"
                  className="w-full"
                >
                  Se Lodtrækninger
                </PremiumButton>
              </Link>
              <Link href="/account">
                <PremiumButton
                  variant="outline"
                  size="lg"
                  icon="⚙️"
                  className="w-full"
                >
                  Indstillinger
                </PremiumButton>
              </Link>
              <Link href="/winners">
                <PremiumButton
                  variant="outline"
                  size="lg"
                  icon="🏆"
                  className="w-full"
                >
                  Se Vindere
                </PremiumButton>
              </Link>
              {user.isAdmin && (
                <Link href="/admin">
                  <PremiumButton
                    variant="premium"
                    size="lg"
                    icon="🔧"
                    className="w-full"
                  >
                    Admin Panel
                  </PremiumButton>
                </Link>
              )}
            </div>
          </motion.div>

          {/* Recent Entries */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="card-premium p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                Dine Deltagelser
              </h2>
              <Link href="/raffles">
                <PremiumButton variant="outline" size="sm" icon="➕">
                  Deltag i flere
                </PremiumButton>
              </Link>
            </div>

            {entriesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-slate-600">Indlæser deltagelser...</p>
              </div>
            ) : userEntries.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎫</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Ingen deltagelser endnu
                </h3>
                <p className="text-slate-600 mb-6">
                  Du har ikke deltaget i nogen lodtrækninger endnu
                </p>
                <Link href="/raffles">
                  <PremiumButton variant="premium" icon="🎯">
                    Find lodtrækninger
                  </PremiumButton>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {userEntries.slice(0, 5).map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">
                        {entry.raffle.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-slate-600 mt-1">
                        <span>{entry.quantity} billetter</span>
                        <span>•</span>
                        <span>
                          Billetter: {entry.ticketNumbers.join(', ')}
                        </span>
                        <span>•</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          entry.paymentStatus === 'completed' 
                            ? 'bg-green-100 text-green-700'
                            : entry.paymentStatus === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {entry.paymentStatus === 'completed' ? 'Betalt' : 
                           entry.paymentStatus === 'pending' ? 'Afventer' : 'Fejlet'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-slate-900">
                        {new Intl.NumberFormat('da-DK', {
                          style: 'currency',
                          currency: 'DKK'
                        }).format(entry.totalAmount)}
                      </div>
                      <div className="text-sm text-slate-500">
                        {new Date(entry.createdAt).toLocaleDateString('da-DK')}
                      </div>
                    </div>
                  </div>
                ))}
                
                {userEntries.length > 5 && (
                  <div className="text-center pt-4">
                    <button className="text-blue-600 hover:text-blue-700 font-medium">
                      Se alle deltagelser ({userEntries.length - 5} flere)
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Loyalty Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="card-premium p-6 mt-8"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Loyalty Status
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { tier: 'bronze', name: 'Bronze', min: 0, color: 'from-amber-400 to-orange-500', icon: '🥉' },
                { tier: 'silver', name: 'Silver', min: 500, color: 'from-gray-400 to-gray-500', icon: '🥈' },
                { tier: 'gold', name: 'Gold', min: 2000, color: 'from-yellow-400 to-yellow-500', icon: '🥇' },
                { tier: 'diamond', name: 'Diamond', min: 10000, color: 'from-emerald-400 to-teal-500', icon: '💎' },
              ].map((tier) => (
                <div
                  key={tier.tier}
                  className={`p-4 rounded-xl border-2 ${
                    user.loyaltyTier === tier.tier
                      ? 'border-blue-500 bg-blue-50'
                      : user.totalSpent >= tier.min
                      ? 'border-green-300 bg-green-50'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${tier.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                    <span className="text-xl">{tier.icon}</span>
                  </div>
                  <h3 className="text-sm font-bold text-center mb-1">{tier.name}</h3>
                  <p className="text-xs text-center text-slate-600">
                    Fra {new Intl.NumberFormat('da-DK').format(tier.min)} kr
                  </p>
                  {user.loyaltyTier === tier.tier && (
                    <div className="text-center mt-2">
                      <span className="inline-block px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                        Nuværende
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import PremiumHeader from '@/components/PremiumHeader'
import PremiumFooter from '@/components/PremiumFooter'
import PremiumRaffleCard from '@/components/PremiumRaffleCard'
import GradientMesh from '@/components/GradientMesh'
import { raffleServiceDB } from '@/lib/raffleServiceDB'
import { useLanguage } from '@/contexts/LanguageContext'

export default function RafflesPage() {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'upcoming' | 'ended'>('all')
  const [sortBy, setSortBy] = useState<'prize' | 'tickets' | 'ending'>('prize')
  const [raffles, setRaffles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { t } = useLanguage()

  useEffect(() => {
    const loadRaffles = async () => {
      try {
        const allRaffles = await raffleServiceDB.getAllRaffles()
        setRaffles(allRaffles)
      } catch (error) {
        console.error('Failed to load raffles:', error)
        setRaffles([])
      } finally {
        setLoading(false)
      }
    }

    loadRaffles()
  }, [])

  const activeRaffles = raffles.filter(raffle => raffle.status === 'active')
  const upcomingRaffles = raffles.filter(raffle => raffle.status === 'upcoming')
  const endedRaffles = raffles.filter(raffle => raffle.status === 'ended')

  const filteredRaffles = selectedFilter === 'all' 
    ? raffles 
    : raffles.filter(raffle => raffle.status === selectedFilter)

  const sortedRaffles = [...filteredRaffles].sort((a, b) => {
    switch (sortBy) {
      case 'prize':
        // Sort by highest prize value from prizes array
        const aMaxValue = Math.max(...a.prizes.map((p: any) => p.value))
        const bMaxValue = Math.max(...b.prizes.map((p: any) => p.value))
        return bMaxValue - aMaxValue
      case 'tickets':
        return (b.soldTickets / b.totalTickets) - (a.soldTickets / a.totalTickets)
      case 'ending':
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
      default:
        return 0
    }
  })

  return (
    <div className="min-h-screen relative">
      <GradientMesh variant="hero" />
      <PremiumHeader />
      
      <main className="relative">
        {/* Premium Hero Section */}
        <div className="relative py-16 sm:py-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                Alle <span className="bg-gradient-to-r from-blue-500 to-pink-400 bg-clip-text text-transparent">Lodtrækninger</span>
              </h1>
              <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                Udforsk vores fantastiske udvalg af præmier og find din næste store gevinst.
              </p>

              {/* Filter and Sort Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'all', label: 'Alle', count: raffles.length },
                    { key: 'active', label: 'Aktive', count: activeRaffles.length },
                    { key: 'upcoming', label: 'Kommende', count: upcomingRaffles.length },
                    { key: 'ended', label: 'Afsluttet', count: endedRaffles.length }
                  ].map((filter) => (
                    <motion.button
                      key={filter.key}
                      onClick={() => setSelectedFilter(filter.key as any)}
                      className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
                        selectedFilter === filter.key
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                          : 'bg-white/80 backdrop-blur-sm text-slate-700 hover:bg-white border border-slate-200 hover:border-blue-300'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {filter.label}
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        selectedFilter === filter.key
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {filter.count}
                      </span>
                    </motion.button>
                  ))}
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="appearance-none bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl px-4 py-2 pr-8 text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 cursor-pointer"
                  >
                    <option value="prize">Sortér efter værdi</option>
                    <option value="tickets">Sortér efter popularitet</option>
                    <option value="ending">Sortér efter sluttid</option>
                  </select>
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Raffles Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-slate-600">Indlæser lodtrækninger...</p>
            </div>
          ) : sortedRaffles.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {sortedRaffles.map((raffle, index) => (
                <motion.div
                  key={raffle.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <PremiumRaffleCard raffle={raffle} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">
                  Ingen lodtrækninger fundet
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {raffles.length === 0 
                    ? 'Der er ingen lodtrækninger tilgængelige lige nu. Kom tilbage senere!'
                    : 'Der er ingen lodtrækninger, der matcher dine filtre. Prøv at ændre dine søgekriterier.'}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </main>
      
      <PremiumFooter />
    </div>
  )
}
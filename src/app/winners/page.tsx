'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import PremiumHeader from '@/components/PremiumHeader'
import PremiumFooter from '@/components/PremiumFooter'
import GradientMesh from '@/components/GradientMesh'
import PremiumButton from '@/components/PremiumButton'
import Link from 'next/link'
import { getRecentWinners, getBiggestWins } from '@/lib/mockWinners'

const bigWinners = [
  {
    prize: 'BMW M4 Competition',
    winner: 'Sarah M.',
    value: 850000,
    month: 'August 2024'
  },
  {
    prize: '6.500 kr kontant instant win',
    winner: 'Lars K.',
    value: 6500,
    month: 'August 2024'
  },
  {
    prize: 'Samsung Galaxy S24',
    winner: 'Anna H.',
    value: 11699,
    month: 'August 2024'
  }
]

const stats = [
  { label: 'Samlede vindere', value: '2,847', icon: '🏆', color: 'from-blue-500 to-cyan-500' },
  { label: 'Præmier uddelt', value: '27M kr', icon: '💎', color: 'from-emerald-500 to-teal-500' },
  { label: 'Biler vundet', value: '156', icon: '🚗', color: 'from-purple-500 to-pink-500' },
  { label: 'Tilfredshed', value: '98%', icon: '⭐', color: 'from-orange-500 to-red-500' }
]

export default function WinnersPage() {
  const recentWinners = getRecentWinners(6)
  
  return (
    <div className="min-h-screen relative bg-white">
      <GradientMesh variant="hero" />
      <PremiumHeader />
      
      <main className="relative">
        {/* Hero Section */}
        <div className="relative py-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-400 text-white rounded-full text-sm font-bold flex items-center gap-2">
                  🏆 VINDERE
                  <div className="w-2 h-2 bg-white/80 rounded-full animate-pulse" />
                </div>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                Mød vores <span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">vindere</span>
              </h1>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Se hvem der har vundet fantastiske præmier og få inspiration til din næste store gevinst
              </p>
            </motion.div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card-premium p-6 text-center group hover:scale-105 transition-transform duration-300"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <span className="text-2xl">{stat.icon}</span>
                </div>
                <div className="text-3xl font-black text-slate-900 mb-2">{stat.value}</div>
                <div className="text-slate-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Big Winners Showcase */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Største gevinster i år
            </h2>
            <p className="text-xl text-slate-600">
              Se årets mest imponerende vindere og deres fantastiske præmier
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {bigWinners.map((winner, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                <div className="card-premium p-8 text-center relative overflow-hidden">
                  {/* Background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50 opacity-50" />
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <div className="text-4xl font-black text-emerald-600 mb-3">
                      {winner.value.toLocaleString('da-DK')} kr
                    </div>
                    <div className="text-xl font-bold text-slate-900 mb-2">{winner.prize}</div>
                    <div className="text-emerald-600 font-semibold">Vundet af {winner.winner}</div>
                    <div className="text-slate-500 text-sm mt-1">{winner.month}</div>
                    
                    {/* Winner badge */}
                    {index === 0 && (
                      <div className="absolute -top-3 -right-3">
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                          👑 STØRSTE
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Winners */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Seneste vindere
            </h2>
            <p className="text-xl text-slate-600">
              Friske gevinster fra de sidste par uger
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentWinners.map((winner, index) => (
              <motion.div
                key={winner.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card-premium p-6 group hover:scale-105 transition-all duration-300"
              >
                <div className="flex items-center mb-6">
                  <div className="relative w-16 h-16 mr-4">
                    <Image
                      src={winner.image}
                      alt={winner.name}
                      fill
                      className="object-cover rounded-full border-2 border-emerald-200"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{winner.name}</h3>
                    <p className="text-slate-600 text-sm">{winner.city}</p>
                    <p className="text-slate-500 text-xs">{winner.wonDate.toLocaleDateString('da-DK')}</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 mb-4">
                  <p className="font-bold text-slate-900 mb-1">{winner.prize}</p>
                  <p className="text-emerald-600 font-black text-xl">{winner.prizeValue.toLocaleString('da-DK')} kr</p>
                </div>
                
                <blockquote className="text-slate-700 italic text-sm border-l-4 border-emerald-200 pl-4">
                  "{winner.testimonial}"
                </blockquote>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Verification Section */}
        <div className="bg-slate-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Vinder verifikation
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Alle vindere er rigtige mennesker og alle præmier leveres som lovet
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="card-premium p-8"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">📹</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Live lodtrækninger</h3>
                </div>
                <p className="text-slate-600 mb-6">
                  Alle lodtrækninger udføres live på Facebook for maksimal gennemsigtighed. 
                  Du kan se processen i real-time og være sikker på at alt foregår fair.
                </p>
                <Link href="https://facebook.com/drawdash" target="_blank">
                  <PremiumButton
                    variant="primary"
                    size="lg"
                    icon="👀"
                    className="font-semibold"
                  >
                    Se live på Facebook
                  </PremiumButton>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="card-premium p-8"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">✅</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Verificerede vindere</h3>
                </div>
                <p className="text-slate-600 mb-6">
                  Vinderdetaljer verificeres og offentliggøres med deres samtykke. 
                  Vi kontakter alle vindere direkte og dokumenterer leveringen.
                </p>
                <PremiumButton
                  variant="outline"
                  size="lg"
                  icon="🛡️"
                  className="font-semibold"
                >
                  Læs om vores process
                </PremiumButton>
              </motion.div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="card-premium p-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Kunne du være den næste?
              </h2>
              <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
                Bliv en del af vores fællesskab af vindere og prøv lykken i dag!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/raffles">
                  <PremiumButton
                    variant="premium"
                    size="xl"
                    shimmer
                    icon="🎯"
                    className="font-bold"
                  >
                    Se aktive lodtrækninger
                  </PremiumButton>
                </Link>
                
                <Link href="/register">
                  <PremiumButton
                    variant="outline"
                    size="xl"
                    icon="🚀"
                    className="font-bold border-2"
                  >
                    Opret gratis konto
                  </PremiumButton>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <PremiumFooter />
    </div>
  )
}
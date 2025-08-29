'use client'

import { mockRaffles } from '@/lib/mockData'
import PremiumRaffleCard from '@/components/PremiumRaffleCard'
import PremiumHeader from '@/components/PremiumHeader'
import GradientMesh from '@/components/GradientMesh'
import PremiumButton from '@/components/PremiumButton'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Home() {
  const activeRaffles = mockRaffles.filter(raffle => raffle.status === 'active').slice(0, 3)
  const featuredRaffles = mockRaffles.filter(raffle => raffle.status === 'active').slice(0, 5)

  return (
    <div className="min-h-screen relative">
      <GradientMesh variant="hero" />
      
      <PremiumHeader />
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Hero Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-blue-400/20 rounded-full"
              initial={{
                x: Math.random() * 1200,
                y: Math.random() * 800,
              }}
              animate={{
                y: [0, -30, 0],
                x: Math.random() * 1200,
              }}
              transition={{
                duration: Math.random() * 6 + 8,
                repeat: Infinity,
                delay: Math.random() * 4,
              }}
            />
          ))}
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 w-full">
          {/* Social Proof Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-md rounded-full px-4 py-2 text-sm font-semibold text-slate-700 mb-8 border border-white/20 shadow-lg"
          >
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            🔥 Over 10.000 vindere i 2024
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-900 mb-6 leading-tight"
          >
            Vind <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">fantastiske præmier</span>
            <br />
            <span className="text-3xl sm:text-4xl md:text-5xl">med DrawDash</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-lg sm:text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            🇩🇰 Danmarks mest pålidelige lodtrækningsplatform med over <strong>2.5M kr</strong> i præmier uddelt
          </motion.p>
          
          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <Link href="/raffles">
              <PremiumButton
                variant="premium"
                size="xl"
                shimmer
                icon="🎯"
                className="text-lg font-bold px-8 py-4"
              >
                Se Aktive Lodtrækninger
              </PremiumButton>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Raffles Section */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6">Trending Lodtrækninger</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {featuredRaffles.slice(0,3).map((raffle, index) => (
              <div key={raffle.id} className="transform hover:scale-105 transition-all duration-300">
                <PremiumRaffleCard raffle={raffle} index={index} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="bg-slate-900 text-slate-300 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold mb-4">DrawDash</h1>
          <p className="text-slate-400">Danmarks førende platform for lodtrækninger</p>
        </div>
      </footer>
    </div>
  )
}
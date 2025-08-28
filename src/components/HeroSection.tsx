'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext'
import PremiumButton from './PremiumButton'
import TrustBadges from './TrustBadges'

export default function HeroSection() {
  const { t } = useLanguage()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-60"></div>
      
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Live Status & Stats */}
        <motion.div 
          className="flex justify-center items-center gap-6 mb-8"
          variants={itemVariants}
        >
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Live Nu
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              234 aktive deltagere
            </span>
            <span>•</span>
            <span>12 lodtrækninger i dag</span>
          </div>
        </motion.div>

        {/* Main Headline */}
        <motion.div variants={itemVariants}>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
            Vind <span className="text-gradient">fantastiske præmier</span>
            <br />med DrawDash
          </h1>
        </motion.div>
        
        <motion.p 
          className="text-xl md:text-2xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed"
          variants={itemVariants}
        >
          Danmarks mest troværdige platform for lodtrækninger. Sikre betalinger, fair draws og øjeblikkelige resultater.
        </motion.p>
        
        {/* CTA Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center mb-20"
          variants={itemVariants}
        >
          <PremiumButton
            variant="premium"
            size="xl"
            icon="🎯"
            shimmer
            className="font-bold"
          >
            Se Aktive Lodtrækninger
          </PremiumButton>
          
          <PremiumButton
            variant="ghost"
            size="xl"
            icon="❓"
          >
            Hvordan Fungerer Det?
          </PremiumButton>
        </motion.div>

        {/* Featured Info */}
        <motion.div variants={itemVariants}>
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">Populære Lodtrækninger</h2>
            <p className="text-slate-600">Deltag nu i de mest eftertragtede konkurrencer</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-slate-200">
              <div className="text-2xl mb-3">🏆</div>
              <div className="font-semibold text-slate-900">iPhone 15 Pro</div>
              <div className="text-sm text-slate-600">124 deltagere</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-slate-200">
              <div className="text-2xl mb-3">🚗</div>
              <div className="font-semibold text-slate-900">Tesla Model 3</div>
              <div className="text-sm text-slate-600">89 deltagere</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-slate-200">
              <div className="text-2xl mb-3">💍</div>
              <div className="font-semibold text-slate-900">Rolex Watch</div>
              <div className="text-sm text-slate-600">67 deltagere</div>
            </div>
          </div>
        </motion.div>
        
        {/* Value Propositions */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20"
          variants={itemVariants}
        >
          <motion.div 
            className="card-premium p-8 text-center group"
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <div className="text-3xl">💰</div>
            </div>
            <div className="text-3xl font-bold text-gradient mb-3">Fra 5 kr</div>
            <div className="text-slate-600 font-medium mb-4">Billige billetter til alle</div>
            <p className="text-sm text-slate-500">Deltag i premium lodtrækninger til en overkommelig pris</p>
          </motion.div>
          
          <motion.div 
            className="card-premium p-8 text-center group"
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="bg-gradient-to-br from-emerald-50 to-green-100 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <div className="text-3xl">🛡️</div>
            </div>
            <div className="text-3xl font-bold text-gradient mb-3">100% Sikker</div>
            <div className="text-slate-600 font-medium mb-4">Bank-niveau sikkerhed</div>
            <p className="text-sm text-slate-500">SSL kryptering og PCI compliance for maksimal sikkerhed</p>
          </motion.div>
          
          <motion.div 
            className="card-premium p-8 text-center group"
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <div className="text-3xl">⚡</div>
            </div>
            <div className="text-3xl font-bold text-gradient mb-3">Live Resultater</div>
            <div className="text-slate-600 font-medium mb-4">Øjeblikkelige vindere</div>
            <p className="text-sm text-slate-500">Se vinderne blive annonceret live på Facebook</p>
          </motion.div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div 
          className="mt-20 pt-12 border-t border-slate-200"
          variants={itemVariants}
        >
          <div className="mb-8">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-6">Trusted By Thousands</p>
            <TrustBadges layout="horizontal" variant="minimal" />
          </div>
          
          {/* Alternative Entry Disclaimer */}
          <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-200/60">
            <div className="flex items-center justify-center gap-3 text-sm text-slate-500">
              <div className="text-slate-400">📮</div>
              <span>Gratis deltagelse mulig via postkort</span>
              <span>•</span>
              <a href="/free-entry" className="underline hover:text-slate-700 transition-colors">
                Læs mere
              </a>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
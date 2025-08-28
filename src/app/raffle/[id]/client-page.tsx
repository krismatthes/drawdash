'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import PremiumHeader from '@/components/PremiumHeader'
import CountdownTimer from '@/components/CountdownTimer'
import PaymentForm from '@/components/PaymentForm'
import GradientMesh from '@/components/GradientMesh'
import ProductGallery from '@/components/ProductGallery'
import ProgressRing from '@/components/ProgressRing'
import LiveIndicator from '@/components/LiveIndicator'
import TrustBadges from '@/components/TrustBadges'
import SmoothCounter from '@/components/SmoothCounter'
import PremiumButton from '@/components/PremiumButton'
import MobileFloatingButton from '@/components/MobileFloatingButton'
import { mockRaffles } from '@/lib/mockData'
import { Raffle } from '@/types/raffle'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'

export default function ClientRafflePage() {
  const params = useParams()
  const router = useRouter()
  const [raffle, setRaffle] = useState<Raffle | null>(null)
  const [ticketQuantity, setTicketQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const { isAuthenticated, user } = useAuth()
  const { t } = useLanguage()

  useEffect(() => {
    const raffleData = mockRaffles.find(r => r.id === params.id)
    setRaffle(raffleData || null)
  }, [params.id])

  const handlePurchase = () => {
    if (!raffle) return
    
    if (!isAuthenticated) {
      router.push('/login?redirect=' + encodeURIComponent(`/raffle/${raffle.id}`))
      return
    }
    
    setShowPayment(true)
  }

  const handlePaymentSuccess = () => {
    setShowPayment(false)
    
    // Show success message with link to account page
    const message = `Du har succesfuldt deltaget i lodtrækningen med ${ticketQuantity} billet(ter)! 

Held og lykke! Du kan se alle dine deltagelser på din konto side.`
    
    if (confirm(message + '\n\nVil du gå til din konto side nu?')) {
      router.push('/account?tab=active')
    }
  }

  const handlePaymentCancel = () => {
    setShowPayment(false)
  }

  if (!raffle) {
    return (
      <div className="min-h-screen relative">
        <GradientMesh variant="hero" />
        <PremiumHeader />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Raffle Not Found</h1>
            <p className="text-gray-600 mt-2">The raffle you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    )
  }

  const progressPercentage = (raffle.soldTickets / raffle.totalTickets) * 100
  const totalCost = ticketQuantity * raffle.ticketPrice

  return (
    <div className="min-h-screen relative">
      <GradientMesh variant="hero" />
      <PremiumHeader />
      
      <main className="relative">
        {/* WOW Hero Section */}
        <div className="relative h-[65vh] overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src={raffle.image}
              alt={raffle.title}
              fill
              className="object-cover"
              priority
            />
            {/* Multi-layer gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
          </div>

          {/* Floating particles animation */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full"
                initial={{
                  x: Math.random() * 1200,
                  y: 800,
                }}
                animate={{
                  y: -10,
                  x: Math.random() * 1200,
                }}
                transition={{
                  duration: Math.random() * 10 + 10,
                  repeat: Infinity,
                  delay: Math.random() * 10,
                }}
              />
            ))}
          </div>

          {/* Hero Content */}
          <div className="relative h-full flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-4xl">
                
                {/* Status badges */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-4 mb-6"
                >
                  <LiveIndicator variant="live" size="lg" />
                  {raffle.isInstantWin && (
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-bold animate-pulse">
                      ⚡ INSTANT WIN
                    </div>
                  )}
                  <div className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-semibold border border-white/30">
                    {raffle.soldTickets} aktive deltagere
                  </div>
                </motion.div>

                {/* Main Title */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-6"
                >
                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-tight tracking-tight">
                    <span className="block">VIND</span>
                    <span className="block bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                      DENNE
                    </span>
                    <span className="block text-4xl md:text-5xl lg:text-6xl font-bold mt-2">
                      {raffle.title.toUpperCase()}
                    </span>
                  </h1>
                </motion.div>

                {/* Prize Value - The WOW Factor */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="mb-8"
                >
                  <div className="bg-gradient-to-r from-green-400/20 to-blue-400/20 backdrop-blur-xl border border-white/30 rounded-2xl p-6 inline-block">
                    <div className="text-white/80 text-sm font-semibold uppercase tracking-wider mb-2">
                      TOTAL VÆRDI
                    </div>
                    <div className="text-4xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-400 to-purple-400">
                      {raffle.prize.value.toLocaleString('da-DK')} kr
                    </div>
                  </div>
                </motion.div>

                {/* Urgency message */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mb-8"
                >
                  <div className="bg-red-500/20 backdrop-blur-md border border-red-400/30 rounded-xl p-4 inline-block">
                    <div className="flex items-center gap-3 text-white">
                      <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse" />
                      <span className="font-semibold">
                        Kun {raffle.totalTickets - raffle.soldTickets} billetter tilbage!
                      </span>
                      <span className="text-red-300">⚡ Handl nu!</span>
                    </div>
                  </div>
                </motion.div>

                {/* CTA Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-2xl hover:shadow-orange-500/25 transform hover:scale-105">
                    🎯 KØBE BILLETTER NU
                  </button>
                  <button className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white px-6 py-4 rounded-xl font-semibold border border-white/30 transition-all duration-300">
                    📖 Se Detaljer
                  </button>
                </motion.div>

                {/* Social Proof */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="mt-8 flex items-center gap-4 text-white/70 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span>👥</span>
                    <span>{raffle.participants} personer deltager lige nu</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-2">
                    <span>🔥</span>
                    <span>Mest populære lodtrækning denne uge</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="bg-white/20 backdrop-blur-md rounded-full p-3 border border-white/30">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </motion.div>
        </div>

        {/* Smooth Transition Section */}
        <div className="relative -mt-16 z-10">
          <div className="bg-gradient-to-b from-transparent via-white/40 to-white h-24"></div>
        </div>

        {/* Main Content Grid */}
        <div className="max-w-7xl mx-auto px-4 pb-12 relative z-10 -mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            
            {/* Left: Product Gallery (60%) */}
            <div className="lg:col-span-3 space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg"
              >
                <ProductGallery 
                  images={[raffle.image]} 
                  title={raffle.title} 
                />
              </motion.div>

              {/* Prize Details Card */}
              <motion.div 
                className="card-premium p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-xl font-semibold text-slate-900 mb-6">Præmiedetaljer</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-sm text-slate-600 mb-1">Præmie</div>
                    <div className="font-semibold text-slate-900">{raffle.prize.name}</div>
                  </div>
                  
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-sm text-slate-600 mb-1">Værdi</div>
                    <div className="font-bold text-2xl text-gradient">
                      <SmoothCounter 
                        value={raffle.prize.value} 
                        format="currency"
                        currency="DKK"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-700 leading-relaxed">{raffle.prize.description}</p>
                </div>
              </motion.div>

              {/* Trust Badges */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <TrustBadges layout="grid" variant="detailed" />
              </motion.div>
            </div>

            {/* Right: PROMINENT Action Panel (40%) */}
            <div className="lg:col-span-2">
              <motion.div
                className="lg:sticky lg:top-8 space-y-8 mobile-safe-area"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                {/* Status & Progress Card */}
                <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-2xl p-6 shadow-xl">
                  
                  {/* Urgency Header */}
                  <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 rounded-xl mb-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      <span className="font-bold text-sm">KUN {raffle.totalTickets - raffle.soldTickets} TILBAGE!</span>
                    </div>
                    <div className="text-xs opacity-90">⚡ {Math.round(progressPercentage)}% solgt</div>
                  </div>

                  {/* Prize Display */}
                  <div className="text-center mb-6">
                    <div className="text-sm font-semibold text-orange-600 mb-3">🏆 VIND</div>
                    <div className="text-xl font-black text-slate-900 mb-3">{raffle.title}</div>
                    <div className="text-3xl font-black bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent mb-4">
                      {raffle.prize.value.toLocaleString('da-DK')} kr
                    </div>
                    
                    {/* Progress Ring */}
                    <div className="flex items-center justify-center mb-3">
                      <ProgressRing 
                        progress={progressPercentage}
                        size="md"
                        label="Solgt"
                        showValue={false}
                      />
                    </div>
                    <div className="text-sm font-bold text-slate-900">
                      <SmoothCounter value={raffle.soldTickets} /> / {raffle.totalTickets}
                    </div>
                  </div>

                  {/* Countdown Timer */}
                  <div className="text-center bg-slate-900 text-white rounded-xl p-4">
                    <div className="text-xs font-semibold mb-2 text-orange-400">⏰ SLUTTER I:</div>
                    <CountdownTimer endDate={raffle.endDate} />
                  </div>
                </div>

                {/* Purchase Panel */}
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-3 border-orange-300 rounded-2xl p-6 shadow-xl">
                  <div className="text-center mb-6">
                    <div className="text-2xl font-black text-orange-600 mb-2">🎯 KØB BILLETTER</div>
                    <div className="text-sm text-orange-700 font-semibold">Handl hurtigt!</div>
                  </div>
                  
                  {/* Quick Select Buttons */}
                  <div className="grid grid-cols-4 gap-3 mb-6">
                    {[1, 5, 10, 25].map((qty) => (
                      <button
                        key={qty}
                        onClick={() => setTicketQuantity(qty)}
                        className={`py-3 px-3 rounded-xl font-bold text-sm transition-all ${
                          ticketQuantity === qty
                            ? 'bg-orange-500 text-white shadow-md scale-105'
                            : 'bg-white border border-orange-200 text-orange-600 hover:border-orange-400 hover:scale-105'
                        }`}
                      >
                        {qty} stk
                      </button>
                    ))}
                  </div>

                  {/* Ticket Selector */}
                  <div className="mb-6">
                    <div className="flex items-center justify-center bg-white rounded-2xl p-4 border-2 border-orange-200">
                      <motion.button
                        onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                        className="w-10 h-10 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold text-lg disabled:opacity-50"
                        disabled={ticketQuantity <= 1}
                        whileTap={{ scale: 0.95 }}
                      >
                        −
                      </motion.button>
                      <div className="flex-1 mx-4 text-center">
                        <input
                          type="number"
                          value={ticketQuantity}
                          onChange={(e) => setTicketQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-16 bg-transparent text-center text-3xl font-black text-orange-600 border-none outline-none"
                          min="1"
                        />
                        <div className="text-sm text-orange-500 font-semibold mt-1">billetter</div>
                      </div>
                      <motion.button
                        onClick={() => setTicketQuantity(ticketQuantity + 1)}
                        className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold text-lg"
                        whileTap={{ scale: 0.95 }}
                      >
                        +
                      </motion.button>
                    </div>
                  </div>

                  {/* Win Chance & Price */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-4 border border-green-200 text-center">
                      <div className="text-sm font-semibold text-green-700 mb-2">🎯 CHANCE</div>
                      <div className="text-xl font-black text-green-600">
                        {((ticketQuantity / raffle.totalTickets) * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border-2 border-orange-200 text-center">
                      <div className="text-sm font-bold text-slate-600 mb-2">💰 PRIS</div>
                      <div className="text-xl font-bold text-slate-900">
                        {(ticketQuantity * raffle.ticketPrice).toLocaleString('da-DK')} kr
                      </div>
                    </div>
                  </div>

                  {/* Login Required Notice */}
                  {!isAuthenticated && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-center">
                      <div className="text-sm text-amber-800 font-semibold">⚠️ Login påkrævet for at deltage</div>
                    </div>
                  )}

                  {/* CTA Button */}
                  <PremiumButton
                    variant={isAuthenticated ? 'premium' : 'primary'}
                    size="xl"
                    icon={isAuthenticated ? '🎯' : '👤'}
                    iconPosition="left"
                    onClick={handlePurchase}
                    shimmer={isAuthenticated}
                    className="w-full font-bold mb-4"
                  >
                    {isAuthenticated 
                      ? (raffle.isInstantWin ? '⚡ Spil Nu' : 'Deltag i Lodtrækning')
                      : 'Log Ind for at Deltage'
                    }
                  </PremiumButton>

                  {/* Alternative Entry Link */}
                  <div className="text-center mb-4">
                    <a 
                      href="/free-entry" 
                      className="text-sm text-slate-500 hover:text-slate-700 transition-colors underline"
                    >
                      ⓘ Alternative deltagelsesmuligheder
                    </a>
                  </div>

                  <p className="text-xs text-slate-400 text-center">
                    Ved deltagelse accepterer du vores vilkår
                  </p>
                </div>

                {/* How It Works */}
                <div className="card-premium p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Sådan fungerer det</h3>
                  <div className="space-y-4">
                    {[
                      { icon: '🎫', text: 'Vælg antal billetter' },
                      { icon: '💳', text: 'Gennemfør sikker betaling' },
                      { icon: '⏰', text: 'Vent på lodtrækning' },
                      { icon: '🏆', text: 'Vinder annonceres live' }
                    ].map((step, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-sm">
                          {step.icon}
                        </div>
                        <span className="text-sm text-slate-700">{step.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Floating Action Button */}
      <MobileFloatingButton
        label={isAuthenticated 
          ? (raffle.isInstantWin ? '⚡ Spil Nu' : 'Deltag Nu')
          : 'Log Ind'
        }
        icon={isAuthenticated ? '🎯' : '👤'}
        onClick={handlePurchase}
        variant={isAuthenticated ? 'premium' : 'primary'}
      />

      {showPayment && (
        <PaymentForm
          amount={totalCost}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      )}
    </div>
  )
}
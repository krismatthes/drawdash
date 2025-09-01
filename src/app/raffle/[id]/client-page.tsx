'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import PremiumHeader from '@/components/PremiumHeader'
import CountdownTimer from '@/components/CountdownTimer'
import DemoPaymentForm from '@/components/DemoPaymentForm'
import GradientMesh from '@/components/GradientMesh'
import ProductGallery from '@/components/ProductGallery'
import ProgressRing from '@/components/ProgressRing'
import LiveIndicator from '@/components/LiveIndicator'
import TrustBadges from '@/components/TrustBadges'
import SmoothCounter from '@/components/SmoothCounter'
import PremiumButton from '@/components/PremiumButton'
import MobileFloatingButton from '@/components/MobileFloatingButton'
import PointsCalculationDisplay from '@/components/PointsCalculationDisplay'
import InstantWinReveal from '@/components/InstantWinReveal'
import SuccessModal from '@/components/SuccessModal'
import { mockRaffles } from '@/lib/mockData'
import { Raffle } from '@/types/raffle'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { LoyaltyCalculator } from '@/lib/loyalty'
import { LOYALTY_TIERS } from '@/types/loyalty'
import { InstantWinService, InstantWinResult } from '@/lib/instantWinService'

export default function ClientRafflePage() {
  const params = useParams()
  const router = useRouter()
  const [raffle, setRaffle] = useState<Raffle | null>(null)
  const [ticketQuantity, setTicketQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [showInstantWin, setShowInstantWin] = useState(false)
  const [instantWinResult, setInstantWinResult] = useState<InstantWinResult | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successModalData, setSuccessModalData] = useState({ title: '', message: '', type: 'success' as 'success' | 'info' | 'celebration' })
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

  const handlePaymentSuccess = (pointsUsed?: number) => {
    setShowPayment(false)
    
    // Check if this is an instant win raffle
    if (raffle?.isInstantWin && user) {
      // Generate instant win result
      const entryId = `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const result = InstantWinService.generateInstantWinResult(
        raffle.id,
        user.id,
        entryId
      )
      
      setInstantWinResult(result)
      setShowInstantWin(true)
      return
    }
    
    // Regular raffle success flow
    let message = `Du har succesfuldt deltaget i lodtrækningen med ${ticketQuantity} billet(ter)!`
    
    if (pointsUsed && pointsUsed > 0) {
      message += `\n\nDu brugte ${pointsUsed.toLocaleString('da-DK')} DrawDash Rewards points på dette køb.`
      
      if (pointsCalculation) {
        message += `\nDu optjener ${pointsCalculation.totalPoints.toLocaleString('da-DK')} nye points for denne transaktion.`
      }
    }
    
    message += `\n\nHeld og lykke! Du kan se alle dine deltagelser på din konto side.`
    
    setSuccessModalData({
      title: 'Deltagelse Bekræftet!',
      message: message,
      type: 'success'
    })
    setShowSuccessModal(true)
  }

  const handlePaymentCancel = () => {
    setShowPayment(false)
  }

  const handleInstantWinClose = () => {
    setShowInstantWin(false)
    
    // Show appropriate message based on result
    if (instantWinResult?.isWinner) {
      const message = `Tillykke! Du vandt ${instantWinResult.prizeWon?.name} til en værdi af ${instantWinResult.prizeWon?.value.toLocaleString('da-DK')} kr!\n\nDin gevinst er automatisk tilføjet til din konto.`
      
      setSuccessModalData({
        title: 'Stort Tillykke!',
        message: message,
        type: 'celebration'
      })
      setShowSuccessModal(true)
    } else {
      const message = `Du har succesfuldt deltaget i instant win spillet med ${ticketQuantity} billet(ter)!\n\nDesværre ingen gevinst denne gang, men bedre held næste gang!`
      
      setSuccessModalData({
        title: 'Deltagelse Bekræftet!',
        message: message,
        type: 'info'
      })
      setShowSuccessModal(true)
    }
    
    // Reset instant win state
    setInstantWinResult(null)
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
  
  // Calculate points that would be earned
  const pointsCalculation = user ? LoyaltyCalculator.calculatePointsEarned(
    totalCost,
    ticketQuantity,
    user.loyaltyTier
  ) : null

  return (
    <div className="min-h-screen relative bg-white">
      <GradientMesh variant="hero" />
      <PremiumHeader />
      
      <main className="relative">
        {/* Premium Hero Banner - Smaller but Beautiful */}
        <div className="relative h-[40vh] sm:h-[45vh] overflow-hidden">
          {/* Background Image with Premium Effects */}
          <div className="absolute inset-0">
            <Image
              src={raffle.image}
              alt={raffle.title}
              fill
              className="object-cover object-center"
              priority
              sizes="100vw"
            />
            {/* Premium gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
          </div>

          {/* Subtle floating particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/30 rounded-full"
                initial={{
                  x: Math.random() * 800,
                  y: 400,
                }}
                animate={{
                  y: -10,
                  x: Math.random() * 800,
                }}
                transition={{
                  duration: Math.random() * 8 + 12,
                  repeat: Infinity,
                  delay: Math.random() * 8,
                }}
              />
            ))}
          </div>

          {/* Hero Content - Centered and Clean */}
          <div className="relative h-full flex items-center">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-3xl">
                
                {/* Status badges */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-wrap items-center gap-3 mb-4"
                >
                  {raffle.isInstantWin && (
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-400 text-white px-3 py-1.5 rounded-full text-sm font-bold">
                      ⚡ INSTANT WIN
                    </div>
                  )}
                  <div className="glass backdrop-blur-md text-white px-3 py-1.5 rounded-full text-sm font-medium">
                    {raffle.soldTickets} deltagere
                  </div>
                </motion.div>

                {/* Title */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-5"
                >
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
                    Vind denne {raffle.title}
                  </h1>
                </motion.div>

                {/* Prize Value with Premium Styling */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="mb-6"
                >
                  <div className="glass backdrop-blur-xl rounded-xl p-4 inline-block border-white/20">
                    <div className="text-white/80 text-sm font-medium mb-1">
                      TOTAL VÆRDI
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300">
                      {raffle.prize.value.toLocaleString('da-DK')} kr
                    </div>
                  </div>
                </motion.div>

                {/* Urgency message with premium styling */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mb-6"
                >
                  <div className="bg-amber-500/20 backdrop-blur-md border border-amber-400/30 rounded-lg px-4 py-2 inline-block">
                    <div className="flex items-center gap-2 text-white text-sm">
                      <div className="w-2 h-2 bg-amber-300 rounded-full animate-pulse" />
                      <span className="font-medium">
                        Kun {raffle.totalTickets - raffle.soldTickets} billetter tilbage
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* CTA Buttons with Premium Styling */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <PremiumButton
                    variant="premium"
                    size="lg"
                    shimmer
                    icon="🎯"
                    onClick={() => {
                      document.getElementById('actions')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }}
                  >
                    Køb billetter nu
                  </PremiumButton>
                  <button
                    onClick={() => {
                      document.getElementById('details')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }}
                    className="glass backdrop-blur-md text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 border border-white/20 hover:bg-white/10"
                  >
                    📖 Se detaljer
                  </button>
                </motion.div>
              </div>
            </div>
          </div>
        </div>


        {/* Main Content Grid with Premium Cards */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            
            {/* Left: Product Gallery & Details (60%) */}
            <div className="lg:col-span-3 space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="card-premium p-4"
              >
                <ProductGallery 
                  images={[raffle.image]} 
                  title={raffle.title} 
                />
              </motion.div>

              {/* Prize Details Card with Premium Styling */}
              <motion.div 
                id="details"
                className="card-premium p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-xl font-semibold text-slate-900 mb-6">Præmiedetaljer</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4">
                    <div className="text-sm text-slate-600 mb-1">Præmie</div>
                    <div className="font-semibold text-slate-900">{raffle.prize.name}</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4">
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

              {/* Progress/Sold Stats - Redesigned */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="card-premium p-6"
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Lodtrækningsstatus</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
                    <div className="text-sm text-blue-600 font-medium mb-1">Solgte billetter</div>
                    <div className="text-2xl font-bold text-blue-700">
                      <SmoothCounter value={raffle.soldTickets} />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 text-center">
                    <div className="text-sm text-slate-600 font-medium mb-1">Total billetter</div>
                    <div className="text-2xl font-bold text-slate-700">{raffle.totalTickets}</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
                    <div className="text-sm text-green-600 font-medium mb-1">Solgt procent</div>
                    <div className="text-2xl font-bold text-green-700">{Math.round(progressPercentage)}%</div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="relative">
                  <div className="bg-slate-200 rounded-full h-3 mb-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>0</span>
                    <span className="font-medium text-slate-700">{raffle.soldTickets} / {raffle.totalTickets}</span>
                    <span>{raffle.totalTickets}</span>
                  </div>
                </div>
                
                {/* Logo-themed Countdown */}
                <div className="mt-6 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl p-5 relative overflow-hidden shadow-lg">
                  {/* Glass overlay for depth */}
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-xl"></div>
                  
                  {/* Content */}
                  <div className="relative text-center">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <div className="w-2 h-2 bg-white/80 rounded-full animate-pulse"></div>
                      <span className="text-white font-bold text-sm uppercase tracking-wide">
                        🔥 Slutter om
                      </span>
                      <div className="w-2 h-2 bg-white/80 rounded-full animate-pulse"></div>
                    </div>
                    
                    <div className="text-white font-bold">
                      <CountdownTimer endDate={raffle.endDate} />
                    </div>
                    
                    <div className="mt-3 text-xs text-white/80 font-medium">
                      Handl hurtigt før tiden udløber!
                    </div>
                  </div>
                  
                  {/* Decorative shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Corner accents */}
                  <div className="absolute top-2 right-2 w-1 h-1 bg-white/60 rounded-full animate-ping"></div>
                  <div className="absolute bottom-2 left-2 w-1 h-1 bg-white/60 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
                </div>
              </motion.div>
            </div>

            {/* Right: PROMINENT Action Panel (40%) */}
            <div className="lg:col-span-2" id="actions">
              <motion.div
                className="lg:sticky lg:top-8 space-y-6 mobile-safe-area"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                {/* Urgency Alert */}
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-xl text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="font-bold text-sm">KUN {raffle.totalTickets - raffle.soldTickets} TILBAGE!</span>
                  </div>
                  <div className="text-xs opacity-90">Handl hurtigt • {Math.round(progressPercentage)}% solgt</div>
                </div>

                {/* Purchase Panel - Moved up */}
                <div className="card-premium p-6">
                  <div className="text-center mb-6">
                    <div className="text-sm text-slate-600 font-semibold mb-2 uppercase tracking-wide">
                      🎯 Deltag i lodtrækningen
                    </div>
                    <div className="text-2xl font-black text-slate-900">
                      Værdi: <span className="text-green-600">{raffle.prize.value.toLocaleString('da-DK')} kr</span>
                    </div>
                    <div className="text-sm text-slate-600 mt-2">
                      Billetpris: kun {raffle.ticketPrice} kr pr. billet
                    </div>
                  </div>
                  
                  {/* Quick Select Buttons */}
                  <div className="grid grid-cols-4 gap-3 mb-6">
                    {[1, 5, 10, 25].map((qty) => (
                      <button
                        key={qty}
                        onClick={() => setTicketQuantity(qty)}
                        className={`py-3 px-3 rounded-xl font-bold text-sm transition-all ${
                          ticketQuantity === qty
                            ? 'bg-gradient-to-r from-blue-500 to-pink-500 text-white shadow-md scale-105'
                            : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-400 hover:scale-105'
                        }`}
                      >
                        {qty} stk
                      </button>
                    ))}
                  </div>

                  {/* Ticket Selector */}
                  <div className="mb-6">
                    <div className="flex items-center justify-center bg-white rounded-2xl p-4 border border-slate-200">
                      <motion.button
                        onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                        className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-bold text-lg disabled:opacity-50"
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
                          className="w-16 bg-transparent text-center text-3xl font-black text-blue-600 border-none outline-none"
                          min="1"
                        />
                        <div className="text-sm text-slate-500 font-semibold mt-1">billetter</div>
                      </div>
                      <motion.button
                        onClick={() => setTicketQuantity(ticketQuantity + 1)}
                        className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-pink-500 text-white font-bold text-lg"
                        whileTap={{ scale: 0.95 }}
                      >
                        +
                      </motion.button>
                    </div>
                  </div>

                  {/* Win Chance & Price */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 text-center">
                      <div className="text-sm font-semibold text-blue-700 mb-2">🎯 CHANCE</div>
                      <div className="text-xl font-black text-blue-600">
                        {((ticketQuantity / raffle.totalTickets) * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
                      <div className="text-sm font-bold text-slate-600 mb-2">💰 PRIS</div>
                      <div className="text-xl font-bold text-slate-900">
                        {(ticketQuantity * raffle.ticketPrice).toLocaleString('da-DK')} kr
                      </div>
                    </div>
                  </div>
                  
                  {/* Points Earning Display */}
                  {isAuthenticated && pointsCalculation && (
                    <div className="mb-6">
                      <PointsCalculationDisplay 
                        calculation={pointsCalculation}
                        animate
                      />
                    </div>
                  )}

                  {/* Login Required Notice */}
                  {!isAuthenticated && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-center">
                      <div className="text-sm text-amber-800 font-semibold">⚠️ Login påkrævet for at deltage</div>
                    </div>
                  )}

                  {/* Primary CTA Button */}
                  <PremiumButton
                    variant={isAuthenticated ? 'premium' : 'primary'}
                    size="xl"
                    onClick={handlePurchase}
                    shimmer={isAuthenticated}
                    className="w-full font-bold mb-4"
                  >
                    {isAuthenticated 
                      ? (raffle.isInstantWin ? 'Spil Nu' : 'Deltag i Lodtrækning')
                      : 'Log Ind for at Deltage'
                    }
                  </PremiumButton>

                  {/* Free Entry CTA - Equal Prominence */}
                  <div className="mb-4">
                    <PremiumButton
                      variant="outline"
                      size="xl"
                      onClick={() => window.open('/free-entry', '_blank')}
                      className="w-full font-bold border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                    >
                      Deltag GRATIS med Postkort
                    </PremiumButton>
                  </div>

                  {/* Equal chance notice */}
                  <div className="text-center mb-4">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                      <div className="text-sm font-semibold text-emerald-800 mb-1">
                        Samme vindersandsynlighed
                      </div>
                      <div className="text-xs text-emerald-700">
                        Gratis og betalte billetter har identisk chance for at vinde
                      </div>
                    </div>
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
                      { icon: '🎫', text: 'Vælg antal billetter ELLER send gratis postkort' },
                      { icon: '💳', text: 'Gennemfør sikker betaling eller gratis deltagelse' },
                      { icon: '🎯', text: 'Optjen DrawDash Rewards points (kun betalte billetter)' },
                      { icon: '⏰', text: 'Vent på lodtrækning' },
                      { icon: '🏆', text: 'Vinder annonceres live - alle deltagere har samme chance' }
                    ].map((step, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-sm">
                          {step.icon}
                        </div>
                        <span className="text-sm text-slate-700">{step.text}</span>
                      </div>
                    ))}
                  </div>
                  
                  {isAuthenticated && user && (
                    <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                      <div className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                        🎆 DrawDash Rewards Status
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Din tier: <span className="font-semibold text-slate-900">{LOYALTY_TIERS[user.loyaltyTier || 'bronze'].name}</span></span>
                        <span className="text-blue-600 font-bold">{user.points} points</span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Floating Action Button */}
      <MobileFloatingButton
        label={isAuthenticated 
          ? (raffle.isInstantWin ? 'Spil Nu' : 'Deltag Nu')
          : 'Log Ind'
        }
        icon={isAuthenticated ? '🎯' : '👤'}
        onClick={handlePurchase}
        variant={isAuthenticated ? 'premium' : 'primary'}
      />

      {showPayment && (
        <DemoPaymentForm
          amount={totalCost}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      )}

      {/* Instant Win Reveal Modal */}
      <InstantWinReveal
        isOpen={showInstantWin}
        result={instantWinResult}
        onClose={handleInstantWinClose}
        raffleName={raffle.title}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onConfirm={() => {
          setShowSuccessModal(false)
          if (successModalData.type === 'celebration') {
            router.push('/account?tab=winnings')
          } else {
            router.push('/account?tab=active')
          }
        }}
        title={successModalData.title}
        message={successModalData.message}
        type={successModalData.type}
        confirmText="Gå til Konto"
        cancelText="Luk"
      />
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { raffleServiceDB } from '@/lib/raffleServiceDB'
import RaffleCarousel from '@/components/RaffleCarousel'
import PremiumHeader from '@/components/PremiumHeader'
import PremiumFooter from '@/components/PremiumFooter'
import GradientMesh from '@/components/GradientMesh'
import PremiumButton from '@/components/PremiumButton'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Home() {
  const [activeRaffles, setActiveRaffles] = useState<any[]>([])
  const [featuredRaffles, setFeaturedRaffles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadRaffles = async () => {
      try {
        const raffles = await raffleServiceDB.getActiveRaffles()
        setActiveRaffles(raffles.slice(0, 3))
        setFeaturedRaffles(raffles.slice(0, 5))
      } catch (error) {
        console.error('Failed to load raffles:', error)
        // Fallback to empty arrays
        setActiveRaffles([])
        setFeaturedRaffles([])
      } finally {
        setLoading(false)
      }
    }

    loadRaffles()
  }, [])

  return (
    <div className="min-h-screen relative">
      <GradientMesh variant="hero" />
      
      <PremiumHeader />
      
      {/* Hero Section */}
      <section className="relative min-h-[95vh] flex items-center overflow-hidden">
        {/* Hero Background Elements - Floating Tickets */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`ticket-${i}`}
              className="absolute opacity-15 hover:opacity-25 transition-opacity duration-500"
              initial={{
                x: Math.random() * 1400,
                y: Math.random() * 900,
                rotate: Math.random() * 360,
                scale: 0.9 + Math.random() * 0.3,
              }}
              animate={{
                x: [
                  Math.random() * 1400,
                  Math.random() * 1400,
                  Math.random() * 1400,
                ],
                y: [
                  Math.random() * 900,
                  Math.random() * 900,
                  Math.random() * 900,
                ],
                rotate: [
                  Math.random() * 360,
                  Math.random() * 360 + 180,
                  Math.random() * 360,
                ],
              }}
              transition={{
                duration: Math.random() * 20 + 25,
                repeat: Infinity,
                delay: Math.random() * 8,
                ease: "linear",
              }}
            >
              {/* Lottery Ticket SVG */}
              <svg 
                width="100" 
                height="60" 
                viewBox="0 0 100 60" 
                className="drop-shadow-lg"
              >
                {/* Main ticket body with gradient */}
                <defs>
                  <linearGradient id={`ticketGrad-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8"/>
                    <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.8"/>
                    <stop offset="100%" stopColor="#ec4899" stopOpacity="0.8"/>
                  </linearGradient>
                </defs>
                
                {/* Ticket main body */}
                <rect 
                  x="5" y="5" 
                  width="90" height="50" 
                  rx="8" ry="8" 
                  fill={`url(#ticketGrad-${i})`}
                  stroke="white" 
                  strokeWidth="2"
                />
                
                {/* Perforated line down the middle */}
                <line x1="70" y1="5" x2="70" y2="55" stroke="white" strokeWidth="1" strokeDasharray="2,2" opacity="0.8"/>
                
                {/* Perforation circles */}
                {Array.from({length: 8}).map((_, idx) => (
                  <circle 
                    key={idx}
                    cx="70" 
                    cy={8 + idx * 6} 
                    r="1.5" 
                    fill="white" 
                    opacity="0.9"
                  />
                ))}
                
                {/* Left side - Main section */}
                <text x="12" y="20" fontSize="8" fill="white" fontWeight="bold" opacity="0.9">LODTRÆKNING</text>
                <text x="12" y="32" fontSize="12" fill="white" fontWeight="black" opacity="0.95">#{Math.floor(Math.random() * 9999).toString().padStart(4, '0')}</text>
                <text x="12" y="45" fontSize="6" fill="white" opacity="0.7">DrawDash</text>
                
                {/* Right side - Stub */}
                <text x="75" y="18" fontSize="6" fill="white" fontWeight="bold" opacity="0.8">LOD</text>
                <text x="75" y="30" fontSize="8" fill="white" fontWeight="bold" opacity="0.9">#{Math.floor(Math.random() * 9999).toString().padStart(4, '0')}</text>
                <text x="75" y="42" fontSize="5" fill="white" opacity="0.6">2024</text>
                
                {/* Decorative corner elements */}
                <circle cx="15" cy="15" r="2" fill="white" opacity="0.3"/>
                <circle cx="85" cy="15" r="2" fill="white" opacity="0.3"/>
                <circle cx="15" cy="45" r="2" fill="white" opacity="0.3"/>
                <circle cx="85" cy="45" r="2" fill="white" opacity="0.3"/>
                
                {/* Small stars for lottery feel */}
                <text x="45" y="18" fontSize="8" fill="white" opacity="0.5">⭐</text>
                <text x="35" y="42" fontSize="6" fill="white" opacity="0.4">✨</text>
              </svg>
            </motion.div>
          ))}
          
          {/* Additional smaller decorative elements */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={`dot-${i}`}
              className="absolute w-2 h-2 bg-purple-400/15 rounded-full"
              initial={{
                x: Math.random() * 1200,
                y: Math.random() * 800,
              }}
              animate={{
                x: [
                  Math.random() * 1200,
                  Math.random() * 1200,
                ],
                y: [
                  Math.random() * 800,
                  Math.random() * 800,
                ],
              }}
              transition={{
                duration: Math.random() * 15 + 20,
                repeat: Infinity,
                delay: Math.random() * 10,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 w-full">
          {/* Social Proof Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-50 to-blue-50 backdrop-blur-sm rounded-full px-5 py-2.5 text-sm font-bold text-slate-800 mb-8 border border-green-200/60 shadow-sm"
          >
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            🏆 Over 10.000 vindere siden 2024
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl sm:text-6xl md:text-8xl font-black text-slate-900 mb-8 leading-[0.9] tracking-tight"
          >
            Vind <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">Drømmepræmier</span>
            <br />
            <span className="text-4xl sm:text-5xl md:text-6xl font-black">med DrawDash</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-xl sm:text-2xl text-slate-700 mb-10 max-w-4xl mx-auto leading-relaxed font-semibold"
          >
            🇩🇰 Danmarks mest pålidelige lodtrækningsplatform
            <br />
            <span className="text-lg text-slate-600 font-medium">Med over <strong className="text-green-600">2.5M kr</strong> uddelt til glade vindere</span>
          </motion.p>
          
          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <Link href="/raffles">
              <PremiumButton
                variant="premium"
                size="xl"
                shimmer
                icon="🎯"
                className="text-xl font-black px-10 py-5 shadow-2xl"
              >
                Se aktive lodtrækninger
              </PremiumButton>
            </Link>
            <Link href="/winners">
              <PremiumButton
                variant="outline"
                size="xl"
                icon="🏆"
                className="text-xl font-bold px-10 py-5 border-2 hover:shadow-xl"
              >
                Se vindere
              </PremiumButton>
            </Link>
          </motion.div>

          {/* Trust Indicators - More Prominent */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-8 mb-12"
          >
            <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 border border-green-200/50">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">🔒</span>
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-slate-900">100% Sikker</div>
                <div className="text-xs text-slate-600">Bank-niveau sikkerhed</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 border border-blue-200/50">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">⚡</span>
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-slate-900">Øjeblikkelig</div>
                <div className="text-xs text-slate-600">Hurtig udbetaling</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 border border-purple-200/50">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">🎯</span>
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-slate-900">Fair Spil</div>
                <div className="text-xs text-slate-600">Transparent proces</div>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats - Enhanced */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            <div className="text-center bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
              <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-3">2.5M+</div>
              <div className="text-sm text-slate-700 font-bold uppercase tracking-wide">Kroner Uddelt</div>
            </div>
            <div className="text-center bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
              <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-3">10K+</div>
              <div className="text-sm text-slate-700 font-bold uppercase tracking-wide">Glade Vindere</div>
            </div>
            <div className="text-center bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
              <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-3">100%</div>
              <div className="text-sm text-slate-700 font-bold uppercase tracking-wide">Sikker Platform</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Raffles Section */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full px-4 py-2 text-sm font-semibold text-slate-700 mb-6">
              🔥 HOT
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6">Trending lodtrækninger</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
              De mest populære konkurrencer lige nu - få dine billetter før de sælger ud!
            </p>
          </motion.div>
          
          {/* Featured Raffle Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-slate-600">Indlæser lodtrækninger...</p>
              </div>
            ) : featuredRaffles.length > 0 ? (
              <RaffleCarousel raffles={featuredRaffles} />
            ) : (
              <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-2xl">
                <div className="text-6xl mb-4">🎫</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Ingen aktive lodtrækninger
                </h3>
                <p className="text-slate-600">
                  Der er ingen aktive lodtrækninger lige nu. Kom tilbage senere!
                </p>
              </div>
            )}
          </motion.div>
          
          {/* View All CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link href="/raffles">
              <PremiumButton
                variant="outline"
                size="lg"
                icon="👀"
                className="font-semibold"
              >
                Se alle lodtrækninger
              </PremiumButton>
            </Link>
          </motion.div>
        </div>
      </section>
      
      {/* DrawDash Rewards Section */}
      <section className="relative py-20 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-100 to-cyan-100 rounded-full px-4 py-2 text-sm font-semibold text-slate-700 mb-6">
              🎆 NYT
              <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6">DrawDash rewards</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Optjen points ved hvert køb og indløs dem som rabat. Jo mere du spiller, jo flere fordele får du!
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {[
              { tier: 'Bronze', color: 'from-amber-400 to-orange-500', icon: '🥉', points: '1x points', threshold: '0 kr' },
              { tier: 'Silver', color: 'from-gray-400 to-gray-500', icon: '🥈', points: '1.15x points', threshold: '500 kr' },
              { tier: 'Gold', color: 'from-yellow-400 to-yellow-500', icon: '🥇', points: '1.3x points', threshold: '2.000 kr' },
              { tier: 'Diamond', color: 'from-emerald-400 to-teal-500', icon: '💎', points: '1.5x points', threshold: '10.000 kr' },
            ].map((tier, index) => (
              <motion.div
                key={tier.tier}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-white/50 text-center hover:shadow-xl transition-all duration-300"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${tier.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <span className="text-2xl">{tier.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{tier.tier}</h3>
                <div className="text-lg font-semibold text-blue-600 mb-2">{tier.points}</div>
                <div className="text-sm text-slate-500">Fra {tier.threshold}</div>
              </motion.div>
            ))}
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link href="/register">
              <PremiumButton
                variant="premium"
                size="lg"
                icon="🚀"
                shimmer
                className="font-bold"
              >
                Start med at optjene points
              </PremiumButton>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Recent Winners Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-100 via-transparent to-teal-100 opacity-60"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-blue-100 rounded-full px-4 py-2 text-sm font-semibold text-slate-700 mb-6">
              🏆 SENESTE VINDERE
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6">Nylige vindere</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Se hvem der har vundet de seneste præmier - måske er du den næste!
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Lars K.', prize: 'iPhone 15 Pro', value: '12.000 kr', time: '2 timer siden', city: 'København' },
              { name: 'Maria S.', prize: 'Apple Watch', value: '4.500 kr', time: '5 timer siden', city: 'Aarhus' },
              { name: 'Thomas H.', prize: '2.500 kr Cash', value: '2.500 kr', time: '1 dag siden', city: 'Odense' }
            ].map((winner, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {winner.name[0]}
                  </div>
                  <div className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                    {winner.time}
                  </div>
                </div>
                
                <h4 className="font-bold text-slate-900 text-lg mb-1">{winner.name}</h4>
                <p className="text-slate-600 mb-2">{winner.city}</p>
                
                <div className="border-t border-slate-200 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900">{winner.prize}</div>
                      <div className="text-sm text-slate-500">Værdi: {winner.value}</div>
                    </div>
                    <div className="text-2xl">🏆</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6">Sådan fungerer det</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Deltag i lodtrækninger på 3 nemme steps - det er så enkelt!
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: '1',
                title: 'Vælg Lodtrækning',
                description: 'Browse gennem vores aktive lodtrækninger og find den præmie, du ønsker at vinde.',
                icon: '🎯',
                color: 'from-emerald-500 to-teal-500'
              },
              {
                step: '2', 
                title: 'Køb Billetter',
                description: 'Køb dine billetter sikkert med kort eller MobilePay. Optjen points ved hvert køb.',
                icon: '🎫',
                color: 'from-teal-500 to-cyan-500'
              },
              {
                step: '3',
                title: 'Vent På Trækning',
                description: 'Vi trækker lod når alle billetter er solgt. Vindere får besked med det samme!',
                icon: '🏆',
                color: 'from-pink-500 to-orange-500'
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative text-center group"
              >
                <div className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                  <span className="text-3xl">{step.icon}</span>
                </div>
                
                <div className={`absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center text-white text-sm font-black shadow-lg`}>
                  {step.step}
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-4">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed">{step.description}</p>
                
                {index < 2 && (
                  <div className="hidden md:block absolute top-10 -right-6 w-12 h-0.5 bg-gradient-to-r from-slate-300 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Countdown Section - Ending Soon */}
      <section className="py-20 bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-100 via-transparent to-red-100 opacity-60"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-red-100 rounded-full px-4 py-2 text-sm font-semibold text-slate-700 mb-6 animate-pulse">
              ⏰ SIDSTE CHANCE
              <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6">Slutter snart!</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Disse lodtrækninger slutter inden for de næste 24 timer - skyndt dig!
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50 max-w-4xl mx-auto"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-bold inline-block mb-4">
                  🔥 SIDSTE 24 TIMER
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4">BMW M4 Competition</h3>
                <div className="text-lg text-slate-600 mb-6">
                  Værdi: <span className="font-bold text-green-600">850.000 kr</span>
                </div>
                
                {/* Countdown Timer */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Timer', value: '18' },
                    { label: 'Min', value: '43' },
                    { label: 'Sek', value: '22' },
                    { label: 'Solgt', value: '87%' }
                  ].map((item, index) => (
                    <div key={index} className="text-center">
                      <div className="bg-gradient-to-br from-slate-900 to-slate-700 text-white rounded-xl p-4 mb-2">
                        <div className="text-2xl font-black">{item.value}</div>
                      </div>
                      <div className="text-xs text-slate-500 font-semibold">{item.label}</div>
                    </div>
                  ))}
                </div>
                
                <Link href="/raffles/1">
                  <PremiumButton
                    variant="premium"
                    size="lg"
                    shimmer
                    icon="🚨"
                    className="font-bold w-full"
                  >
                    Sikr dine billetter nu!
                  </PremiumButton>
                </Link>
              </div>
              
              <div className="relative">
                <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                  <div className="text-6xl opacity-50">🚗</div>
                </div>
                <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                  SLUTTER SNART!
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust & Security Section */}
      <section className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">Hvorfor vælge DrawDash?</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Danmarks mest pålidelige platform for lodtrækninger og konkurrencer
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center group"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Fair & Transparent</h3>
              <p className="text-slate-600">
                Alle lodtrækninger er verificerede og gennemføres med fuld transparens. Du kan følge hele processen.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center group"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300">
                <span className="text-3xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">100% Sikker</h3>
              <p className="text-slate-600">
                Dine data er beskyttet med bank-niveau sikkerhed. SSL-kryptering og PCI-compliance.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-center group"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Hurtig Udbetaling</h3>
              <p className="text-slate-600">
                Vindere modtager deres præmier hurtigt og problemfrit. Automatisk notifikation ved gevinst.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-teal-900/20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full px-4 py-2 text-sm font-semibold mb-6 border border-emerald-500/20">
              📧 NYHEDSBREV
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black mb-6">
              Bliv Informeret Om Nye <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Lodtrækninger</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
              Få besked først når vi lancerer spændende nye konkurrencer og eksklusiv adgang til særlige tilbud!
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  placeholder="din@email.dk"
                  className="flex-1 px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-slate-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300"
                />
                <PremiumButton
                  variant="premium"
                  size="lg"
                  shimmer
                  icon="🚀"
                  className="font-bold px-8"
                >
                  Tilmeld dig
                </PremiumButton>
              </div>
              
              <div className="flex items-center gap-2 mt-4 text-sm text-slate-300">
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Ingen spam - kun de bedste tilbud og nye lodtrækninger</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 text-center">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-3">
                  <span className="text-xl">🎯</span>
                </div>
                <div className="text-sm font-semibold mb-1">Nye Lodtrækninger</div>
                <div className="text-xs text-slate-400">Først til mølle</div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center mb-3">
                  <span className="text-xl">💰</span>
                </div>
                <div className="text-sm font-semibold mb-1">Eksklusive Tilbud</div>
                <div className="text-xs text-slate-400">Kun for abonnenter</div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center mb-3">
                  <span className="text-xl">🏆</span>
                </div>
                <div className="text-sm font-semibold mb-1">Vinder Updates</div>
                <div className="text-xs text-slate-400">Se seneste vindere</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <PremiumFooter />
    </div>
  )
}
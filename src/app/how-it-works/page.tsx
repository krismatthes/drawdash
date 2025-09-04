'use client'

import { motion } from 'framer-motion'
import PremiumHeader from '@/components/PremiumHeader'
import PremiumFooter from '@/components/PremiumFooter'
import GradientMesh from '@/components/GradientMesh'
import PremiumButton from '@/components/PremiumButton'
import Link from 'next/link'

export default function HowItWorksPage() {
  const steps = [
    {
      number: '1',
      title: 'Vælg en lodtrækning',
      description: 'Gennemse vores aktive lodtrækninger og vælg den præmie du vil vinde',
      icon: '🎯',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      number: '2',
      title: 'Køb billetter',
      description: 'Køb billetter sikkert med priser fra kun 10 kr eller deltag gratis via postkort',
      icon: '🎫',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      number: '3',
      title: 'Vent på lodtrækning',
      description: 'Lodtrækningen sker automatisk når timeren udløber - alle deltagere har lige chance',
      icon: '⏰',
      color: 'from-purple-500 to-pink-500'
    },
    {
      number: '4',
      title: 'Vinder annonceres',
      description: 'Vindere annonceres live på Facebook og kontaktes direkte via email/telefon',
      icon: '🏆',
      color: 'from-orange-500 to-red-500'
    }
  ]

  const features = [
    {
      title: 'Fair og transparent',
      description: 'Alle lodtrækninger udføres med certificeret tilfældighedsgenerator for at sikre fuldstændig fairness',
      icon: '⚖️',
      points: [
        'Kryptografisk sikker tilfældig udvælgelse',
        'Live lodtrækninger streamet på Facebook',
        'Ingen forlængelser eller overbookinger',
        'Øjeblikkelig vinder besked'
      ]
    },
    {
      title: 'Betaling og sikkerhed',
      description: 'Dine betalinger behandles sikkert med branchestandarder og kryptering',
      icon: '🔒',
      points: [
        'SSL 256-bit kryptering',
        'PCI DSS certificeret',
        'Accepterer alle store kort',
        'Apple Pay og Google Pay support'
      ]
    }
  ]

  return (
    <div className="min-h-screen relative bg-white">
      <GradientMesh variant="default" />
      <PremiumHeader />
      
      <main className="relative">
        <div className="max-w-6xl mx-auto px-4 py-16">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Sådan fungerer <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">DrawDash</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Enkelt, fair og transparent lodtrækningsprocess. Fra billetkøb til præmielevering på under 4 nemme trin.
            </p>
          </motion.div>

          {/* Steps Section */}
          <div className="mb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center relative"
                >
                  {/* Connection Line */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 -right-4 w-8 h-0.5 bg-gradient-to-r from-slate-300 to-slate-200 z-0" />
                  )}
                  
                  <div className="relative z-10">
                    {/* Step Number & Icon */}
                    <div className="relative mb-6">
                      <div className={`w-16 h-16 bg-gradient-to-r ${step.color} rounded-2xl flex items-center justify-center mx-auto shadow-lg`}>
                        <span className="text-2xl">{step.icon}</span>
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full border-2 border-slate-200 flex items-center justify-center">
                        <span className="text-sm font-bold text-slate-700">{step.number}</span>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-lg font-bold text-slate-900 mb-3">{step.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Features Section */}
          <div className="space-y-12">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="card-premium p-8"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">{feature.icon}</span>
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900">{feature.title}</h2>
                    </div>
                    <p className="text-slate-600 leading-relaxed mb-6">
                      {feature.description}
                    </p>
                  </div>
                  
                  <div>
                    <ul className="space-y-3">
                      {feature.points.map((point, pointIndex) => (
                        <li key={pointIndex} className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                          <span className="text-slate-700">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-20"
          >
            <div className="card-premium p-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Klar til at begynde?
              </h2>
              <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
                Tilmeld dig i dag og få adgang til eksklusive lodtrækninger med fantastiske præmier
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
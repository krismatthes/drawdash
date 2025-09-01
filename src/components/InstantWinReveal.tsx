'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { InstantWinResult } from '@/lib/instantWinService'
import PremiumButton from './PremiumButton'

interface InstantWinRevealProps {
  isOpen: boolean
  result: InstantWinResult | null
  onClose: () => void
  raffleName: string
}

export default function InstantWinReveal({ 
  isOpen, 
  result, 
  onClose, 
  raffleName 
}: InstantWinRevealProps) {
  const [stage, setStage] = useState<'closed' | 'opening' | 'revealed' | 'celebration'>('closed')
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (isOpen && result) {
      setStage('closed')
      setShowConfetti(false)
    }
  }, [isOpen, result])

  const handleReveal = () => {
    if (stage !== 'closed') return
    
    setStage('opening')
    
    // Auto-progress through stages
    setTimeout(() => {
      setStage('revealed')
      
      if (result?.isWinner) {
        setTimeout(() => {
          setStage('celebration')
          setShowConfetti(true)
        }, 800)
      }
    }, 1500)
  }

  if (!isOpen || !result) return null

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center relative overflow-hidden">
        
        {/* Subtle background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-emerald-50/30" />
        
        {/* Confetti Effect */}
        <AnimatePresence>
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(25)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: ['#10b981', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6'][i % 5],
                    left: `${20 + Math.random() * 60}%`,
                    top: `${20 + Math.random() * 60}%`
                  }}
                  initial={{ scale: 0, y: 0 }}
                  animate={{ 
                    scale: [0, 1, 0.5, 0],
                    y: [-20, -60, 40],
                    x: [(Math.random() - 0.5) * 100]
                  }}
                  transition={{ duration: 2.5, delay: Math.random() * 0.8 }}
                />
              ))}
            </div>
          )}
        </AnimatePresence>

        <div className="relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="text-3xl mb-3">⚡</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Instant Win</h2>
            <p className="text-slate-600 text-sm">{raffleName}</p>
          </motion.div>

          {/* Mystery Box - Closed State */}
          <AnimatePresence mode="wait">
            {stage === 'closed' && (
              <motion.div
                key="closed"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="mb-8"
              >
                <motion.div 
                  className="relative mx-auto w-48 h-48 cursor-pointer"
                  onClick={handleReveal}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Box Shadow */}
                  <div className="absolute inset-2 bg-slate-800/20 rounded-2xl blur-md" />
                  
                  {/* Main Box */}
                  <motion.div 
                    className="relative w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl shadow-xl"
                    animate={{ 
                      rotateY: [0, 2, -2, 0],
                      rotateX: [0, 1, -1, 0]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    {/* Box highlights */}
                    <div className="absolute top-4 left-4 right-4 h-2 bg-white/30 rounded-full" />
                    <div className="absolute top-4 bottom-4 left-4 w-2 bg-white/20 rounded-full" />
                    
                    {/* Sparkle effects */}
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        style={{
                          left: `${20 + Math.random() * 60}%`,
                          top: `${20 + Math.random() * 60}%`
                        }}
                        animate={{ 
                          opacity: [0, 1, 0],
                          scale: [0, 1, 0]
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity, 
                          delay: Math.random() * 2 
                        }}
                      />
                    ))}
                    
                    {/* Center content */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white">
                        <div className="text-4xl mb-2">🎁</div>
                        <div className="text-sm font-medium">Klik for at åbne</div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}

            {/* Opening Animation */}
            {stage === 'opening' && (
              <motion.div
                key="opening"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mb-8"
              >
                <div className="relative mx-auto w-48 h-48">
                  {/* Box opening effect */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl"
                    animate={{ 
                      scaleY: [1, 0.3, 0],
                      rotateX: [0, -45, -90]
                    }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                  />
                  
                  {/* Light burst */}
                  <motion.div
                    className="absolute inset-0 bg-yellow-300 rounded-full blur-2xl"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: [0, 1.5, 0],
                      opacity: [0, 0.6, 0]
                    }}
                    transition={{ duration: 1.5, delay: 0.8 }}
                  />
                  
                  {/* Loading text */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="text-slate-700 font-medium"
                    >
                      Åbner...
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Result Revealed */}
            {(stage === 'revealed' || stage === 'celebration') && (
              <motion.div
                key="revealed"
                initial={{ opacity: 0, scale: 0.5, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="mb-8"
              >
                <div className={`rounded-2xl p-8 ${
                  result?.isWinner 
                    ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white' 
                    : 'bg-gradient-to-br from-slate-300 to-slate-400 text-white'
                }`}>
                  {result?.isWinner ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, delay: 0.3 }}
                    >
                      <motion.div
                        animate={stage === 'celebration' ? { 
                          rotate: [0, 10, -10, 0],
                          scale: [1, 1.1, 1]
                        } : {}}
                        transition={{ duration: 0.6, repeat: 3 }}
                        className="text-5xl mb-4"
                      >
                        🎉
                      </motion.div>
                      <div className="text-2xl font-black mb-3">TILLYKKE!</div>
                      <div className="text-lg font-medium mb-2">Du vandt:</div>
                      <div className="text-xl font-bold mb-2">{result.prizeWon?.name}</div>
                      <div className="text-lg opacity-90">
                        Værdi: {result.prizeWon?.value.toLocaleString('da-DK')} kr
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.3 }}
                    >
                      <div className="text-4xl mb-4">💭</div>
                      <div className="text-xl font-bold mb-2">Ingen gevinst denne gang</div>
                      <div className="opacity-90">Bedre held næste gang!</div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Winner Information */}
          <AnimatePresence>
            {stage === 'celebration' && result?.isWinner && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-4 bg-emerald-50 rounded-xl border border-emerald-200"
              >
                <div className="text-sm font-medium text-emerald-800 mb-1">
                  Gevinst sikret!
                </div>
                <div className="text-xs text-emerald-700">
                  Din gevinst behandles automatisk inden for 24 timer
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Button */}
          <AnimatePresence>
            {stage === 'closed' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <PremiumButton
                  variant="premium"
                  size="xl"
                  onClick={handleReveal}
                  className="w-full font-bold mb-4"
                  shimmer
                >
                  Åbn Din Gevinst
                </PremiumButton>
              </motion.div>
            )}

            {(stage === 'revealed' || stage === 'celebration') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: result?.isWinner ? 2 : 1 }}
              >
                <PremiumButton
                  variant={result?.isWinner ? "premium" : "primary"}
                  size="xl"
                  onClick={onClose}
                  className="w-full font-bold"
                  shimmer={result?.isWinner}
                >
                  {result?.isWinner ? 'Fantastisk!' : 'Forstået'}
                </PremiumButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
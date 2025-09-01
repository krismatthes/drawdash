'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Raffle } from '@/types/raffle'
import PremiumRaffleCard from './PremiumRaffleCard'

interface RaffleCarouselProps {
  raffles: Raffle[]
}

export default function RaffleCarousel({ raffles }: RaffleCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isAutoPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % raffles.length)
      }, 8000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isAutoPlaying, raffles.length])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 15000)
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % raffles.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 15000)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + raffles.length) % raffles.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 15000)
  }

  if (raffles.length === 0) return null

  return (
    <div className="relative max-w-6xl mx-auto">
      {/* Main Carousel Container */}
      <div className="relative overflow-visible">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {Array.from({ length: Math.min(3, raffles.length) }).map((_, slideIndex) => {
            const raffleIndex = (currentIndex + slideIndex) % raffles.length
            const raffle = raffles[raffleIndex]
            
            return (
              <motion.div
                key={`${raffleIndex}-${currentIndex}`}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  duration: 0.6,
                  ease: "easeOut",
                  layout: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }
                }}
                className="relative"
              >
                <div className="transform hover:scale-105 transition-all duration-300">
                  <PremiumRaffleCard raffle={raffle} index={raffleIndex} />
                </div>
                
                {/* Featured Badge for first item */}
                {raffleIndex === 0 && (
                  <div className="absolute -top-4 -right-4 z-10">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                      🔥 MEST POPULÆR
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Navigation Arrows */}
      {raffles.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-white/50 flex items-center justify-center hover:bg-white transition-all duration-300 group"
          >
            <svg 
              className="w-5 h-5 text-slate-700 group-hover:text-slate-900 transition-colors" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-white/50 flex items-center justify-center hover:bg-white transition-all duration-300 group"
          >
            <svg 
              className="w-5 h-5 text-slate-700 group-hover:text-slate-900 transition-colors" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {raffles.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {raffles.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 ${
                index === currentIndex
                  ? 'w-8 h-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full'
                  : 'w-3 h-3 bg-slate-300 hover:bg-slate-400 rounded-full'
              }`}
            />
          ))}
        </div>
      )}

      {/* Auto-play indicator */}
      {isAutoPlaying && raffles.length > 1 && (
        <div className="absolute top-4 left-4 z-20">
          <div className="bg-black/20 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-white text-xs font-medium">AUTO</span>
          </div>
        </div>
      )}
    </div>
  )
}
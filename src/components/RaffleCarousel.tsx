'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Raffle } from '@/types/raffle'
import { useLanguage } from '@/contexts/LanguageContext'

interface RaffleCarouselProps {
  raffles: Raffle[]
}

export default function RaffleCarousel({ raffles }: RaffleCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const { t } = useLanguage()

  useEffect(() => {
    if (isAutoPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % raffles.length)
      }, 4000)
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
    setTimeout(() => setIsAutoPlaying(true), 5000)
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % raffles.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 5000)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + raffles.length) % raffles.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 5000)
  }

  if (raffles.length === 0) return null

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div className="relative h-80 rounded-2xl overflow-hidden shadow-lg bg-white border border-slate-200">
        <div 
          className="flex transition-transform duration-500 ease-in-out h-full"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {raffles.map((raffle, index) => (
            <div key={raffle.id} className="w-full flex-shrink-0 flex">
              <div className="w-1/2 relative">
                <Image
                  src={raffle.image}
                  alt={raffle.title}
                  fill
                  className="object-cover"
                />
                {raffle.isInstantWin && (
                  <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    ⚡ INSTANT WIN
                  </div>
                )}
              </div>
              <div className="w-1/2 p-8 flex flex-col justify-center">
                <h3 className="text-2xl font-light mb-3 text-slate-800">{raffle.title}</h3>
                <p className="text-slate-600 mb-4 leading-relaxed">{raffle.description}</p>
                
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-500">Præmiværdi</span>
                    <span className="font-medium text-slate-800">{raffle.prize.value.toLocaleString()} kr</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-slate-500">Billetpris</span>
                    <span className="font-medium text-blue-600">{raffle.ticketPrice} kr</span>
                  </div>
                  
                  <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(raffle.soldTickets / raffle.totalTickets) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{raffle.soldTickets} solgte</span>
                    <span>{raffle.totalTickets} total</span>
                  </div>
                </div>
                
                <Link
                  href={`/raffle/${raffle.id}`}
                  className="bg-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-600 transition-all shadow-sm text-center"
                >
                  Deltag Nu
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 transition-all"
      >
        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 transition-all"
      >
        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots indicator */}
      <div className="flex justify-center mt-6 space-x-2">
        {raffles.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentIndex
                ? 'bg-blue-500 scale-110'
                : 'bg-slate-300 hover:bg-slate-400'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Raffle } from '@/types/raffle'
import { useState } from 'react'

interface PremiumRaffleCardProps {
  raffle: Raffle
  index?: number
}

export default function PremiumRaffleCard({ raffle, index = 0 }: PremiumRaffleCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const progressPercentage = (raffle.soldTickets / raffle.totalTickets) * 100
  const remainingTickets = raffle.totalTickets - raffle.soldTickets
  const isEndingSoon = raffle.endDate && new Date(raffle.endDate).getTime() - Date.now() < 24 * 60 * 60 * 1000
  const isPopular = raffle.soldTickets > raffle.totalTickets * 0.7

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Link href={`/raffle/${raffle.id}`} className="block group h-full">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-500 transform group-hover:scale-[1.02] relative h-full flex flex-col min-h-[600px]">
          
          {/* Image Section */}
          <div className="relative h-56 overflow-hidden">
            <Image
              src={raffle.image}
              alt={raffle.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              priority={index < 3}
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
            
            {/* Top Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {raffle.isInstantWin && (
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse shadow-lg">
                  ⚡ INSTANT WIN
                </div>
              )}
              {isPopular && (
                <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                  🔥 POPULÆR
                </div>
              )}
              {isEndingSoon && (
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse shadow-lg">
                  ⏰ SLUTTER SNART
                </div>
              )}
            </div>

            {/* Price Badge */}
            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white px-3 py-2 rounded-xl font-semibold shadow-lg border border-white/30">
              {raffle.ticketPrice} kr
            </div>

            {/* Bottom Stats */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
              <div className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg border border-white/30">
                {raffle.participants} deltagere
              </div>
              <div className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg border border-white/30">
                {remainingTickets} tilbage
              </div>
            </div>

            {/* Hover Overlay */}
            <motion.div 
              className="absolute inset-0 bg-blue-500/20 backdrop-blur-sm flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-xl text-slate-900 font-semibold shadow-xl border border-white/50">
                👁️ Hurtig Visning
              </div>
            </motion.div>
          </div>

          {/* Content Section */}
          <div className="p-6 flex-1 flex flex-col">
            {/* Title and Description */}
            <div className="mb-4">
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-2">
                {raffle.title}
              </h3>
              <p className="text-slate-600 text-sm line-clamp-2">
                {raffle.description}
              </p>
            </div>

            {/* Prize Value */}
            {raffle.prize && (
              <div className="mb-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-3 border border-green-200/50">
                <div className="text-xs text-slate-600 uppercase tracking-wider font-semibold mb-1">
                  Præmie Værdi
                </div>
                <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  {raffle.prize.value.toLocaleString('da-DK')} kr
                </div>
              </div>
            )}

            {/* Progress Section */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-slate-600 mb-2">
                <span className="font-semibold">Solgte billetter</span>
                <span className="font-semibold">{Math.round(progressPercentage)}% solgt</span>
              </div>
              
              <div className="relative">
                <div className="w-full bg-slate-200 rounded-full h-3 shadow-inner">
                  <motion.div 
                    className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-3 rounded-full relative overflow-hidden shadow-lg"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    transition={{ duration: 1.5, delay: index * 0.1 }}
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                  </motion.div>
                </div>
                
                {/* Progress Numbers */}
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>{raffle.soldTickets} solgt</span>
                  <span>{raffle.totalTickets} total</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <motion.button 
              className="w-full bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl relative overflow-hidden mt-auto"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Button shimmer */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              />
              
              <div className="relative flex items-center justify-center gap-2">
                <span>🎯</span>
                <span>Deltag Nu</span>
              </div>
            </motion.button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
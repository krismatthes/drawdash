'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Raffle } from '@/types/raffle'

interface SimpleRaffleCardProps {
  raffle: Raffle
}

export default function SimpleRaffleCard({ raffle }: SimpleRaffleCardProps) {
  const progressPercentage = (raffle.soldTickets / raffle.totalTickets) * 100

  return (
    <Link href={`/raffle/${raffle.id}`} className="block group">
      <div className={`bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform group-hover:scale-[1.02] ${
        raffle.isInstantWin ? 'ring-2 ring-orange-300 ring-opacity-50' : ''
      }`}>
        <div className="relative h-48">
          <Image
            src={raffle.image}
            alt={raffle.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {raffle.isInstantWin && (
            <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
              ⚡ INSTANT WIN
            </div>
          )}
          <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-xs font-medium">
            {raffle.ticketPrice} kr
          </div>
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-slate-700">
            {raffle.participants} deltagere
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                {raffle.title}
              </h3>
              <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                {raffle.description}
              </p>
            </div>
            <div className="text-2xl ml-2 flex-shrink-0">
              {raffle.emoji}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-slate-600 mb-1">
              <span>Solgt: {raffle.soldTickets}</span>
              <span>Max: {raffle.totalTickets}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1">
              🎯 {raffle.category}
            </span>
            <span className="flex items-center gap-1">
              ⏰ {raffle.endsAt ? new Date(raffle.endsAt).toLocaleDateString('da-DK') : 'Snart'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
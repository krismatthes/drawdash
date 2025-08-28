'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Raffle } from '@/types/raffle'
import CountdownTimer from './CountdownTimer'
import { useLanguage } from '@/contexts/LanguageContext'

interface RaffleCardProps {
  raffle: Raffle
}

export default function RaffleCard({ raffle }: RaffleCardProps) {
  const progressPercentage = (raffle.soldTickets / raffle.totalTickets) * 100
  const { t } = useLanguage()

  return (
    <div className={`bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-200 ${
      raffle.isInstantWin ? 'ring-2 ring-orange-300 ring-opacity-50' : ''
    }`}>
      <div className="relative h-48">
        <Image
          src={raffle.image}
          alt={raffle.title}
          fill
          className="object-cover"
        />
        {raffle.isInstantWin && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
            ⚡ INSTANT WIN
          </div>
        )}
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-light mb-3 text-slate-800">{raffle.title}</h3>
        <p className="text-slate-600 mb-4 text-sm leading-relaxed">{raffle.description}</p>
        
        <div className="mb-5">
          <div className="flex justify-between text-sm text-slate-600 mb-3">
            <span className="font-medium">{t('progress')}</span>
            <span className="bg-slate-100 px-3 py-1 rounded-full text-xs font-medium">
              {raffle.soldTickets}/{raffle.totalTickets} {t('tickets')}
            </span>
          </div>
          <div className="relative">
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ease-out ${
                  raffle.isInstantWin 
                    ? 'bg-gradient-to-r from-orange-400 to-orange-500' 
                    : 'bg-gradient-to-r from-blue-400 to-blue-500'
                }`}
                style={{ width: `${progressPercentage}%` }}
              >
              </div>
            </div>
            <div className="absolute -top-1 right-0 text-xs font-medium text-slate-600">
              {Math.round(progressPercentage)}%
            </div>
          </div>
        </div>

        <div className="mb-4">
          {raffle.isInstantWin ? (
            <div className="text-center">
              <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-lg p-3">
                <p className="text-orange-800 font-semibold text-sm">⚡ Instant Vindere!</p>
                <p className="text-orange-600 text-xs">Vind øjeblikkeligt når du køber</p>
              </div>
            </div>
          ) : (
            <CountdownTimer endDate={raffle.endDate} />
          )}
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-500">{t('prizeValue')}</p>
              <p className="font-medium text-slate-800">{raffle.prize.value.toLocaleString()} kr</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Billetpris</p>
              <p className="font-medium text-lg text-blue-600">{raffle.ticketPrice} kr</p>
            </div>
          </div>
          
          <Link
            href={`/raffle/${raffle.id}`}
            className={`block w-full text-center px-6 py-4 rounded-xl font-medium transition-all shadow-sm ${
              raffle.isInstantWin 
                ? 'bg-orange-500 text-white hover:bg-orange-600' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {raffle.isInstantWin 
              ? `⚡ Spil Nu - ${raffle.ticketPrice} kr` 
              : `Deltag for kun ${raffle.ticketPrice} kr`
            }
          </Link>
        </div>
      </div>
    </div>
  )
}
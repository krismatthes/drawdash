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
    <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${
      raffle.isInstantWin ? 'ring-2 ring-orange-400 ring-opacity-50' : ''
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
      
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{raffle.title}</h3>
        <p className="text-gray-600 mb-3 text-sm">{raffle.description}</p>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span className="font-medium">{t('progress')}</span>
            <span className="bg-gray-100 px-2 py-1 rounded-full text-xs font-semibold">
              {raffle.soldTickets}/{raffle.totalTickets} {t('tickets')}
            </span>
          </div>
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ease-out relative overflow-hidden ${
                  raffle.isInstantWin 
                    ? 'bg-gradient-to-r from-orange-400 via-red-500 to-pink-500' 
                    : 'bg-gradient-to-r from-green-400 to-green-600'
                }`}
                style={{ width: `${progressPercentage}%` }}
              >
                <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
              </div>
            </div>
            <div className="absolute -top-1 right-0 text-xs font-bold text-gray-600">
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

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">{t('prizeValue')}</p>
              <p className="font-semibold">{raffle.prize.value.toLocaleString()} kr</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Billetpris</p>
              <p className="font-bold text-lg text-green-600">{raffle.ticketPrice} kr</p>
            </div>
          </div>
          
          <Link
            href={`/raffle/${raffle.id}`}
            className={`block w-full text-center px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${
              raffle.isInstantWin 
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-lg' 
                : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg'
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
'use client'

import { useState, useEffect } from 'react'

interface CountdownTimerProps {
  endDate: Date
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export default function CountdownTimer({ endDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = endDate.getTime() - now

      if (distance < 0) {
        setIsExpired(true)
        clearInterval(timer)
        return
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      setTimeLeft({ days, hours, minutes, seconds })
    }, 1000)

    return () => clearInterval(timer)
  }, [endDate])

  if (isExpired) {
    return (
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold py-2 px-4 rounded-lg text-center">
        <span className="text-sm">🔴 Lodtrækning Afsluttet</span>
      </div>
    )
  }

  return (
    <div className="text-center">
      <p className="text-sm text-gray-600 mb-3 font-medium">⏰ Tid Tilbage</p>
      <div className="grid grid-cols-4 gap-2 text-sm">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg px-2 py-3 shadow-sm border">
          <div className="font-bold text-lg text-gray-800">{timeLeft.days}</div>
          <div className="text-xs text-gray-600 uppercase tracking-wide">Dage</div>
        </div>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg px-2 py-3 shadow-sm border">
          <div className="font-bold text-lg text-gray-800">{timeLeft.hours}</div>
          <div className="text-xs text-gray-600 uppercase tracking-wide">Timer</div>
        </div>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg px-2 py-3 shadow-sm border">
          <div className="font-bold text-lg text-gray-800">{timeLeft.minutes}</div>
          <div className="text-xs text-gray-600 uppercase tracking-wide">Min</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg px-2 py-3 shadow-sm border border-green-200">
          <div className="font-bold text-lg text-green-700 animate-pulse">{timeLeft.seconds}</div>
          <div className="text-xs text-green-600 uppercase tracking-wide">Sek</div>
        </div>
      </div>
    </div>
  )
}
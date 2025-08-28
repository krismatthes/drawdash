'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'

interface SmoothCounterProps {
  value: number
  duration?: number
  format?: 'number' | 'currency' | 'percentage'
  currency?: string
  decimals?: number
  className?: string
  prefix?: string
  suffix?: string
  separator?: string
}

const formatNumber = (
  num: number, 
  format: 'number' | 'currency' | 'percentage',
  currency: string,
  decimals: number,
  separator: string
) => {
  const roundedNum = Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals)
  
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('da-DK', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(roundedNum)
      
    case 'percentage':
      return `${roundedNum.toFixed(decimals)}%`
      
    default:
      // Custom number formatting with separator
      const parts = roundedNum.toFixed(decimals).split('.')
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator)
      return parts.join(',')
  }
}

export default function SmoothCounter({
  value,
  duration = 1.5,
  format = 'number',
  currency = 'DKK',
  decimals = 0,
  className = '',
  prefix = '',
  suffix = '',
  separator = '.'
}: SmoothCounterProps) {
  const [isInView, setIsInView] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => Math.round(latest))
  const [displayValue, setDisplayValue] = useState(() => 
    formatNumber(0, format, currency, decimals, separator)
  )

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isInView && isMounted) {
      const controls = animate(count, value, { 
        duration,
        ease: "easeOut",
        onUpdate: (latest) => {
          setDisplayValue(formatNumber(latest, format, currency, decimals, separator))
        }
      })
      return controls.stop
    }
  }, [count, value, duration, isInView, isMounted, format, currency, decimals, separator])

  // Don't render until mounted to avoid hydration mismatch
  if (!isMounted) {
    return (
      <div className={`font-mono ${className}`}>
        <span>
          {prefix}
          {formatNumber(0, format, currency, decimals, separator)}
          {suffix}
        </span>
      </div>
    )
  }

  return (
    <motion.div
      className={`font-mono ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      onViewportEnter={() => setIsInView(true)}
    >
      <span>
        {prefix}
        {displayValue}
        {suffix}
      </span>
    </motion.div>
  )
}

// Preset configurations for common use cases
export const CounterPresets = {
  price: {
    format: 'currency' as const,
    currency: 'DKK',
    decimals: 0,
    className: 'text-2xl font-bold text-green-600'
  },
  
  percentage: {
    format: 'percentage' as const,
    decimals: 1,
    className: 'text-xl font-semibold text-blue-600'
  },
  
  participants: {
    format: 'number' as const,
    separator: '.',
    className: 'text-lg font-medium text-slate-700'
  },
  
  countdown: {
    format: 'number' as const,
    className: 'text-3xl font-bold font-mono text-slate-800'
  }
}
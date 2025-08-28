'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface ProgressRingProps {
  progress: number // 0-100
  size?: 'sm' | 'md' | 'lg'
  strokeWidth?: number
  showValue?: boolean
  label?: string
  className?: string
  animated?: boolean
}

export default function ProgressRing({
  progress,
  size = 'md',
  strokeWidth = 8,
  showValue = true,
  label,
  className = '',
  animated = true
}: ProgressRingProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const sizes = {
    sm: { radius: 30, containerSize: 80 },
    md: { radius: 45, containerSize: 120 },
    lg: { radius: 60, containerSize: 160 }
  }

  const { radius, containerSize } = sizes[size]
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference

  useEffect(() => {
    if (animated && isMounted) {
      const timer = setTimeout(() => {
        setAnimatedProgress(progress)
      }, 300)
      return () => clearTimeout(timer)
    } else if (isMounted) {
      setAnimatedProgress(progress)
    }
  }, [progress, animated, isMounted])

  // Dynamic color based on progress
  const getProgressColor = () => {
    if (progress < 30) return 'text-blue-500'
    if (progress < 60) return 'text-indigo-500'
    if (progress < 80) return 'text-pink-500'
    return 'text-emerald-500'
  }

  const getProgressColors = () => {
    if (progress < 30) return { start: '#3b82f6', end: '#2563eb' } // blue
    if (progress < 60) return { start: '#6366f1', end: '#8b5cf6' } // indigo to purple  
    if (progress < 80) return { start: '#ec4899', end: '#f43f5e' } // pink to rose
    return { start: '#10b981', end: '#059669' } // emerald to green
  }

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} 
         style={{ width: containerSize, height: containerSize }}>
      
      {/* Background circle */}
      <svg
        className="absolute transform -rotate-90"
        width={containerSize}
        height={containerSize}
      >
        <defs>
          <linearGradient id={`progress-gradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={getProgressColors().start} />
            <stop offset="100%" stopColor={getProgressColors().end} />
          </linearGradient>
        </defs>
        
        {/* Background track */}
        <circle
          cx={containerSize / 2}
          cy={containerSize / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-200"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={containerSize / 2}
          cy={containerSize / 2}
          r={radius}
          fill="transparent"
          stroke={`url(#progress-gradient-${size})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: animated ? 1.2 : 0, ease: "easeOut" }}
          className="drop-shadow-sm"
        />
      </svg>

      {/* Center content */}
      <div className="text-center">
        {showValue && (
          <motion.div 
            className={`font-bold ${getProgressColor()} ${
              size === 'sm' ? 'text-lg' : size === 'md' ? 'text-2xl' : 'text-3xl'
            }`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {Math.round(animatedProgress)}%
          </motion.div>
        )}
        
        {label && (
          <div className={`text-slate-600 font-medium ${
            size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'
          }`}>
            {label}
          </div>
        )}
      </div>

      {/* Glow effect for high progress */}
      {progress > 80 && (
        <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
      )}
    </div>
  )
}
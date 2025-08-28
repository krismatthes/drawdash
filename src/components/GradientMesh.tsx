'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface GradientMeshProps {
  variant?: 'default' | 'premium' | 'hero'
  className?: string
  animated?: boolean
}

export default function GradientMesh({ 
  variant = 'default', 
  className = '',
  animated = true 
}: GradientMeshProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const variants = {
    default: 'bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50',
    premium: 'bg-gradient-to-br from-blue-50 via-pink-50/50 to-purple-50',
    hero: 'bg-gradient-to-br from-slate-50 via-blue-50/70 to-indigo-100/80'
  }

  const floatingElements = animated && isMounted ? Array.from({ length: 3 }) : []

  return (
    <div className={`absolute inset-0 -z-10 ${variants[variant]} ${className}`}>
      {animated && (
        <>
          {/* Subtle gradient orbs */}
          {floatingElements.map((_, i) => (
            <motion.div
              key={i}
              className={`absolute rounded-full opacity-20 ${
                i === 0 ? 'bg-blue-400 w-96 h-96 -top-48 -right-48' :
                i === 1 ? 'bg-pink-300 w-80 h-80 top-1/3 -left-40' :
                'bg-indigo-300 w-64 h-64 bottom-0 right-1/4'
              }`}
              animate={{
                x: [0, 30, -20, 0],
                y: [0, -20, 10, 0],
                rotate: [0, 45, -30, 0]
              }}
              transition={{
                duration: 20 + i * 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
          
          {/* Animated mesh pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-y-12 animate-pulse" />
        </>
      )}
    </div>
  )
}
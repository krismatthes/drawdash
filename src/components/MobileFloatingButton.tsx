'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PremiumButton from './PremiumButton'

interface MobileFloatingButtonProps {
  label: string
  icon?: string
  onClick?: () => void
  variant?: 'primary' | 'premium'
  showOnScroll?: boolean
  className?: string
}

export default function MobileFloatingButton({
  label,
  icon = '🎯',
  onClick,
  variant = 'premium',
  showOnScroll = true,
  className = ''
}: MobileFloatingButtonProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!showOnScroll) return

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Show when scrolling up or at the top, hide when scrolling down
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY, showOnScroll])

  // Don't render on server to avoid hydration mismatch
  if (!isMounted) {
    return null
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`mobile-fab ${className}`}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <motion.div
            whileTap={{ scale: 0.95 }}
            className="shadow-2xl"
          >
            <PremiumButton
              variant={variant}
              size="lg"
              icon={icon}
              iconPosition="left"
              onClick={onClick}
              shimmer
              className="touch-target px-6 py-4 font-bold shadow-xl rounded-2xl"
            >
              {label}
            </PremiumButton>
          </motion.div>

          {/* Subtle pulse indicator */}
          <div className="absolute -inset-2 bg-blue-400/20 rounded-2xl animate-pulse-subtle pointer-events-none" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
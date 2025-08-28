'use client'

import { motion } from 'framer-motion'
import { ReactNode, ButtonHTMLAttributes } from 'react'

interface PremiumButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'premium' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  loading?: boolean
  shimmer?: boolean
  children: ReactNode
  className?: string
}

export default function PremiumButton({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  shimmer = false,
  children,
  className = '',
  disabled,
  ...props
}: PremiumButtonProps) {
  
  const variants = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl',
    premium: 'bg-gradient-to-r from-blue-500 to-pink-400 hover:from-blue-600 hover:to-pink-500 text-white shadow-xl hover:shadow-2xl',
    ghost: 'bg-white/10 hover:bg-white/20 text-slate-700 backdrop-blur-sm border border-white/20',
    outline: 'bg-transparent hover:bg-slate-50 text-slate-700 border-2 border-slate-300 hover:border-blue-500'
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-xl',
    xl: 'px-10 py-5 text-xl rounded-2xl'
  }

  const isDisabled = disabled || loading

  return (
    <motion.button
      className={`
        relative overflow-hidden font-semibold transition-all duration-300
        ${variants[variant]} ${sizes[size]} ${className}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-blue-500/20
      `}
      whileHover={isDisabled ? {} : { scale: 1.02 }}
      whileTap={isDisabled ? {} : { scale: 0.98 }}
      disabled={isDisabled}
      {...props}
    >
      {/* Shimmer effect */}
      {shimmer && !isDisabled && (
        <motion.div
          className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        />
      )}

      {/* Button content */}
      <div className="relative flex items-center justify-center gap-2">
        {loading ? (
          <div className="flex items-center gap-2">
            <motion.div
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <span>Behandler...</span>
          </div>
        ) : (
          <>
            {icon && iconPosition === 'left' && <span>{icon}</span>}
            <span>{children}</span>
            {icon && iconPosition === 'right' && <span>{icon}</span>}
          </>
        )}
      </div>

      {/* Ripple effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-white/0 hover:bg-white/10 transition-colors duration-300" />
      </div>
    </motion.button>
  )
}

// Preset button configurations
export const ButtonPresets = {
  cta: {
    variant: 'premium' as const,
    size: 'lg' as const,
    shimmer: true,
    className: 'w-full font-bold'
  },
  
  purchase: {
    variant: 'primary' as const,
    size: 'lg' as const,
    icon: '💳',
    iconPosition: 'left' as const
  },
  
  secondary: {
    variant: 'ghost' as const,
    size: 'md' as const
  },
  
  danger: {
    variant: 'outline' as const,
    className: 'border-red-300 text-red-600 hover:border-red-500 hover:bg-red-50'
  }
}
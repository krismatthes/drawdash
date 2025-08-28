'use client'

import { motion } from 'framer-motion'

interface LiveIndicatorProps {
  variant?: 'live' | 'active' | 'hot' | 'new'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  label?: string
}

export default function LiveIndicator({ 
  variant = 'live', 
  size = 'md',
  className = '',
  label
}: LiveIndicatorProps) {
  
  const variants = {
    live: {
      color: 'bg-red-500',
      textColor: 'text-red-600',
      label: label || 'Live'
    },
    active: {
      color: 'bg-green-500',
      textColor: 'text-green-600', 
      label: label || 'Aktiv'
    },
    hot: {
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      label: label || 'Hot'
    },
    new: {
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      label: label || 'Ny'
    }
  }

  const sizes = {
    sm: {
      dot: 'w-2 h-2',
      container: 'px-2 py-1 text-xs',
      spacing: 'gap-1'
    },
    md: {
      dot: 'w-3 h-3',
      container: 'px-3 py-1.5 text-sm',
      spacing: 'gap-1.5'
    },
    lg: {
      dot: 'w-4 h-4',
      container: 'px-4 py-2 text-base',
      spacing: 'gap-2'
    }
  }

  const config = variants[variant]
  const sizeConfig = sizes[size]

  return (
    <div className={`inline-flex items-center ${sizeConfig.spacing} ${sizeConfig.container} 
                    bg-white/90 backdrop-blur-sm rounded-full border border-white/20 
                    shadow-sm font-medium ${config.textColor} ${className}`}>
      
      {/* Pulsing dot */}
      <div className="relative">
        <motion.div
          className={`${sizeConfig.dot} ${config.color} rounded-full`}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Ripple effect */}
        <motion.div
          className={`absolute inset-0 ${config.color} rounded-full opacity-30`}
          animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        />
      </div>
      
      <span className="font-semibold">
        {config.label}
      </span>
    </div>
  )
}
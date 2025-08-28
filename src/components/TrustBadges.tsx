'use client'

import { motion } from 'framer-motion'

interface TrustBadge {
  icon: string
  label: string
  description?: string
  color?: 'green' | 'blue' | 'purple' | 'gold'
}

interface TrustBadgesProps {
  badges?: TrustBadge[]
  layout?: 'horizontal' | 'vertical' | 'grid'
  variant?: 'minimal' | 'detailed'
  className?: string
}

const defaultBadges: TrustBadge[] = [
  {
    icon: '🔒',
    label: 'SSL Sikker',
    description: 'Bank-niveau kryptering',
    color: 'green'
  },
  {
    icon: '🛡️',
    label: 'Verificeret',
    description: 'Dansk Spillemyndighed',
    color: 'blue'
  },
  {
    icon: '💳',
    label: 'PCI Compliant',
    description: 'Sikker kortbehandling',
    color: 'purple'
  },
  {
    icon: '✅',
    label: 'Licenseret',
    description: 'Godkendt platform',
    color: 'gold'
  }
]

export default function TrustBadges({
  badges = defaultBadges,
  layout = 'horizontal',
  variant = 'minimal',
  className = ''
}: TrustBadgesProps) {
  
  const colorClasses = {
    green: {
      bg: 'bg-green-50 border-green-200',
      text: 'text-green-700',
      icon: 'text-green-600'
    },
    blue: {
      bg: 'bg-blue-50 border-blue-200',
      text: 'text-blue-700', 
      icon: 'text-blue-600'
    },
    purple: {
      bg: 'bg-purple-50 border-purple-200',
      text: 'text-purple-700',
      icon: 'text-purple-600'
    },
    gold: {
      bg: 'bg-amber-50 border-amber-200',
      text: 'text-amber-700',
      icon: 'text-amber-600'
    }
  }

  const layouts = {
    horizontal: 'flex flex-row gap-3 overflow-x-auto',
    vertical: 'flex flex-col gap-3',
    grid: 'grid grid-cols-2 md:grid-cols-4 gap-3'
  }

  return (
    <div className={`${layouts[layout]} ${className}`}>
      {badges.map((badge, index) => {
        const colors = colorClasses[badge.color || 'blue']
        
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className={`
              flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg 
              border ${colors.bg} transition-all duration-200
              ${variant === 'minimal' ? 'hover:shadow-sm' : 'hover:shadow-md'}
            `}
          >
            <span className={`text-lg ${colors.icon}`}>
              {badge.icon}
            </span>
            
            <div className="min-w-0">
              <div className={`font-medium text-sm ${colors.text}`}>
                {badge.label}
              </div>
              
              {variant === 'detailed' && badge.description && (
                <div className="text-xs text-slate-500 mt-0.5">
                  {badge.description}
                </div>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// Preset configurations for different contexts
export const TrustBadgesPresets = {
  security: [
    { icon: '🔒', label: 'SSL Sikker', color: 'green' as const },
    { icon: '🛡️', label: 'Verificeret', color: 'blue' as const },
    { icon: '💳', label: 'PCI DSS', color: 'purple' as const }
  ],
  
  compliance: [
    { icon: '✅', label: 'Licenseret', color: 'gold' as const },
    { icon: '🏛️', label: 'Reguleret', color: 'blue' as const },
    { icon: '📋', label: 'Certificeret', color: 'green' as const }
  ],
  
  payment: [
    { icon: '💳', label: 'Stripe', color: 'purple' as const },
    { icon: '🏪', label: 'MobilePay', color: 'blue' as const },
    { icon: '🔐', label: '256-bit SSL', color: 'green' as const }
  ]
}
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import PremiumButton from './PremiumButton'

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'success' | 'info' | 'celebration'
}

export default function SuccessModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'OK',
  cancelText = 'Annuller',
  type = 'success'
}: SuccessModalProps) {
  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case 'celebration':
        return '🎉'
      case 'info':
        return '💡'
      default:
        return '✅'
    }
  }

  const getColors = () => {
    switch (type) {
      case 'celebration':
        return {
          gradient: 'from-yellow-400 via-orange-400 to-red-400',
          bg: 'from-yellow-50 to-orange-50',
          border: 'border-yellow-200'
        }
      case 'info':
        return {
          gradient: 'from-blue-400 via-cyan-400 to-teal-400',
          bg: 'from-blue-50 to-cyan-50',
          border: 'border-blue-200'
        }
      default:
        return {
          gradient: 'from-emerald-400 via-teal-400 to-green-400',
          bg: 'from-emerald-50 to-teal-50',
          border: 'border-emerald-200'
        }
    }
  }

  const colors = getColors()

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className={`bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border ${colors.border}`}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with gradient */}
          <div className={`bg-gradient-to-r ${colors.gradient} p-6 text-center`}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="text-4xl mb-3"
            >
              {getIcon()}
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl font-bold text-white"
            >
              {title}
            </motion.h2>
          </div>

          {/* Content */}
          <motion.div
            className="p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-slate-700 leading-relaxed mb-6 whitespace-pre-line">
              {message}
            </p>

            {/* Action buttons */}
            <div className="flex gap-3">
              <PremiumButton
                variant="outline"
                size="lg"
                onClick={onClose}
                className="flex-1 font-medium"
              >
                {cancelText}
              </PremiumButton>
              
              <PremiumButton
                variant="premium"
                size="lg"
                onClick={onConfirm}
                className="flex-1 font-medium"
                shimmer
              >
                {confirmText}
              </PremiumButton>
            </div>
          </motion.div>

          {/* Decorative elements */}
          <div className={`h-1 bg-gradient-to-r ${colors.gradient}`} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
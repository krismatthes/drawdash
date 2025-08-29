'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext'

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-all duration-300 border border-slate-200/50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
        </div>
        <span className="hidden sm:inline">{language === 'da' ? 'Dansk' : 'English'}</span>
        <span className="sm:hidden">{language === 'da' ? 'DA' : 'EN'}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-40 bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-slate-200/50 overflow-hidden z-50"
          >
            <div className="p-2">
              <motion.button
                onClick={() => {
                  setLanguage('da')
                  setIsOpen(false)
                }}
                className={`flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                  language === 'da' 
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-slate-800 font-semibold' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-6 h-4 rounded bg-red-500 relative overflow-hidden">
                  <div className="w-full h-full bg-red-600 relative">
                    <div className="absolute inset-y-0 left-0 w-1/3 bg-white"></div>
                    <div className="absolute top-1/2 left-1/6 transform -translate-y-1/2 w-1 h-1 bg-red-600 rounded-full"></div>
                    <div className="absolute top-1/2 left-1/6 transform -translate-y-1/2 w-0.5 h-2 bg-white"></div>
                    <div className="absolute top-1/2 left-1/6 transform -translate-y-1/2 rotate-90 w-0.5 h-2 bg-white"></div>
                  </div>
                </div>
                <span>Dansk</span>
                {language === 'da' && (
                  <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </motion.button>
              
              <motion.button
                onClick={() => {
                  setLanguage('en')
                  setIsOpen(false)
                }}
                className={`flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                  language === 'en' 
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-slate-800 font-semibold' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-6 h-4 bg-blue-700 relative overflow-hidden rounded">
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-white"></div>
                  <div className="absolute top-1 left-0 w-full h-0.5 bg-red-500"></div>
                  <div className="absolute top-0 left-0 w-2.5 h-2 bg-blue-700"></div>
                  <div className="absolute top-0 left-0 w-1 h-0.5 bg-white transform rotate-12"></div>
                  <div className="absolute top-0.5 left-0 w-1 h-0.5 bg-white transform -rotate-12"></div>
                </div>
                <span>English</span>
                {language === 'en' && (
                  <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
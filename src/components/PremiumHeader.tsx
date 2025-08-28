'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import LanguageSwitcher from './LanguageSwitcher'

export default function PremiumHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const { t } = useLanguage()
  const { user, logout, isAuthenticated } = useAuth()

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const headerBg = scrollY > 20 
    ? 'bg-white/95 backdrop-blur-xl border-slate-200/60 shadow-lg'
    : 'bg-white/80 backdrop-blur-md border-slate-100'

  return (
    <motion.header 
      className={`sticky top-0 z-50 transition-all duration-500 border-b ${headerBg}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, type: "spring" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-pink-500 rounded-xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
              <div className="relative bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                <h1 className="text-2xl font-black tracking-tight">DrawDash</h1>
              </div>
              <div className="absolute -top-1 -right-2 w-3 h-3 bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-pulse" />
            </motion.div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {[
              { href: '/', label: t('home'), icon: '🏠' },
              { href: '/raffles', label: t('activeRaffles'), icon: '🎯', badge: 'HOT' },
              { href: '/winners', label: t('winners'), icon: '🏆' },
              { href: '/how-it-works', label: t('howItWorks'), icon: '❓' },
              { href: '/faq', label: 'FAQ', icon: '💬' }
            ].map((item, index) => (
              <Link key={item.href} href={item.href}>
                <motion.div
                  className="relative px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 group hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center gap-2">
                    <span className="group-hover:scale-110 transition-transform duration-200">
                      {item.icon}
                    </span>
                    <span className="text-slate-700 group-hover:text-slate-900">
                      {item.label}
                    </span>
                  </div>
                  
                  {item.badge && (
                    <div className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                      {item.badge}
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                </motion.div>
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="hidden lg:flex items-center space-x-4">
            
            {/* Live Indicator */}
            <motion.div 
              className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-blue-50 px-3 py-2 rounded-xl border border-green-200"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-green-700">1,234 online</span>
            </motion.div>

            <LanguageSwitcher />
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link href="/account">
                  <motion.button 
                    className="text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                    whileHover={{ scale: 1.05 }}
                  >
                    Min Konto
                  </motion.button>
                </Link>
                
                {user?.isAdmin && (
                  <Link href="/admin">
                    <motion.div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-2 rounded-xl text-xs font-bold"
                      whileHover={{ scale: 1.05, rotate: 1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      👑 Admin
                    </motion.div>
                  </Link>
                )}
                
                <div className="flex items-center space-x-2 ml-2 pl-2 border-l border-slate-200">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user?.firstName?.[0]?.toUpperCase()}
                  </div>
                  <div className="text-sm">
                    <div className="font-semibold text-slate-900">Hej, {user?.firstName}!</div>
                    <div className="text-xs text-slate-500">Velkommen tilbage</div>
                  </div>
                </div>
                
                <motion.button 
                  onClick={logout}
                  className="text-sm font-medium text-slate-500 hover:text-red-600 transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  Log Ud
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <motion.button 
                    className="text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors px-4 py-2 rounded-xl hover:bg-slate-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Log Ind
                  </motion.button>
                </Link>
                
                <Link href="/register">
                  <motion.div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* Button shimmer */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    />
                    <div className="relative flex items-center gap-2">
                      <span>🚀</span>
                      <span>Tilmeld Dig</span>
                    </div>
                  </motion.div>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button 
            className="lg:hidden p-3 rounded-xl hover:bg-slate-50 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={isMenuOpen ? { rotate: 45 } : { rotate: 0 }}
              transition={{ duration: 0.2 }}
            >
              <svg className="h-6 w-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </motion.div>
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="lg:hidden border-t border-slate-200 py-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-2">
                {[
                  { href: '/', label: t('home'), icon: '🏠' },
                  { href: '/raffles', label: t('activeRaffles'), icon: '🎯' },
                  { href: '/winners', label: t('winners'), icon: '🏆' },
                  { href: '/how-it-works', label: t('howItWorks'), icon: '❓' },
                  { href: '/faq', label: 'FAQ', icon: '💬' }
                ].map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link 
                      href={item.href}
                      className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </motion.div>
                ))}
                
                <div className="border-t border-slate-200 pt-4 mt-4">
                  {isAuthenticated ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 px-4 py-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {user?.firstName?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">Hej, {user?.firstName}!</div>
                          <div className="text-sm text-slate-500">Velkommen tilbage</div>
                        </div>
                      </div>
                      <Link href="/account" className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-xl">
                        <span>👤</span>
                        <span>Min Konto</span>
                      </Link>
                      {user?.isAdmin && (
                        <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-purple-600 hover:bg-purple-50 rounded-xl">
                          <span>👑</span>
                          <span>Admin</span>
                        </Link>
                      )}
                      <button 
                        onClick={logout}
                        className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl w-full text-left"
                      >
                        <span>🚪</span>
                        <span>Log Ud</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Link href="/login" className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-xl">
                        <span>🔑</span>
                        <span>Log Ind</span>
                      </Link>
                      <Link href="/register" className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold">
                        <span>🚀</span>
                        <span>Tilmeld Dig</span>
                      </Link>
                    </div>
                  )}
                  
                  <div className="px-4 py-3">
                    <LanguageSwitcher />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  )
}
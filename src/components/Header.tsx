'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import LanguageSwitcher from './LanguageSwitcher'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { t } = useLanguage()
  const { user, logout, isAuthenticated } = useAuth()

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          <Link href="/" className="flex items-center group">
            <div className="bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">
              <h1 className="text-xl font-bold tracking-tight">DrawDash</h1>
            </div>
          </Link>
          
          <nav className="hidden md:flex space-x-6">
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors duration-200 relative group">
              {t('home')}
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-500 group-hover:w-full transition-all duration-200"></div>
            </Link>
            <Link href="/raffles" className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors duration-200 relative group">
              {t('activeRaffles')}
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-500 group-hover:w-full transition-all duration-200"></div>
            </Link>
            <Link href="/winners" className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors duration-200 relative group">
              {t('winners')}
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-500 group-hover:w-full transition-all duration-200"></div>
            </Link>
            <Link href="/how-it-works" className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors duration-200 relative group">
              {t('howItWorks')}
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-500 group-hover:w-full transition-all duration-200"></div>
            </Link>
            <Link href="/faq" className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors duration-200 relative group">
              FAQ
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-500 group-hover:w-full transition-all duration-200"></div>
            </Link>
          </nav>

          <div className="hidden md:flex items-center space-x-3">
            <LanguageSwitcher />
            {isAuthenticated ? (
              <>
                <Link href="/account" className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors duration-200">
                  Min konto
                </Link>
                {user?.isAdmin && (
                  <Link href="/admin" className="text-sm font-medium text-green-600 hover:text-green-700 transition-colors duration-200 bg-green-50 px-2 py-1 rounded-full">
                    Admin
                  </Link>
                )}
                <div className="flex items-center space-x-2 ml-2 pl-2 border-l border-gray-200">
                  <div className="w-7 h-7 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    {user?.firstName?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-600">Hej, {user?.firstName}!</span>
                </div>
                <button 
                  onClick={logout}
                  className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  Log Ud
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors duration-200">
                  {t('login')}
                </Link>
                <Link href="/register" className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 shadow-sm">
                  {t('signUp')}
                </Link>
              </>
            )}
          </div>

          <button 
            className="md:hidden p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link href="/" className="block px-3 py-2 text-gray-700">{t('home')}</Link>
              <Link href="/raffles" className="block px-3 py-2 text-gray-700">{t('activeRaffles')}</Link>
              <Link href="/winners" className="block px-3 py-2 text-gray-700">{t('winners')}</Link>
              <Link href="/how-it-works" className="block px-3 py-2 text-gray-700">{t('howItWorks')}</Link>
              <Link href="/faq" className="block px-3 py-2 text-gray-700">FAQ</Link>
              
              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2 text-gray-700">Hej, {user?.firstName}!</div>
                  <Link href="/account" className="block px-3 py-2 text-gray-700">Min konto</Link>
                  {user?.isAdmin && (
                    <Link href="/admin" className="block px-3 py-2 text-green-600">Admin</Link>
                  )}
                  <button 
                    onClick={logout}
                    className="block px-3 py-2 text-gray-700 text-left w-full"
                  >
                    Log ud
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="block px-3 py-2 text-gray-700">{t('login')}</Link>
                  <Link href="/register" className="block px-3 py-2 text-green-600">{t('signUp')}</Link>
                </>
              )}
              
              <div className="px-3 py-2">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
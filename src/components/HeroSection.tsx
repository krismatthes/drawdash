'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export default function HeroSection() {
  const { t } = useLanguage()

  return (
    <section className="bg-gradient-to-r from-green-500/80 to-green-700/80 text-white py-16 relative overflow-hidden backdrop-blur-sm">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
      <div className="absolute top-8 left-8 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-8 right-8 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h1 className="text-3xl md:text-5xl font-bold mb-5">
          {t('heroTitle')}
        </h1>
        <p className="text-lg md:text-xl mb-6 max-w-3xl mx-auto opacity-90">
          {t('heroSubtitle')}
        </p>
        
        {/* Redesigned Free Entry Card */}
        <div className="relative max-w-3xl mx-auto mb-6">
          <div className="bg-white/90 text-gray-800 rounded-2xl p-6 shadow-xl border border-white/30 backdrop-blur-md">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-green-600 text-white rounded-full p-3 mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="text-2xl font-bold text-green-600 mb-1">{t('freeEntryTitle')}</h3>
                <p className="text-green-700 font-medium">Helt gratis deltagelse via postkort</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div className="text-left space-y-3">
                <p className="text-gray-700 leading-relaxed">
                  {t('freeEntryText')}
                </p>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Helt lovligt og gratis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Samme vindechance som betalte billetter</span>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                <div className="text-center">
                  <div className="text-3xl mb-2">📮</div>
                  <p className="text-sm font-semibold text-green-800 mb-2">Send postkort til:</p>
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <p className="text-xs text-gray-700 leading-tight">
                      DrawDash Gratis Deltagelse<br />
                      PO Box 123<br />
                      London, W1A 0AA
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/raffles"
            className="bg-white text-green-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
          >
            {t('viewActiveRaffles')}
          </Link>
          <Link 
            href="/how-it-works"
            className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-green-600 transition-all transform hover:scale-105"
          >
            {t('howItWorks')}
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-center shadow-lg transform hover:scale-105 transition-all duration-200">
            <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="text-3xl font-bold mb-2 text-white">5 kr</div>
            <div className="text-blue-100 font-medium">{t('startingPrice')}</div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-center shadow-lg transform hover:scale-105 transition-all duration-200">
            <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-3xl font-bold mb-2 text-white">Fair</div>
            <div className="text-emerald-100 font-medium">{t('fairDraws')}</div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 text-center shadow-lg transform hover:scale-105 transition-all duration-200">
            <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="text-3xl font-bold mb-2 text-white">Øjeblikkelig</div>
            <div className="text-amber-100 font-medium">{t('instantResults')}</div>
          </div>
        </div>
      </div>
    </section>
  )
}
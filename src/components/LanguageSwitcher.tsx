'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-green-600 transition-colors"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
        {language === 'da' ? 'DA' : 'EN'}
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            <button
              onClick={() => {
                setLanguage('da')
                setIsOpen(false)
              }}
              className={`flex items-center w-full px-4 py-2 text-sm ${
                language === 'da' 
                  ? 'bg-green-50 text-green-700' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              🇩🇰 {t('danish')}
            </button>
            <button
              onClick={() => {
                setLanguage('en')
                setIsOpen(false)
              }}
              className={`flex items-center w-full px-4 py-2 text-sm ${
                language === 'en' 
                  ? 'bg-green-50 text-green-700' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              🇬🇧 {t('english')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
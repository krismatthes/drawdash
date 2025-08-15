'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import { getFAQsByCategory } from '@/lib/mockFAQ'
import { useLanguage } from '@/contexts/LanguageContext'

const categories = [
  { id: 'all', label: 'Alle', icon: '📋' },
  { id: 'general', label: 'Generelt', icon: '❓' },
  { id: 'payment', label: 'Betaling', icon: '💳' },
  { id: 'delivery', label: 'Levering', icon: '📦' },
  { id: 'prizes', label: 'Præmier', icon: '🏆' },
  { id: 'account', label: 'Konto', icon: '👤' }
]

export default function FAQPage() {
  const { t } = useLanguage()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)
  
  const faqs = getFAQsByCategory(selectedCategory)

  const toggleFAQ = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Ofte Stillede Spørgsmål</h1>
          <p className="text-lg text-gray-600">Find svar på de mest almindelige spørgsmål om DrawDash</p>
        </div>

        {/* Category Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtrer efter kategori:</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-green-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqs.map(faq => (
            <div key={faq.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <button
                onClick={() => toggleFAQ(faq.id)}
                className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">{faq.question}</h3>
                  <div className={`flex-shrink-0 transition-transform duration-200 ${
                    expandedFAQ === faq.id ? 'transform rotate-180' : ''
                  }`}>
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </button>
              
              {expandedFAQ === faq.id && (
                <div className="px-6 pb-4">
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                    <div className="mt-3 flex items-center text-xs text-gray-500">
                      <span className="bg-gray-100 px-2 py-1 rounded-full">
                        {categories.find(cat => cat.id === faq.category)?.label || faq.category}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-8 mt-12 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Fandt du ikke svar på dit spørgsmål?</h2>
          <p className="text-green-100 mb-6">
            Vores kundeservice team er klar til at hjælpe dig med alle dine spørgsmål.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:support@drawdash.dk"
              className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
            >
              <span className="mr-2">📧</span>
              Send Email
            </a>
            <a 
              href="tel:+4570123456"
              className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors inline-flex items-center justify-center"
            >
              <span className="mr-2">📞</span>
              Ring til Os
            </a>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white rounded-lg p-6 text-center shadow-md">
            <div className="text-3xl font-bold text-green-600 mb-2">&lt; 2 timer</div>
            <div className="text-gray-600">Gennemsnitlig svartid</div>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow-md">
            <div className="text-3xl font-bold text-green-600 mb-2">98%</div>
            <div className="text-gray-600">Kundetilfredshed</div>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow-md">
            <div className="text-3xl font-bold text-green-600 mb-2">24/7</div>
            <div className="text-gray-600">Email support</div>
          </div>
        </div>
      </div>
    </div>
  )
}
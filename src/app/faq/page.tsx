'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PremiumHeader from '@/components/PremiumHeader'
import PremiumFooter from '@/components/PremiumFooter'
import GradientMesh from '@/components/GradientMesh'
import { getFAQsByCategory } from '@/lib/mockFAQ'
import { useLanguage } from '@/contexts/LanguageContext'

const categories = [
  { id: 'all', label: 'Alle', icon: '📋', color: 'from-slate-500 to-slate-600' },
  { id: 'general', label: 'Generelt', icon: '❓', color: 'from-blue-500 to-cyan-500' },
  { id: 'payment', label: 'Betaling', icon: '💳', color: 'from-emerald-500 to-teal-500' },
  { id: 'delivery', label: 'Levering', icon: '📦', color: 'from-purple-500 to-pink-500' },
  { id: 'prizes', label: 'Præmier', icon: '🏆', color: 'from-orange-500 to-red-500' },
  { id: 'account', label: 'Konto', icon: '👤', color: 'from-indigo-500 to-purple-500' }
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
    <div className="min-h-screen relative bg-white">
      <GradientMesh variant="default" />
      <PremiumHeader />
      
      <main className="relative">
        <div className="max-w-6xl mx-auto px-4 py-16">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm font-bold flex items-center gap-2">
                💬 HJÆLP
                <div className="w-2 h-2 bg-white/80 rounded-full animate-pulse" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Ofte stillede <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">spørgsmål</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Find svar på de mest almindelige spørgsmål om DrawDash lodtrækninger og services
            </p>
          </motion.div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-premium p-8 mb-12"
          >
            <h2 className="text-xl font-bold text-slate-900 mb-6 text-center">Filtrer efter kategori</h2>
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category, index) => (
                <motion.button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    selectedCategory === category.id
                      ? `bg-gradient-to-r ${category.color} text-white shadow-lg scale-105`
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:scale-105'
                  }`}
                  whileHover={{ scale: selectedCategory === category.id ? 1.05 : 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <span className="mr-2 text-lg">{category.icon}</span>
                  {category.label}
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-bold ${
                    selectedCategory === category.id
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {getFAQsByCategory(category.id).length}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* FAQ List */}
          <motion.div
            layout
            className="space-y-4"
          >
            <AnimatePresence mode="wait">
              {faqs.map((faq, index) => (
                <motion.div
                  key={faq.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="card-premium overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <motion.button
                    onClick={() => toggleFAQ(faq.id)}
                    className="w-full px-8 py-6 text-left hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded-t-xl"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-bold text-slate-900 pr-4 leading-relaxed">
                        {faq.question}
                      </h3>
                      <motion.div
                        animate={{ rotate: expandedFAQ === faq.id ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex-shrink-0"
                      >
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </motion.div>
                    </div>
                  </motion.button>
                  
                  <AnimatePresence>
                    {expandedFAQ === faq.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-8 pb-6 border-t border-slate-100">
                          <div className="pt-6 prose prose-slate max-w-none">
                            <div className="text-slate-700 leading-relaxed">
                              {faq.answer}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center mt-16"
          >
            <div className="card-premium p-12">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">💬</span>
              </div>
              
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Fandt du ikke svar på dit spørgsmål?
              </h2>
              <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
                Vores support team er klar til at hjælpe dig. Kontakt os og få personlig assistance.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  onClick={() => window.open('mailto:support@drawdash.dk', '_blank')}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  📧 Send email
                </motion.button>
                
                <motion.button
                  onClick={() => window.open('tel:+4570205060', '_blank')}
                  className="px-8 py-4 bg-white border-2 border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-600 rounded-xl font-bold transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  📞 Ring til os
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <PremiumFooter />
    </div>
  )
}
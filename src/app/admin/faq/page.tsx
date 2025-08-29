'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, Reorder } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import AdminLayout from '@/components/AdminLayout'
import { getAllFAQs, FAQ } from '@/lib/mockFAQ'

export default function FAQManagement() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [faqs, setFAQs] = useState<FAQ[]>(getAllFAQs().sort((a, b) => a.order - b.order))
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null)
  const [showCreateFAQ, setShowCreateFAQ] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [categoryFilter, setCategoryFilter] = useState<'all' | FAQ['category']>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login?redirect=/admin/faq')
        return
      }
      if (!user?.isAdmin) {
        router.push('/')
        return
      }
    }
  }, [isLoading, isAuthenticated, user?.isAdmin, router])

  // Show loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if not admin (will redirect)
  if (!isAuthenticated || !user?.isAdmin) {
    return null
  }

  const filteredFAQs = faqs.filter(faq => {
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'active' && faq.isActive) ||
      (filter === 'inactive' && !faq.isActive)
    
    const matchesCategory = categoryFilter === 'all' || faq.category === categoryFilter
    
    const matchesSearch = 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesCategory && matchesSearch
  })

  const handleCreateFAQ = (faqData: Partial<FAQ>) => {
    const newFAQ: FAQ = {
      id: Date.now().toString(),
      question: faqData.question || '',
      answer: faqData.answer || '',
      category: faqData.category || 'general',
      isActive: faqData.isActive ?? true,
      order: Math.max(...faqs.map(f => f.order), 0) + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setFAQs(prev => [...prev, newFAQ])
    setShowCreateFAQ(false)
  }

  const handleUpdateFAQ = (faqData: Partial<FAQ>) => {
    if (!editingFAQ) return
    const updatedFAQ: FAQ = {
      ...editingFAQ,
      ...faqData,
      updatedAt: new Date()
    }
    setFAQs(prev => prev.map(f => f.id === editingFAQ.id ? updatedFAQ : f))
    setEditingFAQ(null)
  }

  const handleDeleteFAQ = (faqId: string) => {
    if (confirm('Er du sikker på du vil slette dette FAQ?')) {
      setFAQs(prev => prev.filter(f => f.id !== faqId))
    }
  }

  const handleToggleFAQStatus = (faqId: string) => {
    setFAQs(prev => prev.map(f => 
      f.id === faqId ? { ...f, isActive: !f.isActive, updatedAt: new Date() } : f
    ))
  }

  const handleReorder = (newOrder: FAQ[]) => {
    // Update the order property based on new positions
    const updatedFAQs = newOrder.map((faq, index) => ({
      ...faq,
      order: index + 1,
      updatedAt: new Date()
    }))
    setFAQs(updatedFAQs)
  }

  const categories = [
    { key: 'general', label: 'Generelt' },
    { key: 'payment', label: 'Betaling' },
    { key: 'delivery', label: 'Levering' },
    { key: 'prizes', label: 'Præmier' },
    { key: 'account', label: 'Konto' }
  ]

  const stats = {
    total: faqs.length,
    active: faqs.filter(f => f.isActive).length,
    inactive: faqs.filter(f => !f.isActive).length
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">FAQ Styring</h1>
            <p className="text-slate-600">Administrer ofte stillede spørgsmål med træk-og-slip</p>
          </div>
          
          <motion.button
            onClick={() => setShowCreateFAQ(true)}
            className="mt-4 sm:mt-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Opret Nyt FAQ
          </motion.button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-600">Samlede FAQ</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-600">Aktive FAQ</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                <p className="text-xs text-green-600 mt-1">
                  Synlige på hjemmeside
                </p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-600">Inaktive FAQ</p>
                <p className="text-2xl font-bold text-orange-600">{stats.inactive}</p>
                <p className="text-xs text-orange-600 mt-1">
                  Skjult for brugere
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L18 18M4 4l16 16" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Status Filter */}
            <div className="flex space-x-1 p-1 bg-slate-100 rounded-lg">
              {[
                { key: 'all', label: 'Alle' },
                { key: 'active', label: 'Aktive' },
                { key: 'inactive', label: 'Inaktive' }
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => setFilter(option.key as any)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-all ${
                    filter === option.key
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Alle kategorier</option>
              {categories.map(category => (
                <option key={category.key} value={category.key}>
                  {category.label}
                </option>
              ))}
            </select>

            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Søg i FAQ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Drag and Drop Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 text-blue-600 mt-0.5">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-blue-900">Træk og slip for at ændre rækkefølge</h3>
              <p className="text-sm text-blue-700 mt-1">
                Du kan trække FAQ-elementer op og ned for at ændre deres rækkefølge på hjemmesiden. Rækkefølgen gemmes automatisk.
              </p>
            </div>
          </div>
        </div>

        {/* Reorderable FAQ List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">FAQ Liste</h2>
            <p className="text-sm text-slate-600">Træk og slip for at ændre rækkefølge</p>
          </div>

          <Reorder.Group
            axis="y"
            values={filteredFAQs}
            onReorder={handleReorder}
            className="divide-y divide-slate-200"
          >
            {filteredFAQs.map((faq) => (
              <Reorder.Item
                key={faq.id}
                value={faq}
                className="group hover:bg-slate-50 transition-colors cursor-grab active:cursor-grabbing"
              >
                <div className="px-6 py-4">
                  <div className="flex items-start gap-4">
                    {/* Drag Handle */}
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-6 h-6 text-slate-400 group-hover:text-slate-600 transition-colors">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                        </svg>
                      </div>
                    </div>

                    {/* Order Number */}
                    <div className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-sm font-semibold text-slate-600">
                      {faq.order}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-slate-900 mb-1">
                            {faq.question}
                          </h3>
                          <p className="text-sm text-slate-600 line-clamp-2 mb-2">
                            {faq.answer.length > 100 
                              ? `${faq.answer.substring(0, 100)}...`
                              : faq.answer
                            }
                          </p>
                          
                          <div className="flex items-center gap-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              categories.find(c => c.key === faq.category)?.key === faq.category
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {categories.find(c => c.key === faq.category)?.label || faq.category}
                            </span>
                            
                            <button
                              onClick={() => handleToggleFAQStatus(faq.id)}
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-colors ${
                                faq.isActive 
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                  : 'bg-red-100 text-red-800 hover:bg-red-200'
                              }`}
                            >
                              {faq.isActive ? 'Aktiv' : 'Inaktiv'}
                            </button>
                            
                            <span className="text-xs text-slate-500">
                              Opdateret: {faq.updatedAt.toLocaleDateString('da-DK')}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-2 ml-4">
                          <motion.button
                            onClick={() => setEditingFAQ(faq)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </motion.button>
                          
                          <motion.button
                            onClick={() => handleDeleteFAQ(faq.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>

          {filteredFAQs.length === 0 && (
            <div className="px-6 py-12 text-center">
              <div className="text-slate-400 text-lg mb-2">Ingen FAQ fundet</div>
              <div className="text-slate-500">Prøv at justere dine filtre eller opret et nyt FAQ</div>
            </div>
          )}
        </div>
      </div>

      {/* Create FAQ Modal */}
      {showCreateFAQ && (
        <CreateFAQModal 
          onClose={() => setShowCreateFAQ(false)} 
          onSave={handleCreateFAQ}
          categories={categories}
        />
      )}

      {/* Edit FAQ Modal */}
      {editingFAQ && (
        <EditFAQModal 
          faq={editingFAQ}
          onClose={() => setEditingFAQ(null)} 
          onSave={handleUpdateFAQ}
          categories={categories}
        />
      )}
    </AdminLayout>
  )
}

// Create FAQ Modal Component
function CreateFAQModal({ 
  onClose, 
  onSave, 
  categories 
}: { 
  onClose: () => void
  onSave: (data: Partial<FAQ>) => void
  categories: Array<{key: string, label: string}>
}) {
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'general' as FAQ['category'],
    isActive: true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-slate-900">Opret Nyt FAQ</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Spørgsmål
            </label>
            <input
              type="text"
              value={formData.question}
              onChange={(e) => setFormData({...formData, question: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Svar
            </label>
            <textarea
              value={formData.answer}
              onChange={(e) => setFormData({...formData, answer: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={5}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Kategori
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value as FAQ['category']})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category.key} value={category.key}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              className="h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="ml-2 text-sm text-slate-700">
              Aktiv (synlig på FAQ siden)
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Annuller
            </button>
            <motion.button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg font-semibold"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Opret FAQ
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// Edit FAQ Modal Component
function EditFAQModal({ 
  faq, 
  onClose, 
  onSave, 
  categories 
}: { 
  faq: FAQ
  onClose: () => void
  onSave: (data: Partial<FAQ>) => void
  categories: Array<{key: string, label: string}>
}) {
  const [formData, setFormData] = useState({
    question: faq.question,
    answer: faq.answer,
    category: faq.category,
    isActive: faq.isActive,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-slate-900">Rediger FAQ</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Spørgsmål
            </label>
            <input
              type="text"
              value={formData.question}
              onChange={(e) => setFormData({...formData, question: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Svar
            </label>
            <textarea
              value={formData.answer}
              onChange={(e) => setFormData({...formData, answer: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={5}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Kategori
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value as FAQ['category']})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category.key} value={category.key}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActiveEdit"
              checked={formData.isActive}
              onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              className="h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <label htmlFor="isActiveEdit" className="ml-2 text-sm text-slate-700">
              Aktiv (synlig på FAQ siden)
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Annuller
            </button>
            <motion.button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg font-semibold"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Gem Ændringer
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
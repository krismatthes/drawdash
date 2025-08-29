'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { raffleService } from '@/lib/raffleService'
import { Raffle } from '@/types/raffle'
import ImageUpload from '@/components/ImageUpload'
import ProfitCalculator from '@/components/ProfitCalculator'

interface RaffleFormData {
  title: string
  description: string
  image: string
  category: string
  emoji: string
  ticketPrice: number
  totalTickets: number
  endDate: string
  status: Raffle['status']
  isInstantWin: boolean
  prize: {
    name: string
    value: number
    cost: number
    description: string
    images: string[]
  }
}

export default function CreateRaffle() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof RaffleFormData, string>>>({})
  
  const [formData, setFormData] = useState<RaffleFormData>({
    title: '',
    description: '',
    image: '',
    category: '',
    emoji: '🎯',
    ticketPrice: 10,
    totalTickets: 1000,
    endDate: '',
    status: 'upcoming',
    isInstantWin: false,
    prize: {
      name: '',
      value: 0,
      cost: 0,
      description: '',
      images: []
    }
  })

  // Set default end date to 7 days from now
  useEffect(() => {
    const defaultEndDate = new Date()
    defaultEndDate.setDate(defaultEndDate.getDate() + 7)
    const dateString = defaultEndDate.toISOString().slice(0, 16) // Format for datetime-local input
    setFormData(prev => ({ ...prev, endDate: dateString }))
  }, [])

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login?redirect=/admin/raffles/create')
        return
      }
      if (!user?.isAdmin) {
        router.push('/')
        return
      }
    }
  }, [isLoading, isAuthenticated, user?.isAdmin, router])

  const handleInputChange = (field: keyof RaffleFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handlePrizeChange = (field: keyof RaffleFormData['prize'], value: any) => {
    setFormData(prev => ({
      ...prev,
      prize: {
        ...prev.prize,
        [field]: value
      }
    }))
  }

  const handleImagesChange = (images: string[]) => {
    handlePrizeChange('images', images)
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof RaffleFormData, string>> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Titel er påkrævet'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Beskrivelse er påkrævet'
    }

    if (!formData.image.trim()) {
      newErrors.image = 'Billede URL er påkrævet'
    } else {
      // Basic URL validation
      try {
        new URL(formData.image)
      } catch {
        newErrors.image = 'Indtast en gyldig URL'
      }
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Kategori er påkrævet'
    }

    if (formData.ticketPrice <= 0) {
      newErrors.ticketPrice = 'Billetpris skal være større end 0'
    }

    if (formData.totalTickets <= 0) {
      newErrors.totalTickets = 'Antal billetter skal være større end 0'
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Slutdato er påkrævet'
    } else {
      const endDate = new Date(formData.endDate)
      if (endDate <= new Date()) {
        newErrors.endDate = 'Slutdato skal være i fremtiden'
      }
    }

    if (!formData.prize.name.trim()) {
      newErrors.prize = 'Præmie navn er påkrævet'
    }

    if (formData.prize.value <= 0) {
      newErrors.prize = 'Præmie værdi skal være større end 0'
    }

    if (formData.prize.cost <= 0) {
      newErrors.prize = 'Præmie indkøbspris skal være større end 0'
    }

    if (formData.prize.cost >= formData.prize.value) {
      newErrors.prize = 'Indkøbspris skal være lavere end salgsværdi'
    }

    if (!formData.prize.description.trim()) {
      newErrors.prize = 'Præmie beskrivelse er påkrævet'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      const raffleData = {
        ...formData,
        endDate: new Date(formData.endDate),
        endsAt: new Date(formData.endDate)
      }

      const newRaffle = raffleService.createRaffle(raffleData)
      
      // Redirect to the raffle detail page
      router.push(`/admin/raffles/${newRaffle.id}`)
    } catch (error) {
      console.error('Error creating raffle:', error)
      alert('Der opstod en fejl ved oprettelse af lodtrækningen')
    } finally {
      setIsSubmitting(false)
    }
  }

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

  const categories = [
    'Bil', 'Elektronik', 'Luksus', 'Gaming', 'Computer', 'Kontant', 'Instant Win', 'Sport', 'Mode', 'Rejse'
  ]

  const emojis = [
    '🎯', '🏎️', '📱', '⌚', '💰', '🎮', '💻', '🏆', '💎', '🎁', '✈️', '👕', '⚽', '🎵', '📷'
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg border-r border-slate-200">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b border-slate-200 px-4">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">DD</span>
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">DrawDash</div>
                <div className="text-xs text-slate-500">Admin Panel</div>
              </div>
            </Link>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-4 py-4">
            <div className="space-y-1">
              <Link href="/admin">
                <div className="text-slate-600 hover:bg-slate-50 hover:text-slate-900 px-3 py-2.5 text-sm font-medium rounded-xl flex items-center gap-3 transition-colors">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Dashboard
                </div>
              </Link>
              
              <Link href="/admin/raffles">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200 px-3 py-2.5 text-sm font-medium rounded-xl flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 0v1m-2 0V6a2 2 0 00-2 0v1m2 0V9.5m0 0v3m0-3h3m-3 0h-3m-2-5a9 9 0 1118 0 9 9 0 01-18 0z" />
                  </svg>
                  Lodtrækninger
                  <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full" />
                </div>
              </Link>
              
              <Link href="/admin/users">
                <div className="text-slate-600 hover:bg-slate-50 hover:text-slate-900 px-3 py-2.5 text-sm font-medium rounded-xl flex items-center gap-3 transition-colors">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 5.197H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Brugere
                </div>
              </Link>
              
              <Link href="/admin/finance">
                <div className="text-slate-600 hover:bg-slate-50 hover:text-slate-900 px-3 py-2.5 text-sm font-medium rounded-xl flex items-center gap-3 transition-colors">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Finans
                </div>
              </Link>
              
              <Link href="/admin/faq">
                <div className="text-slate-600 hover:bg-slate-50 hover:text-slate-900 px-3 py-2.5 text-sm font-medium rounded-xl flex items-center gap-3 transition-colors">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  FAQ
                </div>
              </Link>
            </div>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <Link href="/admin/raffles" className="text-slate-600 hover:text-slate-900">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-slate-600">Opret Ny Lodtrækning</span>
            </div>
          </div>
          <div className="text-sm text-slate-500">
            {new Date().toLocaleDateString('da-DK', {
              weekday: 'long',
              year: 'numeric',
              month: 'long', 
              day: 'numeric'
            })}
          </div>
        </div>

        <main className="px-6 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Opret Ny Lodtrækning</h1>
              <p className="text-slate-600">Udfyld formularen nedenfor for at oprette en ny lodtrækning</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <h2 className="text-xl font-semibold text-slate-900 mb-6">Grundlæggende Information</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Titel *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.title ? 'border-red-300' : 'border-slate-300'}`}
                      placeholder="f.eks. BMW M4 Competition"
                    />
                    {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Beskrivelse *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.description ? 'border-red-300' : 'border-slate-300'}`}
                      placeholder="Beskriv lodtrækningen i detaljer..."
                    />
                    {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Kategori *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.category ? 'border-red-300' : 'border-slate-300'}`}
                    >
                      <option value="">Vælg kategori</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Emoji
                    </label>
                    <select
                      value={formData.emoji}
                      onChange={(e) => handleInputChange('emoji', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {emojis.map(emoji => (
                        <option key={emoji} value={emoji}>{emoji}</option>
                      ))}
                    </select>
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Billede URL *
                    </label>
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => handleInputChange('image', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.image ? 'border-red-300' : 'border-slate-300'}`}
                      placeholder="https://example.com/image.jpg"
                    />
                    {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
                    
                    {formData.image && (
                      <div className="mt-4">
                        <img
                          src={formData.image}
                          alt="Preview"
                          className="w-full max-w-md h-48 object-cover rounded-lg border border-slate-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Pricing & Tickets */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <h2 className="text-xl font-semibold text-slate-900 mb-6">Priser & Billetter</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Billetpris (kr) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.ticketPrice}
                      onChange={(e) => handleInputChange('ticketPrice', parseInt(e.target.value))}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.ticketPrice ? 'border-red-300' : 'border-slate-300'}`}
                    />
                    {errors.ticketPrice && <p className="mt-1 text-sm text-red-600">{errors.ticketPrice}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Antal Billetter *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.totalTickets}
                      onChange={(e) => handleInputChange('totalTickets', parseInt(e.target.value))}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.totalTickets ? 'border-red-300' : 'border-slate-300'}`}
                    />
                    {errors.totalTickets && <p className="mt-1 text-sm text-red-600">{errors.totalTickets}</p>}
                  </div>

                  <div className="lg:col-span-2 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Maksimal omsætning:</span>
                      <span className="font-semibold text-blue-900">
                        {(formData.ticketPrice * formData.totalTickets).toLocaleString('da-DK')} kr
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profit Calculator */}
              {formData.prize.value > 0 && formData.prize.cost > 0 && formData.ticketPrice > 0 && formData.totalTickets > 0 && (
                <ProfitCalculator
                  prizeValue={formData.prize.value}
                  prizeCost={formData.prize.cost}
                  ticketPrice={formData.ticketPrice}
                  totalTickets={formData.totalTickets}
                />
              )}

              {/* Prize Information */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <h2 className="text-xl font-semibold text-slate-900 mb-6">Præmie Information</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Præmie Navn *
                    </label>
                    <input
                      type="text"
                      value={formData.prize.name}
                      onChange={(e) => handlePrizeChange('name', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.prize ? 'border-red-300' : 'border-slate-300'}`}
                      placeholder="f.eks. BMW M4 Competition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Præmie Salgsværdi (kr) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.prize.value}
                      onChange={(e) => handlePrizeChange('value', parseInt(e.target.value))}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.prize ? 'border-red-300' : 'border-slate-300'}`}
                      placeholder="Markedsværdi"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Præmie Indkøbspris (kr) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.prize.cost}
                      onChange={(e) => handlePrizeChange('cost', parseInt(e.target.value))}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.prize ? 'border-red-300' : 'border-slate-300'}`}
                      placeholder="Hvad præmien kostede"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      Bruges til markup og profitberegning
                    </p>
                  </div>

                  <div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="text-sm text-slate-600 mb-1">💰 Markup</div>
                      <div className="text-lg font-bold text-green-600">
                        {formData.prize.value > 0 && formData.prize.cost > 0 
                          ? `${(((formData.prize.value - formData.prize.cost) / formData.prize.cost) * 100).toFixed(1)}%`
                          : '0%'
                        }
                      </div>
                      <div className="text-xs text-slate-500">
                        {formData.prize.value > 0 && formData.prize.cost > 0 
                          ? `+${(formData.prize.value - formData.prize.cost).toLocaleString('da-DK')} kr`
                          : 'Indtast begge priser'
                        }
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Præmie Beskrivelse *
                    </label>
                    <textarea
                      value={formData.prize.description}
                      onChange={(e) => handlePrizeChange('description', e.target.value)}
                      rows={3}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.prize ? 'border-red-300' : 'border-slate-300'}`}
                      placeholder="Detaljeret beskrivelse af præmien..."
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <ImageUpload
                      images={formData.prize.images}
                      onImagesChange={handleImagesChange}
                      maxImages={5}
                      label="Præmie Billeder"
                      description="Upload billeder af præmien (maksimalt 5 stk.)"
                    />
                  </div>

                  {errors.prize && <p className="lg:col-span-2 text-sm text-red-600">{errors.prize}</p>}
                </div>
              </div>

              {/* Settings */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <h2 className="text-xl font-semibold text-slate-900 mb-6">Indstillinger</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Slutdato *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.endDate ? 'border-red-300' : 'border-slate-300'}`}
                    />
                    {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value as Raffle['status'])}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="upcoming">Kommende</option>
                      <option value="active">Aktiv</option>
                      <option value="ended">Afsluttet</option>
                    </select>
                  </div>

                  <div className="lg:col-span-2">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.isInstantWin}
                        onChange={(e) => handleInputChange('isInstantWin', e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-slate-700">Instant Win</span>
                        <p className="text-xs text-slate-500">Vinderen udpeges øjeblikkeligt ved køb af billet</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-8">
                <Link href="/admin/raffles">
                  <button
                    type="button"
                    className="px-6 py-3 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    Annuller
                  </button>
                </Link>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Opretter...
                    </div>
                  ) : (
                    '✨ Opret Lodtrækning'
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
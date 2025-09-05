'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { userService } from '@/lib/userService'
import { raffleServiceDB } from '@/lib/raffleServiceDB'
import { antiFraud } from '@/lib/antiFraud'

// Edit User Modal Component
interface EditUserModalProps {
  isOpen: boolean
  user: any | null
  onSave: (updates: any) => void
  onCancel: () => void
}

function EditUserModal({ isOpen, user, onSave, onCancel }: EditUserModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    adminNotes: ''
  })

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        postalCode: user.postalCode || '',
        country: user.country || '',
        adminNotes: user.adminNotes || ''
      })
    }
  }, [user])

  const handleSave = () => {
    onSave(formData)
    onCancel()
  }

  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Rediger Bruger</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Fornavn</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Efternavn</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Telefon</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Land</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Adresse</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">By</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Postnummer</label>
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Admin Noter</label>
              <textarea
                value={formData.adminNotes}
                onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
                rows={3}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Interne noter om brugeren..."
              />
            </div>
          </div>
          
          <div className="flex gap-3 justify-end mt-6">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Annuller
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Gem Ændringer
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// Grant Free Tickets Modal
interface GrantTicketsModalProps {
  isOpen: boolean
  user: any | null
  onGrant: (raffleId: string, quantity: number, reason: string) => void
  onCancel: () => void
}

function GrantTicketsModal({ isOpen, user, onGrant, onCancel }: GrantTicketsModalProps) {
  const [raffleId, setRaffleId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [reason, setReason] = useState('')
  const [raffles, setRaffles] = useState<any[]>([])

  useEffect(() => {
    if (isOpen) {
      const loadRaffles = async () => {
        const allRaffles = await raffleServiceDB.getActiveRaffles()
        setRaffles(allRaffles.filter((r: any) => r.status === 'active'))
      }
      loadRaffles()
    }
  }, [isOpen])

  const handleGrant = () => {
    if (raffleId && quantity > 0 && reason.trim()) {
      onGrant(raffleId, quantity, reason.trim())
      setRaffleId('')
      setQuantity(1)
      setReason('')
      onCancel()
    }
  }

  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl max-w-md w-full"
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Giv Gratis Billetter</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Vælg Lodtrækning</label>
              <select
                value={raffleId}
                onChange={(e) => setRaffleId(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Vælg lodtrækning...</option>
                {raffles.map((raffle) => (
                  <option key={raffle.id} value={raffle.id}>
                    {raffle.title} - {raffle.ticketPrice} kr
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Antal Billetter</label>
              <input
                type="number"
                min="1"
                max="100"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Grund (påkrævet)</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="F.eks. Kompensation for teknisk problem, kundeservice gestus..."
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-3 justify-end mt-6">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Annuller
            </button>
            <button
              onClick={handleGrant}
              disabled={!raffleId || quantity < 1 || !reason.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Giv Billetter
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function UserDetail() {
  const { user: currentUser, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string

  const [user, setUser] = useState<any>(null)
  const [userEntries, setUserEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'draws' | 'points' | 'activity'>('overview')
  const [drawsFilter, setDrawsFilter] = useState<'all' | 'active' | 'completed'>('all')

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login?redirect=/admin/users')
        return
      }
      if (!currentUser?.isAdmin) {
        router.push('/')
        return
      }
    }
  }, [isLoading, isAuthenticated, currentUser?.isAdmin, router])

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      if (!userId) return
      
      try {
        // Get user data
        const userData = await userService.getUserById(userId)
        if (userData) {
          setUser(userData)
          
          // Get user's raffle entries
          const entries = await raffleServiceDB.getUserRaffleEntries(userId)
          setUserEntries(entries)
        } else {
          router.push('/admin/users')
        }
      } catch (error) {
        console.error('Failed to load user data:', error)
        router.push('/admin/users')
      } finally {
        setLoading(false)
      }
    }

    if (currentUser?.isAdmin) {
      loadUserData()
    }
  }, [userId, router, currentUser?.isAdmin])

  const handleSaveUser = async (updates: any) => {
    if (user) {
      try {
        await userService.updateUser(user.id, updates)
        const updatedUser = await userService.getUserById(user.id)
        if (updatedUser) {
          setUser(updatedUser)
        }
      } catch (error) {
        console.error('Failed to update user:', error)
      }
    }
  }

  // Show loading
  if (isLoading || loading || !user) {
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
  if (!isAuthenticated || !currentUser?.isAdmin) {
    return null
  }

  // Filter user entries based on status
  const getFilteredEntries = () => {
    if (drawsFilter === 'active') {
      return userEntries.filter(entry => entry.raffle.status === 'active')
    } else if (drawsFilter === 'completed') {
      return userEntries.filter(entry => entry.raffle.status === 'ended' || entry.raffle.status === 'completed')
    }
    return userEntries
  }

  const filteredEntries = getFilteredEntries()
  
  // Sort entries chronologically (newest first)
  const sortedEntries = [...filteredEntries].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar - same as other admin pages */}
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
              
              <Link href="/admin/users">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200 px-3 py-2.5 text-sm font-medium rounded-xl flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 5.197H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Brugere
                  <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full" />
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
            <Link href="/admin/users" className="text-slate-600 hover:text-slate-900">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-slate-600">Brugerdetaljer</span>
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
          <div className="max-w-7xl mx-auto space-y-6">
            {/* User Header */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500">
                    <span className="text-white text-xl font-bold">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                      {user.firstName} {user.lastName}
                    </h1>
                    <p className="text-slate-600">{user.email}</p>
                    {user.phone && <p className="text-slate-500 text-sm">{user.phone}</p>}
                    
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Aktiv
                      </span>
                      
                      {user.isVerified && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Verificeret
                        </span>
                      )}
                      
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                        {(user.loyaltyTier || 'bronze').charAt(0).toUpperCase() + (user.loyaltyTier || 'bronze').slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditModalOpen(true)}
                    className="px-4 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Rediger
                  </button>
                </div>
              </div>
              
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="border-b border-slate-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'overview', label: 'Oversigt' },
                    { id: 'draws', label: `Lodtrækninger (${userEntries.length})` },
                    { id: 'points', label: 'Points & Loyalty' },
                    { id: 'activity', label: 'Aktivitetslog' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Stats Cards */}
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-50 rounded-lg p-4">
                        <div className="text-sm text-slate-600 mb-1">Total Forbrug</div>
                        <div className="text-2xl font-bold text-slate-900">{user.totalSpent?.toLocaleString('da-DK') || '0'} kr</div>
                      </div>
                      
                      <div className="bg-slate-50 rounded-lg p-4">
                        <div className="text-sm text-slate-600 mb-1">Loyalty Points</div>
                        <div className="text-2xl font-bold text-purple-600">{user.points?.toLocaleString('da-DK') || '0'}</div>
                      </div>
                      
                      <div className="bg-slate-50 rounded-lg p-4">
                        <div className="text-sm text-slate-600 mb-1">Deltagelser</div>
                        <div className="text-2xl font-bold text-slate-900">{userEntries.length}</div>
                      </div>
                      
                      <div className="bg-slate-50 rounded-lg p-4">
                        <div className="text-sm text-slate-600 mb-1">Total Billetter</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {userEntries.reduce((sum, entry) => sum + entry.quantity, 0)}
                        </div>
                      </div>
                    </div>
                    
                    {/* User Info */}
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h3 className="font-semibold text-slate-900 mb-4">Brugeroplysninger</h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-slate-600">Registreret:</span>
                          <div>{new Date(user.createdAt).toLocaleDateString('da-DK')}</div>
                        </div>
                        <div>
                          <span className="text-slate-600">Loyalty Tier:</span>
                          <div className="capitalize">{user.loyaltyTier}</div>
                        </div>
                        <div>
                          <span className="text-slate-600">Verificeret:</span>
                          <div>{user.isVerified ? 'Ja' : 'Nej'}</div>
                        </div>
                        <div>
                          <span className="text-slate-600">Admin:</span>
                          <div>{user.isAdmin ? 'Ja' : 'Nej'}</div>
                        </div>
                        {user.phone && (
                          <div>
                            <span className="text-slate-600">Telefon:</span>
                            <div>{user.phone}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'draws' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-slate-900">Lodtræknings Deltagelser</h3>
                      
                      {/* Filter buttons */}
                      <div className="flex rounded-lg bg-slate-100 p-1">
                        {[
                          { key: 'all', label: `Alle (${userEntries.length})` },
                          { key: 'active', label: `Aktive (${userEntries.filter(e => e.raffle.status === 'active').length})` },
                          { key: 'completed', label: `Afsluttede (${userEntries.filter(e => e.raffle.status === 'ended' || e.raffle.status === 'completed').length})` }
                        ].map((filter) => (
                          <button
                            key={filter.key}
                            onClick={() => setDrawsFilter(filter.key as any)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                              drawsFilter === filter.key
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {filter.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Entries list */}
                    <div className="space-y-4">
                      {sortedEntries.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                          <div className="text-6xl mb-4">🎫</div>
                          <h4 className="text-lg font-medium text-slate-900 mb-2">
                            {drawsFilter === 'all' ? 'Ingen deltagelser endnu' : 
                             drawsFilter === 'active' ? 'Ingen aktive deltagelser' :
                             'Ingen afsluttede deltagelser'}
                          </h4>
                          <p className="text-slate-600">
                            {drawsFilter === 'all' ? 'Denne bruger har ikke deltaget i nogen lodtrækninger endnu' :
                             drawsFilter === 'active' ? 'Brugeren deltager ikke i nogen aktive lodtrækninger' :
                             'Brugeren har ingen afsluttede deltagelser'}
                          </p>
                        </div>
                      ) : (
                        sortedEntries.map((entry) => (
                          <div key={entry.id} className="bg-white border border-slate-200 rounded-lg p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="text-lg font-semibold text-slate-900">
                                    {entry.raffle.title}
                                  </h4>
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    entry.raffle.status === 'active' 
                                      ? 'bg-green-100 text-green-700'
                                      : entry.raffle.status === 'ended'
                                      ? 'bg-gray-100 text-gray-700'
                                      : entry.raffle.status === 'upcoming'
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-red-100 text-red-700'
                                  }`}>
                                    {entry.raffle.status === 'active' ? 'Aktiv' :
                                     entry.raffle.status === 'ended' ? 'Afsluttet' :
                                     entry.raffle.status === 'upcoming' ? 'Kommende' : 'Ukendt'}
                                  </span>
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                  <div>
                                    <div className="text-sm text-slate-600">Billetter købt</div>
                                    <div className="font-semibold text-slate-900">{entry.quantity}</div>
                                  </div>
                                  <div>
                                    <div className="text-sm text-slate-600">Beløb</div>
                                    <div className="font-semibold text-slate-900">
                                      {entry.totalAmount.toLocaleString('da-DK')} kr
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-sm text-slate-600">Billetnumre</div>
                                    <div className="font-semibold text-slate-900">
                                      {entry.ticketNumbers.join(', ')}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-sm text-slate-600">Status</div>
                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                      entry.paymentStatus === 'completed' 
                                        ? 'bg-green-100 text-green-700'
                                        : entry.paymentStatus === 'pending'
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : 'bg-red-100 text-red-700'
                                    }`}>
                                      {entry.paymentStatus === 'completed' ? 'Betalt' : 
                                       entry.paymentStatus === 'pending' ? 'Afventer' : 'Fejlet'}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                                  <div className="text-sm text-slate-500">
                                    Deltaget: {new Date(entry.createdAt).toLocaleDateString('da-DK')} kl. {new Date(entry.createdAt).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                  <div className="text-sm text-slate-500">
                                    Lodtrækning slutter: {new Date(entry.raffle.endDate).toLocaleDateString('da-DK')}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'points' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-slate-900">Points & Loyalty System</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
                        <div className="text-sm text-purple-600 mb-2">Aktuelle Points</div>
                        <div className="text-3xl font-bold text-purple-900">{user.points?.toLocaleString('da-DK') || '0'}</div>
                        <div className="text-sm text-purple-700 mt-1">
                          ≈ {Math.round((user.points || 0) / 200)} kr værdi
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                        <div className="text-sm text-blue-600 mb-2">Loyalty Tier</div>
                        <div className="text-2xl font-bold text-blue-900 capitalize">{user.loyaltyTier || 'bronze'}</div>
                        <div className="text-sm text-blue-700 mt-1">
                          Baseret på {user.totalSpent?.toLocaleString('da-DK') || '0'} kr forbrug
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
                        <div className="text-sm text-green-600 mb-2">Point Rate</div>
                        <div className="text-2xl font-bold text-green-900">
                          {user.loyaltyTier === 'diamond' ? '1.5x' :
                           user.loyaltyTier === 'gold' ? '1.3x' :
                           user.loyaltyTier === 'silver' ? '1.15x' : '1.0x'}
                        </div>
                        <div className="text-sm text-green-700 mt-1">
                          Points multiplikator
                        </div>
                      </div>
                    </div>

                    {/* Loyalty Tiers Progress */}
                    <div className="bg-white border border-slate-200 rounded-lg p-6">
                      <h4 className="font-semibold text-slate-900 mb-4">Loyalty Tiers</h4>
                      <div className="space-y-4">
                        {[
                          { tier: 'bronze', name: 'Bronze', min: 0, multiplier: '1.0x', color: 'from-amber-400 to-orange-500' },
                          { tier: 'silver', name: 'Silver', min: 500, multiplier: '1.15x', color: 'from-gray-400 to-gray-500' },
                          { tier: 'gold', name: 'Gold', min: 2000, multiplier: '1.3x', color: 'from-yellow-400 to-yellow-500' },
                          { tier: 'diamond', name: 'Diamond', min: 10000, multiplier: '1.5x', color: 'from-emerald-400 to-teal-500' }
                        ].map((tier) => {
                          const isCurrentTier = user.loyaltyTier === tier.tier
                          const hasReached = (user.totalSpent || 0) >= tier.min
                          
                          return (
                            <div
                              key={tier.tier}
                              className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                                isCurrentTier 
                                  ? 'border-blue-300 bg-blue-50' 
                                  : hasReached
                                  ? 'border-green-300 bg-green-50'
                                  : 'border-slate-200 bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 bg-gradient-to-r ${tier.color} rounded-full flex items-center justify-center`}>
                                  <span className="text-white font-bold">
                                    {tier.tier === 'bronze' ? '🥉' :
                                     tier.tier === 'silver' ? '🥈' :
                                     tier.tier === 'gold' ? '🥇' : '💎'}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-semibold text-slate-900">{tier.name}</div>
                                  <div className="text-sm text-slate-600">
                                    Fra {tier.min.toLocaleString('da-DK')} kr forbrug
                                  </div>
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <div className="font-semibold text-slate-900">{tier.multiplier}</div>
                                {isCurrentTier && (
                                  <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                                    Nuværende
                                  </span>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'activity' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900">Aktivitetslog</h3>
                    
                    <div className="space-y-3">
                      {userEntries.length > 0 ? (
                        userEntries.slice(0, 10).map((entry) => (
                          <div key={entry.id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-blue-600">🎫</span>
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-slate-900">
                                Deltog i "{entry.raffle.title}" med {entry.quantity} billetter
                              </div>
                              <div className="text-xs text-slate-500 mt-1">
                                {new Date(entry.createdAt).toLocaleDateString('da-DK')} kl. {new Date(entry.createdAt).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })} • {entry.totalAmount.toLocaleString('da-DK')} kr
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-slate-500">
                          Ingen aktivitet endnu
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Modals */}
        <EditUserModal
          isOpen={editModalOpen}
          user={user}
          onSave={handleSaveUser}
          onCancel={() => setEditModalOpen(false)}
        />
      </div>
    </div>
  )
}
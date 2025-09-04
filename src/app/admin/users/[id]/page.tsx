'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { userManagementService, AdminUser, UserAction, FreeTicketGrant } from '@/lib/userManagementService'
import { antiFraud } from '@/lib/antiFraud'
import { raffleService } from '@/lib/raffleService'
import { paymentHistoryService, PaymentRecord, PaymentSummary } from '@/lib/paymentHistoryService'

// Edit User Modal Component
interface EditUserModalProps {
  isOpen: boolean
  user: AdminUser | null
  onSave: (updates: Partial<AdminUser>) => void
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
  user: AdminUser | null
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
      const allRaffles = raffleService.getAllRaffles()
      const activeRaffles = allRaffles.filter(r => r.status === 'active')
      setRaffles(activeRaffles)
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

  const [user, setUser] = useState<AdminUser | null>(null)
  const [userActions, setUserActions] = useState<UserAction[]>([])
  const [freeTickets, setFreeTickets] = useState<FreeTicketGrant[]>([])
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([])
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [ticketModalOpen, setTicketModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'preferences' | 'transactions'>('overview')

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
    if (userId) {
      const userData = userManagementService.getUserById(userId)
      if (userData) {
        setUser(userData)
        const actions = userManagementService.getUserActions(userId)
        setUserActions(actions)
        const tickets = userManagementService.getUserFreeTickets(userId)
        setFreeTickets(tickets)
        const payments = paymentHistoryService.getUserPaymentHistory(userId)
        setPaymentHistory(payments)
        const summary = paymentHistoryService.getUserPaymentSummary(userId)
        setPaymentSummary(summary)
      } else {
        router.push('/admin/users')
      }
    }
  }, [userId, router])

  const handleSaveUser = (updates: Partial<AdminUser>) => {
    if (user) {
      const success = userManagementService.updateUser(
        user.id,
        updates,
        currentUser?.email || 'admin@drawdash.dk'
      )
      
      if (success) {
        const updatedUser = userManagementService.getUserById(user.id)
        if (updatedUser) {
          setUser(updatedUser)
          // Refresh actions
          const actions = userManagementService.getUserActions(userId)
          setUserActions(actions)
        }
      }
    }
  }

  const handleGrantTickets = (raffleId: string, quantity: number, reason: string) => {
    if (user) {
      const grant = userManagementService.grantFreeTickets(
        user.id,
        raffleId,
        quantity,
        reason,
        currentUser?.email || 'admin@drawdash.dk'
      )
      
      if (grant) {
        // Refresh data
        const tickets = userManagementService.getUserFreeTickets(userId)
        setFreeTickets(tickets)
        const actions = userManagementService.getUserActions(userId)
        setUserActions(actions)
      }
    }
  }

  const handleBlockUser = () => {
    if (user && !user.isBlocked) {
      const reason = prompt('Grund til blokering:')
      if (reason) {
        const success = userManagementService.blockUser(
          user.id,
          reason,
          currentUser?.email || 'admin@drawdash.dk'
        )
        
        if (success) {
          const updatedUser = userManagementService.getUserById(user.id)
          if (updatedUser) setUser(updatedUser)
        }
      }
    }
  }

  const handleUnblockUser = () => {
    if (user && user.isBlocked) {
      const success = userManagementService.unblockUser(
        user.id,
        currentUser?.email || 'admin@drawdash.dk'
      )
      
      if (success) {
        const updatedUser = userManagementService.getUserById(user.id)
        if (updatedUser) setUser(updatedUser)
      }
    }
  }

  // Show loading
  if (isLoading || !user) {
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

  const getRiskBadge = (riskScore?: number) => {
    if (!riskScore) return null
    
    if (riskScore > 70) {
      return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Høj Risiko</span>
    } else if (riskScore > 40) {
      return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Medium Risiko</span>
    } else {
      return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Lav Risiko</span>
    }
  }

  const getDrawPreferenceChart = () => {
    const { drawPreferences } = user
    const total = Object.values(drawPreferences).reduce((sum, val) => sum + val, 0)
    
    if (total === 0) return null

    return (
      <div className="space-y-2">
        {Object.entries(drawPreferences).map(([key, value]) => {
          const percentage = (value / total) * 100
          const labels: Record<string, string> = {
            highValue: 'Høj værdi',
            cashPrizes: 'Kontanter',
            electronics: 'Elektronik',
            experiences: 'Oplevelser',
            cars: 'Biler',
            lifestyle: 'Livsstil'
          }
          
          return (
            <div key={key} className="flex items-center">
              <div className="w-24 text-sm text-slate-600">{labels[key]}</div>
              <div className="flex-1 bg-slate-200 rounded-full h-2 mr-3">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="w-12 text-xs text-slate-500">{value}</div>
            </div>
          )
        })}
      </div>
    )
  }

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
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    user.isBlocked ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-blue-500 to-purple-500'
                  }`}>
                    <span className="text-white text-xl font-bold">
                      {user.firstName[0]}{user.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                      {user.firstName} {user.lastName}
                      {user.fraudFlags > 0 && (
                        <span className="ml-2 text-red-500" title={`${user.fraudFlags} fraud flags`}>
                          ⚠️
                        </span>
                      )}
                    </h1>
                    <p className="text-slate-600">{user.email}</p>
                    {user.phone && <p className="text-slate-500 text-sm">{user.phone}</p>}
                    
                    <div className="flex items-center gap-2 mt-2">
                      {user.isBlocked ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Blokeret
                        </span>
                      ) : user.isActive ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Aktiv
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          Inaktiv
                        </span>
                      )}
                      
                      {user.isVerified && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Verificeret
                        </span>
                      )}
                      
                      {getRiskBadge(user.riskScore)}
                      
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                        {user.loyaltyTier.charAt(0).toUpperCase() + user.loyaltyTier.slice(1)}
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
                  <button
                    onClick={() => setTicketModalOpen(true)}
                    className="px-4 py-2 text-green-600 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    Giv Billetter
                  </button>
                  {user.isBlocked ? (
                    <button
                      onClick={handleUnblockUser}
                      className="px-4 py-2 text-green-600 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
                    >
                      Fjern Blok
                    </button>
                  ) : (
                    <button
                      onClick={handleBlockUser}
                      className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Bloker Bruger
                    </button>
                  )}
                </div>
              </div>
              
              {user.isBlocked && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-red-800 text-sm">
                    <strong>Blokeret:</strong> {user.blockReason}
                  </div>
                  <div className="text-red-600 text-xs mt-1">
                    Blokeret {user.blockedAt?.toLocaleDateString('da-DK')} af {user.blockedBy}
                  </div>
                </div>
              )}
              
              {user.adminNotes && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-blue-800 text-sm">
                    <strong>Admin Noter:</strong> {user.adminNotes}
                  </div>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="border-b border-slate-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'overview', label: 'Oversigt' },
                    { id: 'activity', label: 'Aktivitetslog' },
                    { id: 'preferences', label: 'Præferencer' },
                    { id: 'transactions', label: 'Transaktioner' }
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
                        <div className="text-2xl font-bold text-slate-900">{user.totalSpent.toLocaleString()} kr</div>
                      </div>
                      
                      <div className="bg-slate-50 rounded-lg p-4">
                        <div className="text-sm text-slate-600 mb-1">Total Gevinster</div>
                        <div className="text-2xl font-bold text-green-600">{user.totalWinnings.toLocaleString()} kr</div>
                      </div>
                      
                      <div className="bg-slate-50 rounded-lg p-4">
                        <div className="text-sm text-slate-600 mb-1">Billetter Købt</div>
                        <div className="text-2xl font-bold text-slate-900">{user.totalTickets}</div>
                      </div>
                      
                      <div className="bg-slate-50 rounded-lg p-4">
                        <div className="text-sm text-slate-600 mb-1">Loyalitet Point</div>
                        <div className="text-2xl font-bold text-purple-600">{user.loyaltyPoints}</div>
                      </div>
                    </div>
                    
                    {/* User Info */}
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h3 className="font-semibold text-slate-900 mb-4">Brugeroplysninger</h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-slate-600">Registreret:</span>
                          <div>{user.registeredAt.toLocaleDateString('da-DK')}</div>
                        </div>
                        <div>
                          <span className="text-slate-600">Sidst aktiv:</span>
                          <div>{user.lastActivity.toLocaleDateString('da-DK')}</div>
                        </div>
                        {user.address && (
                          <div>
                            <span className="text-slate-600">Adresse:</span>
                            <div>{user.address}</div>
                            {user.city && user.postalCode && (
                              <div>{user.postalCode} {user.city}</div>
                            )}
                          </div>
                        )}
                        <div>
                          <span className="text-slate-600">CRM Segment:</span>
                          <div className="capitalize">{user.crmSegment.replace('_', ' ')}</div>
                        </div>
                        {user.riskScore !== undefined && (
                          <div>
                            <span className="text-slate-600">Risiko Score:</span>
                            <div>{user.riskScore}/100</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'activity' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900">Aktivitetslog</h3>
                    
                    <div className="space-y-3">
                      {userActions.map((action) => (
                        <div key={action.id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-slate-900">{action.details}</div>
                            <div className="text-xs text-slate-500 mt-1">
                              {action.performedAt.toLocaleDateString('da-DK')} kl. {action.performedAt.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })} af {action.performedBy}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {userActions.length === 0 && (
                        <div className="text-center py-8 text-slate-500">
                          Ingen aktivitet endnu
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'preferences' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-slate-900">Lodtræknings Præferencer</h3>
                    
                    <div className="bg-slate-50 rounded-lg p-6">
                      <h4 className="font-medium text-slate-900 mb-4">Deltagelsesmønstre</h4>
                      {getDrawPreferenceChart()}
                    </div>
                    
                    {freeTickets.length > 0 && (
                      <div>
                        <h4 className="font-medium text-slate-900 mb-4">Gratis Billetter</h4>
                        <div className="space-y-3">
                          {freeTickets.map((grant) => (
                            <div key={grant.id} className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                              <div>
                                <div className="font-medium text-green-900">
                                  {grant.ticketQuantity} billetter til lodtrækning {grant.raffleId}
                                </div>
                                <div className="text-sm text-green-700">
                                  Grund: {grant.reason}
                                </div>
                                <div className="text-xs text-green-600 mt-1">
                                  Tildelt {grant.grantedAt.toLocaleDateString('da-DK')} af {grant.grantedBy}
                                </div>
                              </div>
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                grant.status === 'active' 
                                  ? 'bg-green-100 text-green-800'
                                  : grant.status === 'used'
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {grant.status === 'active' ? 'Aktiv' : grant.status === 'used' ? 'Brugt' : 'Udløbet'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'transactions' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-slate-900">Transaktionshistorik</h3>
                    
                    {/* Payment Summary */}
                    {paymentSummary && (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-green-50 rounded-lg p-4">
                          <div className="text-sm text-green-600 mb-1">Indskud</div>
                          <div className="text-xl font-bold text-green-800">{paymentSummary.totalDeposits.toLocaleString()} kr</div>
                        </div>
                        <div className="bg-red-50 rounded-lg p-4">
                          <div className="text-sm text-red-600 mb-1">Udbetalinger</div>
                          <div className="text-xl font-bold text-red-800">{paymentSummary.totalWithdrawals.toLocaleString()} kr</div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="text-sm text-blue-600 mb-1">Køb</div>
                          <div className="text-xl font-bold text-blue-800">{paymentSummary.totalPurchases.toLocaleString()} kr</div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4">
                          <div className="text-sm text-purple-600 mb-1">Net Saldo</div>
                          <div className={`text-xl font-bold ${paymentSummary.netBalance >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                            {paymentSummary.netBalance.toLocaleString()} kr
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Transaction List */}
                    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                      <div className="px-6 py-4 border-b border-slate-200">
                        <h4 className="font-medium text-slate-900">Alle Transaktioner</h4>
                      </div>
                      
                      <div className="divide-y divide-slate-200">
                        {paymentHistory.slice(0, 20).map((payment) => (
                          <div key={payment.id} className="px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                payment.type === 'deposit' ? 'bg-green-100' :
                                payment.type === 'withdrawal' || payment.type === 'payout' ? 'bg-red-100' :
                                payment.type === 'purchase' ? 'bg-blue-100' :
                                'bg-gray-100'
                              }`}>
                                {payment.type === 'deposit' && <span className="text-green-600">↓</span>}
                                {(payment.type === 'withdrawal' || payment.type === 'payout') && <span className="text-red-600">↑</span>}
                                {payment.type === 'purchase' && <span className="text-blue-600">💳</span>}
                                {payment.type === 'refund' && <span className="text-gray-600">↩</span>}
                              </div>
                              
                              <div>
                                <div className="font-medium text-slate-900">{payment.description}</div>
                                <div className="text-sm text-slate-500">
                                  {payment.timestamp.toLocaleDateString('da-DK')} • {payment.paymentMethod}
                                  {payment.metadata.cardLast4 && ` ****${payment.metadata.cardLast4}`}
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className={`font-medium ${
                                payment.type === 'deposit' ? 'text-green-600' :
                                payment.type === 'withdrawal' || payment.type === 'payout' ? 'text-red-600' :
                                'text-slate-900'
                              }`}>
                                {payment.type === 'deposit' ? '+' : payment.type === 'withdrawal' || payment.type === 'payout' ? '-' : ''}
                                {payment.amount.toLocaleString()} kr
                              </div>
                              <div className={`text-xs ${
                                payment.status === 'completed' ? 'text-green-600' :
                                payment.status === 'failed' ? 'text-red-600' :
                                payment.status === 'processing' ? 'text-yellow-600' :
                                'text-slate-500'
                              }`}>
                                {payment.status === 'completed' ? 'Fuldført' :
                                 payment.status === 'failed' ? 'Fejlet' :
                                 payment.status === 'processing' ? 'Behandles' :
                                 payment.status === 'pending' ? 'Afventer' :
                                 'Annulleret'}
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {paymentHistory.length === 0 && (
                          <div className="px-6 py-8 text-center text-slate-500">
                            Ingen transaktioner endnu
                          </div>
                        )}
                        
                        {paymentHistory.length > 20 && (
                          <div className="px-6 py-4 text-center">
                            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                              Vis alle {paymentHistory.length} transaktioner
                            </button>
                          </div>
                        )}
                      </div>
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
        
        <GrantTicketsModal
          isOpen={ticketModalOpen}
          user={user}
          onGrant={handleGrantTickets}
          onCancel={() => setTicketModalOpen(false)}
        />
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { userManagementService, AdminUser } from '@/lib/userManagementService'
import { adminTheme, getStatusClasses, getNumberDisplay } from '@/lib/admin-theme'

// Confirmation modal component
interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText: string
  cancelText: string
  onConfirm: () => void
  onCancel: () => void
  type?: 'danger' | 'warning' | 'info'
}

function ConfirmModal({ isOpen, title, message, confirmText, cancelText, onConfirm, onCancel, type = 'warning' }: ConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={adminTheme.card.default + ' p-6 max-w-md w-full mx-4'}>
        <h3 className={`text-lg font-semibold ${adminTheme.colors.text.primary} mb-4`}>{title}</h3>
        <div className={`p-4 rounded-md border mb-4 ${getStatusClasses(type)}`}>
          <p className="text-sm">{message}</p>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className={adminTheme.buttons.secondary}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={adminTheme.buttons.primary}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

// Block user modal
interface BlockModalProps {
  isOpen: boolean
  user: AdminUser | null
  onConfirm: (reason: string) => void
  onCancel: () => void
}

function BlockUserModal({ isOpen, user, onConfirm, onCancel }: BlockModalProps) {
  const [reason, setReason] = useState('')

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason.trim())
      setReason('')
    }
  }

  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={adminTheme.card.default + ' p-6 max-w-md w-full mx-4'}>
        <h3 className={`text-lg font-semibold ${adminTheme.colors.text.primary} mb-4`}>Bloker Bruger</h3>
        <div className={`p-4 rounded-md border mb-4 ${getStatusClasses('error')}`}>
          <p className="text-sm">
            Du er ved at blokere <strong>{user.firstName} {user.lastName}</strong> ({user.email})
          </p>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Grund til blokering (påkrævet)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            rows={3}
            placeholder="F.eks. Mistænkelig aktivitet, gentagne overtrædelser..."
          />
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => {
              setReason('')
              onCancel()
            }}
            className={adminTheme.buttons.secondary}
          >
            Annuller
          </button>
          <button
            onClick={handleConfirm}
            disabled={!reason.trim()}
            className={`${adminTheme.buttons.danger} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Bloker Bruger
          </button>
        </div>
      </div>
    </div>
  )
}

export default function UserManagement() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'verified' | 'unverified' | 'blocked' | 'high_risk'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'registered' | 'spent' | 'activity' | 'risk'>('registered')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; type: string; user: AdminUser | null }>({ isOpen: false, type: '', user: null })
  const [blockModal, setBlockModal] = useState<{ isOpen: boolean; user: AdminUser | null }>({ isOpen: false, user: null })
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [stats, setStats] = useState<any>(null)

  // Load users on mount
  useEffect(() => {
    const loadUsers = () => {
      const allUsers = userManagementService.getAllUsers()
      const userStats = userManagementService.getUserStats()
      setUsers(allUsers)
      setStats(userStats)
    }
    loadUsers()
  }, [])

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login?redirect=/admin/users')
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

  const filteredUsers = users.filter(user => {
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'active' && user.isActive && !user.isBlocked) ||
      (filter === 'inactive' && (!user.isActive || user.isBlocked)) ||
      (filter === 'verified' && user.isVerified) ||
      (filter === 'unverified' && !user.isVerified) ||
      (filter === 'blocked' && user.isBlocked) ||
      (filter === 'high_risk' && (user.riskScore || 0) > 70)
    
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone && user.phone.includes(searchTerm))
    
    return matchesFilter && matchesSearch
  }).sort((a, b) => {
    let aValue: any, bValue: any
    
    switch (sortBy) {
      case 'name':
        aValue = `${a.firstName} ${a.lastName}`
        bValue = `${b.firstName} ${b.lastName}`
        break
      case 'registered':
        aValue = a.registeredAt.getTime()
        bValue = b.registeredAt.getTime()
        break
      case 'spent':
        aValue = a.totalSpent
        bValue = b.totalSpent
        break
      case 'activity':
        aValue = a.lastActivity.getTime()
        bValue = b.lastActivity.getTime()
        break
      case 'risk':
        aValue = a.riskScore || 0
        bValue = b.riskScore || 0
        break
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const handleBlockUser = (user: AdminUser) => {
    setBlockModal({ isOpen: true, user })
  }

  const handleUnblockUser = (user: AdminUser) => {
    setConfirmModal({
      isOpen: true,
      type: 'unblock',
      user
    })
  }

  const confirmBlockUser = async (reason: string) => {
    if (blockModal.user) {
      const success = userManagementService.blockUser(
        blockModal.user.id,
        reason,
        user?.email || 'admin@drawdash.dk'
      )
      
      if (success) {
        // Refresh users
        const allUsers = userManagementService.getAllUsers()
        const userStats = userManagementService.getUserStats()
        setUsers(allUsers)
        setStats(userStats)
      }
    }
    setBlockModal({ isOpen: false, user: null })
  }

  const confirmAction = async () => {
    if (!confirmModal.user) return
    
    const userId = confirmModal.user.id
    let success = false
    
    switch (confirmModal.type) {
      case 'unblock':
        success = userManagementService.unblockUser(userId, user?.email || 'admin@drawdash.dk')
        break
    }
    
    if (success) {
      // Refresh users
      const allUsers = userManagementService.getAllUsers()
      const userStats = userManagementService.getUserStats()
      setUsers(allUsers)
      setStats(userStats)
    }
    
    setConfirmModal({ isOpen: false, type: '', user: null })
  }

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleBulkBlock = () => {
    if (selectedUsers.length === 0) return
    // Handle bulk block - simplified for demo
    console.log('Bulk blocking users:', selectedUsers)
    setSelectedUsers([])
  }

  const exportUsers = () => {
    const data = userManagementService.exportUserData(
      user?.email || 'admin@drawdash.dk',
      { blocked: false } // Only active users
    )
    
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `drawdash-users-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
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

  const getCRMSegmentBadge = (segment: string) => {
    const segments = {
      high_roller: { label: 'High Roller', class: 'bg-purple-100 text-purple-800' },
      regular: { label: 'Regulær', class: 'bg-blue-100 text-blue-800' },
      casual: { label: 'Casual', class: 'bg-green-100 text-green-800' },
      new: { label: 'Ny', class: 'bg-gray-100 text-gray-800' },
      at_risk: { label: 'Risiko', class: 'bg-orange-100 text-orange-800' },
      dormant: { label: 'Inaktiv', class: 'bg-red-100 text-red-800' }
    }
    
    const segmentInfo = segments[segment as keyof typeof segments] || { label: segment, class: 'bg-gray-100 text-gray-800' }
    return <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${segmentInfo.class}`}>{segmentInfo.label}</span>
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg border-r border-slate-200">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b border-slate-200 px-4">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-900 rounded-md flex items-center justify-center">
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
                <div className={adminTheme.nav.item}>
                  <svg className={adminTheme.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Dashboard
                </div>
              </Link>
              
              <Link href="/admin/users">
                <div className={adminTheme.nav.active}>
                  <svg className={adminTheme.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 5.197H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Brugere
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
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-slate-600">System Online</span>
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
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Brugerstyring</h1>
                <p className="text-slate-600">Administrer alle brugere og deres aktivitet</p>
              </div>
              <div className="flex gap-2 mt-4 sm:mt-0">
                {selectedUsers.length > 0 && (
                  <button
                    onClick={handleBulkBlock}
                    className={adminTheme.buttons.danger}
                  >
                    Bloker Valgte ({selectedUsers.length})
                  </button>
                )}
                <button
                  onClick={exportUsers}
                  className={adminTheme.buttons.primary}
                >
                  Eksporter Data
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className={adminTheme.card.default + ' p-6'}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${adminTheme.colors.text.secondary}`}>Samlede Brugere</p>
                    <p className={`text-2xl font-bold ${adminTheme.colors.text.primary}`}>{getNumberDisplay(stats?.total || 0)}</p>
                  </div>
                  <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center">
                    <svg className={adminTheme.iconLarge} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 5.197H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className={adminTheme.card.default + ' p-6'}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${adminTheme.colors.text.secondary}`}>Aktive Brugere</p>
                    <p className={`text-2xl font-bold ${adminTheme.colors.text.primary}`}>{getNumberDisplay(stats?.active || 0)}</p>
                    <p className={`text-xs ${adminTheme.colors.text.muted} mt-1`}>
                      {stats?.total ? Math.round((stats.active / stats.total) * 100) : 0}% af total
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center">
                    <svg className={adminTheme.iconLarge} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className={adminTheme.card.default + ' p-6'}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${adminTheme.colors.text.secondary}`}>Verificerede</p>
                    <p className={`text-2xl font-bold ${adminTheme.colors.text.primary}`}>{getNumberDisplay(stats?.verified || 0)}</p>
                    <p className={`text-xs ${adminTheme.colors.text.muted} mt-1`}>
                      {stats?.total ? Math.round((stats.verified / stats.total) * 100) : 0}% af total
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center">
                    <svg className={adminTheme.iconLarge} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className={adminTheme.card.default + ' p-6'}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${adminTheme.colors.text.secondary}`}>Total Omsætning</p>
                    <p className={`text-2xl font-bold ${adminTheme.colors.text.primary}`}>
                      {getNumberDisplay(stats?.totalRevenue || 0, 'currency')}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center">
                    <svg className={adminTheme.iconLarge} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className={adminTheme.card.default + ' p-6'}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${adminTheme.colors.text.secondary}`}>Blokerede</p>
                    <p className={`text-2xl font-bold ${adminTheme.colors.text.primary}`}>{getNumberDisplay(stats?.blocked || 0)}</p>
                    <p className={`text-xs ${adminTheme.colors.text.muted} mt-1`}>
                      {stats?.total ? Math.round((stats.blocked / stats.total) * 100) : 0}% af total
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center">
                    <svg className={adminTheme.iconLarge} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className={adminTheme.card.default + ' p-6'}>
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Status Filter */}
                <div className="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-lg">
                  {[
                    { key: 'all', label: 'Alle' },
                    { key: 'active', label: 'Aktive' },
                    { key: 'inactive', label: 'Inaktive' },
                    { key: 'verified', label: 'Verificerede' },
                    { key: 'unverified', label: 'Ikke Verificerede' },
                    { key: 'blocked', label: 'Blokerede' },
                    { key: 'high_risk', label: 'Høj Risiko' }
                  ].map((option) => (
                    <button
                      key={option.key}
                      onClick={() => setFilter(option.key as any)}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${
                        filter === option.key
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Søg brugere..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Sort */}
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="registered">Registrering</option>
                    <option value="name">Navn</option>
                    <option value="spent">Forbrug</option>
                    <option value="activity">Aktivitet</option>
                    <option value="risk">Risiko Score</option>
                  </select>
                  
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <svg className={`w-4 h-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className={adminTheme.card.default + ' overflow-hidden'}>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers(filteredUsers.map(u => u.id))
                            } else {
                              setSelectedUsers([])
                            }
                          }}
                          className="rounded border-slate-300"
                        />
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Bruger
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Status & Risiko
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Aktivitet
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Forbrug
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        CRM Segment
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Handlinger
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className={adminTheme.table.row + ` ${user.isBlocked ? 'bg-red-50' : ''} ${selectedUsers.includes(user.id) ? 'bg-blue-50' : ''}`}
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => toggleUserSelection(user.id)}
                            className="rounded border-slate-300"
                          />
                        </td>
                        
                        <td className={adminTheme.table.cell}>
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-md flex items-center justify-center mr-3 ${
                              user.isBlocked 
                                ? 'bg-red-200 text-red-700' 
                                : 'bg-slate-300 text-slate-600'
                            }`}>
                              <span className="text-xs font-medium">
                                {user.firstName[0]}{user.lastName[0]}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-slate-900">
                                {user.firstName} {user.lastName}
                                {user.fraudFlags > 0 && (
                                  <span className="ml-2 text-red-500" title={`${user.fraudFlags} fraud flags`}>
                                    ⚠️
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-slate-500">{user.email}</div>
                              {user.phone && (
                                <div className="text-xs text-slate-400">{user.phone}</div>
                              )}
                              {user.isBlocked && (
                                <div className="text-xs text-red-600 mt-1">
                                  Blokeret: {user.blockReason}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 space-y-1">
                          <div className="flex flex-col gap-1">
                            {user.isBlocked ? (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                Blokeret
                              </span>
                            ) : (
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.isActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {user.isActive ? 'Aktiv' : 'Inaktiv'}
                              </span>
                            )}
                            
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.isVerified
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}>
                              {user.isVerified ? 'Verificeret' : 'Ikke Verificeret'}
                            </span>
                            
                            {getRiskBadge(user.riskScore)}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 text-sm text-slate-600">
                          <div>Registreret: {user.registeredAt.toLocaleDateString('da-DK')}</div>
                          <div>Sidst aktiv: {user.lastActivity.toLocaleDateString('da-DK')}</div>
                          <div className="text-xs text-slate-500 mt-1">
                            {user.loyaltyTier.charAt(0).toUpperCase() + user.loyaltyTier.slice(1)} • {user.loyaltyPoints} point
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 text-sm">
                          <div className="font-semibold text-slate-900">
                            {user.totalSpent.toLocaleString()} kr
                          </div>
                          <div className="text-slate-500">
                            {user.totalTickets} billetter
                          </div>
                          <div className={`text-xs font-medium ${user.totalWinnings > 0 ? 'text-green-600' : 'text-slate-400'}`}>
                            Gevinst: {user.totalWinnings > 0 ? `${user.totalWinnings.toLocaleString()} kr` : 'Ingen'}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          {getCRMSegmentBadge(user.crmSegment)}
                        </td>
                        
                        <td className={adminTheme.table.cell}>
                          <div className="flex flex-col space-y-2">
                            <Link href={`/admin/users/${user.id}`}>
                              <button className={`w-full text-xs ${adminTheme.buttons.ghost}`}>
                                Vis Detaljer
                              </button>
                            </Link>
                            
                            <div className="flex space-x-1">
                              {user.isBlocked ? (
                                <button
                                  onClick={() => handleUnblockUser(user)}
                                  className={`flex-1 text-xs ${adminTheme.buttons.ghost}`}
                                >
                                  Fjern Blok
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleBlockUser(user)}
                                  className={`flex-1 text-xs ${adminTheme.buttons.danger}`}
                                >
                                  Bloker
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <div className="text-slate-400 text-lg mb-2">Ingen brugere fundet</div>
                <div className="text-slate-500">Prøv at justere dine filtre</div>
              </div>
            )}
          </div>
        </main>
        
        {/* Confirmation Modals */}
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.type === 'unblock' ? 'Fjern Blokering' : 'Bekræft Handling'}
          message={confirmModal.type === 'unblock' 
            ? `Er du sikker på at du vil fjerne blokeringen af ${confirmModal.user?.firstName} ${confirmModal.user?.lastName}?`
            : 'Er du sikker på at du vil udføre denne handling?'
          }
          confirmText={confirmModal.type === 'unblock' ? 'Fjern Blokering' : 'Bekræft'}
          cancelText="Annuller"
          onConfirm={confirmAction}
          onCancel={() => setConfirmModal({ isOpen: false, type: '', user: null })}
          type={confirmModal.type === 'unblock' ? 'info' : 'warning'}
        />
        
        <BlockUserModal
          isOpen={blockModal.isOpen}
          user={blockModal.user}
          onConfirm={confirmBlockUser}
          onCancel={() => setBlockModal({ isOpen: false, user: null })}
        />
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  registeredAt: Date
  isActive: boolean
  isVerified: boolean
  totalSpent: number
  totalTickets: number
  totalWinnings: number
  lastActivity: Date
}

// Mock user data
const mockUsers: User[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@email.dk',
    phone: '+45 12 34 56 78',
    registeredAt: new Date('2024-01-15'),
    isActive: true,
    isVerified: true,
    totalSpent: 2500,
    totalTickets: 125,
    totalWinnings: 500,
    lastActivity: new Date('2024-08-28')
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Nielsen',
    email: 'sarah.nielsen@email.dk',
    phone: '+45 87 65 43 21',
    registeredAt: new Date('2024-02-03'),
    isActive: true,
    isVerified: true,
    totalSpent: 1800,
    totalTickets: 90,
    totalWinnings: 1200,
    lastActivity: new Date('2024-08-29')
  },
  {
    id: '3',
    firstName: 'Mike',
    lastName: 'Hansen',
    email: 'mike.hansen@email.dk',
    registeredAt: new Date('2024-03-12'),
    isActive: false,
    isVerified: false,
    totalSpent: 200,
    totalTickets: 10,
    totalWinnings: 0,
    lastActivity: new Date('2024-07-15')
  },
  {
    id: '4',
    firstName: 'Emma',
    lastName: 'Larsen',
    email: 'emma.larsen@email.dk',
    phone: '+45 11 22 33 44',
    registeredAt: new Date('2024-04-20'),
    isActive: true,
    isVerified: true,
    totalSpent: 3200,
    totalTickets: 160,
    totalWinnings: 800,
    lastActivity: new Date('2024-08-29')
  },
  {
    id: '5',
    firstName: 'David',
    lastName: 'Andersen',
    email: 'david.andersen@email.dk',
    registeredAt: new Date('2024-05-08'),
    isActive: true,
    isVerified: false,
    totalSpent: 450,
    totalTickets: 23,
    totalWinnings: 0,
    lastActivity: new Date('2024-08-25')
  }
]

export default function UserManagement() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'verified' | 'unverified'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'registered' | 'spent' | 'activity'>('registered')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

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
      (filter === 'active' && user.isActive) ||
      (filter === 'inactive' && !user.isActive) ||
      (filter === 'verified' && user.isVerified) ||
      (filter === 'unverified' && !user.isVerified)
    
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
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
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const toggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, isActive: !user.isActive }
        : user
    ))
  }

  const toggleVerification = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, isVerified: !user.isVerified }
        : user
    ))
  }

  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    verified: users.filter(u => u.isVerified).length,
    totalRevenue: users.reduce((sum, u) => sum + u.totalSpent, 0)
  }

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
                <div className="text-slate-600 hover:bg-slate-50 hover:text-slate-900 px-3 py-2.5 text-sm font-medium rounded-xl flex items-center gap-3 transition-colors">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 0v1m-2 0V6a2 2 0 00-2 0v1m2 0V9.5m0 0v3m0-3h3m-3 0h-3m-2-5a9 9 0 1118 0 9 9 0 01-18 0z" />
                  </svg>
                  Lodtrækninger
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
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-600">Samlede Brugere</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 5.197H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-600">Aktive Brugere</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                <p className="text-xs text-green-600 mt-1">
                  {Math.round((stats.active / stats.total) * 100)}% af total
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
                <p className="text-sm font-medium text-slate-600">Verificerede</p>
                <p className="text-2xl font-bold text-purple-600">{stats.verified}</p>
                <p className="text-xs text-purple-600 mt-1">
                  {Math.round((stats.verified / stats.total) * 100)}% af total
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-600">Total Omsætning</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.totalRevenue.toLocaleString()} kr
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                { key: 'inactive', label: 'Inaktive' },
                { key: 'verified', label: 'Verificerede' },
                { key: 'unverified', label: 'Ikke Verificerede' }
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
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Bruger
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Aktivitet
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Forbrug
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Gevinster
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Handlinger
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredUsers.map((user) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white text-sm font-bold">
                            {user.firstName[0]}{user.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-slate-500">{user.email}</div>
                          {user.phone && (
                            <div className="text-xs text-slate-400">{user.phone}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Aktiv' : 'Inaktiv'}
                        </span>
                        
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isVerified
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {user.isVerified ? 'Verificeret' : 'Ikke Verificeret'}
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div>Registreret: {user.registeredAt.toLocaleDateString('da-DK')}</div>
                      <div>Sidst aktiv: {user.lastActivity.toLocaleDateString('da-DK')}</div>
                    </td>
                    
                    <td className="px-6 py-4 text-sm">
                      <div className="font-semibold text-slate-900">
                        {user.totalSpent.toLocaleString()} kr
                      </div>
                      <div className="text-slate-500">
                        {user.totalTickets} billetter
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-sm">
                      <div className={`font-semibold ${user.totalWinnings > 0 ? 'text-green-600' : 'text-slate-400'}`}>
                        {user.totalWinnings > 0 
                          ? `${user.totalWinnings.toLocaleString()} kr`
                          : 'Ingen gevinster'
                        }
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-2">
                        <Link href={`/admin/users/${user.id}`}>
                          <motion.button
                            className="w-full px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Vis Detaljer
                          </motion.button>
                        </Link>
                        
                        <div className="flex space-x-1">
                          <motion.button
                            onClick={() => toggleUserStatus(user.id)}
                            className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                              user.isActive
                                ? 'text-red-600 bg-red-50 hover:bg-red-100'
                                : 'text-green-600 bg-green-50 hover:bg-green-100'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {user.isActive ? 'Deaktiver' : 'Aktiver'}
                          </motion.button>
                          
                          <motion.button
                            onClick={() => toggleVerification(user.id)}
                            className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                              user.isVerified
                                ? 'text-orange-600 bg-orange-50 hover:bg-orange-100'
                                : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {user.isVerified ? 'Fjern Verif.' : 'Verificer'}
                          </motion.button>
                        </div>
                      </div>
                    </td>
                  </motion.tr>
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
      </div>
    </div>
  )
}
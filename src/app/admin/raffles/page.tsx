'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { raffleService } from '@/lib/raffleService'
import { Raffle } from '@/types/raffle'

export default function RaffleManagement() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [raffles, setRaffles] = useState<Raffle[]>([])
  const [selectedRaffles, setSelectedRaffles] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<Raffle['status'] | 'all'>('all')
  const [sortBy, setSortBy] = useState<'title' | 'endDate' | 'revenue' | 'soldTickets'>('endDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Load raffles
  useEffect(() => {
    loadRaffles()
  }, [])

  const loadRaffles = () => {
    const allRaffles = raffleService.getAllRaffles()
    setRaffles(allRaffles)
  }

  // Filter and sort raffles
  const filteredRaffles = () => {
    let filtered = raffles

    // Apply search
    if (searchQuery) {
      filtered = raffleService.searchRaffles(searchQuery)
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(raffle => raffle.status === filterStatus)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case 'endDate':
          aValue = new Date(a.endDate).getTime()
          bValue = new Date(b.endDate).getTime()
          break
        case 'revenue':
          aValue = a.soldTickets * a.ticketPrice
          bValue = b.soldTickets * b.ticketPrice
          break
        case 'soldTickets':
          aValue = a.soldTickets
          bValue = b.soldTickets
          break
        default:
          return 0
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return filtered
  }

  const handleSelectAll = () => {
    const filtered = filteredRaffles()
    if (selectedRaffles.length === filtered.length) {
      setSelectedRaffles([])
    } else {
      setSelectedRaffles(filtered.map(raffle => raffle.id))
    }
  }

  const handleSelectRaffle = (raffleId: string) => {
    if (selectedRaffles.includes(raffleId)) {
      setSelectedRaffles(selectedRaffles.filter(id => id !== raffleId))
    } else {
      setSelectedRaffles([...selectedRaffles, raffleId])
    }
  }

  const handleBulkStatusChange = (newStatus: Raffle['status']) => {
    raffleService.bulkUpdateStatus(selectedRaffles, newStatus)
    loadRaffles()
    setSelectedRaffles([])
  }

  const handleBulkDelete = () => {
    if (confirm(`Er du sikker på at du vil slette ${selectedRaffles.length} lodtrækninger?`)) {
      raffleService.bulkDelete(selectedRaffles)
      loadRaffles()
      setSelectedRaffles([])
    }
  }

  const handleDeleteRaffle = (raffleId: string) => {
    const raffle = raffles.find(r => r.id === raffleId)
    if (confirm(`Er du sikker på at du vil slette "${raffle?.title}"?`)) {
      raffleService.deleteRaffle(raffleId)
      loadRaffles()
    }
  }

  const getStatusColor = (status: Raffle['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'ended': return 'bg-gray-100 text-gray-800'
      case 'upcoming': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: Raffle['status']) => {
    switch (status) {
      case 'active': return 'Aktiv'
      case 'ended': return 'Afsluttet'
      case 'upcoming': return 'Kommende'
      default: return status
    }
  }

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login?redirect=/admin/raffles')
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

  const filtered = filteredRaffles()

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
                <h1 className="text-2xl font-bold text-slate-900">Lodtrækningsstyring</h1>
                <p className="text-slate-600">Administrer alle lodtrækninger og konkurencer</p>
              </div>
              
              <Link href="/admin/raffles/create">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-4 sm:mt-0 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  ✨ Opret Ny Lodtrækning
                </motion.button>
              </Link>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Søg efter lodtrækninger..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Alle Status</option>
                  <option value="active">Aktive</option>
                  <option value="upcoming">Kommende</option>
                  <option value="ended">Afsluttede</option>
                </select>
                
                {/* Sort */}
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [by, order] = e.target.value.split('-')
                    setSortBy(by as any)
                    setSortOrder(order as any)
                  }}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="endDate-desc">Udløbsdato (Nyeste)</option>
                  <option value="endDate-asc">Udløbsdato (Ældste)</option>
                  <option value="title-asc">Titel (A-Z)</option>
                  <option value="title-desc">Titel (Z-A)</option>
                  <option value="revenue-desc">Omsætning (Højest)</option>
                  <option value="revenue-asc">Omsætning (Lavest)</option>
                  <option value="soldTickets-desc">Solgte Billetter (Flest)</option>
                  <option value="soldTickets-asc">Solgte Billetter (Færrest)</option>
                </select>
              </div>

              {/* Bulk Actions */}
              {selectedRaffles.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedRaffles.length} valgte:
                  </span>
                  <button
                    onClick={() => handleBulkStatusChange('active')}
                    className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
                  >
                    Sæt til Aktiv
                  </button>
                  <button
                    onClick={() => handleBulkStatusChange('ended')}
                    className="px-3 py-1 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600"
                  >
                    Afslut
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                  >
                    Slet Alle
                  </button>
                </div>
              )}
            </div>

            {/* Raffles Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="w-12 px-6 py-4">
                        <input
                          type="checkbox"
                          checked={filtered.length > 0 && selectedRaffles.length === filtered.length}
                          onChange={handleSelectAll}
                          className="rounded border-slate-300"
                        />
                      </th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Lodtrækning</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Status</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Billetter</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Omsætning</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Udløber</th>
                      <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700">Handlinger</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filtered.map((raffle, index) => (
                      <motion.tr
                        key={raffle.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedRaffles.includes(raffle.id)}
                            onChange={() => handleSelectRaffle(raffle.id)}
                            className="rounded border-slate-300"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={raffle.image}
                              alt={raffle.title}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div>
                              <div className="font-semibold text-slate-900">{raffle.title}</div>
                              <div className="text-sm text-slate-500">{raffle.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(raffle.status)}`}>
                            {getStatusText(raffle.status)}
                          </span>
                          {raffle.isInstantWin && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              ⚡ Instant
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="font-semibold">{raffle.soldTickets}/{raffle.totalTickets}</div>
                            <div className="text-slate-500">
                              {Math.round((raffle.soldTickets / raffle.totalTickets) * 100)}% solgt
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-green-600">
                            {(raffle.soldTickets * raffle.ticketPrice).toLocaleString('da-DK')} kr
                          </div>
                          <div className="text-sm text-slate-500">
                            {raffle.ticketPrice} kr/billet
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div>{new Date(raffle.endDate).toLocaleDateString('da-DK')}</div>
                          <div className="text-slate-500">
                            {new Date(raffle.endDate).toLocaleTimeString('da-DK', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <Link href={`/admin/raffles/${raffle.id}`}>
                              <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                            </Link>
                            <Link href={`/admin/raffles/${raffle.id}/edit`}>
                              <button className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                            </Link>
                            <button
                              onClick={() => handleDeleteRaffle(raffle.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filtered.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Ingen lodtrækninger fundet</h3>
                  <p className="text-slate-600 mb-4">
                    {searchQuery || filterStatus !== 'all' 
                      ? 'Prøv at justere dine søgekriterier'
                      : 'Opret din første lodtrækning for at komme i gang'
                    }
                  </p>
                  {!searchQuery && filterStatus === 'all' && (
                    <Link href="/admin/raffles/create">
                      <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold">
                        Opret Ny Lodtrækning
                      </button>
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Summary Stats */}
            {filtered.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                  <div className="text-2xl font-bold text-slate-900">{filtered.length}</div>
                  <div className="text-sm text-slate-600">Total Lodtrækninger</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                  <div className="text-2xl font-bold text-green-600">
                    {filtered.reduce((sum, r) => sum + (r.soldTickets * r.ticketPrice), 0).toLocaleString('da-DK')} kr
                  </div>
                  <div className="text-sm text-slate-600">Total Omsætning</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                  <div className="text-2xl font-bold text-blue-600">
                    {filtered.reduce((sum, r) => sum + r.soldTickets, 0).toLocaleString('da-DK')}
                  </div>
                  <div className="text-sm text-slate-600">Solgte Billetter</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                  <div className="text-2xl font-bold text-purple-600">
                    {filtered.filter(r => r.status === 'active').length}
                  </div>
                  <div className="text-sm text-slate-600">Aktive Lodtrækninger</div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
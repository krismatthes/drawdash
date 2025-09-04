'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { financeService, Payout } from '@/lib/financeService'

export default function PayoutCenter() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [filteredPayouts, setFilteredPayouts] = useState<Payout[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedPayouts, setSelectedPayouts] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null)

  const payoutsPerPage = 20

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login?redirect=/admin/finance/payouts')
        return
      }
      if (!user?.isAdmin) {
        router.push('/')
        return
      }
    }
  }, [isLoading, isAuthenticated, user?.isAdmin, router])

  useEffect(() => {
    loadPayouts()
  }, [])

  useEffect(() => {
    filterPayouts()
  }, [payouts, searchQuery, selectedStatus])

  const loadPayouts = () => {
    setLoading(true)
    const allPayouts = financeService.getAllPayouts()
    setPayouts(allPayouts)
    setLoading(false)
  }

  const filterPayouts = () => {
    let filtered = payouts

    if (searchQuery) {
      filtered = financeService.searchPayouts(searchQuery)
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(payout => payout.status === selectedStatus)
    }

    setFilteredPayouts(filtered)
    setCurrentPage(1)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency: 'DKK',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'pending_verification': return 'text-blue-600 bg-blue-100'
      case 'pending_payout': return 'text-yellow-600 bg-yellow-100'
      case 'processing': return 'text-purple-600 bg-purple-100'
      case 'failed': return 'text-red-600 bg-red-100'
      case 'cancelled': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getVerificationProgress = (payout: Payout) => {
    const verification = payout.verificationStatus
    const checks = [
      verification.identityVerified,
      verification.addressVerified,
      verification.paymentMethodVerified,
      verification.kycCompleted,
      payout.amount <= 20000 || verification.taxFormSubmitted
    ]
    const completed = checks.filter(Boolean).length
    return { completed, total: checks.length, percentage: (completed / checks.length) * 100 }
  }

  const handleBulkApproval = async () => {
    if (selectedPayouts.size === 0) return

    const result = financeService.bulkApprovePayout(
      Array.from(selectedPayouts),
      user?.email || 'admin'
    )

    if (result.successful > 0) {
      loadPayouts()
      setSelectedPayouts(new Set())
      alert(`${result.successful} udbetalinger godkendt. ${result.failed.length} fejlede.`)
    }
  }

  const handleApproval = (payoutId: string) => {
    try {
      const success = financeService.approvePayout(payoutId, user?.email || 'admin')
      if (success) {
        loadPayouts()
        alert('Udbetaling godkendt og sat til afventende udbetaling')
      }
    } catch (error) {
      alert(`Fejl: ${(error as Error).message}`)
    }
  }

  const togglePayoutSelection = (id: string) => {
    const newSelection = new Set(selectedPayouts)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setSelectedPayouts(newSelection)
  }

  const getCurrentPagePayouts = () => {
    const startIndex = (currentPage - 1) * payoutsPerPage
    const endIndex = startIndex + payoutsPerPage
    return filteredPayouts.slice(startIndex, endIndex)
  }

  const totalPages = Math.ceil(filteredPayouts.length / payoutsPerPage)

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
              
              <Link href="/admin/finance">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200 px-3 py-2.5 text-sm font-medium rounded-xl flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Finans
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
                <h1 className="text-2xl font-bold text-slate-900">Udbetalingscenter</h1>
                <p className="text-slate-600">Verificer og administrer alle udbetalinger</p>
              </div>
              <div className="mt-4 sm:mt-0 flex gap-3">
                <Link
                  href="/admin/finance"
                  className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                >
                  ← Tilbage til oversigt
                </Link>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Afventende Verifikation</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {payouts.filter(p => p.status === 'pending_verification').length}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Klar til Udbetaling</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {payouts.filter(p => p.status === 'pending_payout').length}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Under Behandling</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {payouts.filter(p => p.status === 'processing').length}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Gennemført</p>
                    <p className="text-2xl font-bold text-green-600">
                      {payouts.filter(p => p.status === 'completed').length}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Søg</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Søg i ID, bruger, raffle..."
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <svg className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Alle statusser</option>
                    <option value="pending_verification">Afventende verifikation</option>
                    <option value="pending_payout">Klar til udbetaling</option>
                    <option value="processing">Under behandling</option>
                    <option value="completed">Gennemført</option>
                    <option value="failed">Fejlet</option>
                    <option value="cancelled">Annulleret</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">&nbsp;</label>
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedStatus('all')
                    }}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                  >
                    Ryd filtre
                  </button>
                </div>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedPayouts.size > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-50 border border-blue-200 rounded-xl p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-blue-700">
                      {selectedPayouts.size} udbetalinger valgt
                    </span>
                    <button
                      onClick={() => setSelectedPayouts(new Set())}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Ryd markering
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleBulkApproval}
                      className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      Godkend valgte
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Payout Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Udbetalinger ({filteredPayouts.length})
                  </h3>
                  <button
                    onClick={() => financeService.exportToCSV(filteredPayouts, 'payouts')}
                    className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
                  >
                    Eksportér CSV
                  </button>
                </div>
              </div>
              
              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-slate-600">Indlæser udbetalinger...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={getCurrentPagePayouts().length > 0 && getCurrentPagePayouts().every(payout => selectedPayouts.has(payout.id))}
                            onChange={(e) => {
                              if (e.target.checked) {
                                const newSelection = new Set(selectedPayouts)
                                getCurrentPagePayouts().forEach(payout => newSelection.add(payout.id))
                                setSelectedPayouts(newSelection)
                              } else {
                                const newSelection = new Set(selectedPayouts)
                                getCurrentPagePayouts().forEach(payout => newSelection.delete(payout.id))
                                setSelectedPayouts(newSelection)
                              }
                            }}
                            className="rounded border-slate-300"
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Udbetaling
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Beløb
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Verifikation
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Anmodet
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Handlinger
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {getCurrentPagePayouts().map((payout) => {
                        const verification = getVerificationProgress(payout)
                        return (
                          <tr 
                            key={payout.id} 
                            className={`hover:bg-slate-50 ${selectedPayouts.has(payout.id) ? 'bg-blue-50' : ''}`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={selectedPayouts.has(payout.id)}
                                onChange={() => togglePayoutSelection(payout.id)}
                                className="rounded border-slate-300"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-slate-900">
                                  Raffle #{payout.raffleId}
                                </div>
                                <div className="text-sm text-slate-500">
                                  Bruger: {payout.userId}
                                </div>
                                <div className="text-xs text-slate-400">
                                  Ticket #{payout.winningTicketNumber}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-slate-900">
                                {formatCurrency(payout.amount)}
                              </div>
                              {payout.taxInfo.withholdingRequired && (
                                <div className="text-xs text-orange-600">
                                  Skat: {formatCurrency(payout.taxInfo.withholdingAmount || 0)}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payout.status)}`}>
                                {payout.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-slate-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full transition-all ${
                                      verification.percentage === 100 ? 'bg-green-500' : 'bg-blue-500'
                                    }`}
                                    style={{ width: `${verification.percentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-slate-600">
                                  {verification.completed}/{verification.total}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                              {payout.requestedAt.toLocaleDateString('da-DK')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex gap-1">
                                <button
                                  onClick={() => setSelectedPayout(payout)}
                                  className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                  title="Se detaljer"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                </button>
                                {payout.status === 'pending_verification' && verification.percentage === 100 && (
                                  <button
                                    onClick={() => handleApproval(payout.id)}
                                    className="p-1 text-green-600 hover:bg-green-100 rounded"
                                    title="Godkend"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </button>
                                )}
                                {['pending_verification', 'pending_payout'].includes(payout.status) && (
                                  <button
                                    onClick={() => {
                                      financeService.updatePayout(payout.id, { 
                                        status: 'cancelled',
                                        processedBy: user?.email || 'admin'
                                      })
                                      loadPayouts()
                                    }}
                                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                                    title="Annullér"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>

                  {getCurrentPagePayouts().length === 0 && (
                    <div className="p-12 text-center">
                      <div className="text-slate-400 mb-2">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <p className="text-slate-600">Ingen udbetalinger fundet</p>
                      <p className="text-slate-500 text-sm mt-1">Prøv at justere dine filtre</p>
                    </div>
                  )}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-600">
                      Viser {((currentPage - 1) * payoutsPerPage) + 1} til {Math.min(currentPage * payoutsPerPage, filteredPayouts.length)} af {filteredPayouts.length} udbetalinger
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Forrige
                      </button>
                      <span className="px-3 py-1.5 text-sm font-medium text-slate-700">
                        Side {currentPage} af {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Næste
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Payout Detail Modal */}
      {selectedPayout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Udbetalingsdetaljer</h3>
                <button
                  onClick={() => setSelectedPayout(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h4 className="font-medium text-slate-900 mb-3">Grundlæggende Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">ID:</span>
                    <div className="font-mono text-slate-900">{selectedPayout.id}</div>
                  </div>
                  <div>
                    <span className="text-slate-600">Beløb:</span>
                    <div className="font-bold text-slate-900">{formatCurrency(selectedPayout.amount)}</div>
                  </div>
                  <div>
                    <span className="text-slate-600">Bruger:</span>
                    <div className="text-slate-900">{selectedPayout.userId}</div>
                  </div>
                  <div>
                    <span className="text-slate-600">Raffle:</span>
                    <div className="text-slate-900">{selectedPayout.raffleId}</div>
                  </div>
                  <div>
                    <span className="text-slate-600">Vindende billet:</span>
                    <div className="text-slate-900">#{selectedPayout.winningTicketNumber}</div>
                  </div>
                  <div>
                    <span className="text-slate-600">Status:</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedPayout.status)}`}>
                      {selectedPayout.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Verification Status */}
              <div>
                <h4 className="font-medium text-slate-900 mb-3">Verifikationsstatus</h4>
                <div className="space-y-2">
                  {Object.entries({
                    'Identitet verificeret': selectedPayout.verificationStatus.identityVerified,
                    'Adresse verificeret': selectedPayout.verificationStatus.addressVerified,
                    'Betalingsmetode verificeret': selectedPayout.verificationStatus.paymentMethodVerified,
                    'KYC gennemført': selectedPayout.verificationStatus.kycCompleted,
                    'Skatteformular indsendt': selectedPayout.amount <= 20000 || selectedPayout.verificationStatus.taxFormSubmitted
                  }).map(([label, verified]) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">{label}</span>
                      <div className={`flex items-center gap-1 ${verified ? 'text-green-600' : 'text-red-600'}`}>
                        {verified ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                        <span className="text-sm font-medium">{verified ? 'Ja' : 'Nej'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Details */}
              <div>
                <h4 className="font-medium text-slate-900 mb-3">Betalingsdetaljer</h4>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600">Metode:</span>
                      <div className="text-slate-900 capitalize">{selectedPayout.paymentDetails.method.replace('_', ' ')}</div>
                    </div>
                    <div>
                      <span className="text-slate-600">Kontooplysninger:</span>
                      <div className="font-mono text-slate-900">{selectedPayout.paymentDetails.accountDetails}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tax Information */}
              {selectedPayout.taxInfo.withholdingRequired && (
                <div>
                  <h4 className="font-medium text-slate-900 mb-3">Skatteoplysninger</h4>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-600">Skattetræk påkrævet:</span>
                        <div className="text-slate-900">Ja</div>
                      </div>
                      <div>
                        <span className="text-slate-600">Skattebeløb:</span>
                        <div className="font-bold text-orange-600">
                          {formatCurrency(selectedPayout.taxInfo.withholdingAmount || 0)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div>
                <h4 className="font-medium text-slate-900 mb-3">Tidslinje</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div className="text-sm">
                      <span className="font-medium">Anmodet:</span> {selectedPayout.requestedAt.toLocaleString('da-DK')}
                    </div>
                  </div>
                  {selectedPayout.processedAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="text-sm">
                        <span className="font-medium">Behandlet:</span> {selectedPayout.processedAt.toLocaleString('da-DK')}
                        {selectedPayout.processedBy && <span className="text-slate-600"> af {selectedPayout.processedBy}</span>}
                      </div>
                    </div>
                  )}
                  {selectedPayout.completedAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div className="text-sm">
                        <span className="font-medium">Gennemført:</span> {selectedPayout.completedAt.toLocaleString('da-DK')}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {selectedPayout.status === 'pending_verification' && getVerificationProgress(selectedPayout).percentage === 100 && (
                  <button
                    onClick={() => {
                      handleApproval(selectedPayout.id)
                      setSelectedPayout(null)
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    Godkend Udbetaling
                  </button>
                )}
                <button
                  onClick={() => setSelectedPayout(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                >
                  Luk
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
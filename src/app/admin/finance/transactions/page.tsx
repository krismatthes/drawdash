'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { financeService, Transaction } from '@/lib/financeService'

export default function TransactionManagement() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const transactionsPerPage = 25

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login?redirect=/admin/finance/transactions')
        return
      }
      if (!user?.isAdmin) {
        router.push('/')
        return
      }
    }
  }, [isLoading, isAuthenticated, user?.isAdmin, router])

  useEffect(() => {
    loadTransactions()
  }, [])

  useEffect(() => {
    filterTransactions()
  }, [transactions, searchQuery, selectedType, selectedStatus])

  const loadTransactions = () => {
    setLoading(true)
    const allTransactions = financeService.getAllTransactions()
    setTransactions(allTransactions)
    setLoading(false)
  }

  const filterTransactions = () => {
    let filtered = transactions

    if (searchQuery) {
      filtered = financeService.searchTransactions(searchQuery)
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(txn => txn.type === selectedType)
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(txn => txn.status === selectedStatus)
    }

    setFilteredTransactions(filtered)
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
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'failed': return 'text-red-600 bg-red-100'
      case 'cancelled': return 'text-gray-600 bg-gray-100'
      case 'refunded': return 'text-purple-600 bg-purple-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'TICKET_PURCHASE': return '🎫'
      case 'BONUS_REDEMPTION': return '🎁'
      case 'PAYOUT': return '💸'
      case 'REFUND': return '🔄'
      case 'ADJUSTMENT': return '⚖️'
      case 'FEE': return '🏦'
      case 'INSTANT_WIN': return '⚡'
      default: return '💳'
    }
  }

  const handleBulkStatusUpdate = async (status: Transaction['status']) => {
    if (selectedTransactions.size === 0) return

    const count = financeService.bulkUpdateTransactionStatus(
      Array.from(selectedTransactions), 
      status, 
      user?.email || 'admin'
    )

    if (count > 0) {
      loadTransactions()
      setSelectedTransactions(new Set())
      alert(`${count} transaktioner opdateret til ${status}`)
    }
  }

  const toggleTransactionSelection = (id: string) => {
    const newSelection = new Set(selectedTransactions)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setSelectedTransactions(newSelection)
  }

  const selectAllVisible = () => {
    const visibleIds = getCurrentPageTransactions().map(txn => txn.id)
    setSelectedTransactions(new Set(visibleIds))
  }

  const clearSelection = () => {
    setSelectedTransactions(new Set())
  }

  const getCurrentPageTransactions = () => {
    const startIndex = (currentPage - 1) * transactionsPerPage
    const endIndex = startIndex + transactionsPerPage
    return filteredTransactions.slice(startIndex, endIndex)
  }

  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage)

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
                <h1 className="text-2xl font-bold text-slate-900">Transaktionsstyring</h1>
                <p className="text-slate-600">Administrer og overvåg alle transaktioner</p>
              </div>
              <div className="mt-4 sm:mt-0">
                <Link
                  href="/admin/finance"
                  className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                >
                  ← Tilbage til oversigt
                </Link>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Søg</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Søg i beskrivelse, ID, bruger..."
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <svg className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                {/* Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Alle typer</option>
                    <option value="TICKET_PURCHASE">Billetkøb</option>
                    <option value="BONUS_REDEMPTION">Bonus indløsning</option>
                    <option value="PAYOUT">Udbetaling</option>
                    <option value="REFUND">Refund</option>
                    <option value="FEE">Gebyr</option>
                    <option value="INSTANT_WIN">Instant Win</option>
                    <option value="ADJUSTMENT">Justering</option>
                  </select>
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
                    <option value="pending">Afventende</option>
                    <option value="completed">Gennemført</option>
                    <option value="failed">Fejlet</option>
                    <option value="cancelled">Annulleret</option>
                    <option value="refunded">Refunderet</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">&nbsp;</label>
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedType('all')
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
            {selectedTransactions.size > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-50 border border-blue-200 rounded-xl p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-blue-700">
                      {selectedTransactions.size} transaktioner valgt
                    </span>
                    <button
                      onClick={clearSelection}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Ryd markering
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBulkStatusUpdate('completed')}
                      className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      Marker som gennemført
                    </button>
                    <button
                      onClick={() => handleBulkStatusUpdate('failed')}
                      className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                    >
                      Marker som fejlet
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Transaction Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Transaktioner ({filteredTransactions.length})
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={selectAllVisible}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Vælg alle synlige
                    </button>
                    <button
                      onClick={() => financeService.exportToCSV(filteredTransactions, 'transactions')}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
                    >
                      Eksportér CSV
                    </button>
                  </div>
                </div>
              </div>
              
              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-slate-600">Indlæser transaktioner...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={getCurrentPageTransactions().length > 0 && getCurrentPageTransactions().every(txn => selectedTransactions.has(txn.id))}
                            onChange={(e) => {
                              if (e.target.checked) {
                                selectAllVisible()
                              } else {
                                clearSelection()
                              }
                            }}
                            className="rounded border-slate-300"
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Transaktion
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Beløb
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Bruger
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Dato
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Handlinger
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {getCurrentPageTransactions().map((transaction) => (
                        <tr 
                          key={transaction.id} 
                          className={`hover:bg-slate-50 ${selectedTransactions.has(transaction.id) ? 'bg-blue-50' : ''}`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedTransactions.has(transaction.id)}
                              onChange={() => toggleTransactionSelection(transaction.id)}
                              className="rounded border-slate-300"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{getTypeIcon(transaction.type)}</span>
                              <span className="text-xs text-slate-500">{transaction.type}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-slate-900">
                                {transaction.description}
                              </div>
                              <div className="text-sm text-slate-500">{transaction.id}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-slate-900">
                              {formatCurrency(transaction.amount)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                              {transaction.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            {transaction.userId || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            {transaction.createdAt.toLocaleDateString('da-DK')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex gap-1">
                              {transaction.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => {
                                      financeService.updateTransaction(transaction.id, { status: 'completed' })
                                      loadTransactions()
                                    }}
                                    className="p-1 text-green-600 hover:bg-green-100 rounded"
                                    title="Godkend"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => {
                                      financeService.updateTransaction(transaction.id, { status: 'failed' })
                                      loadTransactions()
                                    }}
                                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                                    title="Afvis"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </>
                              )}
                              {transaction.status === 'completed' && transaction.type === 'TICKET_PURCHASE' && (
                                <button
                                  onClick={() => {
                                    const refundTransaction = {
                                      type: 'REFUND' as const,
                                      amount: transaction.amount,
                                      currency: transaction.currency,
                                      status: 'completed' as const,
                                      userId: transaction.userId,
                                      raffleId: transaction.raffleId,
                                      description: `Refund for ${transaction.description}`,
                                      metadata: {
                                        refundReason: 'Admin initiated refund',
                                        adminUser: user?.email || 'admin',
                                        originalTransactionId: transaction.id
                                      }
                                    }
                                    financeService.createTransaction(refundTransaction)
                                    loadTransactions()
                                  }}
                                  className="p-1 text-orange-600 hover:bg-orange-100 rounded"
                                  title="Refunder"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {getCurrentPageTransactions().length === 0 && (
                    <div className="p-12 text-center">
                      <div className="text-slate-400 mb-2">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <p className="text-slate-600">Ingen transaktioner fundet</p>
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
                      Viser {((currentPage - 1) * transactionsPerPage) + 1} til {Math.min(currentPage * transactionsPerPage, filteredTransactions.length)} af {filteredTransactions.length} transaktioner
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

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Omsætning</p>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(
                        filteredTransactions
                          .filter(txn => txn.status === 'completed' && ['TICKET_PURCHASE', 'BONUS_REDEMPTION'].includes(txn.type))
                          .reduce((sum, txn) => sum + txn.amount, 0)
                      )}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Gennemsnitlig Værdi</p>
                    <p className="text-xl font-bold text-blue-600">
                      {formatCurrency(
                        filteredTransactions.length > 0 
                          ? filteredTransactions.reduce((sum, txn) => sum + txn.amount, 0) / filteredTransactions.length
                          : 0
                      )}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Afventende</p>
                    <p className="text-xl font-bold text-orange-600">
                      {filteredTransactions.filter(txn => txn.status === 'pending').length}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
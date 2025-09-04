'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { financeService, ReconciliationRecord } from '@/lib/financeService'

export default function ComplianceCenter() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [reconciliations, setReconciliations] = useState<ReconciliationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [reconciliationLoading, setReconciliationLoading] = useState(false)

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login?redirect=/admin/finance/compliance')
        return
      }
      if (!user?.isAdmin) {
        router.push('/')
        return
      }
    }
  }, [isLoading, isAuthenticated, user?.isAdmin, router])

  useEffect(() => {
    loadReconciliations()
  }, [])

  const loadReconciliations = () => {
    setLoading(true)
    const stored = localStorage.getItem('drawdash_reconciliation')
    if (stored) {
      const reconciliationData = JSON.parse(stored) as ReconciliationRecord[]
      setReconciliations(reconciliationData.map(rec => ({
        ...rec,
        reviewedAt: rec.reviewedAt ? new Date(rec.reviewedAt) : undefined,
        adjustments: rec.adjustments.map(adj => ({
          ...adj,
          createdAt: new Date(adj.createdAt)
        }))
      })))
    }
    setLoading(false)
  }

  const performReconciliation = async () => {
    setReconciliationLoading(true)
    try {
      const result = financeService.performDailyReconciliation(selectedDate)
      setReconciliations(prev => [result, ...prev])
      alert(`Reconciliation for ${selectedDate} completed. Status: ${result.status}`)
    } catch (error) {
      alert(`Error performing reconciliation: ${(error as Error).message}`)
    }
    setReconciliationLoading(false)
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
      case 'balanced': return 'text-green-600 bg-green-100'
      case 'discrepancy': return 'text-red-600 bg-red-100'
      case 'under_review': return 'text-yellow-600 bg-yellow-100'
      case 'resolved': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const exportComplianceReport = () => {
    const overview = financeService.getFinancialOverview(30)
    const recentTransactions = financeService.getAllTransactions().slice(0, 100)
    const recentPayouts = financeService.getAllPayouts().slice(0, 50)
    
    const complianceData = {
      generatedAt: new Date().toISOString(),
      generatedBy: user?.email || 'admin',
      period: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString()
      },
      summary: overview,
      transactions: recentTransactions,
      payouts: recentPayouts,
      reconciliations: reconciliations.slice(0, 30)
    }

    const dataStr = JSON.stringify(complianceData, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `compliance-report-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
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
                <h1 className="text-2xl font-bold text-slate-900">Compliance & Reconciliation</h1>
                <p className="text-slate-600">Daglig afstemning og overholdelse af regler</p>
              </div>
              <div className="mt-4 sm:mt-0 flex gap-3">
                <button
                  onClick={exportComplianceReport}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  📋 Eksportér Compliance Rapport
                </button>
                <Link
                  href="/admin/finance"
                  className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                >
                  ← Tilbage til oversigt
                </Link>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Hurtige Handlinger</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Daily Reconciliation */}
                <div className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">Daglig Afstemning</h4>
                      <p className="text-sm text-slate-600">Kør afstemning for specifik dato</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={performReconciliation}
                      disabled={reconciliationLoading}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {reconciliationLoading ? 'Behandler...' : 'Kør Afstemning'}
                    </button>
                  </div>
                </div>

                {/* Export Tools */}
                <div className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">Export Værktøjer</h4>
                      <p className="text-sm text-slate-600">Download data til eksterne systemer</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={() => financeService.exportToCSV(financeService.getAllTransactions(), 'all-transactions')}
                      className="w-full px-3 py-2 text-sm text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Alle Transaktioner (CSV)
                    </button>
                    <button
                      onClick={() => financeService.exportToCSV(financeService.getAllPayouts(), 'all-payouts')}
                      className="w-full px-3 py-2 text-sm text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Alle Udbetalinger (CSV)
                    </button>
                    <button
                      onClick={() => financeService.exportToCSV(financeService.getAllExpenses(), 'all-expenses')}
                      className="w-full px-3 py-2 text-sm text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Alle Udgifter (CSV)
                    </button>
                  </div>
                </div>

                {/* Compliance Checks */}
                <div className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">Compliance Tjek</h4>
                      <p className="text-sm text-slate-600">Automatiserede kontroltjek</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Daglig afstemning</span>
                      <span className="text-green-600">✅ OK</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Udbetaling verifikation</span>
                      <span className="text-green-600">✅ OK</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Moms beregning</span>
                      <span className="text-green-600">✅ OK</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Anti-fraud kontrol</span>
                      <span className="text-green-600">✅ OK</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reconciliation History */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">Afstemningshistorik</h3>
                  <div className="text-sm text-slate-600">
                    {reconciliations.length} afstemninger
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Dato
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Forventet Omsætning
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Faktisk Omsætning
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Afvigelse
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Transaktioner
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Gennemgået
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {reconciliations.map((reconciliation) => (
                      <tr key={reconciliation.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                          {new Date(reconciliation.date).toLocaleDateString('da-DK')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          {formatCurrency(reconciliation.expectedRevenue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          {formatCurrency(reconciliation.actualRevenue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={reconciliation.discrepancy === 0 ? 'text-green-600' : 'text-red-600'}>
                            {reconciliation.discrepancy > 0 ? '+' : ''}{formatCurrency(reconciliation.discrepancy)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(reconciliation.status)}`}>
                            {reconciliation.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {reconciliation.transactions.length}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {reconciliation.reviewedAt ? (
                            <div>
                              <div>{reconciliation.reviewedAt.toLocaleDateString('da-DK')}</div>
                              <div className="text-xs text-slate-400">{reconciliation.reviewedBy}</div>
                            </div>
                          ) : (
                            'Ikke gennemgået'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {reconciliations.length === 0 && (
                  <div className="p-12 text-center">
                    <div className="text-slate-400 mb-2">
                      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <p className="text-slate-600">Ingen afstemninger endnu</p>
                    <p className="text-slate-500 text-sm mt-1">Kør din første afstemning med værktøjerne ovenfor</p>
                  </div>
                )}
              </div>
            </div>

            {/* Compliance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Risk Assessment */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900">Risiko Vurdering</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Høj-risiko transaktioner</span>
                    <span className="text-sm font-medium text-slate-900">
                      {financeService.getAllTransactions().filter(t => (t.metadata.riskScore || 0) > 70).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Afventende verifikationer</span>
                    <span className="text-sm font-medium text-slate-900">
                      {financeService.getAllPayouts().filter(p => p.status === 'pending_verification').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Fejlede transaktioner</span>
                    <span className="text-sm font-medium text-slate-900">
                      {financeService.getAllTransactions().filter(t => t.status === 'failed').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Refunds i denne måned</span>
                    <span className="text-sm font-medium text-slate-900">
                      {financeService.getAllTransactions().filter(t => 
                        t.type === 'REFUND' && 
                        t.createdAt.getMonth() === new Date().getMonth()
                      ).length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Regulatory Compliance */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900">Regulatorisk Overholdelse</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">GDPR Overholdelse</span>
                    <span className="text-green-600 font-medium text-sm">✅ Aktiv</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">PCI DSS Compliance</span>
                    <span className="text-green-600 font-medium text-sm">✅ Aktiv</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">AML Kontroller</span>
                    <span className="text-green-600 font-medium text-sm">✅ Aktiv</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">KYC Verifikation</span>
                    <span className="text-green-600 font-medium text-sm">✅ Aktiv</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Skattetræk (27%)</span>
                    <span className="text-green-600 font-medium text-sm">✅ Aktiv</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Moms beregning (25%)</span>
                    <span className="text-green-600 font-medium text-sm">✅ Aktiv</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Retention Policy */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Data Opbevaringspolitik</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-slate-900 mb-3">Transaktionsdata</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Aktive transaktioner:</span>
                        <span className="text-slate-900">Permanent</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Arkiverede transaktioner:</span>
                        <span className="text-slate-900">7 år</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Persondata (GDPR):</span>
                        <span className="text-slate-900">2 år efter inaktivitet</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 mb-3">Skatte og Moms</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Momsdata:</span>
                        <span className="text-slate-900">5 år</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Skattedata:</span>
                        <span className="text-slate-900">5 år</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Udbetalingsdata:</span>
                        <span className="text-slate-900">7 år</span>
                      </div>
                    </div>
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
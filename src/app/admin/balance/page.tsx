'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { adminTheme, getNumberDisplay } from '@/lib/admin-theme'
import { Balance, BalanceTransaction } from '@/lib/balanceService'
import { Payouts, PayoutRequest } from '@/lib/payoutService'

export default function AdminBalanceManagement() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<any>(null)
  const [pendingPayouts, setPendingPayouts] = useState<PayoutRequest[]>([])
  const [recentTransactions, setRecentTransactions] = useState<BalanceTransaction[]>([])
  const [selectedTab, setSelectedTab] = useState<'overview' | 'payouts' | 'transactions' | 'users'>('overview')

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user?.isAdmin) {
        router.push('/login?redirect=/admin/balance')
        return
      }
    }
  }, [isLoading, isAuthenticated, user?.isAdmin, router])

  useEffect(() => {
    loadBalanceData()
  }, [])

  const loadBalanceData = () => {
    const balanceAnalytics = Balance.getAnalytics()
    const payoutAnalytics = Payouts.getAnalytics()
    const pending = Payouts.getPending()
    const transactions = Balance.getHistory(undefined, undefined, undefined, 50)

    setAnalytics({ balance: balanceAnalytics, payout: payoutAnalytics })
    setPendingPayouts(pending)
    setRecentTransactions(transactions)
  }

  const processPayout = async (requestId: string, action: 'approve' | 'reject', notes?: string) => {
    const result = await Payouts.processRequest(
      requestId,
      user?.id || 'admin',
      action,
      notes
    )

    if (result.success) {
      alert(`Udbetaling ${action === 'approve' ? 'godkendt' : 'afvist'}!`)
      loadBalanceData()
    } else {
      alert(`Fejl: ${result.error}`)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading balance management...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user?.isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg border-r border-slate-200">
        <div className="flex h-full flex-col">
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
              
              <Link href="/admin/balance">
                <div className={adminTheme.nav.active}>
                  <svg className={adminTheme.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Balance & Udbetalinger
                </div>
              </Link>
            </div>
          </nav>

          <div className="border-t border-slate-200 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-slate-600 rounded-md flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {user?.firstName?.[0]?.toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-900 truncate">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-xs text-slate-500">Administrator</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        <div className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-slate-600">Balance System Active</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">
              {pendingPayouts.length} afventende udbetalinger
            </span>
          </div>
        </div>

        <main className="px-6 py-8">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Balance & Payout Management</h1>
              <p className="text-slate-600">Administrer brugerbalancer og udbetalingsanmodninger</p>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-slate-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { key: 'overview', label: 'Oversigt', icon: '📊' },
                  { key: 'payouts', label: 'Udbetalinger', icon: '💳' },
                  { key: 'transactions', label: 'Transaktioner', icon: '📋' },
                  { key: 'users', label: 'Bruger Balancer', icon: '👥' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setSelectedTab(tab.key as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      selectedTab === tab.key
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Overview Tab */}
            {selectedTab === 'overview' && analytics && (
              <div className="space-y-6">
                {/* Balance Metrics */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <div className={adminTheme.card.default + ' p-6'}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${adminTheme.colors.text.secondary}`}>Total Cash Balance</p>
                        <p className={`text-2xl font-bold ${adminTheme.colors.text.primary}`}>
                          {getNumberDisplay(analytics.balance.balanceTotals.cashBalance, 'currency')}
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-green-100 rounded-md flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className={adminTheme.card.default + ' p-6'}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${adminTheme.colors.text.secondary}`}>Bonus Balance</p>
                        <p className={`text-2xl font-bold ${adminTheme.colors.text.primary}`}>
                          {getNumberDisplay(analytics.balance.balanceTotals.bonusBalance, 'currency')}
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 0v1m-2 0V6a2 2 0 00-2 0v1m2 0V9.5m0 0v3m0-3h3m-3 0h-3m-2-5a9 9 0 1118 0 9 9 0 01-18 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className={adminTheme.card.default + ' p-6'}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${adminTheme.colors.text.secondary}`}>Locked Balance</p>
                        <p className={`text-2xl font-bold ${analytics.balance.balanceTotals.lockedBalance > 0 ? 'text-amber-600' : adminTheme.colors.text.primary}`}>
                          {getNumberDisplay(analytics.balance.balanceTotals.lockedBalance, 'currency')}
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-amber-100 rounded-md flex items-center justify-center">
                        <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className={adminTheme.card.default + ' p-6'}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${adminTheme.colors.text.secondary}`}>Pending Payouts</p>
                        <p className={`text-2xl font-bold ${pendingPayouts.length > 0 ? 'text-red-600' : adminTheme.colors.text.primary}`}>
                          {pendingPayouts.length}
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-red-100 rounded-md flex items-center justify-center">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* System Health */}
                <div className={adminTheme.card.default + ' p-6'}>
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">System Status</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h3 className="font-medium text-slate-700 mb-3">Balance Distribution</h3>
                      <div className="space-y-2">
                        {analytics?.balance.userDistribution && Object.entries(analytics.balance.userDistribution).map(([tier, count]) => (
                          <div key={tier} className="flex items-center justify-between">
                            <span className="text-sm text-slate-600 capitalize">
                              {tier === 'zeroBalance' ? 'Ingen saldo' :
                               tier === 'lowBalance' ? 'Lav saldo' :
                               tier === 'mediumBalance' ? 'Medium saldo' : 'Høj saldo'}
                            </span>
                            <span className="text-sm font-medium text-slate-900">{count as number} brugere</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-slate-700 mb-3">Recent Activity (30d)</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Total transaktioner</span>
                          <span className="text-sm font-medium text-slate-900">
                            {analytics?.balance.recentActivity.totalTransactions}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Volume</span>
                          <span className="text-sm font-medium text-slate-900">
                            {getNumberDisplay(analytics?.balance.recentActivity.totalVolume || 0, 'currency')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Udbetalinger</span>
                          <span className="text-sm font-medium text-slate-900">
                            {analytics?.balance.recentActivity.withdrawals}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-slate-700 mb-3">Payout Metrics</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Success rate</span>
                          <span className="text-sm font-medium text-green-600">
                            {analytics?.payout.thirtyDayStats.successRate.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Avg processing</span>
                          <span className="text-sm font-medium text-slate-900">
                            {analytics?.payout.processingMetrics.avgProcessingTime.toFixed(1)}h
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">High risk</span>
                          <span className={`text-sm font-medium ${
                            analytics?.payout.processingMetrics.highRiskRequests > 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {analytics?.payout.processingMetrics.highRiskRequests} anmodninger
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payouts Tab */}
            {selectedTab === 'payouts' && (
              <div className={adminTheme.card.default + ' overflow-hidden'}>
                <div className="px-6 py-4 border-b border-slate-200">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Payout Anmodninger ({pendingPayouts.length} afventende)
                  </h2>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Bruger
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Beløb
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Metode
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Risk Score
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Anmodet
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Handlinger
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {pendingPayouts.map((payout) => (
                        <tr key={payout.id} className={adminTheme.table.row}>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-slate-900">
                              Bruger {payout.userId}
                            </div>
                            <div className="text-sm text-slate-500">
                              KYC: {payout.kycStatus === 'verified' ? '✅' : '⚠️'} {payout.kycStatus}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-slate-900">
                              {payout.amount.toLocaleString('da-DK')} DKK
                            </div>
                            <div className="text-sm text-slate-500">
                              Net: {payout.netAmount.toLocaleString('da-DK')} DKK
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-slate-900">{payout.method.name}</div>
                            <div className="text-sm text-slate-500">{payout.method.type}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              (payout.metadata?.riskScore || 0) > 70 ? 'bg-red-100 text-red-800' :
                              (payout.metadata?.riskScore || 0) > 30 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {payout.metadata?.riskScore || 0}
                            </span>
                            {payout.metadata?.manualReviewRequired && (
                              <div className="text-xs text-red-600 mt-1">Manual review</div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-slate-900">
                              {payout.requestedAt.toLocaleDateString('da-DK')}
                            </div>
                            <div className="text-sm text-slate-500">
                              {payout.requestedAt.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => processPayout(payout.id, 'approve')}
                                className="p-2 text-slate-400 hover:text-green-600 transition-colors"
                                title="Godkend"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                              <button
                                onClick={() => {
                                  const reason = prompt('Årsag til afvisning:')
                                  if (reason) processPayout(payout.id, 'reject', reason)
                                }}
                                className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                                title="Afvis"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {pendingPayouts.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className={`text-lg font-medium ${adminTheme.colors.text.primary} mb-2`}>Ingen afventende udbetalinger</h3>
                      <p className={`${adminTheme.colors.text.muted}`}>
                        Alle udbetalingsanmodninger er behandlet
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={adminTheme.card.default + ' p-6'}>
                <h3 className="font-semibold text-slate-900 mb-2">Balance Export</h3>
                <p className="text-sm text-slate-600 mb-4">Download balance og transaction data</p>
                <button
                  onClick={() => {
                    const data = Balance.export()
                    const blob = new Blob([data], { type: 'application/json' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `balance-data-${new Date().toISOString().split('T')[0]}.json`
                    a.click()
                    URL.revokeObjectURL(url)
                  }}
                  className={`w-full ${adminTheme.buttons.secondary}`}
                >
                  Download Balance Data
                </button>
              </div>
              
              <div className={adminTheme.card.default + ' p-6'}>
                <h3 className="font-semibold text-slate-900 mb-2">Payout Export</h3>
                <p className="text-sm text-slate-600 mb-4">Download udbetaling og KYC data</p>
                <button
                  onClick={() => {
                    const data = Payouts.export()
                    const blob = new Blob([data], { type: 'application/json' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `payout-data-${new Date().toISOString().split('T')[0]}.json`
                    a.click()
                    URL.revokeObjectURL(url)
                  }}
                  className={`w-full ${adminTheme.buttons.secondary}`}
                >
                  Download Payout Data
                </button>
              </div>
              
              <div className={adminTheme.card.default + ' p-6'}>
                <h3 className="font-semibold text-slate-900 mb-2">Manual Balance Adjustment</h3>
                <p className="text-sm text-slate-600 mb-4">Juster bruger balance manuelt</p>
                <button
                  onClick={() => {
                    const userId = prompt('Bruger ID:')
                    if (!userId) return
                    
                    const amount = prompt('Beløb (DKK):')
                    if (!amount) return
                    
                    const reason = prompt('Årsag:')
                    if (!reason) return
                    
                    const amountValue = parseFloat(amount)
                    if (isNaN(amountValue)) {
                      alert('Ugyldigt beløb')
                      return
                    }
                    
                    const result = Balance.addCash(userId, amountValue, `Manual adjustment: ${reason}`, { adminId: user?.id })
                    if (result.success) {
                      alert('Balance justeret!')
                      loadBalanceData()
                    } else {
                      alert(`Fejl: ${result.error}`)
                    }
                  }}
                  className={`w-full ${adminTheme.buttons.primary}`}
                >
                  Juster Balance
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
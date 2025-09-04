'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { financeService, Transaction, Payout, ExpenseRecord, BusinessMetrics } from '@/lib/financeService'
import { adminTheme, getStatusClasses, getNumberDisplay } from '@/lib/admin-theme'

function FinanceDashboard() {
  const [overview, setOverview] = useState<any>(null)
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetrics | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [payouts, setPayout] = useState<Payout[]>([])
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState(30)

  useEffect(() => {
    // Load financial data
    const financialOverview = financeService.getFinancialOverview(selectedPeriod)
    const businessMetricsData = financeService.getBusinessMetrics(selectedPeriod)
    const allTransactions = financeService.getAllTransactions().slice(0, 10) // Latest 10
    const allPayouts = financeService.getAllPayouts().slice(0, 5) // Latest 5
    const allExpenses = financeService.getAllExpenses().slice(0, 5) // Latest 5

    setOverview(financialOverview)
    setBusinessMetrics(businessMetricsData)
    setTransactions(allTransactions)
    setPayout(allPayouts)
    setExpenses(allExpenses)
  }, [selectedPeriod])

  if (!overview) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
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
      case 'pending_verification': return 'text-blue-600 bg-blue-100'
      case 'processing': return 'text-purple-600 bg-purple-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getExpiryColor = (daysLeft: number) => {
    if (daysLeft <= 1) return 'text-red-600'
    if (daysLeft <= 3) return 'text-orange-600'
    if (daysLeft <= 7) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-900">Finansiel Oversigt</h2>
        <div className="flex gap-2">
          {[7, 30, 90].map(days => (
            <button
              key={days}
              onClick={() => setSelectedPeriod(days)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                selectedPeriod === days
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {days} dage
            </button>
          ))}
        </div>
      </div>

      {/* Business Metrics Cards */}
      {businessMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* CAC */}
          <div className={adminTheme.card.default + ' p-6'}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${adminTheme.colors.text.secondary}`}>CAC (Customer Acquisition Cost)</p>
                <p className={`text-2xl font-bold ${adminTheme.colors.text.primary}`}>{getNumberDisplay(businessMetrics.financial.cac, 'currency')}</p>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center">
                <svg className={adminTheme.iconLarge} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <p className={`text-xs ${adminTheme.colors.text.muted} mt-2`}>{businessMetrics.overview.newCustomers} nye kunder</p>
          </div>

          {/* LTV */}
          <div className={adminTheme.card.default + ' p-6'}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${adminTheme.colors.text.secondary}`}>LTV (Lifetime Value)</p>
                <p className={`text-2xl font-bold ${adminTheme.colors.text.primary}`}>{getNumberDisplay(businessMetrics.financial.ltv, 'currency')}</p>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center">
                <svg className={adminTheme.iconLarge} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <p className={`text-xs ${adminTheme.colors.text.muted} mt-2`}>Gennemsnit pr. kunde</p>
          </div>

          {/* LTV:CAC Ratio */}
          <div className={adminTheme.card.default + ' p-6'}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${adminTheme.colors.text.secondary}`}>LTV:CAC Ratio</p>
                <p className={`text-2xl font-bold ${adminTheme.colors.text.primary}`}>
                  {businessMetrics.financial.ltvCacRatio.toFixed(1)}:1
                </p>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center">
                <svg className={adminTheme.iconLarge} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <p className={`text-xs ${adminTheme.colors.text.muted} mt-2`}>
              {businessMetrics.financial.ltvCacRatio >= 3 ? 'Excellent' : businessMetrics.financial.ltvCacRatio >= 1 ? 'Good' : 'Needs improvement'}
            </p>
          </div>

          {/* ARPU */}
          <div className={adminTheme.card.default + ' p-6'}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${adminTheme.colors.text.secondary}`}>ARPU (Average Revenue Per User)</p>
                <p className={`text-2xl font-bold ${adminTheme.colors.text.primary}`}>{getNumberDisplay(businessMetrics.financial.arpu, 'currency')}</p>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center">
                <svg className={adminTheme.iconLarge} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 5.197H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className={`text-xs ${adminTheme.colors.text.muted} mt-2`}>{businessMetrics.overview.activeCustomers} aktive kunder</p>
          </div>
        </div>
      )}

      {/* Traditional Financial KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Gross Revenue */}
        <div className={adminTheme.card.default + ' p-6'}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${adminTheme.colors.text.secondary}`}>Brutto Omsætning</p>
              <p className={`text-2xl font-bold ${adminTheme.colors.text.primary}`}>{getNumberDisplay(overview.grossRevenue, 'currency')}</p>
            </div>
            <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center">
              <svg className={adminTheme.iconLarge} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className={`text-xs ${adminTheme.colors.text.muted} mt-2`}>{overview.transactionCount} transaktioner</p>
        </div>

        {/* Net Revenue */}
        <div className={adminTheme.card.default + ' p-6'}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${adminTheme.colors.text.secondary}`}>Netto Omsætning</p>
              <p className={`text-2xl font-bold ${adminTheme.colors.text.primary}`}>{getNumberDisplay(overview.netRevenue, 'currency')}</p>
            </div>
            <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center">
              <svg className={adminTheme.iconLarge} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <p className={`text-xs ${adminTheme.colors.text.muted} mt-2`}>Efter refunds og gebyrer</p>
        </div>

        {/* Profit */}
        <div className={adminTheme.card.default + ' p-6'}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${adminTheme.colors.text.secondary}`}>Profit</p>
              <p className={`text-2xl font-bold ${adminTheme.colors.text.primary}`}>
                {getNumberDisplay(overview.profit, 'currency')}
              </p>
            </div>
            <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center">
              <svg className={adminTheme.iconLarge} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <p className={`text-xs ${adminTheme.colors.text.muted} mt-2`}>{overview.profitMargin.toFixed(1)}% margin</p>
        </div>

        {/* Pending Payouts */}
        <div className={adminTheme.card.default + ' p-6'}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${adminTheme.colors.text.secondary}`}>Afventende Udbetalinger</p>
              <p className={`text-2xl font-bold ${adminTheme.colors.text.primary}`}>{getNumberDisplay(overview.pendingPayoutAmount, 'currency')}</p>
            </div>
            <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center">
              <svg className={adminTheme.iconLarge} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className={`text-xs ${adminTheme.colors.text.muted} mt-2`}>{overview.pendingPayouts} afventende</p>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2">
          <div className={adminTheme.card.default}>
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Seneste Transaktioner</h3>
                <Link 
                  href="/admin/finance/transactions"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Se alle
                </Link>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
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
                      Dato
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-slate-50">
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
                        {transaction.createdAt.toLocaleDateString('da-DK')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          {/* Pending Payouts */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Afventende Udbetalinger</h3>
            </div>
            <div className="p-6 space-y-4">
              {payouts.filter(p => ['pending_verification', 'pending_payout', 'processing'].includes(p.status)).map((payout) => (
                <div key={payout.id} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-900">
                      {formatCurrency(payout.amount)}
                    </div>
                    <div className="text-xs text-slate-500">{payout.userId}</div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payout.status)}`}>
                    {payout.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
              {payouts.filter(p => ['pending_verification', 'pending_payout', 'processing'].includes(p.status)).length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">Ingen afventende udbetalinger</p>
              )}
            </div>
          </div>

          {/* Recent Expenses */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Seneste Udgifter</h3>
            </div>
            <div className="p-6 space-y-4">
              {expenses.slice(0, 5).map((expense) => (
                <div key={expense.id} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-900">
                      {expense.description}
                    </div>
                    <div className="text-xs text-slate-500">{expense.category}</div>
                  </div>
                  <div className="text-sm font-medium text-red-600">
                    -{formatCurrency(expense.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Hurtige Handlinger</h3>
            </div>
            <div className="p-6 space-y-3">
              <Link 
                href="/admin/finance/transactions"
                className={`block w-full text-left ${adminTheme.buttons.ghost}`}
              >
                Se alle transaktioner
              </Link>
              <Link 
                href="/admin/finance/payouts"
                className={`block w-full text-left ${adminTheme.buttons.ghost}`}
              >
                Administrer udbetalinger
              </Link>
              <Link 
                href="/admin/finance/expenses"
                className={`block w-full text-left ${adminTheme.buttons.ghost}`}
              >
                Udgiftsstyring
              </Link>
              <Link 
                href="/admin/finance/reports"
                className={`block w-full text-left ${adminTheme.buttons.ghost}`}
              >
                Generér rapporter
              </Link>
              <Link 
                href="/admin/finance/customers"
                className={`block w-full text-left ${adminTheme.buttons.ghost}`}
              >
                Kunde analytics
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Analytics Section */}
      {businessMetrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Kunde Oversigt</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">{businessMetrics.overview.totalCustomers}</div>
                  <div className="text-sm text-slate-600">Total Kunder</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{businessMetrics.overview.activeCustomers}</div>
                  <div className="text-sm text-slate-600">Aktive Kunder</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{businessMetrics.overview.newCustomers}</div>
                  <div className="text-sm text-slate-600">Nye Kunder</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{businessMetrics.overview.churnedCustomers}</div>
                  <div className="text-sm text-slate-600">Churn Risk</div>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600">Retention Rate</span>
                  <span className="font-medium text-green-600">{businessMetrics.overview.retentionRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${businessMetrics.overview.retentionRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Acquisition Channels */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Acquisition Channels</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {financeService.getAcquisitionChannelMetrics().slice(0, 5).map((channel) => (
                  <div key={channel.channel} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div>
                        <div className="text-sm font-medium text-slate-900 capitalize">
                          {channel.channel.replace('_', ' ')}
                        </div>
                        <div className="text-xs text-slate-500">
                          {channel.customerCount} kunder • ROI: {channel.roi.toFixed(0)}%
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-slate-900">
                        {formatCurrency(channel.totalRevenue)}
                      </div>
                      <div className="text-xs text-slate-500">
                        CAC: {formatCurrency(channel.averageCAC)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Chart Placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Omsætningsudvikling</h3>
        </div>
        <div className="p-6">
          <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-slate-400 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-sm text-slate-600">Chart kommer snart...</p>
              <p className="text-xs text-slate-500 mt-1">
                Gennemsnitlig transaktionsværdi: {formatCurrency(overview.averageTransactionValue)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function FinanceManagement() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login?redirect=/admin/finance')
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
              
              <Link href="/admin/raffles">
                <div className={adminTheme.nav.item}>
                  <svg className={adminTheme.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 0v1m-2 0V6a2 2 0 00-2 0v1m2 0V9.5m0 0v3m0-3h3m-3 0h-3m-2-5a9 9 0 1118 0 9 9 0 01-18 0z" />
                  </svg>
                  Lodtrækninger
                </div>
              </Link>
              
              <Link href="/admin/users">
                <div className={adminTheme.nav.item}>
                  <svg className={adminTheme.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 5.197H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Brugere
                </div>
              </Link>
              
              <Link href="/admin/finance">
                <div className={adminTheme.nav.active}>
                  <svg className={adminTheme.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Finans
                </div>
              </Link>
              
              <Link href="/admin/faq">
                <div className={adminTheme.nav.item}>
                  <svg className={adminTheme.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <h1 className="text-2xl font-bold text-slate-900">Finansiel Styring</h1>
                <p className="text-slate-600">Administrer transaktioner og udbetalinger</p>
              </div>
            </div>

            {/* Financial Overview */}
            <FinanceDashboard />
          </div>
        </main>
      </div>
    </div>
  )
}
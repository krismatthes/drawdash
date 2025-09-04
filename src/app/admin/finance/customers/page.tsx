'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { financeService, CustomerMetrics, CohortAnalysis } from '@/lib/financeService'

export default function CustomerAnalytics() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [customers, setCustomers] = useState<CustomerMetrics[]>([])
  const [cohorts, setCohorts] = useState<CohortAnalysis[]>([])
  const [topCustomers, setTopCustomers] = useState<CustomerMetrics[]>([])
  const [churnRiskCustomers, setChurnRiskCustomers] = useState<CustomerMetrics[]>([])
  const [acquisitionChannels, setAcquisitionChannels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedView, setSelectedView] = useState<'overview' | 'cohorts' | 'customers' | 'channels'>('overview')

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login?redirect=/admin/finance/customers')
        return
      }
      if (!user?.isAdmin) {
        router.push('/')
        return
      }
    }
  }, [isLoading, isAuthenticated, user?.isAdmin, router])

  useEffect(() => {
    loadCustomerData()
  }, [])

  const loadCustomerData = () => {
    setLoading(true)
    const allCustomers = financeService.getAllCustomerMetrics()
    const cohortAnalysis = financeService.getCohortAnalysis()
    const topCustomersList = financeService.getTopCustomers(20)
    const churnRiskList = financeService.getChurnRiskCustomers()
    const channelMetrics = financeService.getAcquisitionChannelMetrics()

    setCustomers(allCustomers)
    setCohorts(cohortAnalysis)
    setTopCustomers(topCustomersList)
    setChurnRiskCustomers(churnRiskList)
    setAcquisitionChannels(channelMetrics)
    setLoading(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency: 'DKK',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'high': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'organic': return '🌱'
      case 'paid_social': return '📱'
      case 'paid_search': return '🔍'
      case 'email': return '📧'
      case 'referral': return '🤝'
      case 'direct': return '🎯'
      default: return '📊'
    }
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
                <h1 className="text-2xl font-bold text-slate-900">Kunde Analytics</h1>
                <p className="text-slate-600">CAC, LTV, cohort analyse og kunde retention</p>
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

            {/* View Selector */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex gap-2">
                {[
                  { key: 'overview', label: 'Oversigt', icon: '📊' },
                  { key: 'cohorts', label: 'Cohort Analyse', icon: '📈' },
                  { key: 'customers', label: 'Top Kunder', icon: '👑' },
                  { key: 'channels', label: 'Channels', icon: '📡' }
                ].map(view => (
                  <button
                    key={view.key}
                    onClick={() => setSelectedView(view.key as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedView === view.key
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {view.icon} {view.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Overview */}
            {selectedView === 'overview' && (
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{formatCurrency(customers.reduce((sum, c) => sum + c.acquisitionCost, 0) / Math.max(customers.length, 1))}</div>
                      <div className="text-sm font-medium text-slate-600 mt-1">Gennemsnitlig CAC</div>
                      <div className="text-xs text-slate-500 mt-1">Alle kanaler</div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">{formatCurrency(customers.reduce((sum, c) => sum + c.lifetimeValue, 0) / Math.max(customers.length, 1))}</div>
                      <div className="text-sm font-medium text-slate-600 mt-1">Gennemsnitlig LTV</div>
                      <div className="text-xs text-slate-500 mt-1">Alle kunder</div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">{customers.filter(c => c.totalTransactions > 1).length}</div>
                      <div className="text-sm font-medium text-slate-600 mt-1">Repeat Customers</div>
                      <div className="text-xs text-slate-500 mt-1">{((customers.filter(c => c.totalTransactions > 1).length / Math.max(customers.length, 1)) * 100).toFixed(1)}% rate</div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600">{churnRiskCustomers.length}</div>
                      <div className="text-sm font-medium text-slate-600 mt-1">High Churn Risk</div>
                      <div className="text-xs text-slate-500 mt-1">{((churnRiskCustomers.length / Math.max(customers.length, 1)) * 100).toFixed(1)}% af kunder</div>
                    </div>
                  </div>
                </div>

                {/* Top Customers */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                  <div className="p-6 border-b border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-900">Top Kunder (Total Spent)</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Kunde</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total Spent</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">LTV</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">AOV</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Transactions</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Channel</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {topCustomers.slice(0, 10).map((customer) => (
                          <tr key={customer.userId} className="hover:bg-slate-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-slate-900">{customer.userId}</div>
                              <div className="text-sm text-slate-500">
                                Registreret {customer.registrationDate.toLocaleDateString('da-DK')}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-bold text-slate-900">{formatCurrency(customer.totalSpent)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-green-600">{formatCurrency(customer.lifetimeValue)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-slate-600">{formatCurrency(customer.averageOrderValue)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-slate-600">{customer.totalTransactions}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-1">
                                <span className="text-sm">{getChannelIcon(customer.acquisitionChannel)}</span>
                                <span className="text-sm text-slate-600 capitalize">{customer.acquisitionChannel.replace('_', ' ')}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                customer.isActive ? 'text-green-600 bg-green-100' : 'text-slate-600 bg-slate-100'
                              }`}>
                                {customer.isActive ? 'Aktiv' : 'Inaktiv'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Cohort Analysis */}
            {selectedView === 'cohorts' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900">Cohort Analyse</h3>
                  <p className="text-sm text-slate-600">Retention og revenue per registreringsmåned</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Cohort</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Størrelse</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Aktive</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">30d Retention</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">90d Retention</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total Revenue</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">CAC</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">LTV</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Payback</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {cohorts.map((cohort) => (
                        <tr key={cohort.cohort} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-slate-900">{cohort.cohort}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-600">{cohort.initialSize}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-green-600">{cohort.currentSize}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-medium text-slate-900">{cohort.retentionRates.day30.toFixed(1)}%</div>
                              <div className="w-12 bg-slate-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full"
                                  style={{ width: `${Math.min(cohort.retentionRates.day30, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-medium text-slate-900">{cohort.retentionRates.day90.toFixed(1)}%</div>
                              <div className="w-12 bg-slate-200 rounded-full h-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full"
                                  style={{ width: `${Math.min(cohort.retentionRates.day90, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-slate-900">{formatCurrency(cohort.revenueMetrics.totalRevenue)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-blue-600">{formatCurrency(cohort.cac)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-green-600">{formatCurrency(cohort.ltv)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-600">{cohort.paybackPeriod.toFixed(1)} mdr</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Customer Details */}
            {selectedView === 'customers' && (
              <div className="space-y-6">
                {/* High-Value Customers */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                  <div className="p-6 border-b border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-900">Højværdi Kunder</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Kunde</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total Spent</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">LTV</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">CAC</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ROI</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Churn Risk</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Sidste Aktivitet</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {topCustomers.map((customer) => {
                          const roi = customer.acquisitionCost > 0 ? ((customer.totalSpent - customer.acquisitionCost) / customer.acquisitionCost) * 100 : 0
                          return (
                            <tr key={customer.userId} className="hover:bg-slate-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-slate-900">{customer.userId}</div>
                                <div className="text-sm text-slate-500 capitalize">{customer.acquisitionChannel.replace('_', ' ')}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-bold text-slate-900">{formatCurrency(customer.totalSpent)}</div>
                                <div className="text-xs text-slate-500">{customer.totalTransactions} transaktioner</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-green-600">{formatCurrency(customer.lifetimeValue)}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-blue-600">{formatCurrency(customer.acquisitionCost)}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className={`text-sm font-medium ${roi >= 100 ? 'text-green-600' : roi >= 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                                  {roi.toFixed(0)}%
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(customer.churnRisk)}`}>
                                  {customer.churnRisk}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-slate-600">{customer.daysSinceLastTransaction} dage siden</div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Churn Risk Customers */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                  <div className="p-6 border-b border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-900">Kunder med Høj Churn Risk</h3>
                    <p className="text-sm text-slate-600">Kunder der risikerer at forlade platformen</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-red-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Kunde</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total Værdi</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Sidste Aktivitet</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Forventet Churn</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Handlinger</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {churnRiskCustomers.slice(0, 10).map((customer) => (
                          <tr key={customer.userId} className="hover:bg-slate-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-slate-900">{customer.userId}</div>
                              <div className="text-sm text-slate-500 capitalize">{customer.acquisitionChannel.replace('_', ' ')}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-slate-900">{formatCurrency(customer.totalSpent)}</div>
                              <div className="text-xs text-slate-500">LTV: {formatCurrency(customer.lifetimeValue)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-red-600">{customer.daysSinceLastTransaction} dage siden</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-slate-600">
                                {customer.predictedChurnDate 
                                  ? customer.predictedChurnDate.toLocaleDateString('da-DK')
                                  : 'Ukendt'
                                }
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                Send retention email
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Acquisition Channels */}
            {selectedView === 'channels' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900">Acquisition Channel Performance</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Channel</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Kunder</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total Revenue</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Avg CAC</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Avg LTV</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">LTV:CAC</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ROI</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {acquisitionChannels.map((channel) => (
                        <tr key={channel.channel} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{getChannelIcon(channel.channel)}</span>
                              <div className="text-sm font-medium text-slate-900 capitalize">
                                {channel.channel.replace('_', ' ')}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-600">{channel.customerCount}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-slate-900">{formatCurrency(channel.totalRevenue)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-blue-600">{formatCurrency(channel.averageCAC)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-green-600">{formatCurrency(channel.averageLTV)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-medium ${
                              channel.ltvCacRatio >= 3 ? 'text-green-600' : 
                              channel.ltvCacRatio >= 1 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {channel.ltvCacRatio.toFixed(1)}:1
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-medium ${
                              channel.roi >= 100 ? 'text-green-600' : 
                              channel.roi >= 0 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {channel.roi.toFixed(0)}%
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
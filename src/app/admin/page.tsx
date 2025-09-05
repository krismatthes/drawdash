'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { raffleServiceDB } from '@/lib/raffleServiceDB'
import { userService } from '@/lib/userService'
import { adminTheme, getNumberDisplay } from '@/lib/admin-theme'

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const router = useRouter()
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month'>('today')
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const stats = dashboardData ? {
    revenue: dashboardData.revenue || { today: 0, week: 0, month: 0 },
    tickets: dashboardData.tickets || { today: 0, week: 0, month: 0 },
    users: dashboardData.users || { today: 0, week: 0, month: 0 },
    activeRaffles: dashboardData.activeRaffles || 0
  } : {
    revenue: { today: 0, week: 0, month: 0 },
    tickets: { today: 0, week: 0, month: 0 },
    users: { today: 0, week: 0, month: 0 },
    activeRaffles: 0
  }

  const recentPurchases = dashboardData?.recentPurchases || []
  const recentRegistrations = dashboardData?.recentRegistrations || []
  const endingSoonRaffles = dashboardData?.endingSoonRaffles || []

  const getCurrentStats = () => {
    return {
      revenue: stats.revenue[timeframe],
      tickets: stats.tickets[timeframe],
      users: stats.users[timeframe]
    }
  }

  const currentStats = getCurrentStats()

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Load active raffles
        const activeRaffles = await raffleServiceDB.getActiveRaffles()
        
        // Mock recent purchases from database entries
        const recentEntries = await raffleServiceDB.getRecentEntries(5)
        const recentPurchases = recentEntries.map((entry: any, index: number) => ({
          id: entry.id,
          user: `${entry.user?.firstName || 'User'} ${(entry.user?.lastName || 'X')[0]}.`,
          tickets: entry.quantity,
          raffle: entry.raffle?.title || 'Unknown Raffle',
          time: `${Math.floor(Math.random() * 60)} min siden`,
          amount: entry.totalAmount
        }))
        
        // Mock stats based on real data
        const totalEntries = await raffleServiceDB.getTotalEntriesCount()
        const totalRevenue = await raffleServiceDB.getTotalRevenue()
        
        const data = {
          revenue: {
            today: Math.floor(totalRevenue * 0.1),
            week: Math.floor(totalRevenue * 0.3), 
            month: totalRevenue
          },
          tickets: {
            today: Math.floor(totalEntries * 0.1),
            week: Math.floor(totalEntries * 0.3),
            month: totalEntries
          },
          users: {
            today: Math.floor(Math.random() * 20) + 5,
            week: Math.floor(Math.random() * 100) + 50,
            month: Math.floor(Math.random() * 400) + 200
          },
          activeRaffles: activeRaffles.length,
          recentPurchases,
          recentRegistrations: [
            { id: 1, name: 'Anna Schmidt', email: 'anna@email.dk', time: '5 min siden' },
            { id: 2, name: 'Peter Nielsen', email: 'peter@email.dk', time: '12 min siden' },
            { id: 3, name: 'Lisa Hansen', email: 'lisa@email.dk', time: '28 min siden' },
          ],
          endingSoonRaffles: activeRaffles
            .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
            .slice(0, 3)
        }
        
        setDashboardData(data)
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user?.isAdmin) {
      loadDashboardData()
    }
  }, [user?.isAdmin])

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login?redirect=/admin')
        return
      }
      if (!user?.isAdmin) {
        router.push('/')
        return
      }
    }
  }, [isLoading, isAuthenticated, user?.isAdmin, router])

  // Show loading
  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  // Don't render if not admin (will redirect)
  if (!isAuthenticated || !user?.isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Adgang Nægtet</h1>
          <p className="text-slate-600">Du har ikke adgang til admin panelet.</p>
        </div>
      </div>
    )
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
                <div className={adminTheme.nav.active}>
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
                <div className={adminTheme.nav.item}>
                  <svg className={adminTheme.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Finans
                </div>
              </Link>
              
              <Link href="/admin/bonuses">
                <div className={adminTheme.nav.item}>
                  <svg className={adminTheme.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 0v1m-2 0V6a2 2 0 00-2 0v1m2 0V9.5m0 0v3m0-3h3m-3 0h-3m-2-5a9 9 0 1118 0 9 9 0 01-18 0z" />
                  </svg>
                  Bonus Rewards
                </div>
              </Link>
              
              <Link href="/admin/crm">
                <div className={adminTheme.nav.item}>
                  <svg className={adminTheme.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  CRM & Kommunikation
                </div>
              </Link>
              
              <Link href="/admin/balance">
                <div className={adminTheme.nav.item}>
                  <svg className={adminTheme.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Balance & Udbetalinger
                </div>
              </Link>
              
              <Link href="/admin/compliance">
                <div className={adminTheme.nav.item}>
                  <svg className={adminTheme.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Compliance & AML
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

          {/* User Info */}
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
            
            <div className="flex gap-2">
              <Link href="/" className="flex-1">
                <button className={`w-full text-xs ${adminTheme.buttons.secondary}`}>
                  Til Forside
                </button>
              </Link>
              <button
                onClick={logout}
                className={`text-xs ${adminTheme.buttons.danger}`}
              >
                Log ud
              </button>
            </div>
          </div>
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
                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-slate-600">Oversigt over DrawDash performance</p>
              </div>
              
              {/* Timeframe selector */}
              <div className="flex rounded-lg bg-slate-100 p-1 mt-4 sm:mt-0">
                {[
                  { key: 'today', label: 'I dag' },
                  { key: 'week', label: 'Uge' },
                  { key: 'month', label: 'Måned' }
                ].map((option) => (
                  <button
                    key={option.key}
                    onClick={() => setTimeframe(option.key as any)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                      timeframe === option.key
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Revenue Card */}
              <div className={adminTheme.card.default + ' p-6'}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${adminTheme.colors.text.secondary}`}>Omsætning</p>
                    <p className={`text-2xl font-bold ${adminTheme.colors.text.primary}`}>
                      {getNumberDisplay(currentStats.revenue, 'currency')}
                    </p>
                    <p className={`text-xs ${adminTheme.colors.text.muted} mt-1`}>
                      +12.5% fra sidste periode
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center">
                    <svg className={adminTheme.iconLarge} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Tickets Card */}
              <div className={adminTheme.card.default + ' p-6'}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${adminTheme.colors.text.secondary}`}>Solgte Billetter</p>
                    <p className={`text-2xl font-bold ${adminTheme.colors.text.primary}`}>
                      {getNumberDisplay(currentStats.tickets)}
                    </p>
                    <p className={`text-xs ${adminTheme.colors.text.muted} mt-1`}>
                      +8.2% fra sidste periode
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center">
                    <svg className={adminTheme.iconLarge} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Users Card */}
              <div className={adminTheme.card.default + ' p-6'}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${adminTheme.colors.text.secondary}`}>Nye Brugere</p>
                    <p className={`text-2xl font-bold ${adminTheme.colors.text.primary}`}>
                      {getNumberDisplay(currentStats.users)}
                    </p>
                    <p className={`text-xs ${adminTheme.colors.text.muted} mt-1`}>
                      +15.7% fra sidste periode
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center">
                    <svg className={adminTheme.iconLarge} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 5.197H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Active Raffles Card */}
              <div className={adminTheme.card.default + ' p-6'}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${adminTheme.colors.text.secondary}`}>Aktive Lodtrækninger</p>
                    <p className={`text-2xl font-bold ${adminTheme.colors.text.primary}`}>{stats.activeRaffles}</p>
                    <p className={`text-xs ${adminTheme.colors.text.muted} mt-1`}>
                      2 udløber snart
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center">
                    <svg className={adminTheme.iconLarge} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 0v1m-2 0V6a2 2 0 00-2 0v1m2 0V9.5m0 0v3m0-3h3m-3 0h-3m-2-5a9 9 0 1118 0 9 9 0 01-18 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activity */}
              <div className="lg:col-span-2 space-y-6">
                {/* Recent Purchases */}
                <div className={adminTheme.card.default + ' p-6'}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-slate-900">Seneste Billetkøb</h2>
                    <Link href="/admin/finance" className="text-sm text-blue-600 hover:text-blue-700">
                      Se alle →
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {recentPurchases.map((purchase) => (
                      <div
                        key={purchase.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-md"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-300 rounded-md flex items-center justify-center">
                            <span className="text-slate-600 text-xs font-medium">
                              {purchase.user.split(' ')[0][0]}{purchase.user.split(' ')[1][0]}
                            </span>
                          </div>
                          <div>
                            <div className={`text-sm font-medium ${adminTheme.colors.text.primary}`}>
                              {purchase.user} købte {purchase.tickets} billetter
                            </div>
                            <div className={`text-xs ${adminTheme.colors.text.muted}`}>
                              {purchase.raffle} • {purchase.time}
                            </div>
                          </div>
                        </div>
                        <div className={`text-sm font-medium ${adminTheme.colors.text.secondary}`}>
                          {getNumberDisplay(purchase.amount, 'currency')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Ending Soon Raffles */}
                <div className={adminTheme.card.default + ' p-6'}>
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Udløber Snart</h2>
                  <div className="space-y-4">
                    {endingSoonRaffles.length > 0 ? endingSoonRaffles.map((raffle: any) => {
                      const daysLeft = Math.ceil((new Date(raffle.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                      const isUrgent = daysLeft <= 1
                      
                      return (
                        <div
                          key={raffle.id}
                          className={`p-4 rounded-md border ${
                            isUrgent 
                              ? adminTheme.colors.status.error.border + ' ' + adminTheme.colors.status.error.bg
                              : adminTheme.colors.status.warning.border + ' ' + adminTheme.colors.status.warning.bg
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-medium text-slate-900 truncate">
                                {raffle.title}
                              </h3>
                              <p className={`text-xs font-medium mt-1 ${
                                isUrgent ? adminTheme.colors.status.error.text : adminTheme.colors.status.warning.text
                              }`}>
                                {daysLeft <= 0 ? 'Udløbet!' : `${daysLeft} dag${daysLeft !== 1 ? 'e' : ''} tilbage`}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                {raffle.soldTickets}/{raffle.totalTickets} billetter solgt
                              </p>
                            </div>
                          </div>
                          <div className="mt-3">
                            <Link href={`/admin/raffles/${raffle.id}`}>
                              <button className={`w-full text-xs ${isUrgent ? adminTheme.buttons.danger : adminTheme.buttons.secondary}`}>
                                Administrer
                              </button>
                            </Link>
                          </div>
                        </div>
                      )
                    }) : (
                      <div className="text-center py-4 text-slate-500">
                        <p className="text-sm">Ingen lodtrækninger udløber snart</p>
                      </div>
                    )}
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
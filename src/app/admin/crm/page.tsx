'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { adminTheme, getNumberDisplay } from '@/lib/admin-theme'
import { CRM, crmService } from '@/lib/crmService'
import { emailService } from '@/lib/emailService'
import { smsService } from '@/lib/smsService'
import { segmentationEngine } from '@/lib/segmentationEngine'

export default function CRMDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<any>(null)
  const [segments, setSegments] = useState<any[]>([])
  const [recentCampaigns, setRecentCampaigns] = useState<any[]>([])
  const [systemStatus, setSystemStatus] = useState({
    customerio: false,
    email: false,
    sms: false
  })

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user?.isAdmin) {
        router.push('/login?redirect=/admin/crm')
        return
      }
    }
  }, [isLoading, isAuthenticated, user?.isAdmin, router])

  useEffect(() => {
    loadCRMData()
  }, [])

  const loadCRMData = () => {
    // Get CRM analytics
    const crmAnalytics = CRM.getAnalytics()
    setAnalytics(crmAnalytics)

    // Get active segments
    const allSegments = CRM.getAllSegments()
    setSegments(allSegments.filter(s => s.isActive).slice(0, 6))

    // Get recent campaigns
    const emailCampaigns = emailService.getAllCampaigns().slice(-3)
    const smsCampaigns = smsService.getAllCampaigns().slice(-3)
    setRecentCampaigns([...emailCampaigns, ...smsCampaigns].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, 5))

    // Check system status
    setSystemStatus({
      customerio: process.env.CUSTOMERIO_ENABLED === 'true',
      email: process.env.EMAIL_SERVICE_ENABLED === 'true',
      sms: process.env.SMS_SERVICE_ENABLED === 'true'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading CRM dashboard...</p>
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
              
              <Link href="/admin/crm">
                <div className={adminTheme.nav.active}>
                  <svg className={adminTheme.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  CRM & Kommunikation
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
              
              <Link href="/admin/raffles">
                <div className={adminTheme.nav.item}>
                  <svg className={adminTheme.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  Lodtrækninger
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

      {/* Main content */}
      <div className="pl-64">
        <div className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${systemStatus.customerio ? 'bg-green-500' : 'bg-amber-500'} animate-pulse`}></div>
              <span className="text-sm text-slate-600">
                {systemStatus.customerio ? 'Customer.io Connected' : 'Mock Mode Active'}
              </span>
            </div>
            <div className="flex gap-2">
              <div className={`w-2 h-2 rounded-full ${systemStatus.email ? 'bg-green-500' : 'bg-slate-300'}`}></div>
              <span className="text-xs text-slate-500">Email</span>
              <div className={`w-2 h-2 rounded-full ${systemStatus.sms ? 'bg-green-500' : 'bg-slate-300'}`}></div>
              <span className="text-xs text-slate-500">SMS</span>
            </div>
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
                <h1 className="text-2xl font-bold text-slate-900">CRM & Kommunikation</h1>
                <p className="text-slate-600">Styring af kundesegmenter og kommunikationskampagner</p>
              </div>
              
              <div className="flex gap-3 mt-4 sm:mt-0">
                <Link href="/admin/crm/campaigns/create">
                  <button className={adminTheme.buttons.secondary}>
                    Ny Kampagne
                  </button>
                </Link>
                <Link href="/admin/crm/segments/create">
                  <button className={adminTheme.buttons.primary}>
                    Opret Segment
                  </button>
                </Link>
              </div>
            </div>

            {/* System Status Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className={adminTheme.card.default + ' p-6'}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${adminTheme.colors.text.secondary}`}>Customer.io Status</p>
                    <p className={`text-lg font-bold ${systemStatus.customerio ? 'text-green-600' : 'text-amber-600'}`}>
                      {systemStatus.customerio ? 'Connected' : 'Mock Mode'}
                    </p>
                    <p className={`text-xs ${adminTheme.colors.text.muted} mt-1`}>
                      {systemStatus.customerio ? 'Live data sync' : 'Ready for integration'}
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
                    <p className={`text-sm font-medium ${adminTheme.colors.text.secondary}`}>Email Service</p>
                    <p className={`text-lg font-bold ${systemStatus.email ? 'text-green-600' : 'text-slate-600'}`}>
                      {systemStatus.email ? 'Active' : 'Mock'}
                    </p>
                    <p className={`text-xs ${adminTheme.colors.text.muted} mt-1`}>
                      {systemStatus.email ? 'SendGrid/Customer.io' : 'Simulation mode'}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center">
                    <svg className={adminTheme.iconLarge} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className={adminTheme.card.default + ' p-6'}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${adminTheme.colors.text.secondary}`}>SMS Service</p>
                    <p className={`text-lg font-bold ${systemStatus.sms ? 'text-green-600' : 'text-slate-600'}`}>
                      {systemStatus.sms ? 'Active' : 'Mock'}
                    </p>
                    <p className={`text-xs ${adminTheme.colors.text.muted} mt-1`}>
                      {systemStatus.sms ? 'Twilio integration' : 'Simulation mode'}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center">
                    <svg className={adminTheme.iconLarge} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* CRM Analytics */}
            {analytics && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className={adminTheme.card.default + ' p-6'}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${adminTheme.colors.text.secondary}`}>Total Brugere</p>
                      <p className={`text-2xl font-bold ${adminTheme.colors.text.primary}`}>{getNumberDisplay(analytics.totalUsers)}</p>
                      <p className={`text-xs ${adminTheme.colors.text.muted} mt-1`}>
                        {analytics.activeUsers} aktive (30 dage)
                      </p>
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
                      <p className={`text-sm font-medium ${adminTheme.colors.text.secondary}`}>Aktive Segmenter</p>
                      <p className={`text-2xl font-bold ${adminTheme.colors.text.primary}`}>{analytics.totalSegments}</p>
                      <p className={`text-xs ${adminTheme.colors.text.muted} mt-1`}>
                        Klar til kampagner
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center">
                      <svg className={adminTheme.iconLarge} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className={adminTheme.card.default + ' p-6'}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${adminTheme.colors.text.secondary}`}>Gennemsnitlig Værdi</p>
                      <p className={`text-2xl font-bold ${adminTheme.colors.text.primary}`}>
                        {getNumberDisplay(analytics.avgSpendPerUser, 'currency')}
                      </p>
                      <p className={`text-xs ${adminTheme.colors.text.muted} mt-1`}>
                        Per bruger lifetime
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
                      <p className={`text-sm font-medium ${adminTheme.colors.text.secondary}`}>Event Tracking</p>
                      <p className={`text-2xl font-bold ${adminTheme.colors.text.primary}`}>{getNumberDisplay(analytics.totalEvents)}</p>
                      <p className={`text-xs ${adminTheme.colors.text.muted} mt-1`}>
                        Events logget
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center">
                      <svg className={adminTheme.iconLarge} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={adminTheme.card.default + ' p-6'}>
                <h3 className={`text-lg font-semibold ${adminTheme.colors.text.primary} mb-2`}>Hurtige Kampagner</h3>
                <p className={`${adminTheme.colors.text.secondary} text-sm mb-4`}>
                  Start en kampagne med foruddefinerede templates
                </p>
                <div className="space-y-2">
                  <Link href="/admin/crm/campaigns/create?template=welcome">
                    <button className={`w-full text-sm ${adminTheme.buttons.secondary}`}>
                      Velkomst Serie
                    </button>
                  </Link>
                  <Link href="/admin/crm/campaigns/create?template=winback">
                    <button className={`w-full text-sm ${adminTheme.buttons.secondary}`}>
                      Win-back Kampagne
                    </button>
                  </Link>
                  <Link href="/admin/crm/campaigns/create?template=flash">
                    <button className={`w-full text-sm ${adminTheme.buttons.secondary}`}>
                      Flash Sale
                    </button>
                  </Link>
                </div>
              </div>

              <div className={adminTheme.card.default + ' p-6'}>
                <h3 className={`text-lg font-semibold ${adminTheme.colors.text.primary} mb-2`}>Segment Management</h3>
                <p className={`${adminTheme.colors.text.secondary} text-sm mb-4`}>
                  Opret og administrer brugersegmenter
                </p>
                <div className="space-y-2">
                  <Link href="/admin/crm/segments">
                    <button className={`w-full text-sm ${adminTheme.buttons.secondary}`}>
                      Se Alle Segmenter
                    </button>
                  </Link>
                  <Link href="/admin/crm/segments/builder">
                    <button className={`w-full text-sm ${adminTheme.buttons.secondary}`}>
                      Segment Builder
                    </button>
                  </Link>
                  <button 
                    onClick={() => {
                      // Auto-segment refresh
                      console.log('🔄 Refreshing all segments...')
                      // In real implementation, this would trigger segment recalculation
                      alert('Segmenter opdateret! Se konsol for detaljer.')
                    }}
                    className={`w-full text-sm ${adminTheme.buttons.ghost}`}
                  >
                    Opdater Segmenter
                  </button>
                </div>
              </div>

              <div className={adminTheme.card.default + ' p-6'}>
                <h3 className={`text-lg font-semibold ${adminTheme.colors.text.primary} mb-2`}>Integration</h3>
                <p className={`${adminTheme.colors.text.secondary} text-sm mb-4`}>
                  Administrer API integrationer
                </p>
                <div className="space-y-2">
                  <Link href="/admin/crm/settings">
                    <button className={`w-full text-sm ${adminTheme.buttons.secondary}`}>
                      API Indstillinger
                    </button>
                  </Link>
                  <Link href="/admin/crm/export">
                    <button className={`w-full text-sm ${adminTheme.buttons.secondary}`}>
                      Eksporter Data
                    </button>
                  </Link>
                  <button
                    onClick={() => {
                      const exportData = CRM.exportUsers([])
                      const blob = new Blob([exportData], { type: 'application/json' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `crm-data-${new Date().toISOString().split('T')[0]}.json`
                      a.click()
                      URL.revokeObjectURL(url)
                    }}
                    className={`w-full text-sm ${adminTheme.buttons.ghost}`}
                  >
                    Download Data
                  </button>
                </div>
              </div>
            </div>

            {/* Active Segments Overview */}
            <div className={adminTheme.card.default + ' overflow-hidden'}>
              <div className="px-6 py-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">Aktive Segmenter</h2>
                  <Link href="/admin/crm/segments" className="text-sm text-blue-600 hover:text-blue-700">
                    Se alle →
                  </Link>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Segment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Brugere
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Sidst Opdateret
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Handlinger
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {segments.map((segment) => (
                      <tr key={segment.id} className={adminTheme.table.row}>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-slate-900">{segment.name}</div>
                            <div className="text-sm text-slate-500">{segment.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {getNumberDisplay(segment.userCount)} brugere
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-500">
                            {segment.rules.length} regel{segment.rules.length !== 1 ? 'r' : ''}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-500">
                            {new Date(segment.updatedAt).toLocaleDateString('da-DK')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/crm/segments/${segment.id}`}>
                              <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                            </Link>
                            <Link href={`/admin/crm/campaigns/create?segment=${segment.id}`}>
                              <button className="p-2 text-slate-400 hover:text-green-600 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                              </button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {segments.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className={`text-lg font-medium ${adminTheme.colors.text.primary} mb-2`}>Ingen segmenter fundet</h3>
                    <p className={`${adminTheme.colors.text.muted} mb-4`}>
                      Opret dit første segment for at komme i gang med målrettet kommunikation
                    </p>
                    <Link href="/admin/crm/segments/create">
                      <button className={adminTheme.buttons.primary}>
                        Opret Segment
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Campaigns */}
            <div className={adminTheme.card.default + ' p-6'}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Seneste Kampagner</h2>
                <Link href="/admin/crm/campaigns" className="text-sm text-blue-600 hover:text-blue-700">
                  Se alle →
                </Link>
              </div>
              
              {recentCampaigns.length > 0 ? (
                <div className="space-y-3">
                  {recentCampaigns.map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-200 rounded-md flex items-center justify-center">
                          {campaign.type === 'email' ? '📧' : '📱'}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900">{campaign.name}</div>
                          <div className="text-xs text-slate-500">
                            {campaign.type === 'email' ? 'Email Kampagne' : 'SMS Kampagne'} • 
                            Status: {campaign.status}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-slate-900">
                          {getNumberDisplay(campaign.metrics?.sent || 0)} sendt
                        </div>
                        <div className="text-xs text-slate-500">
                          {campaign.metrics?.opened || 0} åbnet
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-slate-500">Ingen kampagner endnu</div>
                  <Link href="/admin/crm/campaigns/create">
                    <button className={`mt-2 ${adminTheme.buttons.secondary}`}>
                      Opret Første Kampagne
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
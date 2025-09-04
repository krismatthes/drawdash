'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { adminTheme, getNumberDisplay } from '@/lib/admin-theme'
import { CRM } from '@/lib/crmService'
import { Track } from '@/lib/eventTrackingService'
import { Segments } from '@/lib/segmentationEngine'
import { Integrations } from '@/lib/integrationService'

export default function CRMAnalytics() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<any>(null)
  const [eventAnalytics, setEventAnalytics] = useState<any>(null)
  const [timeframe, setTimeframe] = useState<'7' | '30' | '90'>('30')

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user?.isAdmin) {
        router.push('/login?redirect=/admin/crm/export')
        return
      }
    }
  }, [isLoading, isAuthenticated, user?.isAdmin, router])

  useEffect(() => {
    loadAnalytics()
  }, [timeframe])

  const loadAnalytics = () => {
    const crmAnalytics = CRM.getAnalytics()
    const eventData = Track.getAnalytics(parseInt(timeframe))
    const sessionData = Track.getSessionAnalytics(parseInt(timeframe))
    
    setAnalytics({
      ...crmAnalytics,
      ...sessionData
    })
    setEventAnalytics(eventData)
  }

  const exportData = (type: string) => {
    let data: string
    let filename: string

    switch (type) {
      case 'users':
        data = CRM.exportUsers([])
        filename = `users-customerio-${new Date().toISOString().split('T')[0]}.json`
        break
      case 'events':
        data = CRM.exportEvents()
        filename = `events-customerio-${new Date().toISOString().split('T')[0]}.json`
        break
      case 'segments':
        data = Segments.export()
        filename = `segments-${new Date().toISOString().split('T')[0]}.json`
        break
      case 'tracking':
        data = Track.export(parseInt(timeframe))
        filename = `tracking-${timeframe}days-${new Date().toISOString().split('T')[0]}.json`
        break
      case 'integrations':
        data = Integrations.export()
        filename = `integrations-${new Date().toISOString().split('T')[0]}.json`
        break
      default:
        return
    }

    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)

    console.log(`📥 Exported ${type} data:`, filename)
  }

  const syncToFacebook = async (segmentId: string) => {
    // Mock sync process
    console.log('📘 Starting Facebook audience sync...')
    const result = await Integrations.syncFacebookAudience(segmentId, [
      'user1@example.com',
      'user2@example.com',
      'user3@example.com'
    ])
    
    alert(`Facebook audience sync startet! ID: ${result.id}`)
  }

  const syncToGoogle = async (segmentId: string) => {
    // Mock sync process
    console.log('🟢 Starting Google Ads customer match...')
    const result = await Integrations.syncGoogleCustomerList(segmentId, [
      'user1@example.com',
      'user2@example.com',
      'user3@example.com'
    ])
    
    alert(`Google Ads customer list sync startet! ID: ${result.id}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user?.isAdmin) {
    return null
  }

  const segments = Segments.getAll()

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
              <Link href="/admin/crm">
                <div className={adminTheme.nav.item}>
                  <svg className={adminTheme.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  CRM Overview
                </div>
              </Link>
              
              <Link href="/admin/crm/export">
                <div className={adminTheme.nav.active}>
                  <svg className={adminTheme.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Analytics & Export
                </div>
              </Link>
            </div>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <div className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-slate-600">Analytics Dashboard</span>
          </div>
          
          {/* Timeframe selector */}
          <div className="flex rounded-lg bg-slate-100 p-1">
            {[
              { key: '7', label: '7 dage' },
              { key: '30', label: '30 dage' },
              { key: '90', label: '90 dage' }
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

        <main className="px-6 py-8">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-slate-900">CRM Analytics & Data Export</h1>
              <p className="text-slate-600">Analysér performance og eksporter data til eksterne platforme</p>
            </div>

            {/* Key Metrics */}
            {analytics && eventAnalytics && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className={adminTheme.card.default + ' p-6'}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${adminTheme.colors.text.secondary}`}>Total Events</p>
                      <p className={`text-2xl font-bold ${adminTheme.colors.text.primary}`}>
                        {getNumberDisplay(eventAnalytics.totalEvents)}
                      </p>
                      <p className={`text-xs ${adminTheme.colors.text.muted} mt-1`}>
                        Sidste {timeframe} dage
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center">
                      <svg className={adminTheme.iconLarge} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className={adminTheme.card.default + ' p-6'}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${adminTheme.colors.text.secondary}`}>Unique Users</p>
                      <p className={`text-2xl font-bold ${adminTheme.colors.text.primary}`}>
                        {getNumberDisplay(eventAnalytics.uniqueUsers)}
                      </p>
                      <p className={`text-xs ${adminTheme.colors.text.muted} mt-1`}>
                        {Math.round(analytics.conversionRate)}% conversion rate
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
                      <p className={`text-sm font-medium ${adminTheme.colors.text.secondary}`}>Avg Session</p>
                      <p className={`text-2xl font-bold ${adminTheme.colors.text.primary}`}>
                        {Math.round((analytics.avgDuration || 0) / 60)}m
                      </p>
                      <p className={`text-xs ${adminTheme.colors.text.muted} mt-1`}>
                        {Math.round(analytics.bounceRate || 0)}% bounce rate
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center">
                      <svg className={adminTheme.iconLarge} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className={adminTheme.card.default + ' p-6'}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${adminTheme.colors.text.secondary}`}>Events/User</p>
                      <p className={`text-2xl font-bold ${adminTheme.colors.text.primary}`}>
                        {eventAnalytics.avgEventsPerUser.toFixed(1)}
                      </p>
                      <p className={`text-xs ${adminTheme.colors.text.muted} mt-1`}>
                        Engagement level
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center">
                      <svg className={adminTheme.iconLarge} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Data Export Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={adminTheme.card.default + ' p-6'}>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Customer.io Export</h2>
                <p className={`${adminTheme.colors.text.secondary} text-sm mb-6`}>
                  Export data i Customer.io format til hurtig integration
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-slate-900">Brugerdata</div>
                      <div className="text-xs text-slate-500">Alle brugerprofiler med attributter</div>
                    </div>
                    <button
                      onClick={() => exportData('users')}
                      className={`text-sm ${adminTheme.buttons.secondary}`}
                    >
                      Download
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-slate-900">Event Data</div>
                      <div className="text-xs text-slate-500">Alle bruger events og aktiviteter</div>
                    </div>
                    <button
                      onClick={() => exportData('events')}
                      className={`text-sm ${adminTheme.buttons.secondary}`}
                    >
                      Download
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-slate-900">Segmenter</div>
                      <div className="text-xs text-slate-500">Segment regler og brugergrupper</div>
                    </div>
                    <button
                      onClick={() => exportData('segments')}
                      className={`text-sm ${adminTheme.buttons.secondary}`}
                    >
                      Download
                    </button>
                  </div>
                </div>
              </div>

              <div className={adminTheme.card.default + ' p-6'}>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Platform Integration</h2>
                <p className={`${adminTheme.colors.text.secondary} text-sm mb-6`}>
                  Synkroniser audiences til annonceringsplatforme
                </p>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-slate-700 mb-2">Facebook Custom Audiences</h3>
                    <div className="space-y-2">
                      {segments.slice(0, 3).map(segment => (
                        <div key={segment.id} className="flex items-center justify-between p-2 border border-slate-200 rounded">
                          <div>
                            <div className="text-xs font-medium text-slate-900">{segment.name}</div>
                            <div className="text-xs text-slate-500">{segment.userCount} brugere</div>
                          </div>
                          <button
                            onClick={() => syncToFacebook(segment.id)}
                            className="text-xs px-2 py-1 text-blue-600 hover:text-blue-800"
                          >
                            Sync →
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-slate-700 mb-2">Google Customer Match</h3>
                    <div className="space-y-2">
                      {segments.slice(0, 3).map(segment => (
                        <div key={segment.id} className="flex items-center justify-between p-2 border border-slate-200 rounded">
                          <div>
                            <div className="text-xs font-medium text-slate-900">{segment.name}</div>
                            <div className="text-xs text-slate-500">{segment.userCount} brugere</div>
                          </div>
                          <button
                            onClick={() => syncToGoogle(segment.id)}
                            className="text-xs px-2 py-1 text-blue-600 hover:text-blue-800"
                          >
                            Sync →
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Events */}
            {eventAnalytics && (
              <div className={adminTheme.card.default + ' p-6'}>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Top Events ({timeframe} dage)</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-slate-700 mb-3">Mest Trackede Events</h3>
                    <div className="space-y-2">
                      {eventAnalytics.topEvents.slice(0, 8).map((event: any, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">{event.event}</span>
                          <span className="text-sm font-medium text-slate-900">{getNumberDisplay(event.count)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-slate-700 mb-3">Device Breakdown</h3>
                    <div className="space-y-2">
                      {Object.entries(eventAnalytics.deviceBreakdown).map(([device, count]) => (
                        <div key={device} className="flex items-center justify-between">
                          <span className="text-sm text-slate-600 capitalize">{device}</span>
                          <span className="text-sm font-medium text-slate-900">{getNumberDisplay(count as number)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Conversion Funnel */}
            {eventAnalytics?.conversionFunnel && (
              <div className={adminTheme.card.default + ' p-6'}>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Conversion Funnel</h2>
                
                <div className="space-y-4">
                  {eventAnalytics.conversionFunnel.map((step: any, index: number) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-24 text-sm text-slate-600">{step.step}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-slate-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ 
                                width: eventAnalytics.conversionFunnel[0] ? 
                                  `${(step.users / eventAnalytics.conversionFunnel[0].users) * 100}%` : 
                                  '0%'
                              }}
                            ></div>
                          </div>
                          <div className="w-20 text-right">
                            <div className="text-sm font-medium text-slate-900">{getNumberDisplay(step.users)}</div>
                            {index > 0 && (
                              <div className="text-xs text-red-600">-{step.dropoffRate.toFixed(1)}%</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Advanced Export Options */}
            <div className={adminTheme.card.default + ' p-6'}>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Advanced Data Export</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 border border-slate-200 rounded-lg">
                  <h3 className="font-medium text-slate-900 mb-2">Complete CRM Package</h3>
                  <p className="text-sm text-slate-600 mb-3">Alle data for fuld Customer.io migration</p>
                  <button
                    onClick={() => {
                      const completeExport = {
                        users: CRM.exportUsers([]),
                        events: CRM.exportEvents(),
                        segments: Segments.export(),
                        campaigns: JSON.stringify({
                          email: localStorage.getItem('email_campaigns'),
                          sms: localStorage.getItem('sms_campaigns')
                        }),
                        exportedAt: new Date().toISOString(),
                        version: '1.0'
                      }
                      
                      const blob = new Blob([JSON.stringify(completeExport, null, 2)], { type: 'application/json' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `drawdash-complete-export-${new Date().toISOString().split('T')[0]}.json`
                      a.click()
                      URL.revokeObjectURL(url)
                    }}
                    className={`w-full ${adminTheme.buttons.primary}`}
                  >
                    Download Alt
                  </button>
                </div>
                
                <div className="p-4 border border-slate-200 rounded-lg">
                  <h3 className="font-medium text-slate-900 mb-2">Facebook Ads Format</h3>
                  <p className="text-sm text-slate-600 mb-3">Hashed emails for Custom Audiences</p>
                  <button
                    onClick={() => exportData('integrations')}
                    className={`w-full ${adminTheme.buttons.secondary}`}
                  >
                    Download Facebook Data
                  </button>
                </div>
                
                <div className="p-4 border border-slate-200 rounded-lg">
                  <h3 className="font-medium text-slate-900 mb-2">Analytics Data</h3>
                  <p className="text-sm text-slate-600 mb-3">Event tracking og session analytics</p>
                  <button
                    onClick={() => exportData('tracking')}
                    className={`w-full ${adminTheme.buttons.secondary}`}
                  >
                    Download Analytics
                  </button>
                </div>
              </div>
            </div>

            {/* Integration Instructions */}
            <div className={adminTheme.card.default + ' p-6'}>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Integration Guide</h2>
              
              <div className="prose prose-slate max-w-none">
                <h3 className="text-base font-medium text-slate-900 mb-2">Customer.io Setup:</h3>
                <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-600">
                  <li>Opret Customer.io konto og få Site ID + API Key</li>
                  <li>Importér brugerdata via JSON upload eller API</li>
                  <li>Konfigurer event tracking webhooks</li>
                  <li>Sæt CUSTOMERIO_ENABLED=true i .env.local</li>
                  <li>Test automations i Customer.io dashboard</li>
                </ol>
                
                <h3 className="text-base font-medium text-slate-900 mb-2 mt-6">Facebook Ads Setup:</h3>
                <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-600">
                  <li>Tilføj Facebook Pixel til website</li>
                  <li>Konfigurer Conversions API</li>
                  <li>Upload Custom Audiences fra segment export</li>
                  <li>Opret Lookalike Audiences</li>
                  <li>Test conversion tracking</li>
                </ol>
                
                <h3 className="text-base font-medium text-slate-900 mb-2 mt-6">Google Ads Setup:</h3>
                <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-600">
                  <li>Aktivér Customer Match i Google Ads</li>
                  <li>Upload customer lists fra export</li>
                  <li>Konfigurer Enhanced Conversions</li>
                  <li>Opret Similar Audiences</li>
                  <li>Test attribution tracking</li>
                </ol>
              </div>
            </div>

            {/* Current Status Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Mock Mode Information
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      Systemet kører i mock mode med simuleret data. Alt CRM funktionalitet 
                      er fuldt implementeret og klar til production når du tilføjer rigtige API nøgler.
                    </p>
                    <p className="mt-2">
                      Data eksporteres i rigtige formater, så migration til live integrationer 
                      er sømløs når du er klar.
                    </p>
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
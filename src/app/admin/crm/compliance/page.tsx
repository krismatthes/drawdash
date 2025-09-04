'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { adminTheme, getNumberDisplay } from '@/lib/admin-theme'
import { GDPR, gdprService } from '@/lib/gdprService'

export default function GDPRCompliance() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<any>(null)
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const [auditLog, setAuditLog] = useState<any[]>([])
  const [selectedTab, setSelectedTab] = useState<'overview' | 'requests' | 'audit' | 'consents'>('overview')

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user?.isAdmin) {
        router.push('/login?redirect=/admin/crm/compliance')
        return
      }
    }
  }, [isLoading, isAuthenticated, user?.isAdmin, router])

  useEffect(() => {
    loadGDPRData()
  }, [])

  const loadGDPRData = () => {
    const gdprAnalytics = GDPR.getAnalytics()
    const pending = GDPR.getPendingRequests()
    const audit = GDPR.getAuditLog(30)
    
    setAnalytics(gdprAnalytics)
    setPendingRequests(pending)
    setAuditLog(audit)
  }

  const processRequest = async (requestId: string, action: 'approve' | 'reject', notes?: string) => {
    const success = await GDPR.processRequest(
      requestId, 
      user?.firstName + ' ' + user?.lastName || 'Admin',
      action,
      notes
    )
    
    if (success) {
      alert(`Anmodning ${action === 'approve' ? 'godkendt' : 'afvist'}!`)
      loadGDPRData()
    }
  }

  const downloadComplianceReport = () => {
    const report = GDPR.generateReport()
    const blob = new Blob([report], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gdpr-compliance-report-${new Date().toISOString().split('T')[0]}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading GDPR dashboard...</p>
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
              <Link href="/admin/crm">
                <div className={adminTheme.nav.item}>
                  <svg className={adminTheme.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  CRM Overview
                </div>
              </Link>
              
              <Link href="/admin/crm/compliance">
                <div className={adminTheme.nav.active}>
                  <svg className={adminTheme.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  GDPR Compliance
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
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-slate-600">GDPR Compliance Active</span>
          </div>
          <button
            onClick={downloadComplianceReport}
            className={adminTheme.buttons.secondary}
          >
            Download Report
          </button>
        </div>

        <main className="px-6 py-8">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-slate-900">GDPR Compliance Dashboard</h1>
              <p className="text-slate-600">Administrer brugersagtighed og data beskyttelse</p>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-slate-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { key: 'overview', label: 'Oversigt', icon: '📊' },
                  { key: 'requests', label: 'Data Anmodninger', icon: '📋' },
                  { key: 'audit', label: 'Audit Log', icon: '🔍' },
                  { key: 'consents', label: 'Samtykker', icon: '✅' }
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
                {/* GDPR Metrics */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <div className={adminTheme.card.default + ' p-6'}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${adminTheme.colors.text.secondary}`}>Total Samtykker</p>
                        <p className={`text-2xl font-bold ${adminTheme.colors.text.primary}`}>
                          {getNumberDisplay(analytics.totalConsents)}
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-green-100 rounded-md flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className={adminTheme.card.default + ' p-6'}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${adminTheme.colors.text.secondary}`}>Afventende Anmodninger</p>
                        <p className={`text-2xl font-bold ${analytics.pendingRequests > 0 ? 'text-amber-600' : adminTheme.colors.text.primary}`}>
                          {getNumberDisplay(analytics.pendingRequests)}
                        </p>
                      </div>
                      <div className={`w-10 h-10 rounded-md flex items-center justify-center ${
                        analytics.pendingRequests > 0 ? 'bg-amber-100' : 'bg-slate-100'
                      }`}>
                        <svg className={`w-6 h-6 ${analytics.pendingRequests > 0 ? 'text-amber-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className={adminTheme.card.default + ' p-6'}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${adminTheme.colors.text.secondary}`}>Avg Response Tid</p>
                        <p className={`text-2xl font-bold ${adminTheme.colors.text.primary}`}>
                          {analytics.avgResponseTime.toFixed(1)}h
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
                        <p className={`text-sm font-medium ${adminTheme.colors.text.secondary}`}>Risk Score</p>
                        <p className={`text-2xl font-bold ${
                          analytics.riskMetrics.expiredConsents > 10 ? 'text-red-600' : 
                          analytics.riskMetrics.expiredConsents > 0 ? 'text-amber-600' : 'text-green-600'
                        }`}>
                          {analytics.riskMetrics.expiredConsents > 10 ? 'Høj' : 
                           analytics.riskMetrics.expiredConsents > 0 ? 'Medium' : 'Lav'}
                        </p>
                      </div>
                      <div className={`w-10 h-10 rounded-md flex items-center justify-center ${
                        analytics.riskMetrics.expiredConsents > 10 ? 'bg-red-100' : 
                        analytics.riskMetrics.expiredConsents > 0 ? 'bg-amber-100' : 'bg-green-100'
                      }`}>
                        <svg className={`w-6 h-6 ${
                          analytics.riskMetrics.expiredConsents > 10 ? 'text-red-600' : 
                          analytics.riskMetrics.expiredConsents > 0 ? 'text-amber-600' : 'text-green-600'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Consent Breakdown */}
                <div className={adminTheme.card.default + ' p-6'}>
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Samtykke Fordeling</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-slate-700 mb-3">Samtykke Typer</h3>
                      <div className="space-y-3">
                        {Object.entries(analytics.consentsByType).map(([type, count]) => (
                          <div key={type} className="flex items-center justify-between">
                            <span className="text-sm text-slate-600 capitalize">{type}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-slate-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full"
                                  style={{ width: `${(Number(count) / analytics.totalConsents) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-slate-900 w-8">{count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-slate-700 mb-3">Risk Faktorer</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Udløbne samtykker</span>
                          <span className={`text-sm font-medium ${
                            analytics.riskMetrics.expiredConsents > 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {analytics.riskMetrics.expiredConsents}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Forældet version</span>
                          <span className={`text-sm font-medium ${
                            analytics.riskMetrics.outdatedConsentVersion > 0 ? 'text-amber-600' : 'text-green-600'
                          }`}>
                            {analytics.riskMetrics.outdatedConsentVersion}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Uverificerede emails</span>
                          <span className={`text-sm font-medium ${
                            analytics.riskMetrics.unverifiedEmails > 0 ? 'text-amber-600' : 'text-green-600'
                          }`}>
                            {analytics.riskMetrics.unverifiedEmails}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Compliance Checklist */}
                <div className={adminTheme.card.default + ' p-6'}>
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Compliance Status</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-slate-700 mb-3">Teknisk Compliance</h3>
                      <div className="space-y-3">
                        {[
                          { task: 'Samtykke management system', completed: true },
                          { task: 'Data subject anmodning håndtering', completed: true },
                          { task: 'Audit logging aktiveret', completed: true },
                          { task: 'Data retention policy implementeret', completed: true },
                          { task: 'Cookie consent banner', completed: false },
                          { task: 'Privacy policy opdateret', completed: false }
                        ].map((item, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                              item.completed ? 'bg-green-500' : 'bg-red-500'
                            }`}>
                              {item.completed ? (
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              )}
                            </div>
                            <span className={`text-sm ${item.completed ? 'text-slate-700' : 'text-red-600'}`}>
                              {item.task}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-slate-700 mb-3">Processuel Compliance</h3>
                      <div className="space-y-3">
                        {[
                          { task: 'Data Protection Officer udpeget', completed: false },
                          { task: 'DPIA gennemført for højrisiko processing', completed: false },
                          { task: 'Databeskyttelsespolitik opdateret', completed: true },
                          { task: 'Medarbejder GDPR træning', completed: false },
                          { task: 'Leverandør agreements opdateret', completed: false },
                          { task: 'Incident response plan', completed: true }
                        ].map((item, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                              item.completed ? 'bg-green-500' : 'bg-amber-500'
                            }`}>
                              {item.completed ? (
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              )}
                            </div>
                            <span className={`text-sm ${item.completed ? 'text-slate-700' : 'text-amber-600'}`}>
                              {item.task}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Data Requests Tab */}
            {selectedTab === 'requests' && (
              <div className={adminTheme.card.default + ' overflow-hidden'}>
                <div className="px-6 py-4 border-b border-slate-200">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Data Subject Anmodninger ({pendingRequests.length} afventende)
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
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Beskrivelse
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Indsendt
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Handlinger
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {GDPR.getRequests().slice(0, 20).map((request) => (
                        <tr key={request.id} className={adminTheme.table.row}>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-slate-900">{request.email}</div>
                            <div className="text-sm text-slate-500">ID: {request.userId}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {request.requestType}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-slate-900">{request.description}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              request.status === 'completed' ? 'bg-green-100 text-green-800' :
                              request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {request.status === 'pending' ? 'Afventende' :
                               request.status === 'completed' ? 'Færdig' :
                               request.status === 'rejected' ? 'Afvist' : 'I gang'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-slate-500">
                              {new Date(request.requestedAt).toLocaleDateString('da-DK')}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {request.status === 'pending' && (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => processRequest(request.id, 'approve')}
                                  className="p-2 text-slate-400 hover:text-green-600 transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => {
                                    const reason = prompt('Årsag til afvisning:')
                                    if (reason) processRequest(request.id, 'reject', reason)
                                  }}
                                  className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {GDPR.getRequests().length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <h3 className={`text-lg font-medium ${adminTheme.colors.text.primary} mb-2`}>Ingen anmodninger</h3>
                      <p className={`${adminTheme.colors.text.muted}`}>
                        Der er ingen data subject anmodninger at behandle
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Audit Log Tab */}
            {selectedTab === 'audit' && (
              <div className={adminTheme.card.default + ' overflow-hidden'}>
                <div className="px-6 py-4 border-b border-slate-200">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Audit Log (Sidste 30 dage) - {auditLog.length} entries
                  </h2>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Tidspunkt
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Action
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Bruger
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Detaljer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Legal Basis
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {auditLog.slice(0, 50).map((log) => (
                        <tr key={log.id} className={adminTheme.table.row}>
                          <td className="px-6 py-4">
                            <div className="text-sm text-slate-900">
                              {new Date(log.performedAt).toLocaleString('da-DK')}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              log.action.includes('consent_given') ? 'bg-green-100 text-green-800' :
                              log.action.includes('consent_withdrawn') ? 'bg-red-100 text-red-800' :
                              log.action.includes('data_deleted') ? 'bg-purple-100 text-purple-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-slate-900">{log.userId || 'System'}</div>
                            <div className="text-sm text-slate-500">af {log.performedBy}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-slate-900">{log.details}</div>
                            {log.dataTypes.length > 0 && (
                              <div className="text-xs text-slate-500 mt-1">
                                Data: {log.dataTypes.join(', ')}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-slate-600">{log.legalBasis}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={adminTheme.card.default + ' p-6'}>
                <h3 className="font-semibold text-slate-900 mb-2">Data Export</h3>
                <p className="text-sm text-slate-600 mb-4">Download GDPR compliance data</p>
                <button
                  onClick={() => {
                    const data = GDPR.export()
                    const blob = new Blob([data], { type: 'application/json' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `gdpr-data-${new Date().toISOString().split('T')[0]}.json`
                    a.click()
                    URL.revokeObjectURL(url)
                  }}
                  className={`w-full ${adminTheme.buttons.secondary}`}
                >
                  Download GDPR Data
                </button>
              </div>
              
              <div className={adminTheme.card.default + ' p-6'}>
                <h3 className="font-semibold text-slate-900 mb-2">Test Compliance</h3>
                <p className="text-sm text-slate-600 mb-4">Simuler data subject anmodning</p>
                <button
                  onClick={() => {
                    const testRequest = GDPR.submitRequest(
                      'test_user_' + Date.now(),
                      'test@example.com',
                      'access',
                      'Test anmodning fra admin panel'
                    )
                    alert(`Test anmodning oprettet: ${testRequest.id}`)
                    loadGDPRData()
                  }}
                  className={`w-full ${adminTheme.buttons.secondary}`}
                >
                  Opret Test Anmodning
                </button>
              </div>
              
              <div className={adminTheme.card.default + ' p-6'}>
                <h3 className="font-semibold text-slate-900 mb-2">Compliance Report</h3>
                <p className="text-sm text-slate-600 mb-4">Generer fuld compliance rapport</p>
                <button
                  onClick={downloadComplianceReport}
                  className={`w-full ${adminTheme.buttons.primary}`}
                >
                  Download Report
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
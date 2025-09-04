'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { adminTheme, getNumberDisplay } from '@/lib/admin-theme'
import { emailService, EmailCampaign } from '@/lib/emailService'
import { smsService, SMSCampaign } from '@/lib/smsService'

export default function CampaignManagement() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<(EmailCampaign | SMSCampaign)[]>([])
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user?.isAdmin) {
        router.push('/login?redirect=/admin/crm/campaigns')
        return
      }
    }
  }, [isLoading, isAuthenticated, user?.isAdmin, router])

  useEffect(() => {
    loadCampaigns()
  }, [])

  const loadCampaigns = () => {
    const emailCampaigns = emailService.getAllCampaigns().map(c => ({ ...c, type: 'email' as const }))
    const smsCampaigns = smsService.getAllCampaigns().map(c => ({ ...c, type: 'sms' as const }))
    
    const allCampaigns = [...emailCampaigns, ...smsCampaigns]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    setCampaigns(allCampaigns)
  }

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus
    const campaignType = 'templateId' in campaign ? 'email' : 'sms'
    const matchesType = filterType === 'all' || campaignType === filterType
    return matchesStatus && matchesType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800'
      case 'sending':
        return 'bg-blue-100 text-blue-800'
      case 'scheduled':
        return 'bg-purple-100 text-purple-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  const getTypeIcon = (type: string) => {
    return type === 'email' ? (
      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading campaigns...</p>
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
                <div className={adminTheme.nav.item}>
                  <svg className={adminTheme.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  CRM Overview
                </div>
              </Link>
              
              <Link href="/admin/crm/segments">
                <div className={adminTheme.nav.item}>
                  <svg className={adminTheme.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Segmenter
                </div>
              </Link>
              
              <Link href="/admin/crm/campaigns">
                <div className={adminTheme.nav.active}>
                  <svg className={adminTheme.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Kampagner
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
            <span className="text-sm text-slate-600">Campaign Manager Active</span>
          </div>
          <div className="text-sm text-slate-500">
            {filteredCampaigns.length} kampagner
          </div>
        </div>

        <main className="px-6 py-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Kommunikationskampagner</h1>
                <p className="text-slate-600">Administrer e-mail og SMS kampagner</p>
              </div>
              
              <div className="flex gap-3 mt-4 sm:mt-0">
                <Link href="/admin/crm/campaigns/templates">
                  <button className={adminTheme.buttons.secondary}>
                    Templates
                  </button>
                </Link>
                <Link href="/admin/crm/campaigns/create">
                  <button className={adminTheme.buttons.primary}>
                    Ny Kampagne
                  </button>
                </Link>
              </div>
            </div>

            {/* Filters */}
            <div className={adminTheme.card.default + ' p-6'}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Alle statuser</option>
                    <option value="draft">Kladde</option>
                    <option value="scheduled">Planlagt</option>
                    <option value="active">Aktiv</option>
                    <option value="sent">Sendt</option>
                    <option value="paused">Pauseret</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Type
                  </label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Alle typer</option>
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                  </select>
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setFilterStatus('all')
                      setFilterType('all')
                    }}
                    className={adminTheme.buttons.secondary + ' w-full'}
                  >
                    Reset Filtre
                  </button>
                </div>
              </div>
            </div>

            {/* Campaign Stats */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className={adminTheme.card.default + ' p-6'}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${adminTheme.colors.text.secondary}`}>Total Kampagner</p>
                    <p className={`text-2xl font-bold ${adminTheme.colors.text.primary}`}>
                      {getNumberDisplay(campaigns.length)}
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
                    <p className={`text-sm font-medium ${adminTheme.colors.text.secondary}`}>Sendte Beskeder</p>
                    <p className={`text-2xl font-bold ${adminTheme.colors.text.primary}`}>
                      {getNumberDisplay(campaigns.reduce((sum, c) => sum + (c.metrics?.sent || 0), 0))}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center">
                    <svg className={adminTheme.iconLarge} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className={adminTheme.card.default + ' p-6'}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${adminTheme.colors.text.secondary}`}>Åbningsrate</p>
                    <p className={`text-2xl font-bold ${adminTheme.colors.text.primary}`}>
                      {campaigns.length > 0 ? 
                        ((campaigns.filter(c => 'templateId' in c).reduce((sum, c: any) => sum + (c.metrics?.opened || 0), 0) / 
                          Math.max(campaigns.filter(c => 'templateId' in c).reduce((sum, c) => sum + (c.metrics?.sent || 0), 0), 1)) * 100).toFixed(1)
                        : '0'}%
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center">
                    <svg className={adminTheme.iconLarge} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className={adminTheme.card.default + ' p-6'}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${adminTheme.colors.text.secondary}`}>Conversion Revenue</p>
                    <p className={`text-2xl font-bold ${adminTheme.colors.text.primary}`}>
                      {getNumberDisplay(campaigns.filter(c => 'templateId' in c).reduce((sum, c: any) => sum + (c.metrics?.revenue || 0), 0), 'currency')}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center">
                    <svg className={adminTheme.iconLarge} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Campaigns Table */}
            <div className={adminTheme.card.default + ' overflow-hidden'}>
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">
                  Alle Kampagner ({filteredCampaigns.length})
                </h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Kampagne
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Segmenter
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Performance
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Handlinger
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {filteredCampaigns.map((campaign) => (
                      <tr key={campaign.id} className={adminTheme.table.row}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-100 rounded-md flex items-center justify-center">
                              {getTypeIcon('templateId' in campaign ? 'email' : 'sms')}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-slate-900">{campaign.name}</div>
                              <div className="text-sm text-slate-500">{campaign.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            'templateId' in campaign ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {'templateId' in campaign ? 'Email' : 'SMS'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                            {campaign.status === 'draft' ? 'Kladde' : 
                             campaign.status === 'sent' ? 'Sendt' :
                             campaign.status === 'sending' ? 'Sender' :
                             campaign.status === 'scheduled' ? 'Planlagt' : 'Pauseret'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-900">{campaign.segmentIds.length} segmenter</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="text-slate-900">{getNumberDisplay(campaign.metrics?.sent || 0)} sendt</div>
                            <div className="text-xs text-slate-500">
                              {'templateId' in campaign 
                                ? `${(campaign as any).metrics?.opened || 0} åbnet • ${(campaign as any).metrics?.clicked || 0} klik`
                                : `${(campaign as any).metrics?.delivered || 0} leveret • ${(campaign as any).metrics?.clicked || 0} klik`
                              }
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/crm/campaigns/${campaign.id}/analytics`}>
                              <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                              </button>
                            </Link>
                            <Link href={`/admin/crm/campaigns/edit/${campaign.id}`}>
                              <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                            </Link>
                            {campaign.status === 'draft' && (
                              <button
                                onClick={() => {
                                  // In real implementation: send campaign
                                  alert(`Kampagne "${campaign.name}" er blevet sendt! (Mock mode)`)
                                  loadCampaigns()
                                }}
                                className="p-2 text-slate-400 hover:text-green-600 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredCampaigns.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className={`text-lg font-medium ${adminTheme.colors.text.primary} mb-2`}>Ingen kampagner fundet</h3>
                    <p className={`${adminTheme.colors.text.muted} mb-4`}>
                      {filterStatus !== 'all' || filterType !== 'all' 
                        ? 'Prøv at justere dine filtre'
                        : 'Opret din første kampagne for at komme i gang'
                      }
                    </p>
                    <Link href="/admin/crm/campaigns/create">
                      <button className={adminTheme.buttons.primary}>
                        Opret Kampagne
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Campaign Templates Quick Start */}
            <div className={adminTheme.card.default + ' p-6'}>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Kampagne Skabeloner</h2>
              <p className={`${adminTheme.colors.text.secondary} text-sm mb-6`}>
                Start hurtigt med foruddefinerede kampagne-skabeloner
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    name: 'Velkomst Serie',
                    description: 'Automatisk e-mail serie til nye brugere',
                    type: 'email',
                    template: 'welcome'
                  },
                  {
                    name: 'Win-back Kampagne',
                    description: 'Reaktiver inaktive brugere med specialtilbud',
                    type: 'email',
                    template: 'winback'
                  },
                  {
                    name: 'Flash Sale SMS',
                    description: 'Hurtige SMS-notifikationer om tidsbegrænsede tilbud',
                    type: 'sms',
                    template: 'flash'
                  },
                  {
                    name: 'VIP Invitation',
                    description: 'Eksklusive tilbud til high-roller segmentet',
                    type: 'email',
                    template: 'vip'
                  },
                  {
                    name: 'Reminder SMS',
                    description: 'Påmindelser om udløbende lodtrækninger',
                    type: 'sms',
                    template: 'reminder'
                  },
                  {
                    name: 'Weekly Newsletter',
                    description: 'Ugentlig oversigt over nye konkurrencer',
                    type: 'email',
                    template: 'newsletter'
                  }
                ].map((template, index) => (
                  <div key={index} className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-8 h-8 bg-slate-100 rounded-md flex items-center justify-center">
                        {getTypeIcon(template.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-slate-900 mb-1">{template.name}</h3>
                        <p className="text-sm text-slate-600">{template.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className={`text-xs px-2 py-1 rounded-md ${
                        template.type === 'email' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {template.type === 'email' ? 'Email' : 'SMS'}
                      </span>
                      <Link href={`/admin/crm/campaigns/create?template=${template.template}&type=${template.type}`}>
                        <button className="text-xs text-blue-600 hover:text-blue-800">
                          Brug skabelon →
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
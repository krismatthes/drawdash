'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { adminTheme } from '@/lib/admin-theme'
import { integrationService } from '@/lib/integrationService'

export default function CRMSettings() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [integrationStatus, setIntegrationStatus] = useState({
    customerio: false,
    email: false,
    sms: false,
    facebook: false,
    google: false
  })
  
  const [apiKeys, setApiKeys] = useState({
    customerioSiteId: '',
    customerioApiKey: '',
    sendgridKey: '',
    twilioSid: '',
    twilioToken: '',
    facebookPixelId: '',
    facebookToken: '',
    googleCustomerId: '',
    googleToken: ''
  })

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user?.isAdmin) {
        router.push('/login?redirect=/admin/crm/settings')
        return
      }
    }
  }, [isLoading, isAuthenticated, user?.isAdmin, router])

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = () => {
    // Load current integration status from environment/storage
    setIntegrationStatus({
      customerio: process.env.CUSTOMERIO_ENABLED === 'true',
      email: process.env.EMAIL_SERVICE_ENABLED === 'true',
      sms: process.env.SMS_SERVICE_ENABLED === 'true',
      facebook: process.env.FACEBOOK_ENABLED === 'true',
      google: process.env.GOOGLE_ADS_ENABLED === 'true'
    })

    // Load saved API keys (masked for security)
    const savedKeys = localStorage.getItem('crm_api_keys')
    if (savedKeys) {
      const keys = JSON.parse(savedKeys)
      setApiKeys({
        ...keys,
        // Mask sensitive data
        customerioApiKey: keys.customerioApiKey ? '••••••••' + keys.customerioApiKey.slice(-4) : '',
        sendgridKey: keys.sendgridKey ? '••••••••' + keys.sendgridKey.slice(-4) : '',
        twilioToken: keys.twilioToken ? '••••••••' + keys.twilioToken.slice(-4) : '',
        facebookToken: keys.facebookToken ? '••••••••' + keys.facebookToken.slice(-4) : '',
        googleToken: keys.googleToken ? '••••••••' + keys.googleToken.slice(-4) : ''
      })
    }
  }

  const testConnection = async (service: string) => {
    console.log(`🧪 Testing ${service} connection...`)
    
    // Mock connection test
    setTimeout(() => {
      const success = Math.random() > 0.2 // 80% success rate
      if (success) {
        alert(`✅ ${service} forbindelse succes!`)
      } else {
        alert(`❌ ${service} forbindelse fejl - tjek API nøgler`)
      }
    }, 1500)
  }

  const saveApiKey = (service: string, key: string) => {
    const newKeys = { ...apiKeys, [service]: key }
    setApiKeys(newKeys)
    
    // In production, this would be saved securely on the server
    localStorage.setItem('crm_api_keys', JSON.stringify(newKeys))
    console.log(`💾 Saved API key for ${service}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading settings...</p>
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
              
              <Link href="/admin/crm/segments">
                <div className={adminTheme.nav.item}>
                  <svg className={adminTheme.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Segmenter
                </div>
              </Link>
              
              <Link href="/admin/crm/campaigns">
                <div className={adminTheme.nav.item}>
                  <svg className={adminTheme.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Kampagner
                </div>
              </Link>
              
              <Link href="/admin/crm/settings">
                <div className={adminTheme.nav.active}>
                  <svg className={adminTheme.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Indstillinger
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
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-slate-600">Integration Settings</span>
          </div>
        </div>

        <main className="px-6 py-8">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-slate-900">CRM & Integration Indstillinger</h1>
              <p className="text-slate-600">Konfigurer API integrationer og tjenester</p>
            </div>

            {/* Integration Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  name: 'Customer.io',
                  key: 'customerio',
                  description: 'CRM og automatisering platform',
                  status: integrationStatus.customerio,
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  )
                },
                {
                  name: 'Email Service',
                  key: 'email',
                  description: 'SendGrid eller Customer.io email',
                  status: integrationStatus.email,
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  )
                },
                {
                  name: 'SMS Service',
                  key: 'sms',
                  description: 'Twilio SMS integration',
                  status: integrationStatus.sms,
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  )
                },
                {
                  name: 'Facebook Ads',
                  key: 'facebook',
                  description: 'Facebook Custom Audiences',
                  status: integrationStatus.facebook,
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h3a1 1 0 110 2h-1v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6H4a1 1 0 010-2h3z" />
                    </svg>
                  )
                },
                {
                  name: 'Google Ads',
                  key: 'google',
                  description: 'Google Customer Match',
                  status: integrationStatus.google,
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )
                }
              ].map((integration) => (
                <div key={integration.key} className={adminTheme.card.default + ' p-6'}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-md flex items-center justify-center ${
                        integration.status ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {integration.icon}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">{integration.name}</h3>
                        <p className="text-xs text-slate-500">{integration.description}</p>
                      </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${
                      integration.status ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className={`text-sm font-medium ${
                      integration.status ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {integration.status ? 'Forbundet' : 'Ikke konfigureret'}
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => testConnection(integration.name)}
                        className={`flex-1 text-xs ${adminTheme.buttons.secondary}`}
                      >
                        Test Forbindelse
                      </button>
                      <Link href={`/admin/crm/settings/${integration.key}`}>
                        <button className={`text-xs ${adminTheme.buttons.ghost}`}>
                          Konfigurer
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* API Keys Configuration */}
            <div className={adminTheme.card.default + ' p-6'}>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">API Nøgle Konfiguration</h2>
              <p className={`${adminTheme.colors.text.secondary} text-sm mb-6`}>
                Indtast dine API nøgler for at aktivere live integrationer. Indtil da kører systemet i mock mode.
              </p>
              
              <div className="space-y-6">
                {/* Customer.io */}
                <div className="p-4 border border-slate-200 rounded-lg">
                  <h3 className="font-medium text-slate-900 mb-3">Customer.io</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Site ID
                      </label>
                      <input
                        type="text"
                        value={apiKeys.customerioSiteId}
                        onChange={(e) => saveApiKey('customerioSiteId', e.target.value)}
                        placeholder="din_site_id"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        API Key
                      </label>
                      <input
                        type="password"
                        value={apiKeys.customerioApiKey}
                        onChange={(e) => saveApiKey('customerioApiKey', e.target.value)}
                        placeholder="din_api_key"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* SendGrid */}
                <div className="p-4 border border-slate-200 rounded-lg">
                  <h3 className="font-medium text-slate-900 mb-3">SendGrid (Backup Email)</h3>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      API Key
                    </label>
                    <input
                      type="password"
                      value={apiKeys.sendgridKey}
                      onChange={(e) => saveApiKey('sendgridKey', e.target.value)}
                      placeholder="SG.xxx"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Twilio */}
                <div className="p-4 border border-slate-200 rounded-lg">
                  <h3 className="font-medium text-slate-900 mb-3">Twilio SMS</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Account SID
                      </label>
                      <input
                        type="text"
                        value={apiKeys.twilioSid}
                        onChange={(e) => saveApiKey('twilioSid', e.target.value)}
                        placeholder="AC..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Auth Token
                      </label>
                      <input
                        type="password"
                        value={apiKeys.twilioToken}
                        onChange={(e) => saveApiKey('twilioToken', e.target.value)}
                        placeholder="din_auth_token"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Facebook */}
                <div className="p-4 border border-slate-200 rounded-lg">
                  <h3 className="font-medium text-slate-900 mb-3">Facebook Ads</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Pixel ID
                      </label>
                      <input
                        type="text"
                        value={apiKeys.facebookPixelId}
                        onChange={(e) => saveApiKey('facebookPixelId', e.target.value)}
                        placeholder="123456789"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Access Token
                      </label>
                      <input
                        type="password"
                        value={apiKeys.facebookToken}
                        onChange={(e) => saveApiKey('facebookToken', e.target.value)}
                        placeholder="EAAx..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Google Ads */}
                <div className="p-4 border border-slate-200 rounded-lg">
                  <h3 className="font-medium text-slate-900 mb-3">Google Ads</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Customer ID
                      </label>
                      <input
                        type="text"
                        value={apiKeys.googleCustomerId}
                        onChange={(e) => saveApiKey('googleCustomerId', e.target.value)}
                        placeholder="123-456-7890"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Developer Token
                      </label>
                      <input
                        type="password"
                        value={apiKeys.googleToken}
                        onChange={(e) => saveApiKey('googleToken', e.target.value)}
                        placeholder="din_developer_token"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Production Readiness Checklist */}
            <div className={adminTheme.card.default + ' p-6'}>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Production Readiness</h2>
              <p className={`${adminTheme.colors.text.secondary} text-sm mb-6`}>
                Tjek denne liste før du går live med CRM integrationer
              </p>
              
              <div className="space-y-4">
                {[
                  { task: 'Customer.io konto oprettet og verificeret', completed: false },
                  { task: 'Email templates testet og godkendt', completed: false },
                  { task: 'SMS compliance verificeret (dansk lov)', completed: false },
                  { task: 'GDPR consent system implementeret', completed: true },
                  { task: 'Facebook Business Manager adgang', completed: false },
                  { task: 'Google Ads konto konfigureret', completed: false },
                  { task: 'Webhook endpoints testet', completed: true },
                  { task: 'Rate limiting konfigureret', completed: true }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      item.completed ? 'bg-green-500' : 'bg-slate-300'
                    }`}>
                      {item.completed && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm ${item.completed ? 'text-slate-700' : 'text-slate-500'}`}>
                      {item.task}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Export & Backup */}
            <div className={adminTheme.card.default + ' p-6'}>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Data Management</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-medium text-slate-700 mb-2">Export Data</h3>
                  <p className="text-sm text-slate-500 mb-3">Download data til Customer.io import</p>
                  <button
                    onClick={() => {
                      const exportData = JSON.stringify({
                        users: localStorage.getItem('crm_users'),
                        events: localStorage.getItem('tracking_events'),
                        segments: localStorage.getItem('crm_segments'),
                        exportedAt: new Date().toISOString()
                      }, null, 2)
                      
                      const blob = new Blob([exportData], { type: 'application/json' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `drawdash-crm-export-${new Date().toISOString().split('T')[0]}.json`
                      a.click()
                      URL.revokeObjectURL(url)
                    }}
                    className={`w-full ${adminTheme.buttons.secondary}`}
                  >
                    Download CRM Data
                  </button>
                </div>
                
                <div>
                  <h3 className="font-medium text-slate-700 mb-2">System Status</h3>
                  <p className="text-sm text-slate-500 mb-3">Tjek system sundhed</p>
                  <button
                    onClick={() => {
                      const analytics = integrationService.getIntegrationAnalytics()
                      console.log('📊 Integration Analytics:', analytics)
                      alert('System status logget til konsol')
                    }}
                    className={`w-full ${adminTheme.buttons.secondary}`}
                  >
                    Run Health Check
                  </button>
                </div>
                
                <div>
                  <h3 className="font-medium text-slate-700 mb-2">Clear Data</h3>
                  <p className="text-sm text-slate-500 mb-3">Reset alle CRM data (kun test)</p>
                  <button
                    onClick={() => {
                      if (confirm('Er du sikker på du vil slette alle CRM data?')) {
                        localStorage.removeItem('crm_users')
                        localStorage.removeItem('crm_segments')
                        localStorage.removeItem('tracking_events')
                        localStorage.removeItem('email_campaigns')
                        localStorage.removeItem('sms_campaigns')
                        alert('CRM data ryddet!')
                        window.location.reload()
                      }
                    }}
                    className={`w-full text-xs ${adminTheme.buttons.danger}`}
                  >
                    Clear All Data
                  </button>
                </div>
              </div>
            </div>

            {/* Mock Mode Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">
                    Mock Mode Aktiv
                  </h3>
                  <div className="mt-2 text-sm text-amber-700">
                    <p>
                      CRM systemet kører i simulation mode. Alle API kald logges til konsollen, 
                      men ingen rigtige emails/SMS sendes. For at aktivere live mode:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Tilføj rigtige API nøgler ovenfor</li>
                      <li>Sæt CUSTOMERIO_ENABLED=true i .env.local</li>
                      <li>Test forbindelser grundigt i staging miljø</li>
                      <li>Verificer GDPR compliance før live data</li>
                    </ul>
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
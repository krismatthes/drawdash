'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { adminTheme, getNumberDisplay } from '@/lib/admin-theme'
import { Segments, segmentationEngine } from '@/lib/segmentationEngine'
import { CRMSegment } from '@/lib/crmService'

export default function SegmentManagement() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [segments, setSegments] = useState<CRMSegment[]>([])
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<any>(null)

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user?.isAdmin) {
        router.push('/login?redirect=/admin/crm/segments')
        return
      }
    }
  }, [isLoading, isAuthenticated, user?.isAdmin, router])

  useEffect(() => {
    loadSegments()
  }, [])

  const loadSegments = () => {
    const allSegments = Segments.getAll()
    setSegments(allSegments)
    
    if (allSegments.length > 0 && !selectedSegment) {
      setSelectedSegment(allSegments[0].id)
    }
  }

  const createTemplateSegments = () => {
    const templates = Segments.getTemplates()
    
    templates.forEach(template => {
      try {
        Segments.create(template, user?.firstName + ' ' + user?.lastName || 'Admin')
      } catch (error) {
        console.log('Segment already exists:', template.name)
      }
    })
    
    loadSegments()
    alert(`Oprettet ${templates.length} segment-skabeloner!`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading segments...</p>
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
                <div className={adminTheme.nav.active}>
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
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-slate-600">Segmentation Engine Active</span>
          </div>
          <div className="text-sm text-slate-500">
            {segments.length} aktive segmenter
          </div>
        </div>

        <main className="px-6 py-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Brugersegmenter</h1>
                <p className="text-slate-600">Administrer målgrupper og kundesegmentering</p>
              </div>
              
              <div className="flex gap-3 mt-4 sm:mt-0">
                <button 
                  onClick={createTemplateSegments}
                  className={adminTheme.buttons.secondary}
                >
                  Opret Skabeloner
                </button>
                <Link href="/admin/crm/segments/builder">
                  <button className={adminTheme.buttons.secondary}>
                    Segment Builder
                  </button>
                </Link>
                <Link href="/admin/crm/segments/create">
                  <button className={adminTheme.buttons.primary}>
                    Nyt Segment
                  </button>
                </Link>
              </div>
            </div>

            {/* Segments Table */}
            <div className={adminTheme.card.default + ' overflow-hidden'}>
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">
                  Alle Segmenter ({segments.length})
                </h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Segment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Regler
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Brugere
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Status
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
                          <div className="flex flex-wrap gap-1">
                            {segment.rules.slice(0, 2).map((rule, index) => (
                              <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                                {rule.field} {rule.operator === 'greater_than' ? '>' : rule.operator === 'equals' ? '=' : rule.operator} {rule.value}
                              </span>
                            ))}
                            {segment.rules.length > 2 && (
                              <span className="text-xs text-slate-500">+{segment.rules.length - 2} flere</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {getNumberDisplay(segment.userCount)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            segment.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {segment.isActive ? 'Aktiv' : 'Inaktiv'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-500">
                            {new Date(segment.updatedAt).toLocaleDateString('da-DK')}
                          </div>
                          <div className="text-xs text-slate-400">
                            af {segment.createdBy}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedSegment(segment.id)}
                              className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                            </button>
                            <Link href={`/admin/crm/campaigns/create?segment=${segment.id}`}>
                              <button className="p-2 text-slate-400 hover:text-green-600 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                              </button>
                            </Link>
                            <Link href={`/admin/crm/segments/edit/${segment.id}`}>
                              <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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
                      Start med at oprette segment-skabeloner eller byg dit eget segment
                    </p>
                    <div className="flex gap-3 justify-center">
                      <button 
                        onClick={createTemplateSegments}
                        className={adminTheme.buttons.secondary}
                      >
                        Opret Skabeloner
                      </button>
                      <Link href="/admin/crm/segments/create">
                        <button className={adminTheme.buttons.primary}>
                          Opret Segment
                        </button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Segment Templates */}
            <div className={adminTheme.card.default + ' p-6'}>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Segment Skabeloner</h2>
              <p className={`${adminTheme.colors.text.secondary} text-sm mb-6`}>
                Brug foruddefinerede skabeloner til hurtig segmentering
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Segments.getTemplates().map((template, index) => (
                  <div key={index} className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                    <h3 className="font-medium text-slate-900 mb-1">{template.name}</h3>
                    <p className="text-sm text-slate-600 mb-3">{template.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        {template.rules.length} regel{template.rules.length !== 1 ? 'r' : ''}
                      </span>
                      <button
                        onClick={() => {
                          try {
                            Segments.create(template, user?.firstName + ' ' + user?.lastName || 'Admin')
                            loadSegments()
                            alert(`Segment "${template.name}" oprettet!`)
                          } catch (error) {
                            alert('Segment eksisterer allerede')
                          }
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Opret →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Segment Analytics Preview */}
            {selectedSegment && (
              <div className={adminTheme.card.default + ' p-6'}>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Segment Analytics</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-slate-700">Oversigt</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Total brugere:</span>
                        <span className="text-sm font-medium">
                          {getNumberDisplay(segments.find(s => s.id === selectedSegment)?.userCount || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Procent af total:</span>
                        <span className="text-sm font-medium">
                          {segments.find(s => s.id === selectedSegment)?.userCount || 0 > 0 ? '12.5%' : '0%'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium text-slate-700">Værdi Metrics</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Avg. brugt:</span>
                        <span className="text-sm font-medium">{getNumberDisplay(2500, 'currency')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Potentiale:</span>
                        <span className="text-sm font-medium text-green-600">Høj</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium text-slate-700">Aktivitet</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Aktive (7 dage):</span>
                        <span className="text-sm font-medium">75%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Churn risk:</span>
                        <span className="text-sm font-medium text-amber-600">15%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-slate-200">
                  <div className="flex gap-3">
                    <Link href={`/admin/crm/campaigns/create?segment=${selectedSegment}`}>
                      <button className={adminTheme.buttons.primary}>
                        Opret Kampagne
                      </button>
                    </Link>
                    <button className={adminTheme.buttons.secondary}>
                      Eksporter Brugere
                    </button>
                    <Link href={`/admin/crm/segments/edit/${selectedSegment}`}>
                      <button className={adminTheme.buttons.ghost}>
                        Rediger
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
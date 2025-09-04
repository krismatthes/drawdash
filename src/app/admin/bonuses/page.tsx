'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { bonusRewardService, BonusReward } from '@/lib/bonusRewardService'
import { adminTheme, getStatusClasses, getNumberDisplay } from '@/lib/admin-theme'

export default function BonusManagement() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [bonuses, setBonuses] = useState<BonusReward[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user?.isAdmin) {
        router.push('/login?redirect=/admin/bonuses')
        return
      }
    }
  }, [isLoading, isAuthenticated, user?.isAdmin, router])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const allBonuses = bonusRewardService.getAllBonuses()
    setBonuses(allBonuses)
    
    const systemStats = bonusRewardService.getBonusSystemStats()
    setStats(systemStats)
  }

  const filteredBonuses = bonuses.filter(bonus => {
    const matchesSearch = !searchQuery || 
      bonus.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bonus.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesType = filterType === 'all' || bonus.type === filterType
    const matchesActive = filterActive === undefined || bonus.isActive === filterActive
    
    return matchesSearch && matchesType && matchesActive
  })

  const toggleBonusStatus = (bonusId: string) => {
    const bonus = bonuses.find(b => b.id === bonusId)
    if (!bonus) return

    const updated = bonusRewardService.updateBonus(
      bonusId, 
      { isActive: !bonus.isActive }, 
      user?.firstName + ' ' + user?.lastName || 'Admin'
    )
    
    if (updated) {
      loadData()
    }
  }

  const deleteBonus = (bonusId: string) => {
    if (!confirm('Er du sikker på at du vil slette denne bonus? Dette kan ikke fortrydes.')) return

    try {
      bonusRewardService.deleteBonus(bonusId, user?.firstName + ' ' + user?.lastName || 'Admin')
      loadData()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Fejl ved sletning af bonus')
    }
  }

  const getBonusTypeIcon = (type: BonusReward['type']) => {
    return (
      <div className="w-8 h-8 bg-slate-100 rounded-md flex items-center justify-center">
        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 0v1m-2 0V6a2 2 0 00-2 0v1m2 0V9.5m0 0v3m0-3h3m-3 0h-3m-2-5a9 9 0 1118 0 9 9 0 01-18 0z" />
        </svg>
      </div>
    )
  }

  const getBonusTypeLabel = (type: BonusReward['type']) => {
    switch (type) {
      case 'points':
        return 'Points'
      case 'free_tickets':
        return 'Gratis Billetter'
      case 'cashback':
        return 'Cashback'
      case 'multiplier':
        return 'Point Multiplier'
      case 'free_entry':
        return 'Gratis Entry'
      case 'discount':
        return 'Rabat'
      default:
        return 'Ukendt'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading bonus management...</p>
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
              
              <Link href="/admin/bonuses">
                <div className={adminTheme.nav.active}>
                  <svg className={adminTheme.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 0v1m-2 0V6a2 2 0 00-2 0v1m2 0V9.5m0 0v3m0-3h3m-3 0h-3m-2-5a9 9 0 1118 0 9 9 0 01-18 0z" />
                  </svg>
                  Bonus Rewards
                </div>
              </Link>
              
              <Link href="/admin/raffles">
                <div className="text-slate-600 hover:bg-slate-50 hover:text-slate-900 px-3 py-2.5 text-sm font-medium rounded-xl flex items-center gap-3 transition-colors">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  Lodtrækninger
                </div>
              </Link>
              
              <Link href="/admin/users">
                <div className="text-slate-600 hover:bg-slate-50 hover:text-slate-900 px-3 py-2.5 text-sm font-medium rounded-xl flex items-center gap-3 transition-colors">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 5.197H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Brugere
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
            <span className="text-sm text-slate-600">Bonus System Online</span>
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
            {/* Header with actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Bonus Rewards</h1>
                <p className="text-slate-600">Administrer manuel og automatisk bonus tildeling</p>
              </div>
              
              <div className="flex gap-3 mt-4 sm:mt-0">
                <Link href="/admin/bonuses/assign">
                  <button className={adminTheme.buttons.secondary}>
                    Tildel Bonus
                  </button>
                </Link>
                <Link href="/admin/bonuses/create">
                  <button className={adminTheme.buttons.primary}>
                    Opret Bonus
                  </button>
                </Link>
              </div>
            </div>

            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className={adminTheme.card.default + ' p-6'}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${adminTheme.colors.text.secondary}`}>Aktive Bonusser</p>
                      <p className={`text-2xl font-bold ${adminTheme.colors.text.primary}`}>{getNumberDisplay(stats.activeBonuses)}</p>
                    </div>
                    <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center">
                      <svg className={adminTheme.iconLarge} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 0v1m-2 0V6a2 2 0 00-2 0v1m2 0V9.5m0 0v3m0-3h3m-3 0h-3m-2-5a9 9 0 1118 0 9 9 0 01-18 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className={adminTheme.card.default + ' p-6'}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${adminTheme.colors.text.secondary}`}>Tildelt I Alt</p>
                      <p className={`text-2xl font-bold ${adminTheme.colors.text.primary}`}>{getNumberDisplay(stats.totalAssigned)}</p>
                    </div>
                    <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center">
                      <svg className={adminTheme.iconLarge} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className={adminTheme.card.default + ' p-6'}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${adminTheme.colors.text.secondary}`}>Anvendelsesrate</p>
                      <p className={`text-2xl font-bold ${adminTheme.colors.text.primary}`}>{stats.usageRate.toFixed(1)}%</p>
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
                      <p className={`text-sm font-medium ${adminTheme.colors.text.secondary}`}>Aktive Tildelte</p>
                      <p className={`text-2xl font-bold ${adminTheme.colors.text.primary}`}>{getNumberDisplay(stats.totalActive)}</p>
                    </div>
                    <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center">
                      <svg className={adminTheme.iconLarge} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Filters and Search */}
            <div className={adminTheme.card.default + ' p-6'}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Søg bonusser
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Søg navn eller beskrivelse..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Bonus Type
                  </label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Alle typer</option>
                    <option value="points">Points</option>
                    <option value="free_tickets">Gratis Billetter</option>
                    <option value="cashback">Cashback</option>
                    <option value="multiplier">Point Multiplier</option>
                    <option value="free_entry">Gratis Entry</option>
                    <option value="discount">Rabat</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filterActive === undefined ? 'all' : filterActive ? 'active' : 'inactive'}
                    onChange={(e) => {
                      const value = e.target.value
                      setFilterActive(value === 'all' ? undefined : value === 'active')
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Alle</option>
                    <option value="active">Aktive</option>
                    <option value="inactive">Inaktive</option>
                  </select>
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setFilterType('all')
                      setFilterActive(undefined)
                    }}
                    className={adminTheme.buttons.secondary + ' w-full'}
                  >
                    Reset Filtre
                  </button>
                </div>
              </div>
            </div>

            {/* Bonuses Table */}
            <div className={adminTheme.card.default + ' overflow-hidden'}>
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">
                  Alle Bonusser ({filteredBonuses.length})
                </h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Bonus
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Type & Værdi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Målgruppe
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Brug
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Handlinger
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {filteredBonuses.map((bonus, index) => (
                      <tr
                        key={bonus.id}
                        className={adminTheme.table.row}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {getBonusTypeIcon(bonus.type)}
                            <div>
                              <div className="text-sm font-medium text-slate-900">{bonus.name}</div>
                              <div className="text-sm text-slate-500">{bonus.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-slate-900">
                              {getBonusTypeLabel(bonus.type)}
                            </div>
                            <div className="text-sm text-slate-500">
                              {bonus.type === 'points' && `${bonus.value.toLocaleString('da-DK')} points`}
                              {bonus.type === 'free_tickets' && `${bonus.value} billetter`}
                              {bonus.type === 'cashback' && `${bonus.value}% tilbage`}
                              {bonus.type === 'multiplier' && `${bonus.value}x multiplier`}
                              {bonus.type === 'free_entry' && `${bonus.value} gratis entries`}
                              {bonus.type === 'discount' && `${bonus.value}% rabat`}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {bonus.targetGroups.map(group => (
                              <span
                                key={group}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {group === 'new_users' && 'Nye'}
                                {group === 'inactive_users' && 'Inaktive'}
                                {group === 'vip_users' && 'VIP'}
                                {group === 'all_users' && 'Alle'}
                                {group === 'custom' && 'Custom'}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              bonus.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {bonus.isActive ? 'Aktiv' : 'Inaktiv'}
                            </span>
                            {bonus.isManualOnly && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Manuel
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-900">{bonus.usageCount.toLocaleString('da-DK')}</div>
                          <div className="text-xs text-slate-500">
                            Max: {bonus.restrictions.maxTotalUses || '∞'} per bonus
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/bonuses/analytics?id=${bonus.id}`}>
                              <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                              </button>
                            </Link>
                            <Link href={`/admin/bonuses/edit/${bonus.id}`}>
                              <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                            </Link>
                            <button
                              onClick={() => toggleBonusStatus(bonus.id)}
                              className={`p-2 transition-colors ${
                                bonus.isActive
                                  ? 'text-slate-400 hover:text-red-600'
                                  : 'text-slate-400 hover:text-green-600'
                              }`}
                            >
                              {bonus.isActive ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              )}
                            </button>
                            <button
                              onClick={() => deleteBonus(bonus.id)}
                              className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredBonuses.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 0v1m-2 0V6a2 2 0 00-2 0v1m2 0V9.5m0 0v3m0-3h3m-3 0h-3m-2-5a9 9 0 1118 0 9 9 0 01-18 0z" />
                      </svg>
                    </div>
                    <h3 className={`text-lg font-medium ${adminTheme.colors.text.primary} mb-2`}>Ingen bonusser fundet</h3>
                    <p className={`${adminTheme.colors.text.muted} mb-4`}>
                      {searchQuery || filterType !== 'all' || filterActive !== undefined
                        ? 'Prøv at justere dine filtre'
                        : 'Opret din første bonus for at komme i gang'
                      }
                    </p>
                    <Link href="/admin/bonuses/create">
                      <button className={adminTheme.buttons.primary}>
                        Opret Bonus
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={adminTheme.card.default + ' p-6'}>
                <h3 className={`text-lg font-semibold ${adminTheme.colors.text.primary} mb-2`}>Hurtige Bonusser</h3>
                <p className={`${adminTheme.colors.text.secondary} text-sm mb-4`}>
                  Tildel populære bonusser med ét klik
                </p>
                <div className="space-y-2">
                  <Link href="/admin/bonuses/assign?template=welcome">
                    <button className={`w-full text-sm ${adminTheme.buttons.secondary}`}>
                      Velkomst Pakke
                    </button>
                  </Link>
                  <Link href="/admin/bonuses/assign?template=reactivation">
                    <button className={`w-full text-sm ${adminTheme.buttons.secondary}`}>
                      Reaktivering
                    </button>
                  </Link>
                </div>
              </div>

              <div className={adminTheme.card.default + ' p-6'}>
                <h3 className={`text-lg font-semibold ${adminTheme.colors.text.primary} mb-2`}>Bulk Operationer</h3>
                <p className={`${adminTheme.colors.text.secondary} text-sm mb-4`}>
                  Administrer flere bonusser på én gang
                </p>
                <div className="space-y-2">
                  <Link href="/admin/bonuses/bulk">
                    <button className={`w-full text-sm ${adminTheme.buttons.secondary}`}>
                      Bulk Tildeling
                    </button>
                  </Link>
                  <button
                    onClick={() => {
                      const expired = bonusRewardService.cleanupExpiredBonuses()
                      alert(`Ryddet ${expired} udløbne bonusser`)
                    }}
                    className={`w-full text-sm ${adminTheme.buttons.ghost}`}
                  >
                    Ryd Udløbne
                  </button>
                </div>
              </div>

              <div className={adminTheme.card.default + ' p-6'}>
                <h3 className={`text-lg font-semibold ${adminTheme.colors.text.primary} mb-2`}>Analytics</h3>
                <p className={`${adminTheme.colors.text.secondary} text-sm mb-4`}>
                  Analyser bonus performance og ROI
                </p>
                <div className="space-y-2">
                  <Link href="/admin/bonuses/analytics">
                    <button className={`w-full text-sm ${adminTheme.buttons.secondary}`}>
                      Se Alle Analytics
                    </button>
                  </Link>
                  <button
                    onClick={() => {
                      const data = bonusRewardService.exportBonusData()
                      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `bonus-data-${new Date().toISOString().split('T')[0]}.json`
                      a.click()
                      URL.revokeObjectURL(url)
                    }}
                    className={`w-full text-sm ${adminTheme.buttons.ghost}`}
                  >
                    Eksporter Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
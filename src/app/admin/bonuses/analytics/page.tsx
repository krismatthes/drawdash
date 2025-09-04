'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { bonusRewardService, BonusReward, type BonusAnalytics } from '@/lib/bonusRewardService'

export default function BonusAnalyticsPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [bonuses, setBonuses] = useState<BonusReward[]>([])
  const [selectedBonusId, setSelectedBonusId] = useState<string>('')
  const [analytics, setAnalytics] = useState<BonusAnalytics | null>(null)
  const [systemStats, setSystemStats] = useState<any>(null)
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user?.isAdmin) {
        router.push('/login?redirect=/admin/bonuses/analytics')
        return
      }
    }
  }, [isLoading, isAuthenticated, user?.isAdmin, router])

  useEffect(() => {
    loadData()
    
    // Check for specific bonus ID in URL
    const bonusId = searchParams.get('id')
    if (bonusId) {
      setSelectedBonusId(bonusId)
    }
  }, [searchParams])

  useEffect(() => {
    if (selectedBonusId) {
      const bonusAnalytics = bonusRewardService.getBonusAnalytics(selectedBonusId)
      setAnalytics(bonusAnalytics)
    } else {
      setAnalytics(null)
    }
  }, [selectedBonusId])

  const loadData = () => {
    const allBonuses = bonusRewardService.getAllBonuses()
    setBonuses(allBonuses)
    
    const stats = bonusRewardService.getBonusSystemStats()
    setSystemStats(stats)
  }

  const formatCurrency = (amount: number) => {
    return `${(amount / 200).toFixed(2)} kr` // 200 points = 1 kr
  }

  const getPerformanceColor = (rate: number) => {
    if (rate >= 70) return 'text-green-600'
    if (rate >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPerformanceLabel = (rate: number) => {
    if (rate >= 70) return 'Excellent'
    if (rate >= 40) return 'Good'
    return 'Needs Improvement'
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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/bonuses">
              <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Bonus Analytics</h1>
              <p className="text-slate-600">Performance og ROI analyse af bonus systemet</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as any)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7d">Sidste 7 dage</option>
              <option value="30d">Sidste 30 dage</option>
              <option value="90d">Sidste 90 dage</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* System Overview */}
          {systemStats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600">Total Bonusser</p>
                    <p className="text-2xl font-bold text-slate-900">{systemStats.activeBonuses}</p>
                    <p className="text-xs text-blue-600 font-medium mt-1">aktive bonusser</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🎁</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600">Tildelt I Alt</p>
                    <p className="text-2xl font-bold text-slate-900">{systemStats.totalAssigned.toLocaleString('da-DK')}</p>
                    <p className="text-xs text-green-600 font-medium mt-1">
                      {systemStats.totalUsed.toLocaleString('da-DK')} brugt
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📊</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600">Anvendelsesrate</p>
                    <p className={`text-2xl font-bold ${getPerformanceColor(systemStats.usageRate)}`}>
                      {systemStats.usageRate.toFixed(1)}%
                    </p>
                    <p className={`text-xs font-medium mt-1 ${getPerformanceColor(systemStats.usageRate)}`}>
                      {getPerformanceLabel(systemStats.usageRate)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📈</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600">Total Værdi</p>
                    <p className="text-2xl font-bold text-slate-900">{formatCurrency(systemStats.totalValue)}</p>
                    <p className="text-xs text-orange-600 font-medium mt-1">tildelt værdi</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">💰</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Bonus Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
          >
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Vælg Bonus for Detaljeret Analyse</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bonuses.map(bonus => {
                const bonusAnalytics = bonusRewardService.getBonusAnalytics(bonus.id)
                
                return (
                  <button
                    key={bonus.id}
                    onClick={() => setSelectedBonusId(bonus.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-colors ${
                      selectedBonusId === bonus.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xl">
                        {bonus.type === 'points' && '🎯'}
                        {bonus.type === 'free_tickets' && '🎫'}
                        {bonus.type === 'cashback' && '💰'}
                        {bonus.type === 'multiplier' && '⚡'}
                        {bonus.type === 'free_entry' && '🆓'}
                        {bonus.type === 'discount' && '🏷️'}
                      </span>
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">{bonus.name}</div>
                        <div className={`text-xs font-medium ${bonus.isActive ? 'text-green-600' : 'text-red-600'}`}>
                          {bonus.isActive ? 'Aktiv' : 'Inaktiv'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-slate-500">Tildelt</div>
                        <div className="font-medium">{bonusAnalytics.totalAssigned}</div>
                      </div>
                      <div>
                        <div className="text-slate-500">Brugt</div>
                        <div className="font-medium">{bonusAnalytics.totalUsed}</div>
                      </div>
                      <div>
                        <div className="text-slate-500">Rate</div>
                        <div className={`font-medium ${getPerformanceColor(bonusAnalytics.usageRate)}`}>
                          {bonusAnalytics.usageRate.toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500">ROI</div>
                        <div className={`font-medium ${getPerformanceColor(bonusAnalytics.roi)}`}>
                          {bonusAnalytics.roi.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </motion.div>

          {/* Detailed Analytics */}
          {analytics && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {/* Performance Metrics */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Performance Metrics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <div className="text-2xl font-bold text-slate-900">{analytics.totalAssigned.toLocaleString('da-DK')}</div>
                    <div className="text-sm text-slate-600">Total Tildelt</div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{analytics.totalUsed.toLocaleString('da-DK')}</div>
                    <div className="text-sm text-slate-600">Total Brugt</div>
                  </div>
                  
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{analytics.totalExpired.toLocaleString('da-DK')}</div>
                    <div className="text-sm text-slate-600">Udløbet</div>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{analytics.averageTimeToUse.toFixed(1)}h</div>
                    <div className="text-sm text-slate-600">Gennemsnitlig Brug Tid</div>
                  </div>
                </div>
              </div>

              {/* Financial Impact */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Finansiel Impact</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {formatCurrency(analytics.totalValueIssued)}
                    </div>
                    <div className="text-sm text-slate-600">Værdi Udstedt</div>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {formatCurrency(analytics.totalValueRedeemed)}
                    </div>
                    <div className="text-sm text-slate-600">Værdi Indløst</div>
                  </div>
                  
                  <div className="text-center p-4 bg-indigo-50 rounded-lg">
                    <div className={`text-2xl font-bold ${getPerformanceColor(analytics.roi)}`}>
                      {analytics.roi.toFixed(1)}%
                    </div>
                    <div className="text-sm text-slate-600">ROI</div>
                  </div>
                </div>
              </div>

              {/* Usage Chart */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Brug Over Tid (Sidste 30 Dage)</h2>
                <div className="h-64 flex items-end justify-between gap-1">
                  {analytics.usageByDay.map((day, index) => {
                    const maxValue = Math.max(...analytics.usageByDay.map(d => Math.max(d.assigned, d.used, d.expired)))
                    const assignedHeight = maxValue > 0 ? (day.assigned / maxValue) * 100 : 0
                    const usedHeight = maxValue > 0 ? (day.used / maxValue) * 100 : 0
                    const expiredHeight = maxValue > 0 ? (day.expired / maxValue) * 100 : 0
                    
                    return (
                      <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group">
                        <div className="relative w-full max-w-8 flex flex-col justify-end h-48">
                          {day.assigned > 0 && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${assignedHeight}%` }}
                              transition={{ delay: index * 0.02 }}
                              className="bg-blue-500 rounded-t-sm"
                              style={{ minHeight: day.assigned > 0 ? '2px' : '0' }}
                            />
                          )}
                          {day.used > 0 && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${usedHeight}%` }}
                              transition={{ delay: index * 0.02 + 0.1 }}
                              className="bg-green-500"
                              style={{ minHeight: day.used > 0 ? '2px' : '0' }}
                            />
                          )}
                          {day.expired > 0 && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${expiredHeight}%` }}
                              transition={{ delay: index * 0.02 + 0.2 }}
                              className="bg-red-500 rounded-b-sm"
                              style={{ minHeight: day.expired > 0 ? '2px' : '0' }}
                            />
                          )}
                        </div>
                        
                        {/* Tooltip on hover */}
                        <div className="opacity-0 group-hover:opacity-100 absolute z-10 bg-black text-white text-xs rounded px-2 py-1 pointer-events-none transform translate-y-full">
                          <div>{new Date(day.date).toLocaleDateString('da-DK', { month: 'short', day: 'numeric' })}</div>
                          <div>Tildelt: {day.assigned}</div>
                          <div>Brugt: {day.used}</div>
                          <div>Udløbet: {day.expired}</div>
                        </div>
                        
                        <div className="text-xs text-slate-500 transform -rotate-45 origin-left">
                          {new Date(day.date).toLocaleDateString('da-DK', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    )
                  })}
                </div>
                
                <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span className="text-slate-600">Tildelt</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span className="text-slate-600">Brugt</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span className="text-slate-600">Udløbet</span>
                  </div>
                </div>
              </div>

              {/* Top Users */}
              {analytics.topUsers.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Top Brugere</h2>
                  <div className="space-y-3">
                    {analytics.topUsers.map((topUser, index) => (
                      <motion.div
                        key={topUser.userId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{index + 1}</span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900">{topUser.userName}</div>
                            <div className="text-xs text-slate-500">{topUser.usageCount} bonusser brugt</div>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-green-600">
                          {formatCurrency(topUser.valueRedeemed)}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Usage by Type */}
              {systemStats?.usageByType && Object.keys(systemStats.usageByType).length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Brug Efter Type</h2>
                  <div className="space-y-4">
                    {Object.entries(systemStats.usageByType).map(([type, count]) => {
                      const percentage = systemStats.totalUsed > 0 ? ((count as number) / systemStats.totalUsed) * 100 : 0
                      
                      return (
                        <div key={type} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">
                                {type === 'points' && '🎯'}
                                {type === 'free_tickets' && '🎫'}
                                {type === 'cashback' && '💰'}
                                {type === 'multiplier' && '⚡'}
                                {type === 'free_entry' && '🆓'}
                                {type === 'discount' && '🏷️'}
                              </span>
                              <span className="text-sm font-medium text-slate-900 capitalize">{type}</span>
                            </div>
                            <div className="text-sm text-slate-600">
                              {count as number} ({percentage.toFixed(1)}%)
                            </div>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.8, delay: 0.2 }}
                              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Export Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6"
          >
            <h2 className="text-lg font-semibold text-indigo-900 mb-4">Export & Rapportering</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => {
                  const data = bonusRewardService.exportBonusData(selectedBonusId || undefined)
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `bonus-analytics-${selectedBonusId || 'all'}-${new Date().toISOString().split('T')[0]}.json`
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                className="p-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-center"
              >
                <div className="text-lg mb-1">📊</div>
                <div className="font-medium">Eksporter Data</div>
                <div className="text-xs opacity-90">JSON format</div>
              </button>
              
              <button
                onClick={() => {
                  // Generate CSV report
                  const data = bonusRewardService.exportBonusData(selectedBonusId || undefined)
                  const csvData = data.userBonuses.map(ub => ({
                    bonusName: ub.bonusSnapshot.name,
                    userId: ub.userId,
                    assigned: ub.assignedAt.toISOString(),
                    used: ub.usedAt?.toISOString() || '',
                    status: ub.status,
                    value: ub.bonusSnapshot.value,
                    type: ub.bonusSnapshot.type
                  }))
                  
                  const csv = [
                    Object.keys(csvData[0] || {}).join(','),
                    ...csvData.map(row => Object.values(row).join(','))
                  ].join('\n')
                  
                  const blob = new Blob([csv], { type: 'text/csv' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `bonus-report-${selectedBonusId || 'all'}-${new Date().toISOString().split('T')[0]}.csv`
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                className="p-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-center"
              >
                <div className="text-lg mb-1">📋</div>
                <div className="font-medium">CSV Rapport</div>
                <div className="text-xs opacity-90">Excel kompatibel</div>
              </button>
              
              <button
                onClick={() => window.print()}
                className="p-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-center"
              >
                <div className="text-lg mb-1">🖨️</div>
                <div className="font-medium">Print Rapport</div>
                <div className="text-xs opacity-90">PDF via browser</div>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
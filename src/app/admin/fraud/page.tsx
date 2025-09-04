'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { antiFraud } from '@/lib/antiFraud'
import { paymentMethodTracking } from '@/lib/paymentMethodTracking'
import { fraudRulesEngine } from '@/lib/fraudRulesEngine'

export default function FraudManagement() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [fraudFlags, setFraudFlags] = useState<any[]>([])
  const [riskProfiles, setRiskProfiles] = useState<any[]>([])
  const [fraudRules, setFraudRules] = useState<any[]>([])
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [rulePerformance, setRulePerformance] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'flags' | 'rules' | 'payments' | 'analytics'>('flags')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user?.isAdmin) {
        router.push('/login?redirect=/admin/fraud')
        return
      }
    }
  }, [isLoading, isAuthenticated, user?.isAdmin, router])

  useEffect(() => {
    if (user?.isAdmin) {
      loadFraudData()
    }
  }, [user])

  const loadFraudData = async () => {
    setLoading(true)
    
    try {
      // Load fraud flags
      const flags = antiFraud.getFraudFlags()
      setFraudFlags(flags.slice(0, 50)) // Show latest 50

      // Load fraud rules
      const rules = fraudRulesEngine.getAllRules()
      setFraudRules(rules)

      // Load payment methods with risk info
      const allPaymentMethods = paymentMethodTracking.getAllPaymentMethods()
      const highRiskMethods = allPaymentMethods
        .filter(pm => pm.riskScore > 30 || pm.isBlacklisted || pm.associatedUserIds.length > 1)
        .slice(0, 20)
      setPaymentMethods(highRiskMethods)

      // Load rule performance
      const performance = fraudRulesEngine.getRulePerformance()
      setRulePerformance(performance)

    } catch (error) {
      console.error('Failed to load fraud data:', error)
    }
    
    setLoading(false)
  }

  const resolveFraudFlag = (flagId: string) => {
    const success = antiFraud.resolveFraudFlag(flagId, user?.firstName + ' ' + user?.lastName || 'Admin')
    if (success) {
      loadFraudData() // Reload data
    }
  }

  const blacklistPaymentMethod = (paymentMethodId: string) => {
    const reason = prompt('Angiv årsag til blokering:')
    if (reason) {
      const success = paymentMethodTracking.blacklistPaymentMethod(
        paymentMethodId, 
        reason, 
        user?.firstName + ' ' + user?.lastName || 'Admin'
      )
      if (success) {
        loadFraudData() // Reload data
        alert('Betalingsmetode er blevet blokeret')
      }
    }
  }

  const toggleRuleStatus = (ruleId: string) => {
    const rule = fraudRules.find(r => r.id === ruleId)
    if (rule) {
      fraudRulesEngine.updateRule(ruleId, { isActive: !rule.isActive }, user?.firstName + ' ' + user?.lastName || 'Admin')
      loadFraudData() // Reload data
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 80) return 'text-red-600'
    if (riskScore >= 60) return 'text-orange-600'
    if (riskScore >= 40) return 'text-yellow-600'
    return 'text-green-600'
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading fraud management...</p>
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
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">🛡️</span>
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">Fraud Management</div>
                <div className="text-xs text-slate-500">Security Dashboard</div>
              </div>
            </Link>
          </div>
          
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
              
              <Link href="/admin/bonuses">
                <div className="text-slate-600 hover:bg-slate-50 hover:text-slate-900 px-3 py-2.5 text-sm font-medium rounded-xl flex items-center gap-3 transition-colors">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 0v1m-2 0V6a2 2 0 00-2 0v1m2 0V9.5m0 0v3m0-3h3m-3 0h-3m-2-5a9 9 0 1118 0 9 9 0 01-18 0z" />
                  </svg>
                  Bonus Rewards
                </div>
              </Link>
              
              <Link href="/admin/fraud">
                <div className="bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border border-red-200 px-3 py-2.5 text-sm font-medium rounded-xl flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Fraud Detection
                  <div className="ml-auto w-2 h-2 bg-red-500 rounded-full" />
                </div>
              </Link>
            </div>
          </nav>

          <div className="border-t border-slate-200 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {user?.firstName?.[0]?.toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-900 truncate">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-xs text-slate-500">Security Admin</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <div className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-slate-600">Fraud Detection Active</span>
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
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Fraud Management</h1>
              <p className="text-slate-600">Monitor and manage fraud detection and prevention</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
              >
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600">Active Fraud Flags</p>
                    <p className="text-2xl font-bold text-red-600">
                      {fraudFlags.filter(f => !f.resolved).length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🚨</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
              >
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600">Active Rules</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {fraudRules.filter(r => r.isActive).length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">⚙️</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
              >
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600">High Risk Payments</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {paymentMethods.filter(pm => pm.riskScore > 60).length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">💳</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
              >
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600">Block Rate</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {rulePerformance ? rulePerformance.blockRate.toFixed(1) : '0'}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🛡️</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="border-b border-slate-200">
                <nav className="flex">
                  {[
                    { id: 'flags', label: 'Fraud Flags', count: fraudFlags.filter(f => !f.resolved).length },
                    { id: 'rules', label: 'Detection Rules', count: fraudRules.length },
                    { id: 'payments', label: 'Risky Payments', count: paymentMethods.length },
                    { id: 'analytics', label: 'Analytics' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-6 py-4 text-sm font-medium transition-colors relative ${
                        activeTab === tab.id
                          ? 'text-red-600 border-b-2 border-red-600 bg-red-50'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {tab.label}
                      {tab.count !== undefined && (
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                          activeTab === tab.id
                            ? 'bg-red-100 text-red-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'flags' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900">Active Fraud Flags</h3>
                    {fraudFlags.filter(f => !f.resolved).length === 0 ? (
                      <div className="text-center py-12">
                        <span className="text-6xl block mb-4">✅</span>
                        <p className="text-slate-600">No active fraud flags</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {fraudFlags.filter(f => !f.resolved).slice(0, 10).map((flag) => (
                          <div key={flag.id} className="border border-slate-200 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(flag.severity)}`}>
                                    {flag.severity.toUpperCase()}
                                  </span>
                                  <span className="text-sm text-slate-500">
                                    {flag.type.replace('_', ' ').toUpperCase()}
                                  </span>
                                  <span className="text-sm text-slate-500">
                                    User: {flag.userId}
                                  </span>
                                </div>
                                <p className="text-slate-900 mb-1">{flag.details}</p>
                                <p className="text-sm text-slate-500">
                                  {new Date(flag.timestamp).toLocaleString('da-DK')}
                                </p>
                              </div>
                              <button
                                onClick={() => resolveFraudFlag(flag.id)}
                                className="ml-4 px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                              >
                                Resolve
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'rules' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-slate-900">Fraud Detection Rules</h3>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Add Rule
                      </button>
                    </div>
                    <div className="space-y-3">
                      {fraudRules.map((rule) => (
                        <div key={rule.id} className="border border-slate-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-semibold text-slate-900">{rule.name}</h4>
                                <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(rule.severity)}`}>
                                  {rule.severity}
                                </span>
                                <span className="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-700">
                                  {rule.category}
                                </span>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {rule.isActive ? 'ACTIVE' : 'INACTIVE'}
                                </span>
                              </div>
                              <p className="text-slate-600 text-sm mb-2">{rule.description}</p>
                              <div className="flex items-center gap-4 text-xs text-slate-500">
                                <span>Triggers: {rule.metadata.triggerCount}</span>
                                <span>Effectiveness: {(rule.metadata.effectiveness * 100).toFixed(1)}%</span>
                                <span>Created: {new Date(rule.metadata.createdAt).toLocaleDateString('da-DK')}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => toggleRuleStatus(rule.id)}
                              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                                rule.isActive
                                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                              }`}
                            >
                              {rule.isActive ? 'Disable' : 'Enable'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'payments' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900">High Risk Payment Methods</h3>
                    <div className="space-y-3">
                      {paymentMethods.map((pm) => (
                        <div key={pm.id} className="border border-slate-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded">
                                  ****{pm.hashedCardNumber.slice(-4)}
                                </span>
                                <span className={`font-bold ${getRiskColor(pm.riskScore)}`}>
                                  Risk: {pm.riskScore}
                                </span>
                                <span className="text-sm text-slate-500">
                                  {pm.cardType.toUpperCase()}
                                </span>
                                {pm.isBlacklisted && (
                                  <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                                    BLACKLISTED
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-slate-600 space-y-1">
                                <p>Associated users: {pm.associatedUserIds.length}</p>
                                <p>Usage count: {pm.usageCount}</p>
                                <p>Last used: {new Date(pm.lastUsed).toLocaleDateString('da-DK')}</p>
                              </div>
                            </div>
                            {!pm.isBlacklisted && (
                              <button
                                onClick={() => blacklistPaymentMethod(pm.id)}
                                className="ml-4 px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                              >
                                Blacklist
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'analytics' && rulePerformance && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-slate-900">Fraud Detection Analytics</h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-slate-50 rounded-lg p-4">
                        <h4 className="font-semibold text-slate-900 mb-3">Overall Performance</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Total Rules:</span>
                            <span className="font-medium">{rulePerformance.totalRules}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Active Rules:</span>
                            <span className="font-medium">{rulePerformance.activeRules}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Total Assessments:</span>
                            <span className="font-medium">{rulePerformance.totalAssessments}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Avg Risk Score:</span>
                            <span className={`font-medium ${getRiskColor(rulePerformance.avgRiskScore)}`}>
                              {rulePerformance.avgRiskScore.toFixed(1)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Block Rate:</span>
                            <span className="font-medium text-red-600">{rulePerformance.blockRate.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Review Rate:</span>
                            <span className="font-medium text-yellow-600">{rulePerformance.reviewRate.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-50 rounded-lg p-4">
                        <h4 className="font-semibold text-slate-900 mb-3">Rule Effectiveness</h4>
                        <div className="space-y-2">
                          {rulePerformance.ruleEffectiveness.slice(0, 5).map((rule: any) => (
                            <div key={rule.id} className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="text-sm font-medium text-slate-900 truncate">
                                  {rule.name}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {rule.triggerCount} triggers
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-green-600">
                                  {(rule.effectiveness * 100).toFixed(1)}%
                                </div>
                                <div className="text-xs text-red-500">
                                  FP: {(rule.falsePositiveRate * 100).toFixed(1)}%
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
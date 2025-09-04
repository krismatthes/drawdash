'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { antiFraud } from '@/lib/antiFraud'
import { secureRNG } from '@/lib/secureRNG'
import { BalanceCompliance } from '@/lib/balanceComplianceService'

interface ComplianceMetrics {
  totalDraws: number
  auditedDraws: number
  fraudFlags: {
    total: number
    unresolved: number
    critical: number
  }
  riskUsers: number
  balanceCompliance?: any
}

export default function ComplianceDashboard() {
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null)
  const [fraudFlags, setFraudFlags] = useState<any[]>([])
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [selectedTab, setSelectedTab] = useState<'overview' | 'fraud' | 'draws' | 'balance' | 'export'>('overview')

  useEffect(() => {
    loadComplianceData()
  }, [])

  const loadComplianceData = () => {
    const flags = antiFraud.getFraudFlags()
    const logs = secureRNG.getAuditLogs()
    const balanceComplianceReport = BalanceCompliance.generateReport()
    
    setFraudFlags(flags)
    setAuditLogs(logs)
    
    setMetrics({
      totalDraws: logs.length,
      auditedDraws: logs.filter(l => l.verification.seedHash).length,
      fraudFlags: {
        total: flags.length,
        unresolved: flags.filter(f => !f.resolved).length,
        critical: flags.filter(f => f.severity === 'critical').length
      },
      riskUsers: flags.filter(f => !f.resolved && (f.severity === 'high' || f.severity === 'critical')).length,
      balanceCompliance: balanceComplianceReport
    })
  }

  const resolveFraudFlag = (flagId: string) => {
    if (antiFraud.resolveFraudFlag(flagId, 'Admin User')) {
      loadComplianceData()
    }
  }

  const exportComplianceReport = () => {
    const report = antiFraud.exportFraudReport()
    const blob = new Blob([report], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `compliance-report-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportDrawAudit = async (raffleId?: string) => {
    const auditData = raffleId 
      ? await secureRNG.exportAuditLog(raffleId)
      : JSON.stringify(auditLogs, null, 2)
    
    const blob = new Blob([auditData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `draw-audit-${raffleId || 'all'}-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!metrics) {
    return <div className="p-8">Loading compliance dashboard...</div>
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">UK Compliance Dashboard</h1>
        <p className="text-slate-600">Monitor regulatory compliance and fraud detection</p>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          className="bg-white rounded-xl border border-slate-200 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-2xl font-bold text-slate-900">{metrics.totalDraws}</div>
          <div className="text-sm text-slate-600">Total Draws</div>
          <div className="text-xs text-green-600 mt-1">
            {metrics.auditedDraws}/{metrics.totalDraws} audited
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-xl border border-slate-200 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="text-2xl font-bold text-slate-900">{metrics.fraudFlags.total}</div>
          <div className="text-sm text-slate-600">Fraud Flags</div>
          <div className="text-xs text-yellow-600 mt-1">
            {metrics.fraudFlags.unresolved} unresolved
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-xl border border-slate-200 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-2xl font-bold text-red-600">{metrics.fraudFlags.critical}</div>
          <div className="text-sm text-slate-600">Critical Flags</div>
          <div className="text-xs text-red-600 mt-1">
            Require immediate attention
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-xl border border-slate-200 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-2xl font-bold text-orange-600">{metrics.riskUsers}</div>
          <div className="text-sm text-slate-600">High-Risk Users</div>
          <div className="text-xs text-orange-600 mt-1">
            Under monitoring
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 mb-8">
        <nav className="flex space-x-8">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'fraud', label: 'Fraud Detection' },
            { key: 'draws', label: 'Draw Audits' },
            { key: 'balance', label: 'Balance & Payout Compliance' },
            { key: 'export', label: 'Export Reports' }
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
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {selectedTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">UK Compliance Status</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>✅ Cryptographically secure RNG</span>
                <span className="text-green-600">Implemented</span>
              </div>
              <div className="flex justify-between">
                <span>✅ Provably fair draws with seed publication</span>
                <span className="text-green-600">Implemented</span>
              </div>
              <div className="flex justify-between">
                <span>✅ Audit logging and video recording capability</span>
                <span className="text-green-600">Implemented</span>
              </div>
              <div className="flex justify-between">
                <span>✅ Device fingerprinting anti-fraud</span>
                <span className="text-green-600">Implemented</span>
              </div>
              <div className="flex justify-between">
                <span>✅ Duplicate account detection</span>
                <span className="text-green-600">Implemented</span>
              </div>
              <div className="flex justify-between">
                <span>✅ Transaction monitoring</span>
                <span className="text-green-600">Implemented</span>
              </div>
              <div className="flex justify-between">
                <span>⚠️ GDPR consent management (CMP)</span>
                <span className="text-yellow-600">Basic implementation</span>
              </div>
              <div className="flex justify-between">
                <span>⚠️ Free entry postal system</span>
                <span className="text-yellow-600">Manual process</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'fraud' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Fraud Detection Flags</h3>
            <button
              onClick={loadComplianceData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Severity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {fraudFlags.map((flag) => (
                    <tr key={flag.id}>
                      <td className="px-6 py-4 text-sm text-slate-900">{flag.type}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          flag.severity === 'critical' ? 'bg-red-100 text-red-800' :
                          flag.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                          flag.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {flag.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900">{flag.userId}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{flag.details}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          flag.resolved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {flag.resolved ? 'Resolved' : 'Open'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {!flag.resolved && (
                          <button
                            onClick={() => resolveFraudFlag(flag.id)}
                            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                          >
                            Resolve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'draws' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Draw Audit Logs</h3>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Draw ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Raffle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Result</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Participants</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Timestamp</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {auditLogs.map((log) => (
                    <tr key={log.drawId}>
                      <td className="px-6 py-4 text-sm font-mono text-slate-900">{log.drawId}</td>
                      <td className="px-6 py-4 text-sm text-slate-900">{log.raffleId}</td>
                      <td className="px-6 py-4 text-sm text-slate-900">{log.result}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{log.participantCount}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {log.method}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => exportDrawAudit(log.raffleId)}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          Export
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'balance' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Balance & Payout Compliance</h3>

          {/* Balance Compliance Metrics */}
          {metrics?.balanceCompliance && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="text-2xl font-bold text-slate-900">
                  {metrics.balanceCompliance.summary.totalChecks}
                </div>
                <div className="text-sm text-slate-600">Compliance Checks</div>
                <div className="text-xs text-green-600 mt-1">
                  {metrics.balanceCompliance.summary.passedChecks} passed
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="text-2xl font-bold text-red-600">
                  {metrics.balanceCompliance.riskDistribution.high}
                </div>
                <div className="text-sm text-slate-600">High Risk Users</div>
                <div className="text-xs text-red-600 mt-1">
                  Enhanced monitoring required
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="text-2xl font-bold text-yellow-600">
                  {metrics.balanceCompliance.summary.flaggedUsers}
                </div>
                <div className="text-sm text-slate-600">Flagged Users</div>
                <div className="text-xs text-yellow-600 mt-1">
                  Under review
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="text-2xl font-bold text-orange-600">
                  {metrics.balanceCompliance.summary.highRiskTransactions}
                </div>
                <div className="text-sm text-slate-600">High Risk Transactions</div>
                <div className="text-xs text-orange-600 mt-1">
                  AML flagged
                </div>
              </div>
            </div>
          )}

          {/* Recent Balance Compliance Flags */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h4 className="font-semibold text-slate-900 mb-4">Recent AML & KYC Flags</h4>
            
            {metrics?.balanceCompliance?.recentFlags?.length > 0 ? (
              <div className="space-y-3">
                {metrics.balanceCompliance.recentFlags.slice(0, 10).map((flag: any, index: number) => (
                  <div key={index} className={`p-4 rounded-lg border ${
                    flag.severity === 'critical' ? 'border-red-200 bg-red-50' :
                    flag.severity === 'high' ? 'border-orange-200 bg-orange-50' :
                    'border-yellow-200 bg-yellow-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            flag.severity === 'critical' ? 'bg-red-100 text-red-800' :
                            flag.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {flag.severity.toUpperCase()}
                          </span>
                          <span className="text-sm font-medium text-slate-900">
                            {flag.type.replace(/_/g, ' ').toUpperCase()}
                          </span>
                          {flag.regulatoryCode && (
                            <span className="text-xs text-slate-500">({flag.regulatoryCode})</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{flag.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">No Critical Balance Compliance Issues</h3>
                <p className="text-slate-600">All AML and KYC checks are passing</p>
              </div>
            )}
          </div>

          {/* Balance Compliance Tools */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h4 className="font-semibold text-slate-900 mb-4">Risk Assessment Tool</h4>
              <p className="text-sm text-slate-600 mb-4">
                Run manual risk assessment for specific users
              </p>
              <button
                onClick={async () => {
                  const userId = prompt('Enter User ID for risk assessment:')
                  if (userId) {
                    try {
                      const assessment = await BalanceCompliance.performRiskAssessment(userId)
                      alert(`Risk Assessment Result:\n\nUser ID: ${userId}\nScore: ${assessment.score}/100\nStatus: ${assessment.status}\nFlags: ${assessment.flags.length}\n\n${assessment.flags.length > 0 ? 'Flags:\n' + assessment.flags.map(f => `- ${f.type}: ${f.description}`).join('\n') : 'No flags detected'}`)
                    } catch (error) {
                      alert('Error performing risk assessment')
                    }
                  }
                }}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Run Risk Assessment
              </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h4 className="font-semibold text-slate-900 mb-4">Compliance Profile</h4>
              <p className="text-sm text-slate-600 mb-4">
                View and update user compliance profiles
              </p>
              <button
                onClick={() => {
                  const userId = prompt('Enter User ID:')
                  if (userId) {
                    const profile = BalanceCompliance.getProfile(userId)
                    const profileInfo = `User ID: ${userId}

KYC Level: ${profile.kycLevel}
AML Status: ${profile.amlStatus}
Risk Tier: ${profile.riskTier}

Withdrawal Limits:
- Daily: ${profile.restrictions.maxDailyWithdrawal.toLocaleString('da-DK')} DKK
- Monthly: ${profile.restrictions.maxMonthlyWithdrawal.toLocaleString('da-DK')} DKK

Documents: ${profile.documents.length}
Manual Review Required: ${profile.restrictions.requiresManualReview ? 'Yes' : 'No'}

Last Review: ${profile.lastReviewDate.toLocaleDateString('da-DK')}
Next Review: ${profile.nextReviewDue?.toLocaleDateString('da-DK') || 'Not scheduled'}`

                    alert(profileInfo)
                  }
                }}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                View Profile
              </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h4 className="font-semibold text-slate-900 mb-4">Export Balance Compliance</h4>
              <p className="text-sm text-slate-600 mb-4">
                Export compliance data for regulatory reporting
              </p>
              <button
                onClick={() => {
                  const data = BalanceCompliance.export()
                  const blob = new Blob([data], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `balance-compliance-${new Date().toISOString().split('T')[0]}.json`
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Export Data
              </button>
            </div>
          </div>

          {/* Danish Regulatory Requirements */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="font-semibold text-blue-800 mb-2">Danish Balance & Payout Compliance</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-sm text-blue-700 space-y-2">
                <div className="font-medium">Spillemyndighedens krav:</div>
                <div>✅ KYC verification for withdrawals &gt; 1,500 DKK</div>
                <div>✅ Enhanced due diligence for &gt; 10,000 DKK</div>
                <div>✅ Transaction monitoring and suspicious activity reporting</div>
                <div>✅ Responsible gambling integration</div>
                <div>✅ Source of funds verification for large deposits</div>
              </div>
              
              <div className="text-sm text-blue-700 space-y-2">
                <div className="font-medium">Finanstilsynets krav:</div>
                <div>✅ Anti-Money Laundering (AML) screening</div>
                <div>✅ Customer due diligence procedures</div>
                <div>✅ Suspicious transaction monitoring</div>
                <div>✅ Record keeping and audit trail</div>
                <div>✅ Risk-based approach to compliance</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'export' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Export Compliance Reports</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h4 className="font-semibold text-slate-900 mb-4">Fraud Detection Report</h4>
              <p className="text-sm text-slate-600 mb-4">
                Export all fraud flags and risk assessments for regulatory review.
              </p>
              <button
                onClick={exportComplianceReport}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Export Fraud Report
              </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h4 className="font-semibold text-slate-900 mb-4">Draw Audit Logs</h4>
              <p className="text-sm text-slate-600 mb-4">
                Export all cryptographic draw proofs and audit trails.
              </p>
              <button
                onClick={() => exportDrawAudit()}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Export Draw Audits
              </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h4 className="font-semibold text-slate-900 mb-4">Balance & Payout Compliance</h4>
              <p className="text-sm text-slate-600 mb-4">
                Export AML/KYC checks and balance compliance data.
              </p>
              <button
                onClick={() => {
                  const data = BalanceCompliance.export()
                  const blob = new Blob([data], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `balance-compliance-${new Date().toISOString().split('T')[0]}.json`
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Export Balance Compliance
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">UK Regulatory Requirements</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <div>• RNG/Skill: ✅ Documented cryptographic method with independent verification</div>
              <div>• Anti-fraud: ✅ IP/device checking, duplicate detection, transaction limits</div>
              <div>• Privacy: ⚠️ CMP implemented, DPIA documentation needed</div>
              <div>• Free Entry: ⚠️ Postal route active, automation needed for scale</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
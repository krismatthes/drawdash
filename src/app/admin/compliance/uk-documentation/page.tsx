'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { gdprCompliance } from '@/lib/gdprCompliance'
import { secureRNG } from '@/lib/secureRNG'
import { antiFraud } from '@/lib/antiFraud'
import { postalEntrySystem } from '@/lib/postalEntrySystem'

export default function UKDocumentationPage() {
  const [selectedSection, setSelectedSection] = useState<'rng' | 'fraud' | 'privacy' | 'postal'>('rng')

  const exportAllCompliance = () => {
    const compliancePackage = {
      generatedAt: new Date().toISOString(),
      operator: '7days Performance Ltd',
      licenseRequirements: {
        rngDocumentation: generateRNGDocumentation(),
        antiFraudProcedures: generateAntiFraudDocumentation(),
        privacyCompliance: gdprCompliance.generateComplianceReport(),
        postalEntryProcedures: generatePostalEntryDocumentation()
      },
      auditTrail: secureRNG.getAuditLogs(),
      fraudPreventionReport: antiFraud.exportFraudReport(),
      dataProtectionAssessment: gdprCompliance.getDPIAAssessments()
    }

    const blob = new Blob([JSON.stringify(compliancePackage, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `uk-compliance-package-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">UK Regulatory Documentation</h1>
        <p className="text-slate-600">Complete documentation package for UK licensing authorities</p>
        
        <div className="mt-4">
          <button
            onClick={exportAllCompliance}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
          >
            Export Complete Compliance Package
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b border-slate-200 mb-8">
        <nav className="flex space-x-8">
          {[
            { key: 'rng', label: 'RNG/Skill Documentation' },
            { key: 'fraud', label: 'Anti-Fraud Procedures' },
            { key: 'privacy', label: 'Privacy Compliance' },
            { key: 'postal', label: 'Free Entry System' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedSection(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedSection === tab.key
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* RNG Documentation */}
      {selectedSection === 'rng' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-xl border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Random Number Generation & Skill Documentation</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Method</h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800">
                    ✅ <strong>Cryptographically Secure RNG:</strong> Uses crypto.getRandomValues() 
                    (browser) or crypto.randomBytes() (server) - FIPS 140-2 compliant
                  </p>
                </div>
                <div className="mt-3 text-sm text-slate-600">
                  <p><strong>Technical Implementation:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>SHA-256 hashing for seed generation</li>
                    <li>External entropy from blockchain data (optional)</li>
                    <li>Pre-committed seeds published before draws</li>
                    <li>Mathematical proof of fairness available</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Independent Control</h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800">
                    ✅ <strong>Provably Fair System:</strong> All draws can be independently verified 
                    using published seeds and cryptographic proofs
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Video/Log Recording</h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800">
                    ✅ <strong>Comprehensive Audit Trail:</strong> All draws logged with cryptographic 
                    signatures, video recording capability enabled
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Anti-Fraud Documentation */}
      {selectedSection === 'fraud' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-xl border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Anti-Fraud Procedures</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">IP/Device Checking</h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 text-sm">✅ Implemented</p>
                  <ul className="text-sm text-green-700 mt-2 space-y-1">
                    <li>• IP address tracking and VPN detection</li>
                    <li>• Device fingerprinting (canvas, WebGL, audio)</li>
                    <li>• Multiple account detection per IP</li>
                    <li>• Geolocation verification</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Duplicate Detection</h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 text-sm">✅ Implemented</p>
                  <ul className="text-sm text-green-700 mt-2 space-y-1">
                    <li>• Email similarity detection</li>
                    <li>• Disposable email blocking</li>
                    <li>• Device sharing detection</li>
                    <li>• Payment method cross-referencing</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Transaction Limits</h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 text-sm">✅ Implemented</p>
                  <ul className="text-sm text-green-700 mt-2 space-y-1">
                    <li>• Per-minute rate limiting</li>
                    <li>• Daily spending limits</li>
                    <li>• Risk-adjusted limits</li>
                    <li>• Suspicious pattern detection</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Monitoring</h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 text-sm">✅ Implemented</p>
                  <ul className="text-sm text-green-700 mt-2 space-y-1">
                    <li>• Real-time fraud flag generation</li>
                    <li>• Risk scoring algorithms</li>
                    <li>• Admin dashboard for review</li>
                    <li>• Automated alert system</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Privacy Documentation */}
      {selectedSection === 'privacy' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-xl border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Privacy & GDPR Compliance</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Consent Management Platform (CMP)</h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800">✅ <strong>Compliant CMP:</strong> Opt-in consent required before any tracking pixels load</p>
                  <ul className="text-sm text-green-700 mt-2 space-y-1">
                    <li>• Granular consent controls (necessary, analytics, marketing)</li>
                    <li>• Pre-consent tracking pixel blocking</li>
                    <li>• Consent withdrawal mechanisms</li>
                    <li>• Audit trail of consent changes</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Data Protection Impact Assessment</h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800">✅ <strong>DPIA Completed:</strong> Comprehensive assessment of data processing risks</p>
                  <div className="mt-3">
                    <button
                      onClick={() => {
                        const report = gdprCompliance.generateComplianceReport()
                        const blob = new Blob([report], { type: 'application/json' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = 'dpia-assessment.json'
                        a.click()
                        URL.revokeObjectURL(url)
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Export DPIA Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Postal Entry Documentation */}
      {selectedSection === 'postal' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-xl border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Free Entry Postal System</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Equal Treatment Guarantee</h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800">✅ <strong>Same Deadlines:</strong> Postal entries must be received by same deadline as online entries</p>
                  <p className="text-green-800">✅ <strong>Same Chance:</strong> Postal entries receive exactly same winning probability</p>
                  <p className="text-green-800">✅ <strong>Same Draw:</strong> All entries (paid and free) participate in identical draw process</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Processing Procedures</h3>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="text-sm space-y-2">
                    <p><strong>1. Receipt Verification:</strong></p>
                    <ul className="list-disc list-inside ml-4 text-slate-700">
                      <li>Check postmark date against entry deadline</li>
                      <li>Verify postcard format (no envelopes)</li>
                      <li>Confirm legibility of all required information</li>
                    </ul>
                    
                    <p className="pt-2"><strong>2. Account Verification:</strong></p>
                    <ul className="list-disc list-inside ml-4 text-slate-700">
                      <li>Match participant details against registered DrawDash account</li>
                      <li>Verify name, email, and address consistency</li>
                      <li>Reject entries without matching accounts</li>
                    </ul>
                    
                    <p className="pt-2"><strong>3. Draw Integration:</strong></p>
                    <ul className="list-disc list-inside ml-4 text-slate-700">
                      <li>Assign ticket numbers from same pool as paid entries</li>
                      <li>Include in same cryptographic draw process</li>
                      <li>Apply same winner selection algorithm</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Audit Trail</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 text-sm">
                    Complete audit trail maintained for all postal entries including:
                  </p>
                  <ul className="text-sm text-blue-700 mt-2 space-y-1">
                    <li>• Receipt timestamps and processing status</li>
                    <li>• Verification outcomes and rejection reasons</li>
                    <li>• Ticket number assignments</li>
                    <li>• Integration with main draw audit system</li>
                  </ul>
                  
                  <button
                    onClick={() => {
                      const report = postalEntrySystem.exportPostalEntryReport()
                      const blob = new Blob([report], { type: 'application/json' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = 'postal-entry-audit.json'
                      a.click()
                      URL.revokeObjectURL(url)
                    }}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Export Postal Entry Audit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

function generateRNGDocumentation(): any {
  return {
    method: 'Cryptographically Secure Pseudo-Random Number Generator (CSPRNG)',
    implementation: 'crypto.getRandomValues() (Web Crypto API) / crypto.randomBytes() (Node.js)',
    standards: ['FIPS 140-2', 'NIST SP 800-90A'],
    seedGeneration: {
      sources: ['System entropy', 'Timestamp', 'External blockchain data (optional)'],
      publishing: 'Seeds pre-committed and published before draws',
      verification: 'All seeds and results cryptographically verifiable'
    },
    auditability: {
      logging: 'Complete audit trail with immutable timestamps',
      verification: 'Independent verification possible using published data',
      storage: 'Audit logs retained for minimum 7 years'
    },
    fairnessGuarantee: 'Mathematical proof of fairness - all participants have equal probability'
  }
}

function generateAntiFraudDocumentation(): any {
  return {
    ipChecking: {
      tracking: 'All user IP addresses logged and monitored',
      vpnDetection: 'Automated VPN/proxy detection with risk scoring',
      geolocation: 'IP geolocation verification against account data',
      multipleAccounts: 'Detection of multiple accounts from same IP'
    },
    deviceFingerprinting: {
      techniques: ['Canvas fingerprinting', 'WebGL fingerprinting', 'Audio fingerprinting'],
      purpose: 'Detect device sharing and multiple account creation',
      privacy: 'Fingerprints hashed and cannot be reverse-engineered to personal data'
    },
    duplicateDetection: {
      email: 'Detection of similar email addresses and disposable email services',
      payment: 'Cross-referencing payment methods across accounts',
      behavioral: 'Analysis of user behavior patterns for anomaly detection'
    },
    transactionMonitoring: {
      limits: 'Per-minute, hourly, and daily transaction limits',
      patterns: 'Automated detection of suspicious transaction patterns',
      riskScoring: 'Dynamic risk assessment based on user history',
      escalation: 'Automatic flagging for manual review when thresholds exceeded'
    },
    compliance: {
      dataRetention: 'Fraud data retained for 3 years for investigation purposes',
      reporting: 'Quarterly reports to management and annual regulatory reporting',
      staff: 'Trained staff for fraud investigation and resolution'
    }
  }
}

function generatePostalEntryDocumentation(): any {
  return {
    equalTreatment: {
      deadlines: 'Postal entries must be received by same deadline as online entries',
      probability: 'Free postal entries have exactly same winning probability as paid entries',
      drawProcess: 'All entries participate in identical cryptographic draw process'
    },
    processingProcedures: {
      receipt: 'All postcards logged with receipt timestamp and postmark verification',
      verification: 'Manual verification against registered user accounts required',
      integration: 'Verified entries assigned ticket numbers and entered into same draw pool',
      rejection: 'Clear criteria and audit trail for rejected entries'
    },
    qualityAssurance: {
      verification: 'Double-verification process for all postal entries',
      auditTrail: 'Complete documentation of processing decisions',
      appeals: 'Process for participants to appeal rejected entries',
      compliance: 'Regular review of postal entry procedures'
    },
    operationalDetails: {
      address: '7days Performance Ltd, PO Box 100, Attleborough, NR17 2YU, UK',
      processingTime: 'Entries processed within 24 hours of receipt',
      confirmation: 'Email confirmation sent to participants upon successful entry',
      backup: 'Physical postcard scanning and digital backup procedures'
    }
  }
}
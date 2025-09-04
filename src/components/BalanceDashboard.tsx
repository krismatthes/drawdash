'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { Balance, UserBalance, BalanceTransaction } from '@/lib/balanceService'
import { Payouts } from '@/lib/payoutService'

interface BalanceDashboardProps {
  showCompact?: boolean
  showActions?: boolean
}

export default function BalanceDashboard({ showCompact = false, showActions = true }: BalanceDashboardProps) {
  const { user } = useAuth()
  const [balance, setBalance] = useState<UserBalance | null>(null)
  const [transactions, setTransactions] = useState<BalanceTransaction[]>([])
  const [showPayoutModal, setShowPayoutModal] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'overview' | 'history' | 'methods'>('overview')

  useEffect(() => {
    if (user?.id) {
      loadBalanceData()
    }
  }, [user?.id])

  const loadBalanceData = () => {
    if (!user?.id) return
    
    const userBalance = Balance.getBalance(user.id)
    const userTransactions = Balance.getTransactions(user.id, 20)
    
    setBalance(userBalance)
    setTransactions(userTransactions)
  }

  const refreshBalance = () => {
    loadBalanceData()
  }

  if (!user || !balance) {
    return (
      <div className="bg-slate-50 rounded-lg p-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
      </div>
    )
  }

  const available = Balance.getAvailable(user.id)
  const limits = Payouts.getLimits(user.id)

  if (showCompact) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-900">Din Balance</h3>
          <button 
            onClick={refreshBalance}
            className="p-1 text-slate-500 hover:text-slate-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-lg font-bold text-green-600">
              {balance.cashBalance.toLocaleString('da-DK')} DKK
            </div>
            <div className="text-xs text-slate-500">Kontant</div>
          </div>
          
          <div>
            <div className="text-lg font-bold text-blue-600">
              {balance.bonusBalance.toLocaleString('da-DK')} DKK
            </div>
            <div className="text-xs text-slate-500">Bonus</div>
          </div>
          
          <div>
            <div className="text-lg font-bold text-purple-600">
              {balance.freeTickets}
            </div>
            <div className="text-xs text-slate-500">Gratis billetter</div>
          </div>
        </div>

        {balance.lockedBalance > 0 && (
          <div className="mt-3 p-2 bg-amber-100 border border-amber-200 rounded text-center">
            <div className="text-sm font-medium text-amber-800">
              {balance.lockedBalance.toLocaleString('da-DK')} DKK låst til udbetaling
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Balance Overview */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Din Balance</h2>
          <button 
            onClick={refreshBalance}
            className="p-2 text-slate-500 hover:text-slate-700 rounded-full hover:bg-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Cash Balance */}
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">💰</span>
              <span className="text-sm font-medium text-slate-600">Kontant Saldo</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {balance.cashBalance.toLocaleString('da-DK')} DKK
            </div>
            <div className="text-xs text-slate-500 mt-1">Kan hæves</div>
          </div>

          {/* Bonus Balance */}
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🎁</span>
              <span className="text-sm font-medium text-slate-600">Bonus Saldo</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {balance.bonusBalance.toLocaleString('da-DK')} DKK
            </div>
            <div className="text-xs text-slate-500 mt-1">Kun til køb</div>
          </div>

          {/* Free Tickets */}
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🎫</span>
              <span className="text-sm font-medium text-slate-600">Gratis Billetter</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {balance.freeTickets}
            </div>
            <div className="text-xs text-slate-500 mt-1">Brugebare billetter</div>
          </div>

          {/* Total Available */}
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">💎</span>
              <span className="text-sm font-medium text-slate-600">Total Tilgængelig</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {available.total.toLocaleString('da-DK')} DKK
            </div>
            <div className="text-xs text-slate-500 mt-1">Til køb</div>
          </div>
        </div>

        {/* Locked Balance Warning */}
        {balance.lockedBalance > 0 && (
          <div className="mt-4 p-3 bg-amber-100 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="font-medium text-amber-800">
                {balance.lockedBalance.toLocaleString('da-DK')} DKK er låst til udbetaling
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setShowPayoutModal(true)}
            disabled={balance.cashBalance < limits.single.min}
            className={`p-4 rounded-lg text-left transition-colors ${
              balance.cashBalance >= limits.single.min
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-slate-200 text-slate-500 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">💳</span>
              <div>
                <div className="font-semibold">Hæv Penge</div>
                <div className="text-sm opacity-90">
                  {balance.cashBalance >= limits.single.min 
                    ? `Min. ${limits.single.min} DKK`
                    : `Mindst ${limits.single.min} DKK påkrævet`
                  }
                </div>
              </div>
            </div>
          </button>

          <button
            disabled={true}
            className="p-4 rounded-lg text-left bg-slate-200 text-slate-500 cursor-not-allowed"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">💰</span>
              <div>
                <div className="font-semibold">Indskyd Penge</div>
                <div className="text-sm opacity-90">Kommer snart</div>
              </div>
            </div>
          </button>

          <button
            className="p-4 rounded-lg text-left bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            onClick={() => setSelectedTab('history')}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <div className="font-semibold">Historik</div>
                <div className="text-sm opacity-90">{transactions.length} transaktioner</div>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        {/* Tab Navigation */}
        <div className="border-b border-slate-200">
          <nav className="flex">
            {[
              { key: 'overview', label: 'Oversigt', icon: '📊' },
              { key: 'history', label: 'Historik', icon: '📋' },
              { key: 'methods', label: 'Udbetalingsmetoder', icon: '💳' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key as any)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  selectedTab === tab.key
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {selectedTab === 'overview' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">Balance Oversigt</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Balance Fordeling</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="text-sm text-slate-600">Kontant (kan hæves)</span>
                      <span className="font-medium text-green-600">
                        {balance.cashBalance.toLocaleString('da-DK')} DKK
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="text-sm text-slate-600">Bonus (kun køb)</span>
                      <span className="font-medium text-blue-600">
                        {balance.bonusBalance.toLocaleString('da-DK')} DKK
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="text-sm text-slate-600">Gratis billetter</span>
                      <span className="font-medium text-purple-600">
                        {balance.freeTickets} billetter
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Udbetalingsgrænser</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="text-sm text-slate-600">I dag brugt</span>
                      <span className="font-medium text-slate-900">
                        {limits.daily.current.toLocaleString('da-DK')} / {limits.daily.max.toLocaleString('da-DK')} DKK
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="text-sm text-slate-600">Per transaktion</span>
                      <span className="font-medium text-slate-900">
                        {limits.single.min.toLocaleString('da-DK')} - {limits.single.max.toLocaleString('da-DK')} DKK
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="border-t border-slate-200 pt-4 mt-4">
                <h4 className="text-sm font-medium text-slate-700 mb-2">Seneste Aktivitet</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-slate-900">
                      {transactions.filter(t => t.type === 'cash_prize').length}
                    </div>
                    <div className="text-xs text-slate-500">Cash gevinster</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-slate-900">
                      {transactions.filter(t => t.type === 'bonus_credit').length}
                    </div>
                    <div className="text-xs text-slate-500">Bonus credits</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-slate-900">
                      {transactions.filter(t => t.type === 'purchase').length}
                    </div>
                    <div className="text-xs text-slate-500">Køb</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-slate-900">
                      {transactions.filter(t => t.type === 'withdrawal').length}
                    </div>
                    <div className="text-xs text-slate-500">Udbetalinger</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* History Tab */}
          {selectedTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Transaktionshistorik</h3>
                <button
                  onClick={() => {
                    const data = Balance.export()
                    const blob = new Blob([data], { type: 'application/json' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `balance-history-${new Date().toISOString().split('T')[0]}.json`
                    a.click()
                    URL.revokeObjectURL(url)
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Eksporter →
                </button>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="text-4xl mb-2 block">📋</span>
                    <p className="text-slate-600">Ingen transaktioner endnu</p>
                  </div>
                ) : (
                  transactions.map((transaction, index) => (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 border rounded-lg ${
                        transaction.amount > 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">
                            {transaction.type === 'cash_prize' ? '🏆' :
                             transaction.type === 'bonus_credit' ? '🎁' :
                             transaction.type === 'free_tickets' ? '🎫' :
                             transaction.type === 'purchase' ? '🛍️' :
                             transaction.type === 'withdrawal' ? '💳' : '📊'}
                          </span>
                          <div>
                            <div className="font-medium text-slate-900">{transaction.description}</div>
                            <div className="text-sm text-slate-500">
                              {transaction.timestamp.toLocaleDateString('da-DK')} kl. {
                                transaction.timestamp.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })
                              } • {transaction.balanceType}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${
                            transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString('da-DK')} 
                            {transaction.balanceType === 'free_tickets' ? ' billetter' : ' DKK'}
                          </div>
                          <div className={`text-xs px-2 py-1 rounded-full ${
                            transaction.status === 'completed' ? 'bg-green-100 text-green-700' :
                            transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            transaction.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {transaction.status === 'completed' ? 'Gennemført' :
                             transaction.status === 'pending' ? 'Afventer' :
                             transaction.status === 'processing' ? 'Behandles' : 'Fejlet'}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Payment Methods Tab */}
          {selectedTab === 'methods' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Udbetalingsmetoder</h3>
                <button className="text-sm bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  + Tilføj Metode
                </button>
              </div>
              
              <div className="space-y-3">
                {Payouts.getMethods(user.id).map(method => (
                  <div key={method.id} className={`p-4 border rounded-lg ${
                    method.isDefault ? 'border-green-200 bg-green-50' : 'border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">
                          {method.type === 'bank_transfer' ? '🏦' :
                           method.type === 'mobilepay' ? '📱' : '💼'}
                        </span>
                        <div>
                          <div className="font-medium text-slate-900">{method.name}</div>
                          <div className="text-sm text-slate-500">
                            {method.type === 'bank_transfer' && method.details.accountNumber &&
                              `****${method.details.accountNumber.slice(-4)}`
                            }
                            {method.type === 'mobilepay' && method.details.mobilePayNumber}
                            {method.type === 'paypal' && method.details.paypalEmail}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {method.isVerified && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            Verificeret
                          </span>
                        )}
                        {method.isDefault && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            Standard
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {Payouts.getMethods(user.id).length === 0 && (
                  <div className="text-center py-8">
                    <span className="text-4xl mb-2 block">💳</span>
                    <p className="text-slate-600 mb-4">Ingen udbetalingsmetoder tilføjet</p>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Tilføj Din Første Metode
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper function to get balance type color
export function getBalanceTypeColor(type: 'cash' | 'bonus' | 'free_tickets'): string {
  switch (type) {
    case 'cash': return 'text-green-600'
    case 'bonus': return 'text-blue-600'
    case 'free_tickets': return 'text-purple-600'
    default: return 'text-slate-600'
  }
}

// Helper function to get transaction icon
export function getTransactionIcon(type: BalanceTransaction['type']): string {
  switch (type) {
    case 'cash_prize': return '🏆'
    case 'bonus_credit': return '🎁'
    case 'free_tickets': return '🎫'
    case 'purchase': return '🛍️'
    case 'withdrawal': return '💳'
    case 'deposit': return '💰'
    case 'transfer': return '🔄'
    case 'fee': return '📄'
    default: return '📊'
  }
}
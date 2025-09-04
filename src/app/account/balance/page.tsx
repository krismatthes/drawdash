'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import BalanceDashboard from '@/components/BalanceDashboard'
import PayoutRequestModal from '@/components/PayoutRequestModal'
import { Balance, BalanceTransaction } from '@/lib/balanceService'
import { Payouts, PayoutRequest } from '@/lib/payoutService'

export default function BalancePage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [showPayoutModal, setShowPayoutModal] = useState(false)
  const [payoutHistory, setPayoutHistory] = useState<PayoutRequest[]>([])
  const [selectedTab, setSelectedTab] = useState<'balance' | 'payouts' | 'history'>('balance')

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login?redirect=/account/balance')
        return
      }
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (user?.id) {
      loadPayoutHistory()
    }
  }, [user?.id])

  const loadPayoutHistory = () => {
    if (!user?.id) return
    const history = Payouts.getUserPayouts(user.id)
    setPayoutHistory(history)
  }

  const handlePayoutSuccess = () => {
    loadPayoutHistory()
    // Refresh balance dashboard will be handled by the dashboard component
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading balance...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const getPayoutStatusColor = (status: PayoutRequest['status']) => {
    switch (status) {
      case 'completed': return 'text-green-700 bg-green-100 border-green-200'
      case 'processing': return 'text-blue-700 bg-blue-100 border-blue-200'
      case 'pending': return 'text-yellow-700 bg-yellow-100 border-yellow-200'
      case 'rejected': return 'text-red-700 bg-red-100 border-red-200'
      case 'cancelled': return 'text-slate-700 bg-slate-100 border-slate-200'
      default: return 'text-slate-700 bg-slate-100 border-slate-200'
    }
  }

  const getPayoutStatusText = (status: PayoutRequest['status']) => {
    switch (status) {
      case 'completed': return 'Gennemført'
      case 'processing': return 'Behandles'
      case 'pending': return 'Afventer'
      case 'approved': return 'Godkendt'
      case 'rejected': return 'Afvist'
      case 'cancelled': return 'Annulleret'
      default: return status
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-900 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold text-sm">DD</span>
                </div>
                <span className="font-bold text-slate-900">DrawDash</span>
              </Link>
              <span className="text-slate-400">/</span>
              <span className="text-slate-600">Balance</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-slate-600">
                Hej, {user?.firstName}
              </div>
              <Link href="/account/profile">
                <div className="w-8 h-8 bg-slate-600 rounded-md flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {user?.firstName?.[0]?.toUpperCase()}
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Page Title */}
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Din Balance & Udbetalinger</h1>
            <p className="text-slate-600 mt-2">Administrer dine penge, bonusser og udbetalinger</p>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-slate-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'balance', label: 'Balance Oversigt', icon: '💰' },
                { key: 'payouts', label: 'Udbetalinger', icon: '💳' },
                { key: 'history', label: 'Fuld Historik', icon: '📊' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedTab(tab.key as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
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

          {/* Tab Content */}
          {selectedTab === 'balance' && (
            <BalanceDashboard showActions={true} />
          )}

          {selectedTab === 'payouts' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Udbetalingshistorik</h2>
                <button
                  onClick={() => setShowPayoutModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + Ny Udbetaling
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                {payoutHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="text-6xl mb-4 block">💳</span>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">Ingen udbetalinger endnu</h3>
                    <p className="text-slate-600 mb-6">
                      Når du vinder cash præmier kan du hæve dem direkte til din bankkonto
                    </p>
                    <button
                      onClick={() => setShowPayoutModal(true)}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Anmod om Udbetaling
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200">
                    {payoutHistory.map((payout, index) => (
                      <div key={payout.id} className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                              <span className="text-xl">
                                {payout.method.type === 'bank_transfer' ? '🏦' :
                                 payout.method.type === 'mobilepay' ? '📱' : '💼'}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-slate-900">
                                  {payout.netAmount.toLocaleString('da-DK')} DKK
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPayoutStatusColor(payout.status)}`}>
                                  {getPayoutStatusText(payout.status)}
                                </span>
                              </div>
                              <div className="text-sm text-slate-600">
                                {payout.method.name} • {payout.requestedAt.toLocaleDateString('da-DK')}
                              </div>
                              {payout.processingFee > 0 && (
                                <div className="text-xs text-slate-500">
                                  Gebyr: {payout.processingFee.toLocaleString('da-DK')} DKK
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-sm text-slate-600">
                              {payout.status === 'completed' && payout.completedAt
                                ? `Gennemført ${payout.completedAt.toLocaleDateString('da-DK')}`
                                : payout.status === 'processing' && payout.expectedTransferDate
                                ? `Forventet ${payout.expectedTransferDate.toLocaleDateString('da-DK')}`
                                : payout.status === 'pending'
                                ? 'Afventer behandling'
                                : 'Se detaljer'
                              }
                            </div>
                            {payout.status === 'pending' && (
                              <button
                                onClick={() => {
                                  if (confirm('Er du sikker på du vil annullere denne udbetaling?')) {
                                    const success = Payouts.cancelWithdrawal(payout.id, user!.id)
                                    if (success) {
                                      loadPayoutHistory()
                                    }
                                  }
                                }}
                                className="text-xs text-red-600 hover:text-red-700 mt-1"
                              >
                                Annuller
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedTab === 'history' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Komplet Transaktionshistorik</h2>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {Balance.getTransactions(user!.id, 100).map((transaction, index) => (
                  <div
                    key={transaction.id}
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
                           transaction.type === 'withdrawal' ? '💳' :
                           transaction.type === 'deposit' ? '💰' : '📊'}
                        </span>
                        <div>
                          <div className="font-medium text-slate-900">{transaction.description}</div>
                          <div className="text-sm text-slate-500">
                            {transaction.timestamp.toLocaleDateString('da-DK')} kl. {
                              transaction.timestamp.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })
                            } • {transaction.balanceType}
                          </div>
                          {transaction.metadata?.raffleId && (
                            <div className="text-xs text-slate-400 mt-1">
                              Lodtrækning ID: {transaction.metadata.raffleId}
                            </div>
                          )}
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
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Access Links */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Andre Kontofunktioner</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/account/profile">
              <div className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">👤</span>
                  <div>
                    <div className="font-medium text-slate-900">Profil</div>
                    <div className="text-sm text-slate-600">Rediger personlige oplysninger</div>
                  </div>
                </div>
              </div>
            </Link>
            
            <Link href="/account/tickets">
              <div className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎫</span>
                  <div>
                    <div className="font-medium text-slate-900">Mine Billetter</div>
                    <div className="text-sm text-slate-600">Se aktive lodtrækninger</div>
                  </div>
                </div>
              </div>
            </Link>
            
            <Link href="/account/winnings">
              <div className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <div className="font-medium text-slate-900">Mine Gevinster</div>
                    <div className="text-sm text-slate-600">Se alle gevinster</div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Payout Request Modal */}
      <PayoutRequestModal
        isOpen={showPayoutModal}
        onClose={() => setShowPayoutModal(false)}
        onSuccess={handlePayoutSuccess}
      />
    </div>
  )
}
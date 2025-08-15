'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Header from '@/components/Header'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { getUserEntries, getUserWinnings, getUserStats, UserEntry, UserWinning, UserStats } from '@/lib/mockUserData'

export default function AccountPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [activeTab, setActiveTab] = useState<'overview' | 'active' | 'history' | 'winnings' | 'settings'>('overview')
  const [userEntries, setUserEntries] = useState<UserEntry[]>([])
  const [userWinnings, setUserWinnings] = useState<UserWinning[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=' + encodeURIComponent('/account'))
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (user) {
      setUserEntries(getUserEntries(user.id))
      setUserWinnings(getUserWinnings(user.id))
      setUserStats(getUserStats(user.id))
    }
  }, [user])

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['overview', 'active', 'history', 'winnings', 'settings'].includes(tab)) {
      setActiveTab(tab as any)
    }
  }, [searchParams])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Indlæser...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  const activeEntries = userEntries.filter(entry => entry.status === 'active')
  const entryHistory = userEntries.filter(entry => entry.status === 'completed')

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('myAccount')}</h1>
          <p className="text-gray-600">Velkommen tilbage, {user.firstName}!</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex overflow-x-auto">
              {[
                { key: 'overview', label: t('accountOverview'), icon: '📊' },
                { key: 'active', label: t('activeEntries'), icon: '🎯' },
                { key: 'history', label: t('entryHistory'), icon: '📜' },
                { key: 'winnings', label: t('myWinnings'), icon: '🏆' },
                { key: 'settings', label: t('accountSettings'), icon: '⚙️' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.key
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && userStats && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">{t('accountOverview')}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600">{userStats.totalSpent.toLocaleString()} kr</div>
                    <div className="text-blue-700 text-sm">{t('totalSpent')}</div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600">{userStats.totalWon.toLocaleString()} kr</div>
                    <div className="text-green-700 text-sm">{t('totalWon')}</div>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-600">{userStats.totalEntries}</div>
                    <div className="text-purple-700 text-sm">{t('entriesCount')}</div>
                  </div>
                  
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-orange-600">{userStats.winRate.toFixed(1)}%</div>
                    <div className="text-orange-700 text-sm">{t('winRate')}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white border rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">{t('activeEntries')} ({activeEntries.length})</h3>
                    {activeEntries.length > 0 ? (
                      <div className="space-y-3">
                        {activeEntries.slice(0, 3).map(entry => (
                          <div key={entry.id} className="flex items-center space-x-3">
                            <div className="relative w-12 h-12">
                              <Image
                                src={entry.raffleImage}
                                alt={entry.raffleTitle}
                                fill
                                className="object-cover rounded"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{entry.raffleTitle}</p>
                              <p className="text-gray-500 text-xs">{entry.ticketCount} billetter</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">{t('noActiveEntries')}</p>
                    )}
                  </div>

                  <div className="bg-white border rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">{t('myWinnings')} ({userWinnings.length})</h3>
                    {userWinnings.length > 0 ? (
                      <div className="space-y-3">
                        {userWinnings.slice(0, 3).map(winning => (
                          <div key={winning.id} className="flex items-center space-x-3">
                            <div className="relative w-12 h-12">
                              <Image
                                src={winning.raffleImage}
                                alt={winning.raffleTitle}
                                fill
                                className="object-cover rounded"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{winning.raffleTitle}</p>
                              <p className="text-green-600 text-xs font-semibold">{winning.prizeValue} kr</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">{t('noWinnings')}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Active Entries Tab */}
            {activeTab === 'active' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">{t('activeEntries')}</h2>
                
                {activeEntries.length > 0 ? (
                  <div className="space-y-4">
                    {activeEntries.map(entry => (
                      <div key={entry.id} className="bg-white border rounded-lg p-4">
                        <div className="flex items-start space-x-4">
                          <div className="relative w-20 h-20">
                            <Image
                              src={entry.raffleImage}
                              alt={entry.raffleTitle}
                              fill
                              className="object-cover rounded-lg"
                            />
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{entry.raffleTitle}</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                              <div>
                                <span className="text-gray-500">{t('ticketsOwned')}:</span>
                                <p className="font-medium">{entry.ticketCount}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Billet numre:</span>
                                <p className="font-medium">{entry.ticketNumbers.join(', ')}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">{t('entryDate')}:</span>
                                <p className="font-medium">{entry.entryDate.toLocaleDateString('da-DK')}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Betalt:</span>
                                <p className="font-medium">{entry.amountPaid} kr</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              entry.result === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {t('pending')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">{t('noActiveEntries')}</p>
                  </div>
                )}
              </div>
            )}

            {/* Entry History Tab */}
            {activeTab === 'history' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">{t('entryHistory')}</h2>
                
                {entryHistory.length > 0 ? (
                  <div className="space-y-4">
                    {entryHistory.map(entry => (
                      <div key={entry.id} className="bg-white border rounded-lg p-4">
                        <div className="flex items-start space-x-4">
                          <div className="relative w-20 h-20">
                            <Image
                              src={entry.raffleImage}
                              alt={entry.raffleTitle}
                              fill
                              className="object-cover rounded-lg"
                            />
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{entry.raffleTitle}</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                              <div>
                                <span className="text-gray-500">{t('ticketsOwned')}:</span>
                                <p className="font-medium">{entry.ticketCount}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Billet numre:</span>
                                <p className="font-medium">{entry.ticketNumbers.join(', ')}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">{t('entryDate')}:</span>
                                <p className="font-medium">{entry.entryDate.toLocaleDateString('da-DK')}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Betalt:</span>
                                <p className="font-medium">{entry.amountPaid} kr</p>
                              </div>
                            </div>
                            {entry.winningAmount && (
                              <div className="mt-2">
                                <span className="text-green-600 font-semibold">
                                  Gevinst: {entry.winningAmount} kr
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="text-right">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              entry.result === 'won' 
                                ? 'bg-green-100 text-green-800'
                                : entry.result === 'lost'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {entry.result === 'won' ? t('won') : entry.result === 'lost' ? t('lost') : t('pending')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">{t('noEntryHistory')}</p>
                  </div>
                )}
              </div>
            )}

            {/* Winnings Tab */}
            {activeTab === 'winnings' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">{t('myWinnings')}</h2>
                
                {userWinnings.length > 0 ? (
                  <div className="space-y-4">
                    {userWinnings.map(winning => (
                      <div key={winning.id} className="bg-white border rounded-lg p-4">
                        <div className="flex items-start space-x-4">
                          <div className="relative w-20 h-20">
                            <Image
                              src={winning.raffleImage}
                              alt={winning.raffleTitle}
                              fill
                              className="object-cover rounded-lg"
                            />
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{winning.raffleTitle}</h3>
                            <p className="text-gray-600 mb-3">{winning.prizeDescription}</p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Vindende billet:</span>
                                <p className="font-medium">#{winning.winningTicketNumber}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">{t('winningAmount')}:</span>
                                <p className="font-medium text-green-600">{winning.prizeValue} kr</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Vundet dato:</span>
                                <p className="font-medium">{winning.wonDate.toLocaleDateString('da-DK')}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Status:</span>
                                <p className={`font-medium ${
                                  winning.status === 'claimed' ? 'text-green-600' : 'text-orange-600'
                                }`}>
                                  {winning.status === 'claimed' ? t('prizeClaimed') : t('pending')}
                                </p>
                              </div>
                            </div>
                            
                            {winning.claimedDate && (
                              <p className="text-sm text-gray-500 mt-2">
                                Hentet: {winning.claimedDate.toLocaleDateString('da-DK')}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">{t('noWinnings')}</p>
                    <p className="text-sm text-gray-400 mt-1">Held og lykke med dine fremtidige deltagelser!</p>
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">{t('accountSettings')}</h2>
                
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('personalInfo')}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fornavn
                      </label>
                      <input
                        type="text"
                        value={user.firstName}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Efternavn
                      </label>
                      <input
                        type="text"
                        value={user.lastName}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={user.email}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                      For at ændre dine personlige oplysninger, kontakt venligst kundeservice.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
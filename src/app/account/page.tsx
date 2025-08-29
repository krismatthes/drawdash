'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import PremiumHeader from '@/components/PremiumHeader'
import GradientMesh from '@/components/GradientMesh'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { getUserEntries, getUserWinnings, getUserStats, UserEntry, UserWinning, UserStats } from '@/lib/mockUserData'

function AccountContent() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [activeTab, setActiveTab] = useState<'overview' | 'active' | 'history' | 'winnings' | 'settings'>('overview')
  const [userEntries, setUserEntries] = useState<UserEntry[]>([])
  const [userWinnings, setUserWinnings] = useState<UserWinning[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  
  // Form state for editable user info
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [originalData, setOriginalData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Danmark'
  })
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Danmark'
  })

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
      
      // Update form data with user info
      const userData = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        postalCode: user.postalCode || '',
        country: user.country || 'Danmark'
      }
      setFormData(userData)
      setOriginalData(userData)
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
      <div className="min-h-screen relative">
        <GradientMesh variant="hero" />
        <PremiumHeader />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-slate-600">Indlæser...</p>
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

  // Check if there are unsaved changes
  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData)

  // Form handlers
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    // Basic validation
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      alert('Fornavn, efternavn og email er påkrævet felter.')
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      alert('Indtast venligst en gyldig email adresse.')
      return
    }

    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Here you would typically make an API call to update user data
      console.log('Saving user data:', formData)
      
      // Update original data to match current form data
      setOriginalData(formData)
      setIsEditing(false)
      // Show success message (you could use a toast library)
      alert('Dine oplysninger er blevet gemt!')
    } catch (error) {
      console.error('Error saving user data:', error)
      alert('Der opstod en fejl ved gemning af dine oplysninger. Prøv igen.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    // Reset form data to original data
    setFormData(originalData)
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <GradientMesh variant="hero" />
      <PremiumHeader />
      
      <main className="relative overflow-x-hidden">
        {/* Compact Hero Header */}
        <div className="relative py-8 sm:py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-3">
                {t('myAccount')}
              </h1>
              <p className="text-base sm:text-lg text-slate-600">
                Velkommen tilbage, <span className="bg-gradient-to-r from-blue-500 to-pink-400 bg-clip-text text-transparent font-semibold">{user.firstName}</span>!
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-8">

        {/* Premium Tab Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white/50 backdrop-blur-xl rounded-2xl p-2 shadow-lg border border-white/20">
            <nav className="flex overflow-x-auto scrollbar-hide gap-2">
              {[
                { key: 'overview', label: t('accountOverview') },
                { key: 'active', label: t('activeEntries') },
                { key: 'history', label: t('entryHistory') },
                { key: 'winnings', label: t('myWinnings') },
                { key: 'settings', label: t('accountSettings') }
              ].map((tab) => (
                <motion.button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`relative flex-shrink-0 px-4 sm:px-6 py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 ${
                    activeTab === tab.key
                      ? 'text-white shadow-lg'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {activeTab === tab.key && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-blue-500 to-pink-500 rounded-xl shadow-lg"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30
                      }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </motion.button>
              ))}
            </nav>
          </div>
        </motion.div>

        {/* Premium Tab Content */}
        <div className="card-premium p-6 sm:p-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && userStats && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">{t('accountOverview')}</h2>
                  <p className="text-sm sm:text-base text-slate-600">Din aktivitetsoversigt og statistik</p>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-blue-200/50">
                    <div className="text-lg sm:text-2xl font-bold text-blue-600 mb-1">{userStats.totalSpent.toLocaleString()} kr</div>
                    <div className="text-blue-700 text-xs sm:text-sm font-semibold">{t('totalSpent')}</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-green-200/50">
                    <div className="text-lg sm:text-2xl font-bold text-green-600 mb-1">{userStats.totalWon.toLocaleString()} kr</div>
                    <div className="text-green-700 text-xs sm:text-sm font-semibold">{t('totalWon')}</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-purple-200/50">
                    <div className="text-lg sm:text-2xl font-bold text-purple-600 mb-1">{userStats.totalEntries}</div>
                    <div className="text-purple-700 text-xs sm:text-sm font-semibold">{t('entriesCount')}</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-orange-200/50">
                    <div className="text-lg sm:text-2xl font-bold text-orange-600 mb-1">{userStats.winRate.toFixed(1)}%</div>
                    <div className="text-orange-700 text-xs sm:text-sm font-semibold">{t('winRate')}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="card-premium p-4 sm:p-5">
                    <h3 className="font-bold text-slate-900 mb-4 text-base sm:text-lg">{t('activeEntries')} ({activeEntries.length})</h3>
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
                      <p className="text-slate-500 text-sm">{t('noActiveEntries')}</p>
                    )}
                  </div>

                  <div className="card-premium p-4 sm:p-5">
                    <h3 className="font-bold text-slate-900 mb-4 text-base sm:text-lg">{t('myWinnings')} ({userWinnings.length})</h3>
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
                      <p className="text-slate-500 text-sm">{t('noWinnings')}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Active Entries Tab */}
            {activeTab === 'active' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">{t('activeEntries')}</h2>
                  <p className="text-sm sm:text-base text-slate-600">Dine aktive deltagelser i lodtrækninger</p>
                </div>
                
                {activeEntries.length > 0 ? (
                  <div className="space-y-4">
                    {activeEntries.map(entry => (
                      <div key={entry.id} className="card-premium p-4 sm:p-5 hover:shadow-lg transition-all duration-300">
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
                                <span className="text-slate-500 font-medium">Billet numre:</span>
                                <p className="font-bold text-slate-900">{entry.ticketNumbers.join(', ')}</p>
                              </div>
                              <div>
                                <span className="text-slate-500 font-medium">{t('entryDate')}:</span>
                                <p className="font-bold text-slate-900">{entry.entryDate.toLocaleDateString('da-DK')}</p>
                              </div>
                              <div>
                                <span className="text-slate-500 font-medium">Betalt:</span>
                                <p className="font-bold text-slate-900">{entry.amountPaid} kr</p>
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
                  <div className="text-center py-8 sm:py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500/10 to-pink-500/10 rounded-full flex items-center justify-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-pink-500 rounded-full opacity-20"></div>
                    </div>
                    <p className="text-slate-500 text-base sm:text-lg font-medium">{t('noActiveEntries')}</p>
                    <p className="text-slate-400 text-sm mt-2">Deltag i en lodtrækning for at se den her</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Entry History Tab */}
            {activeTab === 'history' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">{t('entryHistory')}</h2>
                  <p className="text-sm sm:text-base text-slate-600">Historik over dine tidligere deltagelser</p>
                </div>
                
                {entryHistory.length > 0 ? (
                  <div className="space-y-4">
                    {entryHistory.map(entry => (
                      <div key={entry.id} className="card-premium p-4 sm:p-5 hover:shadow-lg transition-all duration-300">
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
                                <span className="text-slate-500 font-medium">Billet numre:</span>
                                <p className="font-bold text-slate-900">{entry.ticketNumbers.join(', ')}</p>
                              </div>
                              <div>
                                <span className="text-slate-500 font-medium">{t('entryDate')}:</span>
                                <p className="font-bold text-slate-900">{entry.entryDate.toLocaleDateString('da-DK')}</p>
                              </div>
                              <div>
                                <span className="text-slate-500 font-medium">Betalt:</span>
                                <p className="font-bold text-slate-900">{entry.amountPaid} kr</p>
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
                  <div className="text-center py-8 sm:py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-slate-500/10 to-slate-600/10 rounded-full flex items-center justify-center">
                      <div className="w-8 h-1 bg-gradient-to-r from-slate-400 to-slate-500 rounded-full opacity-40"></div>
                    </div>
                    <p className="text-slate-500 text-base sm:text-lg font-medium">{t('noEntryHistory')}</p>
                    <p className="text-slate-400 text-sm mt-2">Din historik vises her når du har deltaget</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Winnings Tab */}
            {activeTab === 'winnings' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">{t('myWinnings')}</h2>
                  <p className="text-sm sm:text-base text-slate-600">Dine vundne præmier og gevinster</p>
                </div>
                
                {userWinnings.length > 0 ? (
                  <div className="space-y-4">
                    {userWinnings.map(winning => (
                      <div key={winning.id} className="card-premium p-4 sm:p-5 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-green-50 to-emerald-50">
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
                  <div className="text-center py-8 sm:py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-full flex items-center justify-center">
                      <div className="w-6 h-6 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full opacity-30"></div>
                    </div>
                    <p className="text-slate-500 text-base sm:text-lg font-medium">{t('noWinnings')}</p>
                    <p className="text-slate-400 text-sm mt-2">Held og lykke med dine fremtidige deltagelser!</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">{t('accountSettings')}</h2>
                  <p className="text-sm sm:text-base text-slate-600">Administrer dine personlige oplysninger</p>
                </div>
                
                <div className="card-premium p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900">{t('personalInfo')}</h3>
                    <div className="flex items-center gap-3">
                      {!isEditing && (
                        <motion.button
                          onClick={() => setIsEditing(true)}
                          className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-all duration-300"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Rediger oplysninger
                        </motion.button>
                      )}
                      {isEditing && hasChanges && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-3"
                      >
                        <motion.button
                          onClick={handleCancel}
                          className="px-4 py-2 border border-slate-300 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all duration-300"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Fortryd
                        </motion.button>
                        <motion.button
                          onClick={handleSave}
                          disabled={isSaving}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl text-sm font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                          whileHover={{ scale: isSaving ? 1 : 1.05 }}
                          whileTap={{ scale: isSaving ? 1 : 0.95 }}
                        >
                          {isSaving ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Gemmer...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Gem ændringer
                            </>
                          )}
                        </motion.button>
                      </motion.div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Personal Info Section */}
                    <div>
                      <h4 className="text-base font-semibold text-slate-800 mb-4">Personlige oplysninger</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Fornavn *
                          </label>
                          <input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl font-medium transition-all duration-300 bg-white hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Efternavn *
                          </label>
                          <input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl font-medium transition-all duration-300 bg-white hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                          />
                        </div>
                        
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Email *
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl font-medium transition-all duration-300 bg-white hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                          />
                        </div>
                        
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Telefonnummer
                          </label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            readOnly={!isEditing}
                            placeholder="Indtast dit telefonnummer"
                            className={`w-full px-4 py-3 border rounded-xl font-medium transition-all duration-300 ${
                              isEditing 
                                ? 'border-slate-300 bg-white hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none' 
                                : 'border-slate-200 bg-slate-50'
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Address Section */}
                    <div>
                      <h4 className="text-base font-semibold text-slate-800 mb-4">Adresse oplysninger</h4>
                      <div className="grid grid-cols-1 gap-4 sm:gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Adresse
                          </label>
                          <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            readOnly={!isEditing}
                            placeholder="Indtast din adresse"
                            className={`w-full px-4 py-3 border rounded-xl font-medium transition-all duration-300 ${
                              isEditing 
                                ? 'border-slate-300 bg-white hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none' 
                                : 'border-slate-200 bg-slate-50'
                            }`}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              Postnummer
                            </label>
                            <input
                              type="text"
                              value={formData.postalCode}
                              onChange={(e) => handleInputChange('postalCode', e.target.value)}
                              readOnly={!isEditing}
                              placeholder="0000"
                              className={`w-full px-4 py-3 border rounded-xl font-medium transition-all duration-300 ${
                                isEditing 
                                  ? 'border-slate-300 bg-white hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none' 
                                  : 'border-slate-200 bg-slate-50'
                              }`}
                            />
                          </div>
                          
                          <div className="sm:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              By
                            </label>
                            <input
                              type="text"
                              value={formData.city}
                              onChange={(e) => handleInputChange('city', e.target.value)}
                              readOnly={!isEditing}
                              placeholder="Indtast din by"
                              className={`w-full px-4 py-3 border rounded-xl font-medium transition-all duration-300 ${
                                isEditing 
                                  ? 'border-slate-300 bg-white hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none' 
                                  : 'border-slate-200 bg-slate-50'
                              }`}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Land
                          </label>
                          <select
                            value={formData.country}
                            onChange={(e) => handleInputChange('country', e.target.value)}
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl font-medium transition-all duration-300 bg-white hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none cursor-pointer"
                          >
                            <option value="Danmark">Danmark</option>
                            <option value="Sverige">Sverige</option>
                            <option value="Norge">Norge</option>
                            <option value="Tyskland">Tyskland</option>
                            <option value="Andre">Andre</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {!hasChanges && (
                    <div className="mt-8 pt-6 border-t border-slate-200">
                      <p className="text-sm text-slate-500 flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Rediger felterne ovenfor og gem dine ændringer når du er færdig.
                      </p>
                    </div>
                  )}
                  
                  {hasChanges && (
                    <div className="mt-8 pt-6 border-t border-orange-200 bg-orange-50/30 -mx-4 px-4 -mb-4 pb-4 sm:-mx-6 sm:px-6 sm:-mb-6 sm:pb-6 rounded-b-xl">
                      <p className="text-sm text-orange-700 flex items-center gap-2">
                        <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        Du har ugemte ændringer. Klik på "Gem ændringer" for at gemme eller "Fortryd" for at annullere.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
        </div>
        </div>
      </main>
    </div>
  )
}

export default function AccountPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen relative">
        <GradientMesh variant="hero" />
        <PremiumHeader />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-slate-600">Indlæser konto...</p>
          </div>
        </div>
      </div>
    }>
      <AccountContent />
    </Suspense>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { raffleService } from '@/lib/raffleService'
import { Raffle } from '@/types/raffle'

export default function RaffleDetail({ params }: { params: Promise<{ id: string }> }) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [raffle, setRaffle] = useState<Raffle | null>(null)
  const [activity, setActivity] = useState<any[]>([])
  const [showWinnerDialog, setShowWinnerDialog] = useState(false)
  const [selectedWinner, setSelectedWinner] = useState<any>(null)
  const [raffleId, setRaffleId] = useState<string>('')

  // Handle async params
  useEffect(() => {
    params.then((resolvedParams) => {
      setRaffleId(resolvedParams.id)
      setActivity(raffleService.getActivity(resolvedParams.id))
    })
  }, [params])

  // Load raffle data
  useEffect(() => {
    if (!raffleId) return

    const loadRaffle = () => {
      const raffleData = raffleService.getRaffleById(raffleId)
      setRaffle(raffleData)
      if (!raffleData) {
        router.push('/admin/raffles')
      }
    }

    loadRaffle()
    const interval = setInterval(loadRaffle, 5000) // Refresh every 5 seconds

    return () => clearInterval(interval)
  }, [raffleId, router])

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login?redirect=/admin/raffles')
        return
      }
      if (!user?.isAdmin) {
        router.push('/')
        return
      }
    }
  }, [isLoading, isAuthenticated, user?.isAdmin, router])

  const handleSelectWinner = () => {
    if (!raffle) return

    const result = raffleService.selectWinner(raffle.id)
    setSelectedWinner(result)
    setShowWinnerDialog(true)
    
    // Reload raffle and activity data
    const updatedRaffle = raffleService.getRaffleById(raffleId)
    setRaffle(updatedRaffle)
    setActivity(raffleService.getActivity(raffleId))
  }

  const handleStatusChange = (newStatus: Raffle['status']) => {
    if (!raffle) return

    raffleService.updateRaffle(raffle.id, { status: newStatus })
    const updatedRaffle = raffleService.getRaffleById(raffleId)
    setRaffle(updatedRaffle)
    setActivity(raffleService.getActivity(raffleId))
  }

  const handleDeleteRaffle = () => {
    if (!raffle) return

    if (confirm(`Er du sikker på at du vil slette "${raffle.title}"?`)) {
      raffleService.deleteRaffle(raffle.id)
      router.push('/admin/raffles')
    }
  }

  const exportData = () => {
    if (!raffle) return

    const data = raffleService.exportRaffleData(raffle.id)
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `raffle-${raffle.id}-export.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Show loading
  if (isLoading || !raffle) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if not admin (will redirect)
  if (!isAuthenticated || !user?.isAdmin) {
    return null
  }

  const progressPercentage = (raffle.soldTickets / raffle.totalTickets) * 100
  const revenue = raffle.soldTickets * raffle.ticketPrice
  const daysLeft = Math.ceil((new Date(raffle.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  const getStatusColor = (status: Raffle['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'ended': return 'bg-gray-100 text-gray-800'
      case 'upcoming': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: Raffle['status']) => {
    switch (status) {
      case 'active': return 'Aktiv'
      case 'ended': return 'Afsluttet'
      case 'upcoming': return 'Kommende'
      default: return status
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg border-r border-slate-200">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b border-slate-200 px-4">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">DD</span>
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">DrawDash</div>
                <div className="text-xs text-slate-500">Admin Panel</div>
              </div>
            </Link>
          </div>
          
          {/* Navigation */}
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
              
              <Link href="/admin/raffles">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200 px-3 py-2.5 text-sm font-medium rounded-xl flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 0v1m-2 0V6a2 2 0 00-2 0v1m2 0V9.5m0 0v3m0-3h3m-3 0h-3m-2-5a9 9 0 1118 0 9 9 0 01-18 0z" />
                  </svg>
                  Lodtrækninger
                  <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full" />
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
              
              <Link href="/admin/finance">
                <div className="text-slate-600 hover:bg-slate-50 hover:text-slate-900 px-3 py-2.5 text-sm font-medium rounded-xl flex items-center gap-3 transition-colors">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Finans
                </div>
              </Link>
              
              <Link href="/admin/faq">
                <div className="text-slate-600 hover:bg-slate-50 hover:text-slate-900 px-3 py-2.5 text-sm font-medium rounded-xl flex items-center gap-3 transition-colors">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  FAQ
                </div>
              </Link>
            </div>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <Link href="/admin/raffles" className="text-slate-600 hover:text-slate-900">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{raffle.emoji}</span>
              <span className="text-sm text-slate-600 font-medium">{raffle.title}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/admin/raffles/${raffle.id}/edit`}>
              <button className="px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200">
                Rediger
              </button>
            </Link>
            <button
              onClick={exportData}
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Eksporter Data
            </button>
          </div>
        </div>

        <main className="px-6 py-8">
          <div className="space-y-8">
            {/* Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Info */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                  <div className="flex items-start gap-6">
                    <img
                      src={raffle.image}
                      alt={raffle.title}
                      className="w-32 h-32 object-cover rounded-xl"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h1 className="text-2xl font-bold text-slate-900 mb-2">{raffle.title}</h1>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(raffle.status)}`}>
                              {getStatusText(raffle.status)}
                            </span>
                            {raffle.isInstantWin && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                ⚡ Instant Win
                              </span>
                            )}
                            <span className="text-sm text-slate-500">{raffle.category}</span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-slate-600 mb-4">{raffle.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-slate-500">Slutdato</div>
                          <div className="font-semibold">
                            {new Date(raffle.endDate).toLocaleString('da-DK')}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-500">Dage tilbage</div>
                          <div className="font-semibold">
                            {daysLeft > 0 ? `${daysLeft} dage` : 'Udløbet'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Prize Info */}
                <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">💎 Præmie Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-slate-600">Præmie</div>
                      <div className="text-xl font-bold text-green-600">{raffle.prize.name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-600">Salgsværdi</div>
                      <div className="text-xl font-bold text-green-600">
                        {raffle.prize.value.toLocaleString('da-DK')} kr
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-600">Indkøbspris</div>
                      <div className="text-lg font-semibold text-slate-700">
                        {raffle.prize.cost ? raffle.prize.cost.toLocaleString('da-DK') : 'N/A'} kr
                      </div>
                      {raffle.prize.cost && raffle.prize.cost > 0 && (
                        <div className="text-sm text-green-600 font-medium">
                          {(((raffle.prize.value - raffle.prize.cost) / raffle.prize.cost) * 100).toFixed(1)}% markup
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-sm text-slate-600 mb-1">Beskrivelse</div>
                    <div className="text-slate-900">{raffle.prize.description}</div>
                  </div>
                  
                  {/* Prize Images */}
                  {raffle.prize.images && raffle.prize.images.length > 0 && (
                    <div className="mt-4">
                      <div className="text-sm text-slate-600 mb-2">Præmie Billeder</div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {raffle.prize.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`${raffle.prize.name} ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg border border-green-200"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Panel */}
              <div className="space-y-6">
                {/* Key Stats */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">📊 Statistik</h2>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">Solgte billetter</span>
                        <span className="font-semibold">{Math.round(progressPercentage)}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm mt-1 text-slate-500">
                        <span>{raffle.soldTickets}</span>
                        <span>{raffle.totalTickets}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-600">{revenue.toLocaleString('da-DK')}</div>
                        <div className="text-xs text-slate-600">Omsætning (kr)</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">{raffle.participants}</div>
                        <div className="text-xs text-slate-600">Deltagere</div>
                      </div>
                    </div>

                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">{raffle.ticketPrice} kr</div>
                      <div className="text-xs text-slate-600">Pris per billet</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">⚡ Handlinger</h2>
                  <div className="space-y-3">
                    {raffle.status === 'active' && raffle.soldTickets > 0 && (
                      <button
                        onClick={handleSelectWinner}
                        className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-3 rounded-lg font-semibold hover:from-yellow-600 hover:to-orange-600"
                      >
                        🎲 Vælg Vinder
                      </button>
                    )}

                    <div className="flex gap-2">
                      {raffle.status !== 'active' && (
                        <button
                          onClick={() => handleStatusChange('active')}
                          className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600"
                        >
                          Aktivér
                        </button>
                      )}
                      {raffle.status === 'active' && (
                        <button
                          onClick={() => handleStatusChange('ended')}
                          className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-600"
                        >
                          Afslut
                        </button>
                      )}
                    </div>

                    <button
                      onClick={handleDeleteRaffle}
                      className="w-full bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600"
                    >
                      🗑️ Slet Lodtrækning
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Log */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">📝 Aktivitetslog</h2>
              <div className="space-y-3">
                {activity.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    Ingen aktivitet endnu
                  </div>
                ) : (
                  activity.slice(0, 10).map((log, index) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {log.adminUser[0]?.toUpperCase() || 'A'}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-900">{log.details}</div>
                        <div className="text-xs text-slate-500">
                          {new Date(log.timestamp).toLocaleString('da-DK')} • {log.adminUser}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Winner Dialog */}
      {showWinnerDialog && selectedWinner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-8 max-w-md w-full"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Vinder Udvalgt!</h2>
              
              {selectedWinner.winner ? (
                <div className="space-y-3">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="text-lg font-semibold text-green-900">
                      Vinderens billet: #{selectedWinner.winningTicket}
                    </div>
                    <div className="text-sm text-green-700">
                      Bruger ID: {selectedWinner.winner.userId}
                    </div>
                  </div>
                  <p className="text-slate-600">
                    Vinderen er blevet udvalgt og lodtrækningen er afsluttet.
                  </p>
                </div>
              ) : (
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="text-red-900 font-semibold">Ingen vinder fundet</div>
                  <div className="text-red-700 text-sm">Der er ingen billetter solgt til denne lodtrækning.</div>
                </div>
              )}

              <button
                onClick={() => setShowWinnerDialog(false)}
                className="mt-6 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
              >
                Luk
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
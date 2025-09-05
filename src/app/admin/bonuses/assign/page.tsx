'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { bonusRewardService, BonusReward, UserBonus } from '@/lib/bonusRewardService'

function AssignBonusContent() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [bonuses, setBonuses] = useState<BonusReward[]>([])
  const [selectedBonusId, setSelectedBonusId] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [assignmentReason, setAssignmentReason] = useState('')
  const [customExpiryDays, setCustomExpiryDays] = useState('')
  const [bulkMode, setBulkMode] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [assignmentResult, setAssignmentResult] = useState<{
    successful: UserBonus[]
    failed: { userId: string, error: string }[]
  } | null>(null)

  // Mock users data - in production this would come from API
  const mockUsers = [
    { id: 'user_1', name: 'Test Bruger', email: 'test@test.dk', totalSpent: 12500, points: 17500, lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), loyaltyTier: 'gold' },
    { id: 'user_2', name: 'John Hansen', email: 'john@test.dk', totalSpent: 500, points: 450, lastLogin: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000), loyaltyTier: 'bronze' },
    { id: 'user_3', name: 'Sarah Nielsen', email: 'sarah@test.dk', totalSpent: 8500, points: 9200, lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), loyaltyTier: 'silver' },
    { id: 'user_4', name: 'Mike Larsen', email: 'mike@test.dk', totalSpent: 25000, points: 35000, lastLogin: new Date(Date.now() - 3 * 60 * 60 * 1000), loyaltyTier: 'diamond' },
    { id: 'user_5', name: 'Emma Andersen', email: 'emma@test.dk', totalSpent: 150, points: 120, lastLogin: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), loyaltyTier: 'bronze' }
  ]

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user?.isAdmin) {
        router.push('/login?redirect=/admin/bonuses/assign')
        return
      }
    }
  }, [isLoading, isAuthenticated, user?.isAdmin, router])

  useEffect(() => {
    const allBonuses = bonusRewardService.getAllBonuses().filter(bonus => bonus.isActive)
    setBonuses(allBonuses)

    // Check for template parameter
    const template = searchParams.get('template')
    if (template && allBonuses.length > 0) {
      const templateBonus = allBonuses.find(bonus => 
        bonus.name.toLowerCase().includes(template.toLowerCase())
      )
      if (templateBonus) {
        setSelectedBonusId(templateBonus.id)
      }
    }
  }, [searchParams])

  const filteredUsers = mockUsers.filter(user =>
    !userSearchQuery ||
    user.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearchQuery.toLowerCase())
  )

  const selectedBonus = bonuses.find(bonus => bonus.id === selectedBonusId)

  const getEligibleUsers = () => {
    if (!selectedBonus) return []
    
    return mockUsers.filter(user => {
      const daysSinceLastLogin = Math.floor((Date.now() - user.lastLogin.getTime()) / (1000 * 60 * 60 * 24))
      const daysSinceRegistration = 30 // Mock data
      
      const userProfile = {
        totalSpent: user.totalSpent,
        points: user.points,
        lastLoginDays: daysSinceLastLogin,
        registrationDays: daysSinceRegistration,
        loyaltyTier: user.loyaltyTier
      }
      
      const eligibleBonuses = bonusRewardService.getEligibleBonusesForUser(user.id, userProfile)
      return eligibleBonuses.some(bonus => bonus.id === selectedBonusId)
    })
  }

  const eligibleUsers = getEligibleUsers()

  const handleUserSelect = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev.filter(id => id !== userId), userId])
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId))
    }
  }

  const selectEligibleUsers = () => {
    setSelectedUsers(eligibleUsers.map(user => user.id))
  }

  const handleAssignment = () => {
    if (!selectedBonusId) {
      alert('Vælg en bonus')
      return
    }
    
    if (selectedUsers.length === 0) {
      alert('Vælg mindst én bruger')
      return
    }

    if (!assignmentReason.trim()) {
      alert('Indtast grund til tildeling')
      return
    }

    try {
      if (selectedUsers.length === 1) {
        // Single assignment
        const assigned = bonusRewardService.assignBonusToUser(
          selectedBonusId,
          selectedUsers[0],
          user?.firstName + ' ' + user?.lastName || 'Admin',
          customExpiryDays ? parseInt(customExpiryDays) : undefined,
          assignmentReason
        )
        
        if (assigned) {
          setAssignmentResult({
            successful: [assigned],
            failed: []
          })
        }
      } else {
        // Bulk assignment
        const result = bonusRewardService.bulkAssignBonus(
          selectedBonusId,
          selectedUsers,
          user?.firstName + ' ' + user?.lastName || 'Admin',
          assignmentReason
        )
        
        setAssignmentResult(result)
      }
    } catch (error) {
      alert('Fejl ved tildeling: ' + (error instanceof Error ? error.message : 'Ukendt fejl'))
    }
  }

  const resetForm = () => {
    setSelectedBonusId('')
    setSelectedUsers([])
    setAssignmentReason('')
    setCustomExpiryDays('')
    setAssignmentResult(null)
    setPreviewMode(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading bonus assignment...</p>
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
              <h1 className="text-xl font-bold text-slate-900">Tildel Bonus</h1>
              <p className="text-slate-600">Tildel bonusser til udvalgte brugere</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={bulkMode}
                onChange={(e) => setBulkMode(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
              />
              <span className="text-sm text-slate-700">Bulk Mode</span>
            </label>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {!assignmentResult ? (
          <div className="space-y-6">
            {/* Step 1: Select Bonus */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
            >
              <h2 className="text-lg font-semibold text-slate-900 mb-4">1. Vælg Bonus</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bonuses.map(bonus => (
                  <button
                    key={bonus.id}
                    type="button"
                    onClick={() => setSelectedBonusId(bonus.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-colors ${
                      selectedBonusId === bonus.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
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
                        <div className="text-sm text-slate-500">{bonus.description}</div>
                      </div>
                    </div>
                    <div className="text-sm text-blue-600 font-medium">
                      Værdi: {bonus.value}{' '}
                      {bonus.type === 'points' && 'points'}
                      {bonus.type === 'free_tickets' && 'billetter'}
                      {bonus.type === 'cashback' && '%'}
                      {bonus.type === 'multiplier' && 'x'}
                      {bonus.type === 'free_entry' && 'entries'}
                      {bonus.type === 'discount' && '%'}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {bonus.targetGroups.map(group => (
                        <span
                          key={group}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600"
                        >
                          {group === 'new_users' && 'Nye'}
                          {group === 'inactive_users' && 'Inaktive'}
                          {group === 'vip_users' && 'VIP'}
                          {group === 'all_users' && 'Alle'}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Step 2: Select Users */}
            {selectedBonusId && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-900">2. Vælg Brugere</h2>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-600">
                      {eligibleUsers.length} brugere er berettigede
                    </span>
                    <button
                      type="button"
                      onClick={selectEligibleUsers}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Vælg Alle Berettigede
                    </button>
                  </div>
                </div>
                
                <div className="mb-4">
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Søg brugere..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-1 gap-3">
                    {filteredUsers.map(mockUser => {
                      const isEligible = eligibleUsers.some(eu => eu.id === mockUser.id)
                      const isSelected = selectedUsers.includes(mockUser.id)
                      const daysSinceLastLogin = Math.floor((Date.now() - mockUser.lastLogin.getTime()) / (1000 * 60 * 60 * 24))
                      
                      return (
                        <label
                          key={mockUser.id}
                          className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50'
                              : isEligible
                                ? 'border-green-200 bg-green-50 hover:bg-green-100'
                                : 'border-slate-200 bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleUserSelect(mockUser.id, e.target.checked)}
                            disabled={!isEligible}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                          />
                          
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">
                              {mockUser.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-900">{mockUser.name}</span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                mockUser.loyaltyTier === 'bronze' ? 'bg-orange-100 text-orange-800' :
                                mockUser.loyaltyTier === 'silver' ? 'bg-slate-100 text-slate-800' :
                                mockUser.loyaltyTier === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-purple-100 text-purple-800'
                              }`}>
                                {mockUser.loyaltyTier}
                              </span>
                              {!isEligible && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  Ikke berettiget
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-slate-500">
                              {mockUser.email} • {mockUser.totalSpent.toLocaleString('da-DK')} kr brugt • {mockUser.points.toLocaleString('da-DK')} points
                            </div>
                            <div className="text-xs text-slate-400">
                              Sidste login: {daysSinceLastLogin === 0 ? 'I dag' : `${daysSinceLastLogin} dage siden`}
                            </div>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </div>
                
                {selectedUsers.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>{selectedUsers.length}</strong> brugere valgt til tildeling
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 3: Assignment Details */}
            {selectedBonusId && selectedUsers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
              >
                <h2 className="text-lg font-semibold text-slate-900 mb-4">3. Tildeling Detaljer</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Grund til Tildeling *
                    </label>
                    <input
                      type="text"
                      value={assignmentReason}
                      onChange={(e) => setAssignmentReason(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="F.eks. Velkomstbonus, Reaktivering, Special event"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Custom Udløb (dage)
                    </label>
                    <input
                      type="number"
                      value={customExpiryDays}
                      onChange={(e) => setCustomExpiryDays(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={`Standard: ${selectedBonus?.restrictions.validForDays} dage`}
                      min="1"
                    />
                  </div>
                </div>
                
                {/* Preview */}
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Tildeling Preview</h3>
                  <div className="text-sm text-blue-800">
                    <p><strong>Bonus:</strong> {selectedBonus?.name}</p>
                    <p><strong>Værdi:</strong> {selectedBonus?.value} {selectedBonus?.type}</p>
                    <p><strong>Modtagere:</strong> {selectedUsers.length} brugere</p>
                    <p><strong>Udløber:</strong> {customExpiryDays ? customExpiryDays : selectedBonus?.restrictions.validForDays} dage</p>
                    <p><strong>Grund:</strong> {assignmentReason || 'Ikke angivet'}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setPreviewMode(!previewMode)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    {previewMode ? 'Skjul Preview' : 'Vis Preview'}
                  </button>
                  <button
                    type="button"
                    onClick={handleAssignment}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Tildel Bonus
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          /* Assignment Result */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
          >
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Tildeling Resultat</h2>
            
            {assignmentResult.successful.length > 0 && (
              <div className="mb-6">
                <h3 className="text-md font-medium text-green-800 mb-3">
                  ✅ Succesfuldt Tildelt ({assignmentResult.successful.length})
                </h3>
                <div className="space-y-2">
                  {assignmentResult.successful.map(userBonus => {
                    const mockUser = mockUsers.find(u => u.id === userBonus.userId)
                    return (
                      <div key={userBonus.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {mockUser?.name.split(' ').map(n => n[0]).join('') || '?'}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900">{mockUser?.name || userBonus.userId}</div>
                            <div className="text-xs text-slate-500">
                              Bonus: {userBonus.bonusSnapshot.name} • Udløber: {userBonus.expiresAt.toLocaleDateString('da-DK')}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-green-600">
                          {userBonus.bonusSnapshot.value} {userBonus.bonusSnapshot.type}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            
            {assignmentResult.failed.length > 0 && (
              <div className="mb-6">
                <h3 className="text-md font-medium text-red-800 mb-3">
                  ❌ Fejlede Tildelinger ({assignmentResult.failed.length})
                </h3>
                <div className="space-y-2">
                  {assignmentResult.failed.map(failure => {
                    const mockUser = mockUsers.find(u => u.id === failure.userId)
                    return (
                      <div key={failure.userId} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {mockUser?.name.split(' ').map(n => n[0]).join('') || '?'}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900">{mockUser?.name || failure.userId}</div>
                            <div className="text-xs text-red-600">{failure.error}</div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Tildel Flere
              </button>
              <Link href="/admin/bonuses">
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Tilbage til Oversigt
                </button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Quick Actions Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="fixed right-6 top-1/2 transform -translate-y-1/2 w-64 bg-white rounded-xl p-4 shadow-lg border border-slate-200"
        >
          <h3 className="font-medium text-slate-900 mb-3">Hurtige Handlinger</h3>
          <div className="space-y-2">
            <Link href="/admin/bonuses/bulk">
              <button className="w-full px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                Bulk Tildeling
              </button>
            </Link>
            <Link href="/admin/bonuses/create">
              <button className="w-full px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Opret Ny Bonus
              </button>
            </Link>
            <Link href="/admin/bonuses/analytics">
              <button className="w-full px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Se Analytics
              </button>
            </Link>
          </div>
          
          {selectedBonusId && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <h4 className="text-sm font-medium text-slate-700 mb-2">Valgt Bonus Info</h4>
              <div className="text-xs text-slate-600 space-y-1">
                <p><strong>Type:</strong> {selectedBonus?.type}</p>
                <p><strong>Værdi:</strong> {selectedBonus?.value}</p>
                <p><strong>Max brug:</strong> {selectedBonus?.restrictions.maxUsesPerUser}</p>
                <p><strong>Gyldig:</strong> {selectedBonus?.restrictions.validForDays} dage</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default function AssignBonus() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AssignBonusContent />
    </Suspense>
  )
}
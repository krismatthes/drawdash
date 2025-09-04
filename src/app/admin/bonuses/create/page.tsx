'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { bonusRewardService, BonusReward, bonusTemplates } from '@/lib/bonusRewardService'

export default function CreateBonus() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [selectedTemplate, setSelectedTemplate] = useState<string>('custom')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'points' as BonusReward['type'],
    value: 0,
    isManualOnly: false,
    targetGroups: [] as string[],
    conditions: {
      minSpent: '',
      maxSpent: '',
      minPoints: '',
      lastLoginDays: '',
      registrationDays: '',
      loyaltyTier: [] as string[]
    },
    restrictions: {
      maxUsesPerUser: 1,
      maxTotalUses: '',
      validForDays: 30,
      minPurchaseAmount: '',
      onlyFirstPurchase: false
    },
    expiresAt: '',
    metadata: {
      campaignId: '',
      source: '',
      notes: ''
    }
  })

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user?.isAdmin) {
        router.push('/login?redirect=/admin/bonuses/create')
        return
      }
    }
  }, [isLoading, isAuthenticated, user?.isAdmin, router])

  const handleTemplateSelect = (templateKey: string) => {
    setSelectedTemplate(templateKey)
    
    if (templateKey === 'custom') {
      setFormData({
        name: '',
        description: '',
        type: 'points',
        value: 0,
        isManualOnly: false,
        targetGroups: [],
        conditions: {
          minSpent: '',
          maxSpent: '',
          minPoints: '',
          lastLoginDays: '',
          registrationDays: '',
          loyaltyTier: []
        },
        restrictions: {
          maxUsesPerUser: 1,
          maxTotalUses: '',
          validForDays: 30,
          minPurchaseAmount: '',
          onlyFirstPurchase: false
        },
        expiresAt: '',
        metadata: {
          campaignId: '',
          source: '',
          notes: ''
        }
      })
      return
    }

    const template = bonusTemplates[templateKey as keyof typeof bonusTemplates]
    if (template) {
      setFormData({
        name: template.name,
        description: template.description,
        type: template.type,
        value: template.value,
        isManualOnly: true,
        targetGroups: [...template.targetGroups],
        conditions: {
          minSpent: (template.conditions as any).minSpent?.toString() || '',
          maxSpent: (template.conditions as any).maxSpent?.toString() || '',
          minPoints: (template.conditions as any).minPoints?.toString() || '',
          lastLoginDays: (template.conditions as any).lastLoginDays?.toString() || '',
          registrationDays: (template.conditions as any).registrationDays?.toString() || '',
          loyaltyTier: (template.conditions as any).loyaltyTier || []
        },
        restrictions: {
          maxUsesPerUser: template.restrictions.maxUsesPerUser,
          maxTotalUses: (template.restrictions as any).maxTotalUses?.toString() || '',
          validForDays: template.restrictions.validForDays,
          minPurchaseAmount: (template.restrictions as any).minPurchaseAmount?.toString() || '',
          onlyFirstPurchase: (template.restrictions as any).onlyFirstPurchase || false
        },
        expiresAt: '',
        metadata: {
          campaignId: '',
          source: 'Template',
          notes: `Oprettet fra ${template.name} template`
        }
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert('Navn er påkrævet')
      return
    }
    
    if (!formData.description.trim()) {
      alert('Beskrivelse er påkrævet')
      return
    }
    
    if (formData.value <= 0) {
      alert('Værdi skal være større end 0')
      return
    }
    
    if (formData.targetGroups.length === 0) {
      alert('Vælg mindst én målgruppe')
      return
    }

    try {
      const bonusData: Omit<BonusReward, 'id' | 'createdAt' | 'usageCount'> = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type,
        value: formData.value,
        isActive: true,
        isManualOnly: formData.isManualOnly,
        targetGroups: formData.targetGroups as any[],
        conditions: {
          minSpent: formData.conditions.minSpent ? parseInt(formData.conditions.minSpent) : undefined,
          maxSpent: formData.conditions.maxSpent ? parseInt(formData.conditions.maxSpent) : undefined,
          minPoints: formData.conditions.minPoints ? parseInt(formData.conditions.minPoints) : undefined,
          lastLoginDays: formData.conditions.lastLoginDays ? parseInt(formData.conditions.lastLoginDays) : undefined,
          registrationDays: formData.conditions.registrationDays ? parseInt(formData.conditions.registrationDays) : undefined,
          loyaltyTier: formData.conditions.loyaltyTier.length > 0 ? formData.conditions.loyaltyTier as any[] : undefined
        },
        restrictions: {
          maxUsesPerUser: formData.restrictions.maxUsesPerUser,
          maxTotalUses: formData.restrictions.maxTotalUses ? parseInt(formData.restrictions.maxTotalUses) : undefined,
          validForDays: formData.restrictions.validForDays,
          minPurchaseAmount: formData.restrictions.minPurchaseAmount ? parseInt(formData.restrictions.minPurchaseAmount) : undefined,
          onlyFirstPurchase: formData.restrictions.onlyFirstPurchase
        },
        createdBy: user?.firstName + ' ' + user?.lastName || 'Admin',
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : undefined,
        metadata: {
          campaignId: formData.metadata.campaignId || undefined,
          source: formData.metadata.source || undefined,
          notes: formData.metadata.notes || undefined
        }
      }

      const newBonus = bonusRewardService.createBonus(bonusData, user?.firstName + ' ' + user?.lastName || 'Admin')
      
      alert(`Bonus "${newBonus.name}" oprettet succesfuldt!`)
      router.push('/admin/bonuses')
    } catch (error) {
      alert('Fejl ved oprettelse af bonus: ' + (error instanceof Error ? error.message : 'Ukendt fejl'))
    }
  }

  const handleTargetGroupChange = (group: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        targetGroups: [...prev.targetGroups.filter(g => g !== group), group]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        targetGroups: prev.targetGroups.filter(g => g !== group)
      }))
    }
  }

  const handleLoyaltyTierChange = (tier: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        conditions: {
          ...prev.conditions,
          loyaltyTier: [...prev.conditions.loyaltyTier.filter(t => t !== tier), tier]
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        conditions: {
          ...prev.conditions,
          loyaltyTier: prev.conditions.loyaltyTier.filter(t => t !== tier)
        }
      }))
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading bonus creation...</p>
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
              <h1 className="text-xl font-bold text-slate-900">Opret Ny Bonus</h1>
              <p className="text-slate-600">Konfigurer en ny bonus reward</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Template Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
          >
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Vælg Template</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => handleTemplateSelect('custom')}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  selectedTemplate === 'custom'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-2xl mb-2">⚙️</div>
                <div className="font-medium text-slate-900">Custom Bonus</div>
                <div className="text-sm text-slate-500">Opret fra bunden</div>
              </button>
              
              <button
                type="button"
                onClick={() => handleTemplateSelect('welcomePackage')}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  selectedTemplate === 'welcomePackage'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-2xl mb-2">👋</div>
                <div className="font-medium text-slate-900">Velkomst Pakke</div>
                <div className="text-sm text-slate-500">500 points til nye</div>
              </button>
              
              <button
                type="button"
                onClick={() => handleTemplateSelect('reactivation')}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  selectedTemplate === 'reactivation'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-2xl mb-2">🔄</div>
                <div className="font-medium text-slate-900">Reaktivering</div>
                <div className="text-sm text-slate-500">10 gratis billetter</div>
              </button>
            </div>
          </motion.div>

          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
          >
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Grundlæggende Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Bonus Navn *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Indtast bonus navn"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Bonus Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as BonusReward['type'] }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="points">Points</option>
                  <option value="free_tickets">Gratis Billetter</option>
                  <option value="cashback">Cashback (%)</option>
                  <option value="multiplier">Point Multiplier</option>
                  <option value="free_entry">Gratis Entry</option>
                  <option value="discount">Rabat (%)</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Beskrivelse *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Beskriv bonussen og hvornår den anvendes"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Værdi *
                </label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData(prev => ({ ...prev, value: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Indtast værdi"
                  min="1"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  {formData.type === 'points' && 'Antal points at tildele'}
                  {formData.type === 'free_tickets' && 'Antal gratis billetter'}
                  {formData.type === 'cashback' && 'Procentdel cashback (1-100)'}
                  {formData.type === 'multiplier' && 'Multiplier faktor (f.eks. 2 for 2x)'}
                  {formData.type === 'free_entry' && 'Antal gratis entries'}
                  {formData.type === 'discount' && 'Rabat procent (1-100)'}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="manualOnly"
                  checked={formData.isManualOnly}
                  onChange={(e) => setFormData(prev => ({ ...prev, isManualOnly: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
                <label htmlFor="manualOnly" className="text-sm font-medium text-slate-700">
                  Kun manuel tildeling
                </label>
                <div className="text-xs text-slate-500">
                  (Deaktiverer automatisk tildeling)
                </div>
              </div>
            </div>
          </motion.div>

          {/* Target Groups */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
          >
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Målgrupper *</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { key: 'new_users', label: 'Nye Brugere', icon: '👶' },
                { key: 'inactive_users', label: 'Inaktive Brugere', icon: '😴' },
                { key: 'vip_users', label: 'VIP Brugere', icon: '⭐' },
                { key: 'all_users', label: 'Alle Brugere', icon: '🌍' },
                { key: 'custom', label: 'Custom Gruppe', icon: '🎯' }
              ].map(group => (
                <label key={group.key} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.targetGroups.includes(group.key)}
                    onChange={(e) => handleTargetGroupChange(group.key, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                  />
                  <span className="text-lg">{group.icon}</span>
                  <span className="text-sm font-medium text-slate-700">{group.label}</span>
                </label>
              ))}
            </div>
          </motion.div>

          {/* Conditions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
          >
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Betingelser</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Minimum Brugt (kr)
                </label>
                <input
                  type="number"
                  value={formData.conditions.minSpent}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    conditions: { ...prev.conditions, minSpent: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="F.eks. 1000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Maximum Brugt (kr)
                </label>
                <input
                  type="number"
                  value={formData.conditions.maxSpent}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    conditions: { ...prev.conditions, maxSpent: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="F.eks. 10000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Minimum Points
                </label>
                <input
                  type="number"
                  value={formData.conditions.minPoints}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    conditions: { ...prev.conditions, minPoints: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="F.eks. 1000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Dage Siden Sidste Login
                </label>
                <input
                  type="number"
                  value={formData.conditions.lastLoginDays}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    conditions: { ...prev.conditions, lastLoginDays: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="F.eks. 30"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Dage Siden Registrering
                </label>
                <input
                  type="number"
                  value={formData.conditions.registrationDays}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    conditions: { ...prev.conditions, registrationDays: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="F.eks. 1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Loyalty Tiers
                </label>
                <div className="space-y-2">
                  {['bronze', 'silver', 'gold', 'diamond'].map(tier => (
                    <label key={tier} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.conditions.loyaltyTier.includes(tier)}
                        onChange={(e) => handleLoyaltyTierChange(tier, e.target.checked)}
                        className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                      />
                      <span className="text-sm text-slate-700 capitalize">{tier}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Restrictions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
          >
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Begrænsninger</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Max Brug Per Bruger *
                </label>
                <input
                  type="number"
                  value={formData.restrictions.maxUsesPerUser}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    restrictions: { ...prev.restrictions, maxUsesPerUser: parseInt(e.target.value) || 1 }
                  }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Max Total Brug
                </label>
                <input
                  type="number"
                  value={formData.restrictions.maxTotalUses}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    restrictions: { ...prev.restrictions, maxTotalUses: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ubegrænset hvis tom"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Gyldig I Dage *
                </label>
                <input
                  type="number"
                  value={formData.restrictions.validForDays}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    restrictions: { ...prev.restrictions, validForDays: parseInt(e.target.value) || 30 }
                  }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Minimum Køb (kr)
                </label>
                <input
                  type="number"
                  value={formData.restrictions.minPurchaseAmount}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    restrictions: { ...prev.restrictions, minPurchaseAmount: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Minimum køb for brug"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Bonus Udløber
                </label>
                <input
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="onlyFirstPurchase"
                  checked={formData.restrictions.onlyFirstPurchase}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    restrictions: { ...prev.restrictions, onlyFirstPurchase: e.target.checked }
                  }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
                <label htmlFor="onlyFirstPurchase" className="text-sm font-medium text-slate-700">
                  Kun første køb
                </label>
              </div>
            </div>
          </motion.div>

          {/* Metadata */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
          >
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Metadata (Valgfrit)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Kampagne ID
                </label>
                <input
                  type="text"
                  value={formData.metadata.campaignId}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    metadata: { ...prev.metadata, campaignId: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="F.eks. SUMMER2024"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Kilde
                </label>
                <input
                  type="text"
                  value={formData.metadata.source}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    metadata: { ...prev.metadata, source: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="F.eks. Email Campaign"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Noter
                </label>
                <textarea
                  value={formData.metadata.notes}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    metadata: { ...prev.metadata, notes: e.target.value }
                  }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Interne noter om bonussen"
                />
              </div>
            </div>
          </motion.div>

          {/* Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6"
          >
            <h2 className="text-lg font-semibold text-blue-900 mb-4">Preview</h2>
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">
                  {formData.type === 'points' && '🎯'}
                  {formData.type === 'free_tickets' && '🎫'}
                  {formData.type === 'cashback' && '💰'}
                  {formData.type === 'multiplier' && '⚡'}
                  {formData.type === 'free_entry' && '🆓'}
                  {formData.type === 'discount' && '🏷️'}
                </span>
                <div>
                  <div className="font-medium text-slate-900">{formData.name || 'Bonus Navn'}</div>
                  <div className="text-sm text-slate-500">{formData.description || 'Bonus beskrivelse'}</div>
                </div>
              </div>
              <div className="text-sm text-blue-600 font-medium">
                Værdi: {formData.value > 0 ? formData.value : 'X'}{' '}
                {formData.type === 'points' && 'points'}
                {formData.type === 'free_tickets' && 'billetter'}
                {formData.type === 'cashback' && '% cashback'}
                {formData.type === 'multiplier' && 'x multiplier'}
                {formData.type === 'free_entry' && 'gratis entries'}
                {formData.type === 'discount' && '% rabat'}
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Link href="/admin/bonuses">
              <button type="button" className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
                Annuller
              </button>
            </Link>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Opret Bonus
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
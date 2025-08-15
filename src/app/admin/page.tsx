'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import { mockRaffles } from '@/lib/mockData'
import { Raffle } from '@/types/raffle'
import { getAllFAQs, getFAQById, FAQ } from '@/lib/mockFAQ'

export default function AdminPage() {
  const [raffles, setRaffles] = useState<Raffle[]>(mockRaffles)
  const [selectedRaffle, setSelectedRaffle] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [activeTab, setActiveTab] = useState<'raffles' | 'faq'>('raffles')
  const [faqs, setFAQs] = useState<FAQ[]>(getAllFAQs())
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null)
  const [showCreateFAQ, setShowCreateFAQ] = useState(false)

  const handleDrawWinner = async (raffleId: string) => {
    const raffle = raffles.find(r => r.id === raffleId)
    if (!raffle) return

    if (confirm(`Are you sure you want to draw the winner for "${raffle.title}"?`)) {
      // Simulate random winner selection
      const winnerTicket = Math.floor(Math.random() * raffle.soldTickets) + 1
      
      alert(`Winner drawn! Ticket #${winnerTicket} wins ${raffle.title}!`)
      
      // Update raffle status
      setRaffles(prev => prev.map(r => 
        r.id === raffleId 
          ? { ...r, status: 'ended' as const }
          : r
      ))
    }
  }

  const handleCreateFAQ = (faqData: Partial<FAQ>) => {
    const newFAQ: FAQ = {
      id: Date.now().toString(),
      question: faqData.question || '',
      answer: faqData.answer || '',
      category: faqData.category || 'general',
      isActive: faqData.isActive ?? true,
      order: faqs.length + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setFAQs(prev => [...prev, newFAQ])
    setShowCreateFAQ(false)
  }

  const handleUpdateFAQ = (faqData: Partial<FAQ>) => {
    if (!editingFAQ) return
    const updatedFAQ: FAQ = {
      ...editingFAQ,
      ...faqData,
      updatedAt: new Date()
    }
    setFAQs(prev => prev.map(f => f.id === editingFAQ.id ? updatedFAQ : f))
    setEditingFAQ(null)
  }

  const handleDeleteFAQ = (faqId: string) => {
    if (confirm('Er du sikker på du vil slette dette FAQ?')) {
      setFAQs(prev => prev.filter(f => f.id !== faqId))
    }
  }

  const handleToggleFAQStatus = (faqId: string) => {
    setFAQs(prev => prev.map(f => 
      f.id === faqId ? { ...f, isActive: !f.isActive, updatedAt: new Date() } : f
    ))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex space-x-3">
            {activeTab === 'raffles' && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
              >
                Opret Ny Lodtrækning
              </button>
            )}
            {activeTab === 'faq' && (
              <button
                onClick={() => setShowCreateFAQ(true)}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
              >
                Opret Nyt FAQ
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('raffles')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'raffles'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🎯 Lodtrækninger
              </button>
              <button
                onClick={() => setActiveTab('faq')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'faq'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                ❓ FAQ Administration
              </button>
            </nav>
          </div>
        </div>

        {/* Stats Cards */}
        {activeTab === 'raffles' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-900">Aktive Lodtrækninger</h3>
              <p className="text-3xl font-bold text-green-600">
                {raffles.filter(r => r.status === 'active').length}
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-900">Samlet Omsætning</h3>
              <p className="text-3xl font-bold text-green-600">
                {raffles.reduce((sum, r) => sum + (r.soldTickets * r.ticketPrice), 0).toLocaleString()} kr
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-900">Billetter Solgt</h3>
              <p className="text-3xl font-bold text-green-600">
                {raffles.reduce((sum, r) => sum + r.soldTickets, 0)}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'faq' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-900">Samlede FAQ</h3>
              <p className="text-3xl font-bold text-green-600">
                {faqs.length}
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-900">Aktive FAQ</h3>
              <p className="text-3xl font-bold text-green-600">
                {faqs.filter(f => f.isActive).length}
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-900">Inaktive FAQ</h3>
              <p className="text-3xl font-bold text-orange-600">
                {faqs.filter(f => !f.isActive).length}
              </p>
            </div>
          </div>
        )}

        {/* Raffle Management */}
        {activeTab === 'raffles' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Lodtræknings Administration</h2>
            </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Raffle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {raffles.map((raffle) => (
                  <tr key={raffle.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center">
                            🎁
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {raffle.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {raffle.ticketPrice} kr per billet
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        raffle.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : raffle.status === 'ended'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {raffle.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(raffle.soldTickets / raffle.totalTickets) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs">
                          {raffle.soldTickets}/{raffle.totalTickets}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(raffle.soldTickets * raffle.ticketPrice).toLocaleString()} kr
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {raffle.endDate.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        Edit
                      </button>
                      {raffle.status === 'active' && (
                        <button 
                          onClick={() => handleDrawWinner(raffle.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Draw Winner
                        </button>
                      )}
                      <button className="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        )}

        {/* FAQ Management */}
        {activeTab === 'faq' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">FAQ Administration</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Spørgsmål
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rækkefølge
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sidst Opdateret
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Handlinger
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {faqs.map((faq) => (
                    <tr key={faq.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                          {faq.question}
                        </div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {faq.answer.substring(0, 100)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          {faq.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleFAQStatus(faq.id)}
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            faq.isActive 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {faq.isActive ? 'Aktiv' : 'Inaktiv'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {faq.order}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {faq.updatedAt.toLocaleDateString('da-DK')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button 
                          onClick={() => setEditingFAQ(faq)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Rediger
                        </button>
                        <button 
                          onClick={() => handleDeleteFAQ(faq.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Slet
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showCreateForm && (
          <CreateRaffleForm onClose={() => setShowCreateForm(false)} />
        )}

        {showCreateFAQ && (
          <CreateFAQForm 
            onClose={() => setShowCreateFAQ(false)} 
            onSave={handleCreateFAQ}
          />
        )}

        {editingFAQ && (
          <EditFAQForm 
            faq={editingFAQ}
            onClose={() => setEditingFAQ(null)} 
            onSave={handleUpdateFAQ}
          />
        )}
      </div>
    </div>
  )
}

function CreateFAQForm({ onClose, onSave }: { onClose: () => void, onSave: (data: Partial<FAQ>) => void }) {
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'general' as FAQ['category'],
    isActive: true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Opret Nyt FAQ</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Spørgsmål
            </label>
            <input
              type="text"
              value={formData.question}
              onChange={(e) => setFormData({...formData, question: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Svar
            </label>
            <textarea
              value={formData.answer}
              onChange={(e) => setFormData({...formData, answer: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={5}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kategori
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value as FAQ['category']})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="general">Generelt</option>
              <option value="payment">Betaling</option>
              <option value="delivery">Levering</option>
              <option value="prizes">Præmier</option>
              <option value="account">Konto</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              className="h-4 w-4 text-green-600 rounded border-gray-300"
            />
            <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
              Aktiv (synlig på FAQ siden)
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Annuller
            </button>
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
            >
              Opret FAQ
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditFAQForm({ faq, onClose, onSave }: { faq: FAQ, onClose: () => void, onSave: (data: Partial<FAQ>) => void }) {
  const [formData, setFormData] = useState({
    question: faq.question,
    answer: faq.answer,
    category: faq.category,
    isActive: faq.isActive,
    order: faq.order,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Rediger FAQ</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Spørgsmål
            </label>
            <input
              type="text"
              value={formData.question}
              onChange={(e) => setFormData({...formData, question: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Svar
            </label>
            <textarea
              value={formData.answer}
              onChange={(e) => setFormData({...formData, answer: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={5}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value as FAQ['category']})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="general">Generelt</option>
                <option value="payment">Betaling</option>
                <option value="delivery">Levering</option>
                <option value="prizes">Præmier</option>
                <option value="account">Konto</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rækkefølge
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                min="1"
                required
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActiveEdit"
              checked={formData.isActive}
              onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              className="h-4 w-4 text-green-600 rounded border-gray-300"
            />
            <label htmlFor="isActiveEdit" className="ml-2 text-sm text-gray-700">
              Aktiv (synlig på FAQ siden)
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Annuller
            </button>
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
            >
              Gem Ændringer
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function CreateRaffleForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ticketPrice: '',
    totalTickets: '',
    prizeValue: '',
    endDate: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('New raffle created successfully!')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Create New Raffle</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Raffle Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Billetpris (kr)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.ticketPrice}
                onChange={(e) => setFormData({...formData, ticketPrice: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Tickets
              </label>
              <input
                type="number"
                value={formData.totalTickets}
                onChange={(e) => setFormData({...formData, totalTickets: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Præmieværdi (kr)
            </label>
            <input
              type="number"
              value={formData.prizeValue}
              onChange={(e) => setFormData({...formData, prizeValue: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="datetime-local"
              value={formData.endDate}
              onChange={(e) => setFormData({...formData, endDate: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Create Raffle
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
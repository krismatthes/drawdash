'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import PointsRedemption from './PointsRedemption'
import { PointsRedemption as PointsRedemptionType } from '@/types/loyalty'

interface DemoPaymentFormProps {
  amount: number
  onSuccess: (pointsUsed?: number) => void
  onCancel: () => void
}

export default function DemoPaymentForm({ amount, onSuccess, onCancel }: DemoPaymentFormProps) {
  const { user } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [pointsRedemption, setPointsRedemption] = useState<PointsRedemptionType | null>(null)
  const finalAmount = amount - (pointsRedemption?.discountAmount || 0)
  const [formData, setFormData] = useState({
    name: user?.firstName + ' ' + user?.lastName || '',
    email: user?.email || '',
    billingAddress: {
      line1: '',
      line2: '',
      city: '',
      postcode: '',
      country: 'DK'
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsProcessing(true)
    setErrorMessage('')

    try {
      // Create demo payment intent
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: finalAmount * 100, // Convert to øre
          currency: 'dkk',
          pointsUsed: pointsRedemption?.pointsToRedeem || 0,
          userId: user?.id || '',
          ticketQuantity: 1
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create payment intent')
      }

      const { demo } = await response.json()

      if (demo) {
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Simulate random success/failure for demo (90% success rate)
        const success = Math.random() > 0.1
        
        if (success) {
          onSuccess(pointsRedemption?.pointsToRedeem || 0)
        } else {
          setErrorMessage('Demo payment failed. Please try again.')
        }
      }
    } catch (error) {
      setErrorMessage('Payment failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Demo Betaling</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Demo Notice */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-blue-600 text-xl">🎭</span>
            <div>
              <div className="font-medium text-blue-800">Demo Mode</div>
              <div className="text-sm text-blue-600">Ingen rigtige betalinger - kun test</div>
            </div>
          </div>
        </div>

        {/* Points Redemption Section */}
        {user && (
          <div className="mb-6">
            <PointsRedemption
              userPoints={user.points || 0}
              userTier={user.loyaltyTier || 'none'}
              cartAmount={amount}
              onRedemptionChange={setPointsRedemption}
            />
          </div>
        )}
        
        <div className="bg-green-50 p-3 rounded-lg mb-6">
          {pointsRedemption && (
            <>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600">Oprindelig pris:</span>
                <span className="text-slate-900">{amount.toLocaleString('da-DK')} kr</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-green-600">Points rabat:</span>
                <span className="text-green-600">-{pointsRedemption.discountAmount.toLocaleString('da-DK')} kr</span>
              </div>
              <div className="border-t border-green-200 pt-2">
                <div className="flex justify-between">
                  <span className="font-medium">Total Amount:</span>
                  <span className="text-xl font-bold text-green-600">
                    {finalAmount.toLocaleString('da-DK')} kr
                  </span>
                </div>
              </div>
            </>
          )}
          {!pointsRedemption && (
            <div className="flex justify-between">
              <span className="font-medium">Total Amount:</span>
              <span className="text-xl font-bold text-green-600">
                {finalAmount.toLocaleString('da-DK')} kr
              </span>
            </div>
          )}
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Demo Card Details */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Demo Kort Detaljer
            </label>
            <div className="p-3 border border-gray-300 rounded-md bg-gray-50">
              <div className="text-sm text-gray-600">
                <div>💳 **** **** **** 4242</div>
                <div>📅 12/28 • CVC: 123</div>
                <div className="text-xs mt-1 text-blue-600">Demo kort - ingen rigtig betaling</div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Navn på kort
            </label>
            <input
              type="text"
              placeholder="John Smith"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email adresse
            </label>
            <input
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium text-gray-900 mb-3">Fakturerings adresse</h3>
            
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Adresse linje 1"
                value={formData.billingAddress.line1}
                onChange={(e) => setFormData({...formData, billingAddress: {...formData.billingAddress, line1: e.target.value}})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              
              <input
                type="text"
                placeholder="Adresse linje 2 (Valgfri)"
                value={formData.billingAddress.line2}
                onChange={(e) => setFormData({...formData, billingAddress: {...formData.billingAddress, line2: e.target.value}})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="By"
                  value={formData.billingAddress.city}
                  onChange={(e) => setFormData({...formData, billingAddress: {...formData.billingAddress, city: e.target.value}})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Postnummer"
                  value={formData.billingAddress.postcode}
                  onChange={(e) => setFormData({...formData, billingAddress: {...formData.billingAddress, postcode: e.target.value}})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Annuller
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {isProcessing ? '🔄 Behandler...' : `🎭 Demo Betaling ${finalAmount.toLocaleString('da-DK')} kr`}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
            <span>🎭 Demo Mode</span>
            <span>Ingen rigtige betalinger</span>
          </div>
        </div>
      </div>
    </div>
  )
}
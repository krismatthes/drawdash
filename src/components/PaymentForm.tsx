'use client'

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import { useAuth } from '@/contexts/AuthContext'
import PointsRedemption from './PointsRedemption'
import { PointsRedemption as PointsRedemptionType } from '@/types/loyalty'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PaymentFormProps {
  amount: number
  onSuccess: (pointsUsed?: number) => void
  onCancel: () => void
}

interface CheckoutFormProps {
  amount: number
  onSuccess: (pointsUsed?: number) => void
  onCancel: () => void
}

function CheckoutForm({ amount, onSuccess, onCancel }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const { user } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [pointsRedemption, setPointsRedemption] = useState<PointsRedemptionType | null>(null)
  const finalAmount = amount - (pointsRedemption?.discountAmount || 0)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    billingAddress: {
      line1: '',
      line2: '',
      city: '',
      postcode: '',
      country: 'GB'
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setErrorMessage('')

    const cardElement = elements.getElement(CardElement)
    
    if (!cardElement) {
      setIsProcessing(false)
      return
    }

    try {
      // Create payment intent on the server
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: finalAmount * 100, // Convert to cents
          currency: 'gbp',
          pointsUsed: pointsRedemption?.pointsToRedeem || 0
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create payment intent')
      }

      const { clientSecret } = await response.json()

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: formData.name,
            email: formData.email,
            address: {
              line1: formData.billingAddress.line1,
              line2: formData.billingAddress.line2,
              city: formData.billingAddress.city,
              postal_code: formData.billingAddress.postcode,
              country: formData.billingAddress.country,
            },
          },
        },
      })

      if (error) {
        setErrorMessage(error.message || 'Payment failed')
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(pointsRedemption?.pointsToRedeem || 0)
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
          <h2 className="text-xl font-semibold">Complete Payment</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Card Details
            </label>
            <div className="p-3 border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-green-500">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cardholder Name
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
              Email Address
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
            <h3 className="font-medium text-gray-900 mb-3">Billing Address</h3>
            
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Address Line 1"
                value={formData.billingAddress.line1}
                onChange={(e) => setFormData({...formData, billingAddress: {...formData.billingAddress, line1: e.target.value}})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              
              <input
                type="text"
                placeholder="Address Line 2 (Optional)"
                value={formData.billingAddress.line2}
                onChange={(e) => setFormData({...formData, billingAddress: {...formData.billingAddress, line2: e.target.value}})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="City"
                  value={formData.billingAddress.city}
                  onChange={(e) => setFormData({...formData, billingAddress: {...formData.billingAddress, city: e.target.value}})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Postcode"
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
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing || !stripe}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : `Betal ${finalAmount.toLocaleString('da-DK')} kr`}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
            <span>🔒 Secure Payment</span>
            <span>Powered by Stripe</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PaymentForm({ amount, onSuccess, onCancel }: PaymentFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm amount={amount} onSuccess={onSuccess} onCancel={onCancel} />
    </Elements>
  )
}
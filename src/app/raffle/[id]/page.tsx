'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Header from '@/components/Header'
import CountdownTimer from '@/components/CountdownTimer'
import PaymentForm from '@/components/PaymentForm'
import { mockRaffles } from '@/lib/mockData'
import { Raffle } from '@/types/raffle'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'

export default function RafflePage() {
  const params = useParams()
  const router = useRouter()
  const [raffle, setRaffle] = useState<Raffle | null>(null)
  const [ticketQuantity, setTicketQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const { isAuthenticated, user } = useAuth()
  const { t } = useLanguage()

  useEffect(() => {
    const raffleData = mockRaffles.find(r => r.id === params.id)
    setRaffle(raffleData || null)
  }, [params.id])

  const handlePurchase = () => {
    if (!raffle) return
    
    if (!isAuthenticated) {
      router.push('/login?redirect=' + encodeURIComponent(`/raffle/${raffle.id}`))
      return
    }
    
    setShowPayment(true)
  }

  const handlePaymentSuccess = () => {
    setShowPayment(false)
    
    // Show success message with link to account page
    const message = `Du har succesfuldt deltaget i lodtrækningen med ${ticketQuantity} billet(ter)! 

Held og lykke! Du kan se alle dine deltagelser på din konto side.`
    
    if (confirm(message + '\n\nVil du gå til din konto side nu?')) {
      router.push('/account?tab=active')
    }
  }

  const handlePaymentCancel = () => {
    setShowPayment(false)
  }

  if (!raffle) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Raffle Not Found</h1>
            <p className="text-gray-600 mt-2">The raffle you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    )
  }

  const progressPercentage = (raffle.soldTickets / raffle.totalTickets) * 100
  const totalCost = ticketQuantity * raffle.ticketPrice

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image and basic info */}
          <div>
            <div className="relative h-96 mb-6">
              <Image
                src={raffle.image}
                alt={raffle.title}
                fill
                className="object-cover rounded-lg"
              />
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-semibold mb-4">Prize Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Prize:</span>
                  <span className="font-medium">{raffle.prize.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Value:</span>
                  <span className="font-medium">{raffle.prize.value.toLocaleString()} kr</span>
                </div>
                <div className="pt-3 border-t">
                  <p className="text-gray-700">{raffle.prize.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Entry form and details */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{raffle.title}</h1>
              <p className="text-gray-600 mb-6">{raffle.description}</p>
              
              <div className="mb-6">
                <CountdownTimer endDate={raffle.endDate} />
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Tickets Sold</span>
                  <span>{raffle.soldTickets} / {raffle.totalTickets}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-600 h-3 rounded-full transition-all"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {raffle.totalTickets - raffle.soldTickets} tickets remaining
                </p>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Enter This Raffle</h3>
                
                {/* Free Entry Option */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <div className="text-green-600 mr-3 mt-1">
                      📮
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-800 mb-2">Free Entry by Post</h4>
                      <p className="text-sm text-green-700 mb-2">
                        You can enter this raffle for FREE by sending a postcard with the following information:
                      </p>
                      <ul className="text-xs text-green-600 space-y-1 mb-3">
                        <li>• Your full name and address</li>
                        <li>• Phone number and email</li>
                        <li>• Raffle ID: {raffle.id}</li>
                        <li>• Write "FREE ENTRY" on the postcard</li>
                      </ul>
                      <div className="text-xs text-green-600">
                        <p className="font-medium">Send to:</p>
                        <p>DrawDash Free Entry<br />
                        PO Box 123<br />
                        London, W1A 0AA</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Tickets
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                      className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded-md"
                      disabled={ticketQuantity <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={ticketQuantity}
                      onChange={(e) => setTicketQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="border border-gray-300 rounded-md px-3 py-2 w-20 text-center"
                      min="1"
                    />
                    <button
                      onClick={() => setTicketQuantity(ticketQuantity + 1)}
                      className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded-md"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Total Cost</p>
                      <p className="text-sm text-gray-600">
                        {ticketQuantity} ticket(s) × {raffle.ticketPrice} kr
                      </p>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {totalCost} kr
                    </div>
                  </div>
                </div>

                {!isAuthenticated && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center">
                      <div className="text-yellow-600 mr-3">
                        ⚠️
                      </div>
                      <div>
                        <h4 className="font-semibold text-yellow-800">Log ind for at deltage</h4>
                        <p className="text-sm text-yellow-700">
                          Du skal oprette en konto eller logge ind for at købe billetter til lodtrækninger.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handlePurchase}
                  className={`w-full py-3 px-6 rounded-md font-semibold transition-colors ${
                    isAuthenticated 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isAuthenticated ? (raffle.isInstantWin ? '⚡ Spil Nu' : 'Deltag i Lodtrækning') : 'Log Ind for at Deltage'}
                </button>

                <p className="text-xs text-gray-500 mt-3 text-center">
                  By entering this raffle, you agree to our Terms & Conditions
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold mb-4">How It Works</h3>
              <ol className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">1</span>
                  <span>Choose how many tickets you want to purchase</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">2</span>
                  <span>Complete your purchase securely</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">3</span>
                  <span>Wait for the draw when the timer expires</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">4</span>
                  <span>Winner announced immediately via Facebook Live</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {showPayment && (
        <PaymentForm
          amount={totalCost}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      )}
    </div>
  )
}
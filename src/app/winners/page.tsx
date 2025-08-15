import Header from '@/components/Header'
import Image from 'next/image'
import { getRecentWinners, getBiggestWins } from '@/lib/mockWinners'
import { useLanguage } from '@/contexts/LanguageContext'

const bigWinners = [
  {
    prize: 'BMW M4 Competition',
    winner: 'Sarah M.',
    value: 85000,
    month: 'August 2024'
  },
  {
    prize: '£500 Cash Instant Win',
    winner: 'Lars K.',
    value: 500,
    month: 'August 2024'
  },
  {
    prize: 'Samsung Galaxy S24',
    winner: 'Anna H.',
    value: 899,
    month: 'August 2024'
  }
]

export default function WinnersPage() {
  const recentWinners = getRecentWinners(6)
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Nylige Vindere</h1>
          <p className="text-lg text-gray-600">Mød vores heldige vindere og se hvad du kunne vinde næste gang</p>
        </div>

        {/* Big Winners Showcase */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Største Gevinster i År</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {bigWinners.map((winner, index) => (
              <div key={index} className="bg-gradient-to-r from-green-500 to-green-700 text-white rounded-lg p-6 text-center">
                <div className="text-3xl font-bold mb-2">£{winner.value.toLocaleString()}</div>
                <div className="text-lg font-semibold mb-2">{winner.prize}</div>
                <div className="text-green-100">Vundet af {winner.winner}</div>
                <div className="text-green-100 text-sm">{winner.month}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Winners */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Nylige Vindere</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentWinners.map(winner => (
              <div key={winner.id} className="bg-white rounded-lg p-6 shadow-md">
                <div className="flex items-center mb-4">
                  <div className="relative w-16 h-16 mr-4">
                    <Image
                      src={winner.image}
                      alt={winner.name}
                      fill
                      className="object-cover rounded-full"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{winner.name}</h3>
                    <p className="text-gray-600 text-sm">{winner.city}</p>
                    <p className="text-gray-500 text-xs">{winner.wonDate.toLocaleDateString('da-DK')}</p>
                  </div>
                </div>
                
                <div className="border-l-4 border-green-500 pl-4 mb-4">
                  <p className="font-semibold text-gray-900">{winner.prize}</p>
                  <p className="text-green-600 font-bold">£{winner.prizeValue.toLocaleString()}</p>
                </div>
                
                <p className="text-gray-700 italic text-sm">"{winner.testimonial}"</p>
              </div>
            ))}
          </div>
        </section>

        {/* Statistics */}
        <section className="bg-white rounded-lg p-8 shadow-md mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">By The Numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">2,847</div>
              <div className="text-gray-600">Total Winners</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">£2.1M</div>
              <div className="text-gray-600">Prizes Won</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">156</div>
              <div className="text-gray-600">Cars Won</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">98%</div>
              <div className="text-gray-600">Winner Satisfaction</div>
            </div>
          </div>
        </section>

        {/* Winner Verification */}
        <section className="bg-blue-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Winner Verification</h2>
          <div className="max-w-3xl mx-auto">
            <p className="text-gray-700 mb-6 text-center">
              All winners are real people and all prizes are delivered as promised. We maintain transparency 
              by sharing winner information (with their permission) and conducting live draws on Facebook.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="text-center">
                <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📹</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Live Draws</h3>
                <p className="text-gray-600">All draws are conducted live on Facebook for maximum transparency</p>
              </div>
              
              <div className="text-center">
                <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">✅</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Verified Winners</h3>
                <p className="text-gray-600">Winner details are verified and published with their consent</p>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <a 
                href="https://facebook.com/drawdash" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors inline-flex items-center"
              >
                <span className="mr-2">📘</span>
                Watch Live Draws on Facebook
              </a>
            </div>
          </div>
        </section>

        <div className="text-center mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Could You Be Next?</h2>
          <p className="text-gray-600 mb-8">Join our community of winners and try your luck today!</p>
          <a 
            href="/raffles"
            className="bg-blue-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors inline-block"
          >
            Enter Active Raffles
          </a>
        </div>
      </div>
    </div>
  )
}
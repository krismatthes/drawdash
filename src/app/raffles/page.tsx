import Header from '@/components/Header'
import RaffleCard from '@/components/RaffleCard'
import { mockRaffles } from '@/lib/mockData'

export default function RafflesPage() {
  const activeRaffles = mockRaffles.filter(raffle => raffle.status === 'active')
  const upcomingRaffles = mockRaffles.filter(raffle => raffle.status === 'upcoming')
  const endedRaffles = mockRaffles.filter(raffle => raffle.status === 'ended')

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">All Raffles</h1>
          <p className="text-lg text-gray-600">Choose from our amazing selection of prizes</p>
        </div>

        {/* Active Raffles */}
        {activeRaffles.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Active Raffles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeRaffles.map(raffle => (
                <RaffleCard key={raffle.id} raffle={raffle} />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Raffles */}
        {upcomingRaffles.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Coming Soon</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingRaffles.map(raffle => (
                <RaffleCard key={raffle.id} raffle={raffle} />
              ))}
            </div>
          </section>
        )}

        {/* Recently Ended Raffles */}
        {endedRaffles.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Recently Ended</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-60">
              {endedRaffles.map(raffle => (
                <RaffleCard key={raffle.id} raffle={raffle} />
              ))}
            </div>
          </section>
        )}

        {activeRaffles.length === 0 && upcomingRaffles.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Raffles</h3>
            <p className="text-gray-600">Check back soon for exciting new raffles!</p>
          </div>
        )}
      </div>
    </div>
  )
}
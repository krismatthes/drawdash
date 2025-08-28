import { motion } from 'framer-motion'
import Header from '@/components/Header'
import SimpleRaffleCard from '@/components/SimpleRaffleCard'
import { mockRaffles } from '@/lib/mockData'

export default function Home() {
  const activeRaffles = mockRaffles.filter(raffle => raffle.status === 'active').slice(0, 3)
  const featuredRaffles = mockRaffles.filter(raffle => raffle.status === 'active').slice(0, 5)

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-60"></div>
      <Header />
      
      {/* Simple Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Vind <span className="bg-gradient-to-r from-blue-500 to-pink-400 bg-clip-text text-transparent">fantastiske præmier</span>
            <br />med DrawDash
          </h1>
          
          <p className="text-xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            Danmarks mest troværdige platform for lodtrækninger. Sikre betalinger, fair draws og øjeblikkelige resultater.
          </p>
          
          <button className="bg-gradient-to-r from-blue-500 to-pink-400 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-600 hover:to-pink-500 transition-all duration-300">
            🎯 Se Aktive Lodtrækninger
          </button>

          {/* Featured Raffles Preview */}
          <div className="mt-16">
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">Populære Lodtrækninger</h2>
            <p className="text-slate-600 mb-8">Deltag nu i de mest eftertragtede konkurrencer</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredRaffles.slice(0,3).map((raffle, index) => (
                <div key={raffle.id} className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-slate-200">
                  <div className="text-2xl mb-3">{raffle.emoji}</div>
                  <div className="font-semibold text-slate-900">{raffle.title}</div>
                  <div className="text-sm text-slate-600">{raffle.participants} deltagere</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Active Raffles Section */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">Aktive Lodtrækninger</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Deltag nu i vores mest populære konkurrencer og vind fantastiske præmier
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {activeRaffles.map((raffle, index) => (
              <motion.div
                key={raffle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <SimpleRaffleCard raffle={raffle} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose DrawDash Section */}
      <section className="py-20 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">Hvorfor Vælge DrawDash?</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Danmarks mest pålidelige platform for lodtrækninger og konkurrencer
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Fair & Transparent</h3>
              <p className="text-slate-600">
                Alle lodtrækninger er verificerede og gennemføres med fuld transparens. Du kan følge hele processen.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">100% Sikker</h3>
              <p className="text-slate-600">
                Dine data er beskyttet med bank-niveau sikkerhed. SSL-kryptering og PCI-compliance.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Hurtig Udbetaling</h3>
              <p className="text-slate-600">
                Vindere modtager deres præmier hurtigt og problemfrit. Automatisk notifikation ved gevinst.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-green-400 to-green-500 bg-clip-text text-transparent">
                  <h1 className="text-2xl font-bold tracking-tight">DrawDash</h1>
                </div>
              </div>
              <p className="text-slate-400 mb-6 max-w-md">
                Danmarks førende platform for lodtrækninger og konkurrencer. 
                Sikker, transparent og fair.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-slate-200 mb-4">Hurtige Links</h3>
              <ul className="space-y-2">
                <li><a href="/raffles" className="hover:text-green-400 transition-colors">Aktive Lodtrækninger</a></li>
                <li><a href="/winners" className="hover:text-green-400 transition-colors">Vindere</a></li>
                <li><a href="/how-it-works" className="hover:text-green-400 transition-colors">Sådan Fungerer Det</a></li>
                <li><a href="/faq" className="hover:text-green-400 transition-colors">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-slate-200 mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="/contact" className="hover:text-green-400 transition-colors">Kontakt Os</a></li>
                <li><a href="/terms" className="hover:text-green-400 transition-colors">Vilkår & Betingelser</a></li>
                <li><a href="/privacy" className="hover:text-green-400 transition-colors">Privatlivspolitik</a></li>
                <li><a href="/responsible-gaming" className="hover:text-green-400 transition-colors">Ansvarligt Spil</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-500 text-sm mb-4 md:mb-0">
              © 2024 DrawDash. Alle rettigheder forbeholdes.
            </p>
            <div className="flex items-center space-x-4">
              <span className="text-slate-500 text-sm">Licenseret i Danmark</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm">Online</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
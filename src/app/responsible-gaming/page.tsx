'use client'

import { motion } from 'framer-motion'
import PremiumHeader from '@/components/PremiumHeader'
import PremiumFooter from '@/components/PremiumFooter'
import GradientMesh from '@/components/GradientMesh'
import PremiumButton from '@/components/PremiumButton'

export default function ResponsibleGamingPage() {
  return (
    <div className="min-h-screen relative bg-white">
      <GradientMesh variant="default" />
      <PremiumHeader />
      
      <main className="relative">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              Ansvarligt spil
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Vi er forpligtet til at fremme ansvarligt spil og beskytte vores brugere
            </p>
          </motion.div>

          <div className="space-y-8">
            {/* Warning Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-amber-50 border border-amber-200 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-amber-600 text-xl">⚠️</span>
                </div>
                <h2 className="text-xl font-bold text-amber-800">Vigtig påmindelse</h2>
              </div>
              <p className="text-amber-700 leading-relaxed">
                Lodtrækninger skal være sjove og underholdende. Spil aldrig for mere end du har råd til at tabe, 
                og søg hjælp hvis spil bliver et problem for dig.
              </p>
            </motion.div>

            {/* Guidelines */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card-premium p-8"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Retningslinjer for ansvarligt spil</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">✅ Gør dette</h3>
                  <ul className="space-y-3 text-slate-700">
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                      <span>Sæt et budget og hold dig til det</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                      <span>Spil kun for underholdning</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                      <span>Tag regelmæssige pauser</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                      <span>Hold styr på tid og penge brugt</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">❌ Undgå dette</h3>
                  <ul className="space-y-3 text-slate-700">
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                      <span>Spil for at genvinde tab</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                      <span>Lån penge til at spille</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                      <span>Spil når du er ked af det eller stresset</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                      <span>Ignorér bekymringer fra familie/venner</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Our Protections */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card-premium p-8"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Vores beskyttelsesforanstaltninger</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🛡️</span>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">Daglige grænser</h3>
                  <p className="text-slate-600 text-sm">
                    Maksimum 1.000 kr per dag for at forhindre overdreven spil
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">⏰</span>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">Cooling-off perioder</h3>
                  <p className="text-slate-600 text-sm">
                    Mulighed for at sætte dit spil på pause i 24 timer til 6 måneder
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🚫</span>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">Selvudelukkelse</h3>
                  <p className="text-slate-600 text-sm">
                    Permanent udelukkelse fra platformen på brugerens anmodning
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Warning Signs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-red-50 border border-red-200 rounded-xl p-8"
            >
              <h2 className="text-2xl font-bold text-red-800 mb-6">Advarselstegn på problemspil</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-red-700 mb-3">Adfærdsmæssige tegn</h3>
                  <ul className="space-y-2 text-red-600 text-sm">
                    <li>• Spiller mere end planlagt</li>
                    <li>• Ligger om spilaktivitet</li>
                    <li>• Forsømmer arbejde eller familie</li>
                    <li>• Føler sig rastløs når ikke spiller</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-red-700 mb-3">Økonomiske tegn</h3>
                  <ul className="space-y-2 text-red-600 text-sm">
                    <li>• Spiller for mere end råd er til</li>
                    <li>• Låner penge til at spille</li>
                    <li>• Skjuler udgifter for andre</li>
                    <li>• Har økonomiske problemer</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Help Resources */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="card-premium p-8"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Få hjælp</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-4">Danske ressourcer</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600">📞</span>
                      </div>
                      <div>
                        <div className="font-semibold">Spillemyndigheden</div>
                        <div className="text-sm text-slate-600">spil-ansvarligt.dk</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-green-600">🆘</span>
                      </div>
                      <div>
                        <div className="font-semibold">Anonyme Spillere</div>
                        <div className="text-sm text-slate-600">Tlf: 70 20 28 99</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-slate-900 mb-4">International hjælp</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <span className="text-purple-600">🌐</span>
                      </div>
                      <div>
                        <div className="font-semibold">GamCare (UK)</div>
                        <div className="text-sm text-slate-600">gamcare.org.uk</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <span className="text-orange-600">💬</span>
                      </div>
                      <div>
                        <div className="font-semibold">BeGambleAware</div>
                        <div className="text-sm text-slate-600">begambleaware.org</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <PremiumButton
                  variant="outline"
                  size="lg"
                  onClick={() => window.open('mailto:support@drawdash.dk', '_blank')}
                  className="font-semibold"
                >
                  Kontakt vores support team
                </PremiumButton>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <PremiumFooter />
    </div>
  )
}
'use client'

import { motion } from 'framer-motion'
import PremiumHeader from '@/components/PremiumHeader'
import GradientMesh from '@/components/GradientMesh'
import PremiumButton from '@/components/PremiumButton'

export default function FreeEntryPage() {
  return (
    <div className="min-h-screen relative bg-white">
      <GradientMesh variant="default" />
      <PremiumHeader />
      
      <main className="relative">
        <div className="max-w-4xl mx-auto px-4 py-16">
          {/* Clean Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              Gratis Deltagelse
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Deltag helt gratis ved at sende et postkort. Du får 1 billet og samme vindersandsynlighed som betalte billetter.
            </p>
          </motion.div>

          {/* Account Requirement - Prominent */}
          <motion.div
            className="card-premium p-8 mb-12 border-l-4 border-l-blue-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Krav: DrawDash Konto
            </h2>
            <p className="text-slate-600 mb-6">
              Du skal have en DrawDash konto med din fulde adresse tilføjet før du sender postkortet. 
              Alle oplysninger på postkortet skal matche din konto nøjagtigt.
            </p>
            <PremiumButton
              variant="primary"
              size="lg"
              onClick={() => window.open('/login', '_blank')}
              className="font-medium"
            >
              Log Ind på DrawDash
            </PremiumButton>
          </motion.div>

          {/* Instructions */}
          <motion.div
            className="card-premium p-8 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-semibold text-slate-900 mb-8">Sådan Deltager Du</h2>
            
            <div className="space-y-8">
              <div className="border-l-2 border-l-slate-200 pl-6">
                <h3 className="font-medium text-slate-900 mb-3">1. Skriv dit postkort</h3>
                <p className="text-slate-600 mb-4">Inkluder følgende oplysninger tydeligt:</p>
                <ul className="text-slate-600 space-y-1 text-sm">
                  <li>• Dit fulde navn</li>
                  <li>• Din fulde adresse</li>
                  <li>• Telefonnummer og email</li>
                  <li>• Den konkurrence du vil deltage i</li>
                </ul>
              </div>

              <div className="border-l-2 border-l-slate-200 pl-6">
                <h3 className="font-medium text-slate-900 mb-3">2. Send til korrekt adresse</h3>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="font-mono text-slate-900">
                    7days Performance Ltd<br />
                    PO Box 100<br />
                    Attleborough<br />
                    NR17 2YU<br />
                    United Kingdom
                  </div>
                </div>
              </div>

              <div className="border-l-2 border-l-slate-200 pl-6">
                <h3 className="font-medium text-slate-900 mb-3">3. Modtag bekræftelse</h3>
                <p className="text-slate-600 text-sm">
                  Vi sender email med dit billetnummer til din registrerede email-adresse.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Rules */}
          <motion.div
            className="card-premium p-8 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Vigtige Regler</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-medium text-slate-900 mb-3">Deltagelse</h3>
                <ul className="text-slate-600 space-y-2 text-sm">
                  <li>• 1 billet per postkort</li>
                  <li>• Send flere postkort for flere billetter</li>
                  <li>• Hvert postkort skal sendes separat</li>
                  <li>• Kun postkort uden kuvert accepteres</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-slate-900 mb-3">Frister</h3>
                <ul className="text-slate-600 space-y-2 text-sm">
                  <li>• Skal modtages før lodtrækningsdato</li>
                  <li>• Send minimum 5-7 dage i forvejen</li>
                  <li>• Forsinkede postkort får kredit til næste lodtrækning</li>
                  <li>• Ulæselige postkort diskvalificeres</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Call to Action */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <PremiumButton
                variant="premium"
                size="lg"
                onClick={() => window.open('/raffles', '_self')}
                className="font-medium"
              >
                Se Aktive Lodtrækninger
              </PremiumButton>
              
              <PremiumButton
                variant="outline"
                size="lg"
                onClick={() => window.open('/login', '_blank')}
                className="font-medium"
              >
                Log Ind
              </PremiumButton>
            </div>
            
            <p className="text-xs text-slate-400 mt-8 max-w-2xl mx-auto">
              Ved deltagelse accepterer du vores vilkår og betingelser. 
              Gratis og betalte deltagelser behandles ens i alle lodtrækninger.
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
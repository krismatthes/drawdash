'use client'

import { motion } from 'framer-motion'
import Header from '@/components/Header'
import GradientMesh from '@/components/GradientMesh'
import TrustBadges from '@/components/TrustBadges'

export default function FreeEntryPage() {
  return (
    <div className="min-h-screen relative">
      <GradientMesh variant="default" />
      <Header />
      
      <main className="relative">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="text-6xl mb-6">📮</div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              Gratis Deltagelse
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Du kan deltage i alle vores lodtrækninger gratis ved at sende et postkort med dine oplysninger.
            </p>
          </motion.div>

          <motion.div
            className="card-premium p-8 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">Sådan Deltager Du Gratis</h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-sm font-semibold text-blue-600">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Find den lodtrækning du vil deltage i</h3>
                  <p className="text-slate-600">Gå til lodtrækningen på vores website og noter ID'et (fx "RAFFLE-001").</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-sm font-semibold text-blue-600">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Forbered dit postkort</h3>
                  <p className="text-slate-600 mb-3">Skriv følgende oplysninger tydeligt på postkortet:</p>
                  <ul className="text-sm text-slate-600 space-y-1 ml-4">
                    <li>• Dit fulde navn</li>
                    <li>• Din fulde adresse</li>
                    <li>• Telefonnummer</li>
                    <li>• E-mail adresse</li>
                    <li>• Lodtræknings-ID (fx "RAFFLE-001")</li>
                    <li>• Skriv "GRATIS DELTAGELSE" øverst</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-sm font-semibold text-blue-600">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Send postkortet</h3>
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <p className="font-semibold text-slate-900 mb-2">Send til:</p>
                    <div className="text-slate-700">
                      DrawDash Gratis Deltagelse<br />
                      PO Box 123<br />
                      1000 København K<br />
                      Danmark
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="card-premium p-6">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <span className="text-amber-500">⏰</span>
                Vigtige Frister
              </h3>
              <ul className="text-sm text-slate-600 space-y-2">
                <li>• Postkortet skal være modtaget senest 24 timer før lodtrækningen</li>
                <li>• Vi anbefaler at sende minimum 3-5 dage i forvejen</li>
                <li>• Kun ét postkort per person per lodtrækning</li>
                <li>• Utilstrækkelige oplysninger diskvalificerer deltagelsen</li>
              </ul>
            </div>

            <div className="card-premium p-6">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <span className="text-green-500">✅</span>
                Bekræftelse
              </h3>
              <ul className="text-sm text-slate-600 space-y-2">
                <li>• Du modtager en bekræftelses-SMS når dit postkort er modtaget</li>
                <li>• Tjek dit telefonnummer er korrekt og læseligt</li>
                <li>• Bekræftelse sendes inden 2 arbejdsdage</li>
                <li>• Kontakt os hvis du ikke får bekræftelse</li>
              </ul>
            </div>
          </motion.div>

          <motion.div
            className="card-premium p-6 mb-8 bg-blue-50 border border-blue-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <span className="text-blue-600">ℹ️</span>
              Vigtig Information
            </h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p>• Gratis deltagelse har samme chance for at vinde som betalte billetter</p>
              <p>• Der er ingen grænse for hvor mange gratis deltagelser du kan have</p>
              <p>• Alle lodtrækninger er transparente og retfærdige</p>
              <p>• Vi opbevarer ikke dine personlige oplysninger længere end nødvendigt</p>
            </div>
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <TrustBadges layout="horizontal" variant="minimal" />
          </motion.div>
        </div>
      </main>
    </div>
  )
}
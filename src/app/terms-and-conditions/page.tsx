'use client'

import { motion } from 'framer-motion'
import PremiumHeader from '@/components/PremiumHeader'
import PremiumFooter from '@/components/PremiumFooter'
import GradientMesh from '@/components/GradientMesh'

export default function TermsAndConditionsPage() {
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
              Vilkår og betingelser
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Læs vores vilkår og betingelser for deltagelse i DrawDash lodtrækninger
            </p>
            <div className="text-sm text-slate-500 mt-4">
              Sidst opdateret: 1. september 2025
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-premium p-8 space-y-8"
          >
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Generelle vilkår</h2>
              <div className="prose prose-slate max-w-none">
                <p>
                  Ved at bruge DrawDash platformen accepterer du disse vilkår og betingelser. 
                  DrawDash drives af 7days Performance Ltd, et licenseret selskab i Danmark.
                </p>
                <ul>
                  <li>Du skal være mindst 18 år for at deltage</li>
                  <li>Kun én konto per person tilladt</li>
                  <li>Alle oplysninger skal være korrekte og opdaterede</li>
                  <li>Vi forbeholder os retten til at suspendere konti ved mistænkelig aktivitet</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Lodtrækninger og deltagelse</h2>
              <div className="prose prose-slate max-w-none">
                <p>
                  Alle lodtrækninger udføres fair og transparent ved hjælp af certificerede tilfældighedsgeneratorer.
                </p>
                <ul>
                  <li>Billetter købes til den angivne pris på lodtrækningssiden</li>
                  <li>Gratis deltagelse via postkort har samme vindersandsynlighed</li>
                  <li>Lodtrækninger afholdes på den angivne dato og tid</li>
                  <li>Vindere annonceres øjeblikkeligt efter lodtrækningen</li>
                  <li>Alle salg er endelige - ingen refundering</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Præmier og levering</h2>
              <div className="prose prose-slate max-w-none">
                <p>
                  Præmier leveres som beskrevet på lodtrækningssiden.
                </p>
                <ul>
                  <li>Fysiske præmier sendes til vinderens adresse inden for 14 dage</li>
                  <li>Kontante præmier overføres til vinderens bankkonto</li>
                  <li>Gavekort sendes via email inden for 24 timer</li>
                  <li>Præmier kan ikke byttes til kontanter medmindre angivet</li>
                  <li>Skatter og afgifter er vinderens ansvar</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">4. DrawDash Rewards points</h2>
              <div className="prose prose-slate max-w-none">
                <p>
                  DrawDash Rewards er vores loyalitetsprogram for registrerede brugere.
                </p>
                <ul>
                  <li>Points optjenes ved køb af lodtrækningsbilletter</li>
                  <li>Points kan bruges som rabat på fremtidige køb</li>
                  <li>Points udløber efter 12 måneder uden aktivitet</li>
                  <li>Minimum indløsning er 100 points</li>
                  <li>Points har ingen kontantværdi</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Ansvarligt spil</h2>
              <div className="prose prose-slate max-w-none">
                <p>
                  DrawDash støtter ansvarligt spil og har politikker på plads for at beskytte brugere.
                </p>
                <ul>
                  <li>Maksimum dagligt forbrug: 1.000 kr</li>
                  <li>Selvudelukkelse muligheder tilgængelige</li>
                  <li>Support for problemspillere via eksterne organisationer</li>
                  <li>Aldersverifikation påkrævet for alle konti</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Persondata og privatliv</h2>
              <div className="prose prose-slate max-w-none">
                <p>
                  Vi respekterer dit privatliv og følger GDPR reglerne.
                </p>
                <ul>
                  <li>Persondata bruges kun til levering af service</li>
                  <li>Data deles aldrig med tredjeparter uden samtykke</li>
                  <li>Du kan anmode om sletning af din data når som helst</li>
                  <li>Se vores privatlivspolitik for flere detaljer</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Ændringer af vilkår</h2>
              <div className="prose prose-slate max-w-none">
                <p>
                  Vi forbeholder os retten til at ændre disse vilkår med 30 dages varsel. 
                  Væsentlige ændringer kommunikeres via email til alle registrerede brugere.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Kontakt</h2>
              <div className="prose prose-slate max-w-none">
                <p>
                  Har du spørgsmål til vores vilkår og betingelser?
                </p>
                <div className="bg-slate-50 rounded-lg p-4 mt-4">
                  <div className="font-mono text-slate-900">
                    7days Performance Ltd<br />
                    Email: support@drawdash.dk<br />
                    Telefon: +45 70 20 50 60<br />
                    Adresse: PO Box 100, Attleborough, NR17 2YU, UK
                  </div>
                </div>
              </div>
            </section>
          </motion.div>
        </div>
      </main>

      <PremiumFooter />
    </div>
  )
}
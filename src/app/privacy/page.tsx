'use client'

import PremiumHeader from '@/components/PremiumHeader'
import GradientMesh from '@/components/GradientMesh'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen relative">
      <GradientMesh variant="hero" />
      <PremiumHeader />
      
      <main className="relative">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="card-premium p-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-6">Privatlivspolitik</h1>
            <p className="text-sm text-slate-600 mb-8">Sidst opdateret: {new Date().toLocaleDateString('da-DK')}</p>
            
            <div className="prose prose-slate max-w-none space-y-6">
              <section>
                <h2 className="text-xl font-semibold text-slate-900 mb-3">1. Dataansvarlig</h2>
                <p className="text-slate-700">
                  DrawDash ApS er dataansvarlig for behandlingen af dine personoplysninger.
                </p>
                <div className="bg-slate-50 p-4 rounded-lg mt-2">
                  <strong>Kontaktoplysninger:</strong><br />
                  DrawDash ApS<br />
                  Email: privacy@drawdash.dk<br />
                  Telefon: +45 XX XX XX XX
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-900 mb-3">2. Hvilke personoplysninger indsamler vi?</h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium text-slate-800">Kontooplysninger:</h3>
                    <ul className="list-disc list-inside text-slate-700 ml-4">
                      <li>Navn (for- og efternavn)</li>
                      <li>Email adresse</li>
                      <li>Telefonnummer (valgfrit)</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-800">Betalingsoplysninger:</h3>
                    <ul className="list-disc list-inside text-slate-700 ml-4">
                      <li>Faktureringsadresse</li>
                      <li>Betalingshistorik</li>
                      <li>Transaktions-ID'er</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-800">Brug af tjeneste:</h3>
                    <ul className="list-disc list-inside text-slate-700 ml-4">
                      <li>IP-adresse</li>
                      <li>Browser information</li>
                      <li>Besøgsstatistikker</li>
                      <li>Loyalty points og tier status</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-900 mb-3">3. Formål med databehandling</h2>
                <ul className="list-disc list-inside text-slate-700 space-y-1">
                  <li>Levering af vores tjenester (lodtrækninger)</li>
                  <li>Behandling af betalinger</li>
                  <li>Kundeservice og support</li>
                  <li>Loyalty program administration</li>
                  <li>Overholdelse af lovkrav</li>
                  <li>Forebyggelse af svindel</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-900 mb-3">4. Retsgrundlag</h2>
                <ul className="list-disc list-inside text-slate-700 space-y-1">
                  <li><strong>Kontraktopfyldelse:</strong> Levering af lodtræknings-tjenester</li>
                  <li><strong>Legitim interesse:</strong> Forebyggelse af svindel og forretningsudvikling</li>
                  <li><strong>Samtykke:</strong> Marketing og ikke-nødvendige cookies</li>
                  <li><strong>Lovkrav:</strong> Bogføring og anti-hvidvask</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-900 mb-3">5. Dine rettigheder</h2>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-800 font-medium mb-2">Du har følgende rettigheder:</p>
                  <ul className="list-disc list-inside text-blue-700 space-y-1">
                    <li>Ret til indsigt i dine personoplysninger</li>
                    <li>Ret til berigtigelse af forkerte oplysninger</li>
                    <li>Ret til sletning ("ret til at blive glemt")</li>
                    <li>Ret til dataportabilitet</li>
                    <li>Ret til begrænsning af behandling</li>
                    <li>Ret til at trække samtykke tilbage</li>
                  </ul>
                  <p className="text-blue-700 mt-3 text-sm">
                    Kontakt privacy@drawdash.dk for at udøve dine rettigheder.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-900 mb-3">6. Cookies</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="border border-slate-300 p-2 text-left">Cookie Type</th>
                        <th className="border border-slate-300 p-2 text-left">Formål</th>
                        <th className="border border-slate-300 p-2 text-left">Varighed</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-300 p-2">Nødvendige</td>
                        <td className="border border-slate-300 p-2">Login, session, indkøbskurv</td>
                        <td className="border border-slate-300 p-2">Session/30 dage</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2">Analytics</td>
                        <td className="border border-slate-300 p-2">Måling af brug og performance</td>
                        <td className="border border-slate-300 p-2">2 år</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2">Marketing</td>
                        <td className="border border-slate-300 p-2">Personaliserede annoncer</td>
                        <td className="border border-slate-300 p-2">1 år</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-900 mb-3">7. Databeskyttelse</h2>
                <ul className="list-disc list-inside text-slate-700 space-y-1">
                  <li>SSL/TLS kryptering af alle data i transit</li>
                  <li>Krypteret opbevaring af følsomme data</li>
                  <li>Adgangskontrol og audit logs</li>
                  <li>Regelmæssige sikkerhedsopdateringer</li>
                  <li>Incident response procedurer</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-900 mb-3">8. Tredjeparter</h2>
                <ul className="list-disc list-inside text-slate-700 space-y-1">
                  <li><strong>Stripe:</strong> Betalingsbehandling (PCI DSS certified)</li>
                  <li><strong>Google/Apple:</strong> OAuth authentication</li>
                  <li><strong>Cloudflare:</strong> CDN og DDoS beskyttelse</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-900 mb-3">9. Opbevaring</h2>
                <p className="text-slate-700">
                  Vi opbevarer dine personoplysninger så længe det er nødvendigt for at levere vores tjenester, 
                  eller som krævet af lov. Kontodata slettes 3 år efter inaktivitet.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-900 mb-3">10. Kontakt</h2>
                <p className="text-slate-700">
                  Har du spørgsmål om denne privatlivspolitik eller behandling af dine personoplysninger, 
                  kan du kontakte os på <a href="mailto:privacy@drawdash.dk" className="text-blue-600 hover:underline">privacy@drawdash.dk</a>
                </p>
                <p className="text-slate-700 mt-2">
                  Du kan også klage til Datatilsynet på <a href="https://www.datatilsynet.dk" className="text-blue-600 hover:underline">www.datatilsynet.dk</a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
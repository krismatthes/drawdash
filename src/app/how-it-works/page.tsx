import Header from '@/components/Header'

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">How DrawDash Works</h1>
          <p className="text-lg text-gray-600">Simple, fair, and transparent raffles</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">1. Choose a Raffle</h3>
            <p className="text-gray-600">Browse our active raffles and pick the prize you want to win</p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎫</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">2. Buy Tickets</h3>
            <p className="text-gray-600">Purchase tickets securely with prices starting from just £0.79</p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⏰</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">3. Wait for Draw</h3>
            <p className="text-gray-600">The draw happens automatically when the timer expires</p>
          </div>
          
          <div className="text-center">
            <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🏆</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">4. Winner Announced</h3>
            <p className="text-gray-600">Winners are announced live on Facebook and contacted directly</p>
          </div>
        </div>

        <div className="space-y-16">
          <section className="bg-white rounded-lg p-8 shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Fair & Transparent</h2>
            <div className="prose prose-lg text-gray-700">
              <p>All our draws are conducted using a certified random number generator to ensure complete fairness. Every ticket has an equal chance of winning, and the process is transparent.</p>
              
              <ul className="mt-4 space-y-2">
                <li>✅ Cryptographically secure random selection</li>
                <li>✅ Live draws broadcast on Facebook</li>
                <li>✅ No rollovers or extensions</li>
                <li>✅ Instant winner notification</li>
              </ul>
            </div>
          </section>

          <section className="bg-white rounded-lg p-8 shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment & Security</h2>
            <div className="prose prose-lg text-gray-700">
              <p>Your payments are processed securely using industry-standard encryption. We accept major credit and debit cards.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Accepted Payment Methods</h3>
                  <ul className="space-y-1 text-sm">
                    <li>💳 Visa</li>
                    <li>💳 Mastercard</li>
                    <li>💳 American Express</li>
                    <li>💳 Apple Pay</li>
                    <li>💳 Google Pay</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Security Features</h3>
                  <ul className="space-y-1 text-sm">
                    <li>🔒 256-bit SSL encryption</li>
                    <li>🛡️ PCI DSS compliant</li>
                    <li>🔐 Secure payment processing</li>
                    <li>📧 Email confirmations</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-lg p-8 shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Prizes & Delivery</h2>
            <div className="prose prose-lg text-gray-700">
              <p>All prizes are genuine and delivered free of charge to UK addresses. Winners are contacted within 24 hours of the draw.</p>
              
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-2">Prize Types</h3>
                <ul className="space-y-2">
                  <li>🚗 <strong>Vehicles:</strong> Full documentation, insurance, and delivery included</li>
                  <li>💰 <strong>Cash Prizes:</strong> Transferred directly to your bank account</li>
                  <li>📱 <strong>Electronics:</strong> Brand new items with full warranty</li>
                  <li>👕 <strong>Fashion & Accessories:</strong> Authentic designer items</li>
                  <li>🏠 <strong>Home & Garden:</strong> High-quality household items</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-blue-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How are winners selected?</h3>
                <p className="text-gray-700">Winners are selected using a certified random number generator that picks a random ticket number from all valid entries.</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Can I buy multiple tickets?</h3>
                <p className="text-gray-700">Yes! You can purchase multiple tickets to increase your chances of winning. Each ticket gives you one entry into the draw.</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What if I don't win?</h3>
                <p className="text-gray-700">While we can't guarantee you'll win, you can enter multiple raffles and try again. All ticket sales are final and non-refundable.</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How do I know if I've won?</h3>
                <p className="text-gray-700">Winners are announced during our live Facebook draw and contacted via email and phone within 24 hours.</p>
              </div>
            </div>
          </section>
        </div>

        <div className="text-center mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-8">Join thousands of satisfied customers and try your luck today!</p>
          <a 
            href="/raffles"
            className="bg-blue-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors inline-block"
          >
            View Active Raffles
          </a>
        </div>
      </div>
    </div>
  )
}
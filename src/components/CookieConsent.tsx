'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// GDPR Compliance Manager
class GDPRConsentManager {
  private static instance: GDPRConsentManager
  private consentCallbacks: { [key: string]: (granted: boolean) => void } = {}

  static getInstance(): GDPRConsentManager {
    if (!GDPRConsentManager.instance) {
      GDPRConsentManager.instance = new GDPRConsentManager()
    }
    return GDPRConsentManager.instance
  }

  // Register callback for when consent changes
  onConsentChange(type: 'analytics' | 'marketing', callback: (granted: boolean) => void) {
    this.consentCallbacks[type] = callback
  }

  // Check if user has consented to specific tracking
  hasConsent(type: 'analytics' | 'marketing'): boolean {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) return false
    
    const parsed = JSON.parse(consent)
    return parsed[type] === true
  }

  // Trigger consent callbacks
  updateConsent(preferences: any) {
    Object.keys(this.consentCallbacks).forEach(type => {
      this.consentCallbacks[type](preferences[type])
    })
  }

  // Block tracking pixels until consent
  blockTrackingPixels() {
    // Block Google Analytics
    if (typeof window !== 'undefined') {
      (window as any).gtag = (...args: any[]) => {
        if (this.hasConsent('analytics')) {
          // Only execute if consent given
          return (window as any)._gtag?.apply(window, args)
        }
      }

      // Block Facebook Pixel
      ;(window as any).fbq = (...args: any[]) => {
        if (this.hasConsent('marketing')) {
          return (window as any)._fbq?.apply(window, args)
        }
      }

      // Block other tracking scripts
      this.interceptScriptLoading()
    }
  }

  private interceptScriptLoading() {
    const originalAppendChild = document.head.appendChild
    document.head.appendChild = function(node: any) {
      if (node.tagName === 'SCRIPT' && node.src) {
        const src = node.src.toLowerCase()
        
        // Block analytics scripts without consent
        if ((src.includes('google-analytics') || src.includes('googletagmanager')) && 
            !GDPRConsentManager.getInstance().hasConsent('analytics')) {
          console.log('Blocked analytics script:', src)
          return node
        }
        
        // Block marketing scripts without consent
        if ((src.includes('facebook') || src.includes('fbpx') || src.includes('doubleclick')) && 
            !GDPRConsentManager.getInstance().hasConsent('marketing')) {
          console.log('Blocked marketing script:', src)
          return node
        }
      }
      
      return originalAppendChild.call(this, node)
    }
  }
}

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true, cannot be changed
    analytics: false,
    marketing: false
  })

  const consentManager = GDPRConsentManager.getInstance()

  useEffect(() => {
    // Block all tracking by default
    consentManager.blockTrackingPixels()
    
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      setShowBanner(true)
    } else {
      const saved = JSON.parse(consent)
      setPreferences(saved)
      // Apply saved consent preferences
      consentManager.updateConsent(saved)
    }
  }, [])

  const acceptAll = () => {
    const consent = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: Date.now()
    }
    localStorage.setItem('cookie-consent', JSON.stringify(consent))
    setPreferences(consent)
    consentManager.updateConsent(consent)
    setShowBanner(false)
  }

  const acceptNecessary = () => {
    const consent = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: Date.now()
    }
    localStorage.setItem('cookie-consent', JSON.stringify(consent))
    setPreferences(consent)
    consentManager.updateConsent(consent)
    setShowBanner(false)
  }

  const savePreferences = () => {
    const consent = {
      ...preferences,
      timestamp: Date.now()
    }
    localStorage.setItem('cookie-consent', JSON.stringify(consent))
    setPreferences(consent)
    consentManager.updateConsent(consent)
    setShowBanner(false)
    setShowSettings(false)
  }

  if (!showBanner) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg"
      >
        <div className="max-w-7xl mx-auto p-4">
          {!showSettings ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">🍪 Vi bruger cookies</h3>
                <p className="text-sm text-gray-600">
                  Vi bruger cookies for at forbedre din oplevelse og overholde GDPR. 
                  Nødvendige cookies er altid aktiveret.{' '}
                  <button 
                    onClick={() => setShowSettings(true)}
                    className="text-blue-600 hover:underline"
                  >
                    Tilpas indstillinger
                  </button>
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={acceptNecessary}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Kun nødvendige
                </button>
                <button
                  onClick={acceptAll}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Accepter alle
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Cookie Indstillinger</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Nødvendige cookies</div>
                    <div className="text-sm text-gray-600">Påkrævet for grundlæggende funktionalitet</div>
                  </div>
                  <div className="text-sm text-gray-500">Altid aktiv</div>
                </div>
                
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Analytics cookies</div>
                    <div className="text-sm text-gray-600">Hjælper os med at forstå hvordan siden bruges</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => setPreferences({...preferences, analytics: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Marketing cookies</div>
                    <div className="text-sm text-gray-600">Bruges til at vise relevante annoncer</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) => setPreferences({...preferences, marketing: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Tilbage
                </button>
                <button
                  onClick={savePreferences}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Gem indstillinger
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
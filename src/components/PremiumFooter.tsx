'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext'

export default function PremiumFooter() {
  const { t } = useLanguage()
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    platform: [
      { label: 'Hjem', href: '/' },
      { label: 'Aktive lodtrækninger', href: '/raffles' },
      { label: 'Vindere', href: '/winners' },
      { label: 'Sådan fungerer det', href: '/how-it-works' },
      { label: 'Gratis deltagelse', href: '/free-entry' }
    ],
    support: [
      { label: 'FAQ', href: '/faq' },
      { label: 'Kontakt os', href: '/contact' },
      { label: 'Ansvarligt spil', href: '/responsible-gaming' },
      { label: 'Support', href: '/support' }
    ],
    legal: [
      { label: 'Vilkår og betingelser', href: '/terms-and-conditions' },
      { label: 'Privatlivspolitik', href: '/privacy-policy' },
      { label: 'Cookiepolitik', href: '/cookie-policy' },
      { label: 'Licens information', href: '/license' }
    ]
  }

  const socialLinks = [
    { name: 'Facebook', href: '#', icon: '📘' },
    { name: 'Instagram', href: '#', icon: '📸' },
    { name: 'Twitter', href: '#', icon: '🐦' },
    { name: 'YouTube', href: '#', icon: '📺' }
  ]

  return (
    <footer className="bg-slate-900 text-white relative overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
      
      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden opacity-5">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-emerald-400 rounded-full"
            initial={{
              x: Math.random() * 1400,
              y: Math.random() * 600,
            }}
            animate={{
              y: [Math.random() * 600, Math.random() * 600 - 100, Math.random() * 600],
              x: [Math.random() * 1400, Math.random() * 1400 + 50, Math.random() * 1400],
            }}
            transition={{
              duration: Math.random() * 20 + 20,
              repeat: Infinity,
              delay: Math.random() * 10,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-8"
              >
                <Link href="/" className="inline-block mb-6">
                  <div className="flex items-center group">
                    <motion.div 
                      className="relative"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />
                      <div className="relative bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                        <h2 className="text-3xl font-black tracking-tight">DrawDash</h2>
                      </div>
                    </motion.div>
                  </div>
                </Link>
                
                <p className="text-slate-300 leading-relaxed mb-6 max-w-sm">
                  Danmarks foretrukne platform for lodtrækninger. Fair spil, fantastiske præmier og øjeblikkelige resultater.
                </p>

                {/* Trust Badges */}
                <div className="flex flex-wrap gap-3">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 text-emerald-300 text-xs font-semibold">
                    🔒 SSL Sikret
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2 text-blue-300 text-xs font-semibold">
                    ✓ Verificeret
                  </div>
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg px-3 py-2 text-purple-300 text-xs font-semibold">
                    🏆 Licenseret
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Links Sections */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                
                {/* Platform Links */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                >
                  <h3 className="text-lg font-bold text-white mb-6 relative">
                    Platform
                    <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full" />
                  </h3>
                  <ul className="space-y-3">
                    {footerLinks.platform.map((link, index) => (
                      <li key={link.href}>
                        <Link 
                          href={link.href}
                          className="text-slate-300 hover:text-emerald-400 transition-colors duration-200 text-sm font-medium block py-1"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                {/* Support Links */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="text-lg font-bold text-white mb-6 relative">
                    Support
                    <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full" />
                  </h3>
                  <ul className="space-y-3">
                    {footerLinks.support.map((link, index) => (
                      <li key={link.href}>
                        <Link 
                          href={link.href}
                          className="text-slate-300 hover:text-blue-400 transition-colors duration-200 text-sm font-medium block py-1"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                {/* Legal Links */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="text-lg font-bold text-white mb-6 relative">
                    Juridisk
                    <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full" />
                  </h3>
                  <ul className="space-y-3">
                    {footerLinks.legal.map((link, index) => (
                      <li key={link.href}>
                        <Link 
                          href={link.href}
                          className="text-slate-300 hover:text-purple-400 transition-colors duration-200 text-sm font-medium block py-1"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Social Links & Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="border-t border-slate-700 pt-12 mt-12"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              
              {/* Social Links */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Følg os</h3>
                <div className="flex gap-4">
                  {socialLinks.map((social) => (
                    <Link
                      key={social.name}
                      href={social.href}
                      className="w-12 h-12 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center text-xl transition-all duration-300 hover:scale-110 border border-slate-700 hover:border-slate-600"
                    >
                      {social.icon}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Newsletter Signup */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Hold dig opdateret</h3>
                <div className="flex gap-3">
                  <input
                    type="email"
                    placeholder="Din email adresse"
                    className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                  <motion.button
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-emerald-500/25"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Tilmeld
                  </motion.button>
                </div>
                <p className="text-slate-400 text-xs mt-2">
                  Få besked om nye lodtrækninger og eksklusive tilbud
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700 py-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            
            {/* Copyright */}
            <div className="text-slate-400 text-sm">
              © {currentYear} DrawDash. Alle rettigheder forbeholdes.
            </div>

            {/* Compliance Info */}
            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>System Online</span>
              </div>
              <div>Licenseret af UK Gambling Commission</div>
              <div>CVR: 12345678</div>
              <div>7days Performance Ltd</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
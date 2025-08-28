'use client'

import dynamic from 'next/dynamic'

const ClientRafflePage = dynamic(() => import('./client-page'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-slate-600">Loading raffle...</p>
      </div>
    </div>
  )
})

export default function RafflePage() {
  return <ClientRafflePage />
}
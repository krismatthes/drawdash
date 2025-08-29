'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface ProfitCalculatorProps {
  prizeValue: number
  prizeCost: number
  ticketPrice: number
  totalTickets: number
  soldTickets?: number
  onChange?: (calculations: ProfitCalculations) => void
}

interface ProfitCalculations {
  maxRevenue: number
  totalCost: number
  maxProfit: number
  profitMargin: number
  breakEvenTickets: number
  currentRevenue: number
  currentProfit: number
  currentProfitMargin: number
  markup: number
  recommendedTicketPrice: number
  recommendedTotalTickets: number
}

export default function ProfitCalculator({
  prizeValue,
  prizeCost,
  ticketPrice,
  totalTickets,
  soldTickets = 0,
  onChange
}: ProfitCalculatorProps) {
  const [calculations, setCalculations] = useState<ProfitCalculations>({
    maxRevenue: 0,
    totalCost: 0,
    maxProfit: 0,
    profitMargin: 0,
    breakEvenTickets: 0,
    currentRevenue: 0,
    currentProfit: 0,
    currentProfitMargin: 0,
    markup: 0,
    recommendedTicketPrice: 0,
    recommendedTotalTickets: 0
  })

  useEffect(() => {
    const maxRevenue = ticketPrice * totalTickets
    const platformCost = maxRevenue * 0.05 // 5% platform fee
    const totalCost = prizeCost + platformCost
    const maxProfit = maxRevenue - totalCost
    const profitMargin = maxRevenue > 0 ? (maxProfit / maxRevenue) * 100 : 0
    const breakEvenTickets = ticketPrice > 0 ? Math.ceil(totalCost / ticketPrice) : 0
    
    const currentRevenue = soldTickets * ticketPrice
    const currentCost = prizeCost + (currentRevenue * 0.05)
    const currentProfit = currentRevenue - currentCost
    const currentProfitMargin = currentRevenue > 0 ? (currentProfit / currentRevenue) * 100 : 0
    
    const markup = prizeCost > 0 ? ((prizeValue - prizeCost) / prizeCost) * 100 : 0
    
    // Recommendations for 30% profit margin
    const targetProfitMargin = 0.3
    const recommendedTicketPrice = prizeCost > 0 ? Math.ceil((prizeCost * 1.05) / (totalTickets * (1 - targetProfitMargin - 0.05))) : 0
    const recommendedTotalTickets = ticketPrice > 0 ? Math.ceil((prizeCost * 1.05) / (ticketPrice * (1 - targetProfitMargin - 0.05))) : 0

    const newCalculations = {
      maxRevenue,
      totalCost,
      maxProfit,
      profitMargin,
      breakEvenTickets,
      currentRevenue,
      currentProfit,
      currentProfitMargin,
      markup,
      recommendedTicketPrice,
      recommendedTotalTickets
    }

    setCalculations(newCalculations)
    onChange?.(newCalculations)
  }, [prizeValue, prizeCost, ticketPrice, totalTickets, soldTickets, onChange])

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return 'text-green-600 bg-green-50'
    if (value >= thresholds.warning) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getProfitColor = (margin: number) => {
    if (margin >= 25) return 'text-green-600'
    if (margin >= 10) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
          <span className="text-white text-sm">📊</span>
        </div>
        <h3 className="text-lg font-semibold text-slate-900">Profit & Markup Beregner</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Key Metrics */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <h4 className="font-medium text-slate-700 mb-3">💰 Økonomi Overview</h4>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-slate-500">Max Omsætning</div>
                <div className="font-bold text-blue-600">
                  {calculations.maxRevenue.toLocaleString('da-DK')} kr
                </div>
              </div>
              
              <div>
                <div className="text-slate-500">Total Omkostninger</div>
                <div className="font-bold text-slate-700">
                  {calculations.totalCost.toLocaleString('da-DK')} kr
                </div>
                <div className="text-xs text-slate-400">
                  Præmie: {prizeCost.toLocaleString('da-DK')} kr + Platform: {(calculations.maxRevenue * 0.05).toLocaleString('da-DK')} kr
                </div>
              </div>

              <div className="col-span-2 pt-2 border-t border-slate-200">
                <div className="text-slate-500">Max Profit</div>
                <div className={`font-bold text-lg ${getProfitColor(calculations.profitMargin)}`}>
                  {calculations.maxProfit.toLocaleString('da-DK')} kr
                </div>
                <div className={`text-sm ${getProfitColor(calculations.profitMargin)}`}>
                  {calculations.profitMargin.toFixed(1)}% profit margin
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <h4 className="font-medium text-slate-700 mb-3">📈 Aktuel Status</h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Solgte Billetter:</span>
                <span className="font-semibold">{soldTickets}/{totalTickets}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-500">Aktuel Omsætning:</span>
                <span className="font-semibold text-green-600">
                  {calculations.currentRevenue.toLocaleString('da-DK')} kr
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-500">Aktuel Profit:</span>
                <span className={`font-semibold ${getProfitColor(calculations.currentProfitMargin)}`}>
                  {calculations.currentProfit.toLocaleString('da-DK')} kr
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Break-even:</span>
                <span className="font-semibold">
                  {calculations.breakEvenTickets} billetter
                </span>
              </div>
            </div>

            {soldTickets > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-200">
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((soldTickets / totalTickets) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>{((soldTickets / totalTickets) * 100).toFixed(1)}% solgt</span>
                  <span>{totalTickets - soldTickets} tilbage</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Analysis & Recommendations */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <h4 className="font-medium text-slate-700 mb-3">🎯 Markup Analyse</h4>
            
            <div className="space-y-3">
              <div className={`p-3 rounded-lg ${getStatusColor(calculations.markup, { good: 30, warning: 15 })}`}>
                <div className="font-semibold">Markup: {calculations.markup.toFixed(1)}%</div>
                <div className="text-sm opacity-80">
                  Salgsværdi vs. indkøbspris
                </div>
              </div>

              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Præmie Indkøbspris:</span>
                  <span className="font-semibold">{prizeCost.toLocaleString('da-DK')} kr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Præmie Salgsværdi:</span>
                  <span className="font-semibold">{prizeValue.toLocaleString('da-DK')} kr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Markup Beløb:</span>
                  <span className="font-semibold text-green-600">
                    +{(prizeValue - prizeCost).toLocaleString('da-DK')} kr
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <h4 className="font-medium text-slate-700 mb-3">💡 Anbefalinger</h4>
            
            <div className="space-y-3 text-sm">
              <div>
                <div className="font-medium text-slate-600">For 30% profit margin:</div>
                <div className="mt-1 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Anbefalet billetpris:</span>
                    <span className="font-semibold text-blue-600">
                      {calculations.recommendedTicketPrice} kr
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Eller total billetter:</span>
                    <span className="font-semibold text-blue-600">
                      {calculations.recommendedTotalTickets.toLocaleString('da-DK')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                <div className="font-medium text-green-800 mb-1">📋 Optimering Tips</div>
                <ul className="text-xs text-green-700 space-y-1">
                  {calculations.profitMargin < 20 && (
                    <li>• Øg billetprisen eller antal billetter for bedre margin</li>
                  )}
                  {calculations.breakEvenTickets > totalTickets * 0.8 && (
                    <li>• Break-even punkt er højt - overvej at justere priser</li>
                  )}
                  {calculations.markup < 25 && (
                    <li>• Markup er lav - forhandl bedre indkøbspriser</li>
                  )}
                  <li>• Platform gebyr: 5% af omsætning</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-blue-200">
        <div className="flex flex-wrap gap-2">
          <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            Margin: {calculations.profitMargin >= 25 ? '✅' : calculations.profitMargin >= 10 ? '⚠️' : '❌'} {calculations.profitMargin.toFixed(1)}%
          </div>
          <div className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
            Break-even: {calculations.breakEvenTickets} billetter
          </div>
          <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            Markup: {calculations.markup.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  )
}
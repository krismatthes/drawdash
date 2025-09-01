'use client'

import { useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { LoyaltyCalculator } from '@/lib/loyalty'

export default function LoyaltyManagement() {
  const [userId, setUserId] = useState('')
  const [totalSpent, setTotalSpent] = useState('')
  const [currentPoints, setCurrentPoints] = useState('')
  const [result, setResult] = useState<any>(null)

  const calculateCorrectPoints = () => {
    const spent = parseFloat(totalSpent)
    const current = parseInt(currentPoints)
    
    if (!spent || !current) return
    
    const tier = LoyaltyCalculator.getUserTier(spent)
    const pointsCalculation = LoyaltyCalculator.calculatePointsEarned(spent, 1, tier.tier as any)
    
    const difference = pointsCalculation.totalPoints - current
    const valueDifference = difference / 200 // 200 points = 1 kr
    
    setResult({
      tier,
      current,
      expected: pointsCalculation.totalPoints,
      difference,
      valueDifference,
      breakdown: pointsCalculation.breakdown
    })
  }

  const fixUserPoints = () => {
    if (!result) return
    
    // Mock implementation - replace with actual API call
    console.log(`Fixing user ${userId} points:`, {
      from: result.current,
      to: result.expected,
      difference: result.difference
    })
    
    alert(`Points fixed! User ${userId} now has ${result.expected} points (added ${result.difference} points worth ${result.valueDifference.toFixed(2)} kr)`)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Loyalty Points Reconciliation</h1>
          <p className="text-gray-600">Fix user points based on their total spending</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Calculate Correct Points</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User ID
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="user123"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Spent (kr)
              </label>
              <input
                type="number"
                value={totalSpent}
                onChange={(e) => setTotalSpent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="12500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Points
              </label>
              <input
                type="number"
                value={currentPoints}
                onChange={(e) => setCurrentPoints(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="5000"
              />
            </div>
          </div>
          
          <button
            onClick={calculateCorrectPoints}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Calculate Correct Points
          </button>
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Analysis Results</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">User Tier</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{result.tier.icon}</span>
                  <span className="font-medium" style={{ color: result.tier.color }}>
                    {result.tier.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({result.tier.pointsMultiplier}x multiplier)
                  </span>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Points Summary</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Current Points:</span>
                    <span>{result.current.toLocaleString('da-DK')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expected Points:</span>
                    <span className="font-medium">{result.expected.toLocaleString('da-DK')}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Difference:</span>
                    <span className="font-medium">+{result.difference.toLocaleString('da-DK')}</span>
                  </div>
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Value Difference:</span>
                    <span>+{result.valueDifference.toFixed(2)} kr</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="font-medium text-gray-900 mb-2">Points Calculation Breakdown</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-1 text-sm">
                <div>{result.breakdown.base}</div>
                {result.breakdown.tierBonus && <div>{result.breakdown.tierBonus}</div>}
                {result.breakdown.quantityBonus && <div>{result.breakdown.quantityBonus}</div>}
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">Ready to Fix Points?</h4>
              <p className="text-yellow-700 text-sm mb-3">
                This will add {result.difference.toLocaleString('da-DK')} points to user {userId}'s account, 
                worth {result.valueDifference.toFixed(2)} kr.
              </p>
              <button
                onClick={fixUserPoints}
                className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700"
              >
                Fix User Points
              </button>
            </div>
          </div>
        )}
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-800 mb-2">Quick Fix for Admin User</h3>
          <p className="text-blue-700 text-sm mb-3">
            Admin user spent 12.500 kr but only has 5.000 points. Expected: 22.500 points.
          </p>
          <button
            onClick={() => {
              setUserId('admin')
              setTotalSpent('12500')
              setCurrentPoints('5000')
              setTimeout(calculateCorrectPoints, 100)
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Calculate Admin Fix
          </button>
        </div>
      </div>
    </AdminLayout>
  )
}
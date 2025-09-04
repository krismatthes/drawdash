'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { LoyaltyUser } from '@/types/loyalty'
import { bonusRewardService, UserBonus } from '@/lib/bonusRewardService'
import { bonusTriggerService } from '@/lib/bonusTriggerService'
import { antiFraud } from '@/lib/antiFraud'
import { fraudRulesEngine } from '@/lib/fraudRulesEngine'
import { Balance, UserBalance } from '@/lib/balanceService'

interface User extends LoyaltyUser {
  id: string
  email: string
  firstName: string
  lastName: string
  isAdmin: boolean
  phone?: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
  activeBonuses?: UserBonus[]
  balance?: UserBalance
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isAuthenticated: boolean
  refreshUserBonuses: () => void
  refreshUserBalance: () => void
}

interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUserBonuses = () => {
    if (user) {
      const activeBonuses = bonusRewardService.getActiveBonusesForUser(user.id)
      const updatedUser = { ...user, activeBonuses }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
  }

  const refreshUserBalance = () => {
    if (user) {
      const userBalance = Balance.getBalance(user.id)
      const updatedUser = { ...user, balance: userBalance }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
  }

  useEffect(() => {
    // Check if user is logged in on page load
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setUser(parsedUser)
        // Load active bonuses and balance for the user
        setTimeout(() => {
          refreshUserBonuses()
          refreshUserBalance()
        }, 100)
      } catch (error) {
        localStorage.removeItem('user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock authentication for demo purposes
    if (email === 'test@test.dk' && password === 'test123') {
      const mockUser: User = {
        id: 'user_1',
        email: 'test@test.dk',
        firstName: 'Test',
        lastName: 'Bruger',
        isAdmin: false,
        loyaltyTier: 'gold',
        points: 17500,
        totalSpent: 12500
      }
      setUser(mockUser)
      localStorage.setItem('user', JSON.stringify(mockUser))
      setIsLoading(false)
      // Load bonuses and balance after login
      setTimeout(() => {
        refreshUserBonuses()
        refreshUserBalance()
      }, 100)
      return { success: true }
    }
    
    if (email === 'admin@test.dk' && password === 'admin123') {
      const adminUser: User = {
        id: 'admin_1',
        email: 'admin@test.dk',
        firstName: 'Admin',
        lastName: 'User',
        isAdmin: true,
        loyaltyTier: 'diamond',
        points: 5000,
        totalSpent: 12500
      }
      setUser(adminUser)
      localStorage.setItem('user', JSON.stringify(adminUser))
      setIsLoading(false)
      // Load bonuses and balance after login
      setTimeout(() => {
        refreshUserBonuses()
        refreshUserBalance()
      }, 100)
      return { success: true }
    }
    
    setIsLoading(false)
    return { success: false, error: 'Ugyldig email eller adgangskode' }
  }

  const register = async (userData: RegisterData): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    
    try {
      // Get user's IP and device info for fraud detection
      const ip = '127.0.0.1' // In production, get real IP
      const userAgent = navigator.userAgent
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Check if email already exists (mock check)
      if (userData.email === 'test@test.dk' || userData.email === 'admin@test.dk') {
        setIsLoading(false)
        return { success: false, error: 'Email allerede i brug' }
      }

      // Fraud assessment before registration
      const tempUserId = `temp_user_${Date.now()}`
      const fraudAssessment = await fraudRulesEngine.assessUser(
        tempUserId,
        {
          email: userData.email,
          ip,
          userAgent,
          accountAge: 0 // New account
        }
      )

      // Block registration if high fraud risk
      if (fraudAssessment.recommendation === 'block') {
        setIsLoading(false)
        return { 
          success: false, 
          error: 'Registration kunne ikke gennemføres. Kontakt venligst support.' 
        }
      }

      // Create device fingerprint
      await antiFraud.generateDeviceFingerprint()
      
      // Create new mock user
      const newUser: User = {
        id: `user_${Date.now()}`,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        isAdmin: false,
        loyaltyTier: 'bronze',
        points: 0,
        totalSpent: 0
      }
      
      setUser(newUser)
      localStorage.setItem('user', JSON.stringify(newUser))

      // Process registration event for bonus triggers with fraud checks
      setTimeout(async () => {
        try {
          const bonusResults = await bonusTriggerService.processRegistrationEvent(
            newUser.id,
            {
              loyaltyTier: newUser.loyaltyTier,
              points: newUser.points,
              totalSpent: newUser.totalSpent
            },
            ip,
            userAgent
          )

          // Log successful bonus assignments
          const successfulBonuses = bonusResults.filter(result => result.triggered)
          if (successfulBonuses.length > 0) {
            console.log(`Assigned ${successfulBonuses.length} welcome bonuses to new user ${newUser.id}`)
            
            // Show notification to user about bonuses
            // In a real app, you might want to show a toast notification
          }

          // Check for any fraud flags in bonus assignment
          const fraudFlags = bonusResults.filter(result => 
            result.fraudFlags && result.fraudFlags.length > 0
          )
          
          if (fraudFlags.length > 0) {
            console.warn('Fraud flags detected during bonus assignment:', fraudFlags)
          }
        } catch (error) {
          console.warn('Failed to process registration bonuses:', error)
          // Don't fail registration if bonus assignment fails
        }
        
        refreshUserBonuses()
      }, 100)

      setIsLoading(false)
      return { success: true }
    } catch (error) {
      setIsLoading(false)
      console.error('Registration error:', error)
      return { 
        success: false, 
        error: 'Der opstod en fejl under registrering. Prøv igen.' 
      }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      register,
      logout,
      isAuthenticated,
      refreshUserBonuses,
      refreshUserBalance
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
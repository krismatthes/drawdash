'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { LoyaltyUser } from '@/types/loyalty'
import { bonusRewardService, UserBonus } from '@/lib/bonusRewardService'
import { bonusTriggerService } from '@/lib/bonusTriggerService'
import { antiFraud } from '@/lib/antiFraud'
import { fraudRulesEngine } from '@/lib/fraudRulesEngine'
import { Balance, UserBalance } from '@/lib/balanceService'
import { userService } from '@/lib/userService'

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
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(updatedUser))
      }
    }
  }

  const refreshUserBalance = () => {
    if (user) {
      const userBalance = Balance.getBalance(user.id)
      const updatedUser = { ...user, balance: userBalance }
      setUser(updatedUser)
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(updatedUser))
      }
    }
  }

  useEffect(() => {
    // Check if user is logged in on page load
    if (typeof window !== 'undefined') {
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
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    
    try {
      const result = await userService.authenticateUser(email, password)
      
      if (result.success && result.user) {
        const user: User = {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          isAdmin: result.user.isAdmin,
          phone: result.user.phone,
          loyaltyTier: result.user.loyaltyTier,
          points: result.user.points,
          totalSpent: result.user.totalSpent
        }
        
        setUser(user)
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(user))
        }
        
        // Load bonuses and balance after login
        setTimeout(() => {
          refreshUserBonuses()
          refreshUserBalance()
        }, 100)
        
        setIsLoading(false)
        return { success: true }
      } else {
        setIsLoading(false)
        return { success: false, error: result.error || 'Ugyldig email eller adgangskode' }
      }
    } catch (error) {
      setIsLoading(false)
      console.error('Login error:', error)
      return { success: false, error: 'Der opstod en fejl under login. Prøv igen.' }
    }
  }

  const register = async (userData: RegisterData): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    
    try {
      const result = await userService.createUser({
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName
      })
      
      if (result.success && result.user) {
        const user: User = {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          isAdmin: result.user.isAdmin,
          phone: result.user.phone,
          loyaltyTier: result.user.loyaltyTier,
          points: result.user.points,
          totalSpent: result.user.totalSpent
        }
        
        setUser(user)
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(user))
        }
        
        // Load bonuses and balance after registration
        setTimeout(() => {
          refreshUserBonuses()
          refreshUserBalance()
        }, 100)
        
        setIsLoading(false)
        return { success: true }
      } else {
        setIsLoading(false)
        return { success: false, error: result.error || 'Registrering fejlede' }
      }
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
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
    }
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
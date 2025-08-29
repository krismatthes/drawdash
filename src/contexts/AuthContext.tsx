'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { LoyaltyUser } from '@/types/loyalty'

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
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isAuthenticated: boolean
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

  useEffect(() => {
    // Check if user is logged in on page load
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
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
    
    // Mock authentication - in real app this would be API call
    // Test bruger: admin@test.dk / admin123 (admin)
    // Test bruger: test@test.dk / test123 (normal bruger)
    if (email && password) {
      let mockUser: User | null = null
      
      if (email === 'admin@test.dk' && password === 'admin123') {
        mockUser = {
          id: '1',
          email: email,
          firstName: 'Admin',
          lastName: 'Bruger',
          isAdmin: true,
          points: 5000,
          totalSpent: 12500,
          loyaltyTier: 'diamond'
        }
      } else if (email === 'test@test.dk' && password === 'test123') {
        mockUser = {
          id: '2',
          email: email,
          firstName: 'Test',
          lastName: 'Bruger',
          isAdmin: false,
          points: 800,
          totalSpent: 2800,
          loyaltyTier: 'gold'
        }
      } else if (email && password.length >= 3) {
        // Allow any email/password combo for demo
        mockUser = {
          id: Date.now().toString(),
          email: email,
          firstName: email.split('@')[0],
          lastName: 'Bruger',
          isAdmin: email.includes('admin'),
          points: 180,
          totalSpent: 300,
          loyaltyTier: 'bronze'
        }
      }
      
      if (mockUser) {
        setUser(mockUser)
        localStorage.setItem('user', JSON.stringify(mockUser))
        setIsLoading(false)
        return { success: true }
      }
    }
    
    setIsLoading(false)
    return { success: false, error: 'Ugyldig email eller adgangskode' }
  }

  const register = async (userData: RegisterData): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock registration
    if (userData.email && userData.password && userData.firstName && userData.lastName) {
      const newUser: User = {
        id: Date.now().toString(),
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        isAdmin: false,
        points: 0,
        totalSpent: 0,
        loyaltyTier: 'bronze'
      }
      
      setUser(newUser)
      localStorage.setItem('user', JSON.stringify(newUser))
      setIsLoading(false)
      return { success: true }
    } else {
      setIsLoading(false)
      return { success: false, error: 'Alle felter skal udfyldes' }
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
      isAuthenticated
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
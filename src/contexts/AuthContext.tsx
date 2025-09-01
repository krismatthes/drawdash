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
      return { success: true }
    }
    
    setIsLoading(false)
    return { success: false, error: 'Ugyldig email eller adgangskode' }
  }

  const register = async (userData: RegisterData): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Mock registration for demo purposes
    // Check if email already exists (mock check)
    if (userData.email === 'test@test.dk' || userData.email === 'admin@test.dk') {
      setIsLoading(false)
      return { success: false, error: 'Email allerede i brug' }
    }
    
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
    setIsLoading(false)
    return { success: true }
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
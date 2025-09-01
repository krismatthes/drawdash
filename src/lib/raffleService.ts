'use client'

// SECURITY WARNING: This service uses localStorage for data persistence, which is insecure as users can manipulate data in the browser. For production, implement server-side storage and API endpoints with proper authentication.

import { Raffle, RaffleEntry } from '@/types/raffle'
import { mockRaffles } from './mockData'

// Storage keys
const RAFFLES_STORAGE_KEY = 'drawdash_raffles'
const RAFFLE_ENTRIES_STORAGE_KEY = 'drawdash_raffle_entries'
const RAFFLE_ACTIVITY_KEY = 'drawdash_raffle_activity'

// Activity log type
export interface RaffleActivity {
  id: string
  raffleId: string
  action: 'created' | 'updated' | 'deleted' | 'winner_selected' | 'status_changed'
  details: string
  timestamp: Date
  adminUser: string
}

// Initialize storage with mock data if empty
const initializeStorage = () => {
  if (typeof window === 'undefined') return

  const existingRaffles = localStorage.getItem(RAFFLES_STORAGE_KEY)
  if (!existingRaffles) {
    localStorage.setItem(RAFFLES_STORAGE_KEY, JSON.stringify(mockRaffles))
  }

  const existingEntries = localStorage.getItem(RAFFLE_ENTRIES_STORAGE_KEY)
  if (!existingEntries) {
    localStorage.setItem(RAFFLE_ENTRIES_STORAGE_KEY, JSON.stringify([]))
  }

  const existingActivity = localStorage.getItem(RAFFLE_ACTIVITY_KEY)
  if (!existingActivity) {
    localStorage.setItem(RAFFLE_ACTIVITY_KEY, JSON.stringify([]))
  }
}

// Initialize on import
initializeStorage()

// Helper function to log activity
const logActivity = (raffleId: string, action: RaffleActivity['action'], details: string, adminUser: string = 'Admin User') => {
  if (typeof window === 'undefined') return

  const activities = JSON.parse(localStorage.getItem(RAFFLE_ACTIVITY_KEY) || '[]') as RaffleActivity[]
  const newActivity: RaffleActivity = {
    id: Date.now().toString(),
    raffleId,
    action,
    details,
    timestamp: new Date(),
    adminUser
  }
  activities.unshift(newActivity) // Add to beginning
  localStorage.setItem(RAFFLE_ACTIVITY_KEY, JSON.stringify(activities))
}

// Raffle CRUD Operations
export const raffleService = {
  // Get all raffles
  getAllRaffles: (): Raffle[] => {
    if (typeof window === 'undefined') return mockRaffles
    
    const stored = localStorage.getItem(RAFFLES_STORAGE_KEY)
    if (!stored) return mockRaffles
    
    const raffles = JSON.parse(stored) as Raffle[]
    // Convert date strings back to Date objects
    return raffles.map(raffle => ({
      ...raffle,
      endDate: new Date(raffle.endDate),
      endsAt: raffle.endsAt ? new Date(raffle.endsAt) : undefined
    }))
  },

  // Get raffle by ID
  getRaffleById: (id: string): Raffle | null => {
    const raffles = raffleService.getAllRaffles()
    return raffles.find(raffle => raffle.id === id) || null
  },

  // Create new raffle
  createRaffle: (raffleData: Omit<Raffle, 'id' | 'soldTickets' | 'participants'>): Raffle => {
    const raffles = raffleService.getAllRaffles()
    
    const newRaffle: Raffle = {
      ...raffleData,
      id: Date.now().toString(),
      soldTickets: 0,
      participants: 0
    }
    
    raffles.push(newRaffle)
    localStorage.setItem(RAFFLES_STORAGE_KEY, JSON.stringify(raffles))
    
    logActivity(newRaffle.id, 'created', `Raffle "${newRaffle.title}" created`)
    
    return newRaffle
  },

  // Update raffle
  updateRaffle: (id: string, updates: Partial<Raffle>): Raffle | null => {
    const raffles = raffleService.getAllRaffles()
    const index = raffles.findIndex(raffle => raffle.id === id)
    
    if (index === -1) return null
    
    const oldRaffle = raffles[index]
    const updatedRaffle = { ...oldRaffle, ...updates }
    raffles[index] = updatedRaffle
    
    localStorage.setItem(RAFFLES_STORAGE_KEY, JSON.stringify(raffles))
    
    logActivity(id, 'updated', `Raffle "${updatedRaffle.title}" updated`)
    
    return updatedRaffle
  },

  // Delete raffle
  deleteRaffle: (id: string): boolean => {
    const raffles = raffleService.getAllRaffles()
    const raffle = raffles.find(r => r.id === id)
    
    if (!raffle) return false
    
    const filteredRaffles = raffles.filter(raffle => raffle.id !== id)
    localStorage.setItem(RAFFLES_STORAGE_KEY, JSON.stringify(filteredRaffles))
    
    // Also delete related entries
    const entries = JSON.parse(localStorage.getItem(RAFFLE_ENTRIES_STORAGE_KEY) || '[]') as RaffleEntry[]
    const filteredEntries = entries.filter(entry => entry.raffleId !== id)
    localStorage.setItem(RAFFLE_ENTRIES_STORAGE_KEY, JSON.stringify(filteredEntries))
    
    logActivity(id, 'deleted', `Raffle "${raffle.title}" deleted`)
    
    return true
  },

  // Bulk operations
  bulkUpdateStatus: (ids: string[], status: Raffle['status']): number => {
    let updatedCount = 0
    ids.forEach(id => {
      const updated = raffleService.updateRaffle(id, { status })
      if (updated) {
        updatedCount++
        logActivity(id, 'status_changed', `Status changed to "${status}"`)
      }
    })
    return updatedCount
  },

  bulkDelete: (ids: string[]): number => {
    let deletedCount = 0
    ids.forEach(id => {
      if (raffleService.deleteRaffle(id)) {
        deletedCount++
      }
    })
    return deletedCount
  },

  // Statistics
  getRaffleStats: () => {
    const raffles = raffleService.getAllRaffles()
    const active = raffles.filter(r => r.status === 'active').length
    const ended = raffles.filter(r => r.status === 'ended').length
    const upcoming = raffles.filter(r => r.status === 'upcoming').length
    const totalRevenue = raffles.reduce((sum, r) => sum + (r.soldTickets * r.ticketPrice), 0)
    const totalTicketsSold = raffles.reduce((sum, r) => sum + r.soldTickets, 0)
    
    return {
      total: raffles.length,
      active,
      ended,
      upcoming,
      totalRevenue,
      totalTicketsSold
    }
  },

  // Winner selection
  selectWinner: (raffleId: string): { winner: RaffleEntry | null; winningTicket: number | null } => {
    const raffle = raffleService.getRaffleById(raffleId)
    if (!raffle || raffle.soldTickets === 0) {
      return { winner: null, winningTicket: null }
    }

    const entries = JSON.parse(localStorage.getItem(RAFFLE_ENTRIES_STORAGE_KEY) || '[]') as RaffleEntry[]
    const raffleEntries = entries.filter(entry => entry.raffleId === raffleId)
    
    if (raffleEntries.length === 0) {
      return { winner: null, winningTicket: null }
    }

    // Get all ticket numbers
    const allTickets: number[] = []
    raffleEntries.forEach(entry => {
      allTickets.push(...entry.ticketNumbers)
    })

    // Select random winning ticket
    const winningTicket = allTickets[Math.floor(Math.random() * allTickets.length)]
    
    // Find the winner
    const winner = raffleEntries.find(entry => 
      entry.ticketNumbers.includes(winningTicket)
    )

    if (winner && winningTicket) {
      // Update raffle status to ended
      raffleService.updateRaffle(raffleId, { status: 'ended' })
      
      logActivity(
        raffleId, 
        'winner_selected', 
        `Winner selected for "${raffle.title}" - Ticket #${winningTicket}`
      )
    }

    return { winner: winner || null, winningTicket }
  },

  // Activity log
  getActivity: (raffleId?: string): RaffleActivity[] => {
    if (typeof window === 'undefined') return []
    
    const activities = JSON.parse(localStorage.getItem(RAFFLE_ACTIVITY_KEY) || '[]') as RaffleActivity[]
    
    // Convert timestamp strings back to Date objects
    const formattedActivities = activities.map(activity => ({
      ...activity,
      timestamp: new Date(activity.timestamp)
    }))
    
    if (raffleId) {
      return formattedActivities.filter(activity => activity.raffleId === raffleId)
    }
    
    return formattedActivities
  },

  // Search and filter
  searchRaffles: (query: string, filters?: {
    status?: Raffle['status']
    category?: string
    isInstantWin?: boolean
  }): Raffle[] => {
    let raffles = raffleService.getAllRaffles()
    
    // Apply text search
    if (query) {
      const lowerQuery = query.toLowerCase()
      raffles = raffles.filter(raffle =>
        raffle.title.toLowerCase().includes(lowerQuery) ||
        raffle.description.toLowerCase().includes(lowerQuery) ||
        raffle.category?.toLowerCase().includes(lowerQuery)
      )
    }
    
    // Apply filters
    if (filters) {
      if (filters.status) {
        raffles = raffles.filter(raffle => raffle.status === filters.status)
      }
      if (filters.category) {
        raffles = raffles.filter(raffle => raffle.category === filters.category)
      }
      if (filters.isInstantWin !== undefined) {
        raffles = raffles.filter(raffle => raffle.isInstantWin === filters.isInstantWin)
      }
    }
    
    return raffles
  },

  // Export data
  exportRaffleData: (raffleId?: string) => {
    const raffles = raffleId 
      ? [raffleService.getRaffleById(raffleId)].filter(Boolean) as Raffle[]
      : raffleService.getAllRaffles()
    
    const entries = JSON.parse(localStorage.getItem(RAFFLE_ENTRIES_STORAGE_KEY) || '[]') as RaffleEntry[]
    
    return {
      raffles,
      entries: raffleId ? entries.filter(e => e.raffleId === raffleId) : entries,
      exportDate: new Date().toISOString()
    }
  }
}
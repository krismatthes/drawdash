export interface UserEntry {
  id: string
  raffleId: string
  raffleTitle: string
  raffleImage: string
  ticketNumbers: number[]
  ticketCount: number
  amountPaid: number
  entryDate: Date
  status: 'active' | 'completed'
  result?: 'won' | 'lost' | 'pending'
  winningAmount?: number
  prizeClaimed?: boolean
}

export interface UserWinning {
  id: string
  raffleId: string
  raffleTitle: string
  raffleImage: string
  winningTicketNumber: number
  prizeValue: number
  prizeDescription: string
  wonDate: Date
  claimedDate?: Date
  status: 'pending' | 'claimed'
}

export interface UserStats {
  totalSpent: number
  totalWon: number
  totalEntries: number
  winningEntries: number
  winRate: number
}

// Mock bruger data for test@test.dk
export const mockUserEntries: UserEntry[] = [
  {
    id: '1',
    raffleId: '2',
    raffleTitle: 'iPhone 15 Pro Max',
    raffleImage: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop',
    ticketNumbers: [1234, 1235, 1236],
    ticketCount: 3,
    amountPaid: 15, // 3 x 5 kr
    entryDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    status: 'active',
    result: 'pending'
  },
  {
    id: '2',
    raffleId: '1',
    raffleTitle: 'BMW M4 Competition',
    raffleImage: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop',
    ticketNumbers: [567, 568],
    ticketCount: 2,
    amountPaid: 50, // 2 x 25 kr
    entryDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    status: 'active',
    result: 'pending'
  },
  {
    id: '3',
    raffleId: '7',
    raffleTitle: '🎯 INSTANT WIN: 5.000 kr Cash',
    raffleImage: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=300&fit=crop',
    ticketNumbers: [89],
    ticketCount: 1,
    amountPaid: 8,
    entryDate: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    status: 'active',
    result: 'pending'
  },
  {
    id: '4',
    raffleId: 'old1',
    raffleTitle: 'Samsung Galaxy S24',
    raffleImage: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=300&fit=crop',
    ticketNumbers: [1001, 1002, 1003, 1004, 1005],
    ticketCount: 5,
    amountPaid: 50, // 5 x 10 kr
    entryDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
    status: 'completed',
    result: 'lost'
  },
  {
    id: '5',
    raffleId: 'old2',
    raffleTitle: 'Apple Watch Series 9',
    raffleImage: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop',
    ticketNumbers: [2345],
    ticketCount: 1,
    amountPaid: 12,
    entryDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
    status: 'completed',
    result: 'won',
    winningAmount: 4500
  },
  {
    id: '6',
    raffleId: 'old3',
    raffleTitle: '£100 Amazon Gavekort',
    raffleImage: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop',
    ticketNumbers: [777, 778],
    ticketCount: 2,
    amountPaid: 12, // 2 x 6 kr
    entryDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    status: 'completed',
    result: 'won',
    winningAmount: 1000
  }
]

export const mockUserWinnings: UserWinning[] = [
  {
    id: '1',
    raffleId: 'old2',
    raffleTitle: 'Apple Watch Series 9',
    raffleImage: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop',
    winningTicketNumber: 2345,
    prizeValue: 4500,
    prizeDescription: 'Apple Watch Series 9 GPS 45mm med Sport Band',
    wonDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000), // 18 days ago
    claimedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
    status: 'claimed'
  },
  {
    id: '2',
    raffleId: 'old3',
    raffleTitle: '1.000 kr Amazon Gavekort',
    raffleImage: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop',
    winningTicketNumber: 777,
    prizeValue: 1000,
    prizeDescription: '1.000 kr Amazon gavekort sendt via email',
    wonDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000), // 28 days ago
    claimedDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
    status: 'claimed'
  }
]

export const mockUserStats: UserStats = {
  totalSpent: 147, // Sum of all amountPaid
  totalWon: 5500, // Sum of all winningAmount
  totalEntries: 6,
  winningEntries: 2,
  winRate: 33.3 // (2/6) * 100
}

// Function to get user data by user ID
export function getUserEntries(userId: string): UserEntry[] {
  // In real app, this would fetch from API based on userId
  return mockUserEntries
}

export function getUserWinnings(userId: string): UserWinning[] {
  // In real app, this would fetch from API based on userId
  return mockUserWinnings
}

export function getUserStats(userId: string): UserStats {
  // In real app, this would calculate from API data
  return mockUserStats
}
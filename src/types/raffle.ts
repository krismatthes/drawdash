export interface Raffle {
  id: string
  title: string
  description: string
  image: string
  ticketPrice: number
  totalTickets: number
  soldTickets: number
  endDate: Date
  status: 'active' | 'ended' | 'upcoming'
  isInstantWin: boolean
  participants: number
  emoji?: string
  category?: string
  endsAt?: Date
  prize: {
    name: string
    value: number
    cost: number // New: Prize cost for markup calculation
    description: string
    images?: string[] // New: Multiple uploaded images
  }
}

export interface RaffleEntry {
  id: string
  raffleId: string
  userId: string
  ticketNumbers: number[]
  purchaseDate: Date
  amount: number
}
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
    description: string
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
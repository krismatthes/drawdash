import { Raffle } from '@/types/raffle'

export const mockRaffles: Raffle[] = [
  {
    id: '1',
    title: 'BMW M4 Competition',
    description: 'Win this stunning BMW M4 Competition with only 5,000 miles on the clock',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop',
    ticketPrice: 25,
    totalTickets: 5000,
    soldTickets: 3250,
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    status: 'active',
    isInstantWin: false,
    prize: {
      name: 'BMW M4 Competition',
      value: 650000,
      description: 'Brand new BMW M4 Competition in Alpine White'
    }
  },
  {
    id: '2',
    title: 'iPhone 15 Pro Max',
    description: 'Latest iPhone 15 Pro Max 512GB in Natural Titanium',
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop',
    ticketPrice: 5,
    totalTickets: 2500,
    soldTickets: 1890,
    endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    status: 'active',
    isInstantWin: false,
    prize: {
      name: 'iPhone 15 Pro Max',
      value: 12000,
      description: '512GB Natural Titanium iPhone 15 Pro Max'
    }
  },
  {
    id: '3',
    title: 'Rolex Submariner',
    description: 'Authentic Rolex Submariner Date 41mm Black Dial',
    image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=400&h=300&fit=crop',
    ticketPrice: 40,
    totalTickets: 3000,
    soldTickets: 2100,
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    status: 'active',
    isInstantWin: false,
    prize: {
      name: 'Rolex Submariner',
      value: 85000,
      description: 'Authentic Rolex Submariner Date 41mm'
    }
  },
  {
    id: '4',
    title: '100.000 kr Kontantpræmie',
    description: 'Vind 100.000 kr kontant - ingen betingelser!',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop',
    ticketPrice: 15,
    totalTickets: 4000,
    soldTickets: 2800,
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    status: 'active',
    isInstantWin: false,
    prize: {
      name: 'Kontantpræmie',
      value: 100000,
      description: '100.000 kr kontant overført direkte til din bankkonto'
    }
  },
  {
    id: '5',
    title: 'PlayStation 5 Bundle',
    description: 'PS5 Console with 3 games and extra controller',
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&h=300&fit=crop',
    ticketPrice: 10,
    totalTickets: 1500,
    soldTickets: 945,
    endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
    status: 'active',
    isInstantWin: false,
    prize: {
      name: 'PlayStation 5 Bundle',
      value: 6500,
      description: 'PS5 Console with Spider-Man 2, FIFA 24, Call of Duty'
    }
  },
  {
    id: '6',
    title: 'MacBook Pro M3',
    description: 'MacBook Pro 14" with M3 chip, 16GB RAM, 1TB SSD',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop',
    ticketPrice: 30,
    totalTickets: 2000,
    soldTickets: 1200,
    endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
    status: 'active',
    isInstantWin: false,
    prize: {
      name: 'MacBook Pro M3',
      value: 25000,
      description: 'MacBook Pro 14" M3 chip, 16GB RAM, 1TB SSD'
    }
  },
  {
    id: '7',
    title: '🎯 INSTANT WIN: 5.000 kr Kontant',
    description: 'Instant win! Vind øjeblikkeligt 5.000 kr kontant - ingen ventetid!',
    image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=300&fit=crop',
    ticketPrice: 8,
    totalTickets: 1000,
    soldTickets: 234,
    endDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    status: 'active',
    isInstantWin: true,
    prize: {
      name: '5.000 kr Instant Cash',
      value: 5000,
      description: '5.000 kr kontant overført øjeblikkeligt til din konto'
    }
  },
  {
    id: '8',
    title: '🎯 INSTANT WIN: Apple Watch Ultra',
    description: 'Instant win! Vind øjeblikkeligt Apple Watch Ultra 2 - ingen ventetid!',
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop',
    ticketPrice: 12,
    totalTickets: 800,
    soldTickets: 567,
    endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    status: 'active',
    isInstantWin: true,
    prize: {
      name: 'Apple Watch Ultra 2',
      value: 8500,
      description: 'Apple Watch Ultra 2 med Titanium case og Ocean Band'
    }
  },
  {
    id: '9',
    title: '🎯 INSTANT WIN: Amazon 2.000 kr Gavekort',
    description: 'Instant win! Vind øjeblikkeligt 2.000 kr Amazon gavekort - brug det med det samme!',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop',
    ticketPrice: 6,
    totalTickets: 1500,
    soldTickets: 1123,
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    status: 'active',
    isInstantWin: true,
    prize: {
      name: 'Amazon 2.000 kr Gavekort',
      value: 2000,
      description: '2.000 kr Amazon gavekort sendt øjeblikkeligt via email'
    }
  }
]
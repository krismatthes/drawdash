import { Raffle } from '@/types/raffle'

export const mockRaffles: Raffle[] = [
  {
    id: '1',
    title: 'BMW M4 Competition',
    description: 'Win this stunning BMW M4 Competition with only 5,000 miles on the clock. Alpine White with M Performance package.',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop',
    ticketPrice: 25,
    totalTickets: 5000,
    soldTickets: 3850,
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    status: 'active',
    isInstantWin: false,
    participants: 3850,
    emoji: '🏎️',
    category: 'Bil',
    endsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    prize: {
      name: 'BMW M4 Competition',
      value: 850000,
      description: 'Brand new BMW M4 Competition in Alpine White with M Performance package'
    }
  },
  {
    id: '2',
    title: 'iPhone 15 Pro Max 512GB',
    description: 'Latest iPhone 15 Pro Max 512GB in Natural Titanium. Brand new, unlocked with warranty.',
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=600&fit=crop',
    ticketPrice: 5,
    totalTickets: 2500,
    soldTickets: 1890,
    endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    status: 'active',
    isInstantWin: true,
    participants: 1890,
    emoji: '📱',
    category: 'Elektronik',
    endsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    prize: {
      name: 'iPhone 15 Pro Max 512GB',
      value: 15999,
      description: 'Latest iPhone 15 Pro Max 512GB in Natural Titanium, brand new with warranty'
    }
  },
  {
    id: '3',
    title: 'Rolex Submariner Date 41mm',
    description: 'Authentic Rolex Submariner Date 41mm Black Dial. Genuine Rolex with papers and box.',
    image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800&h=600&fit=crop',
    ticketPrice: 40,
    totalTickets: 3000,
    soldTickets: 2100,
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    status: 'active',
    isInstantWin: false,
    participants: 2100,
    emoji: '⌚',
    category: 'Luksus',
    endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    prize: {
      name: 'Rolex Submariner Date 41mm',
      value: 95000,
      description: 'Authentic Rolex Submariner Date 41mm with papers and original box'
    }
  },
  {
    id: '4',
    title: '100.000 kr Kontantpræmie',
    description: 'Vind 100.000 kr kontant - ingen betingelser! Penge overført direkte til din bankkonto.',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop',
    ticketPrice: 15,
    totalTickets: 4000,
    soldTickets: 3200,
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    status: 'active',
    isInstantWin: false,
    participants: 3200,
    emoji: '💰',
    category: 'Kontant',
    endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    prize: {
      name: 'Kontantpræmie',
      value: 100000,
      description: '100.000 kr kontant overført direkte til din bankkonto inden for 24 timer'
    }
  },
  {
    id: '5',
    title: 'PlayStation 5 Bundle',
    description: 'PS5 Console with 3 games and extra controller. Includes Spider-Man 2, FIFA 24, Call of Duty.',
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&h=600&fit=crop',
    ticketPrice: 10,
    totalTickets: 1500,
    soldTickets: 945,
    endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    status: 'active',
    isInstantWin: false,
    participants: 945,
    emoji: '🎮',
    category: 'Gaming',
    endsAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    prize: {
      name: 'PlayStation 5 Bundle',
      value: 7500,
      description: 'PS5 Console with Spider-Man 2, FIFA 24, Call of Duty + DualSense controller'
    }
  },
  {
    id: '6',
    title: 'MacBook Pro 14" M3 Max',
    description: 'MacBook Pro 14" with M3 Max chip, 32GB RAM, 1TB SSD. Perfect for creators and professionals.',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop',
    ticketPrice: 30,
    totalTickets: 2000,
    soldTickets: 1200,
    endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    status: 'active',
    isInstantWin: false,
    participants: 1200,
    emoji: '💻',
    category: 'Computer',
    endsAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    prize: {
      name: 'MacBook Pro 14" M3 Max',
      value: 35000,
      description: 'MacBook Pro 14" M3 Max chip, 32GB RAM, 1TB SSD in Space Black'
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
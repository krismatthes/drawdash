export interface Winner {
  id: string
  name: string
  city: string
  prize: string
  prizeValue: number
  raffleTitle: string
  wonDate: Date
  image: string
  testimonial: string
}

export const mockWinners: Winner[] = [
  {
    id: '1',
    name: 'Sarah M.',
    city: 'København',
    prize: 'BMW M4 Competition',
    prizeValue: 85000,
    raffleTitle: 'BMW M4 Competition',
    wonDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=150&h=150&fit=crop&crop=face',
    testimonial: 'Jeg kunne ikke tro det var virkeligt! DrawDash har ændret mit liv. Tak så meget!'
  },
  {
    id: '2',
    name: 'Michael J.',
    city: 'Aarhus',
    prize: 'iPhone 15 Pro Max',
    prizeValue: 1399,
    raffleTitle: 'iPhone 15 Pro Max',
    wonDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    testimonial: 'Fantastisk oplevelse! Telefonen kom præcis som lovet. Meget professionelt.'
  },
  {
    id: '3',
    name: 'Emma L.',
    city: 'Odense',
    prize: 'Apple Watch Series 9',
    prizeValue: 449,
    raffleTitle: 'Apple Watch Series 9',
    wonDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    testimonial: 'Så glad for mit nye Apple Watch! Lodtrækningen var fair og gennemsigtig.'
  },
  {
    id: '4',
    name: 'Lars K.',
    city: 'Aalborg',
    prize: '£500 Cash',
    prizeValue: 500,
    raffleTitle: '🎯 INSTANT WIN: £500 Cash',
    wonDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    testimonial: 'Instant win kampagnen var utrolig spændende! Pengene var på min konto samme dag.'
  },
  {
    id: '5',
    name: 'Anna H.',
    city: 'Esbjerg',
    prize: 'Samsung Galaxy S24',
    prizeValue: 899,
    raffleTitle: 'Samsung Galaxy S24',
    wonDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    testimonial: 'Utroligt at vinde! Telefonen fungerer perfekt og jeg er så taknemmelig.'
  },
  {
    id: '6',
    name: 'Thomas P.',
    city: 'Horsens',
    prize: '£100 Amazon Gavekort',
    prizeValue: 100,
    raffleTitle: '£100 Amazon Gavekort',
    wonDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    testimonial: 'Perfekt til at købe julegaver! Hurtig levering af gavekort via email.'
  },
  {
    id: '7',
    name: 'Maria S.',
    city: 'Randers',
    prize: 'PlayStation 5',
    prizeValue: 599,
    raffleTitle: 'PlayStation 5',
    wonDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000), // 18 days ago
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    testimonial: 'Min søn var i ekstase! Bedste julegave nogensinde. Tak DrawDash!'
  },
  {
    id: '8',
    name: 'Peter R.',
    city: 'Kolding',
    prize: 'Nintendo Switch OLED',
    prizeValue: 349,
    raffleTitle: 'Nintendo Switch OLED',
    wonDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
    testimonial: 'Fantastisk gaming oplevelse! Hele familien nyder det nye Nintendo Switch.'
  }
]

export const getRecentWinners = (limit: number = 6): Winner[] => {
  return mockWinners
    .sort((a, b) => b.wonDate.getTime() - a.wonDate.getTime())
    .slice(0, limit)
}

export const getBiggestWins = (limit: number = 3): Winner[] => {
  return mockWinners
    .sort((a, b) => b.prizeValue - a.prizeValue)
    .slice(0, limit)
}
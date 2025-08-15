export interface FAQ {
  id: string
  question: string
  answer: string
  category: 'general' | 'payment' | 'delivery' | 'prizes' | 'account'
  isActive: boolean
  order: number
  createdAt: Date
  updatedAt: Date
}

export const mockFAQs: FAQ[] = [
  {
    id: '1',
    question: 'Hvordan fungerer lodtrækningerne?',
    answer: 'Vores lodtrækninger er fuldstændig fair og transparente. Alle lodtrækninger udføres live på Facebook ved hjælp af en certificeret tilfældighedsgenerator. Du køber billetter til en specifik lodtrækning, og når lodtrækningen afsluttes, trækkes der en vinder tilfældigt blandt alle deltagere.',
    category: 'general',
    isActive: true,
    order: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    question: 'Kan jeg virkelig deltage gratis?',
    answer: 'Ja! Du kan deltage i enhver lodtrækning helt gratis ved at sende et postkort med dine oplysninger til vores adresse. Se den specifikke lodtrækning for detaljerede instruktioner om gratis deltagelse. Gratis deltagelser har samme vindechance som betalte billetter.',
    category: 'general',
    isActive: true,
    order: 2,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '3',
    question: 'Hvordan betaler jeg for billetter?',
    answer: 'Vi accepterer alle større kreditkort og debitkort. Alle betalinger er sikrede med 256-bit SSL kryptering. Du kan også bruge Apple Pay og Google Pay for hurtigere checkout.',
    category: 'payment',
    isActive: true,
    order: 3,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '4',
    question: 'Hvornår får jeg besked hvis jeg vinder?',
    answer: 'Vindere kontaktes øjeblikkeligt efter lodtrækningen via email og telefon. Du vil også kunne se din gevinst i din konto på vores hjemmeside. Vi stræber efter at kontakte alle vindere inden for 2 timer efter lodtrækningen.',
    category: 'prizes',
    isActive: true,
    order: 4,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '5',
    question: 'Hvor hurtigt får jeg min præmie?',
    answer: 'For kontante præmier sendes pengene til din bankkonto inden for 2-3 arbejdsdage. Fysiske præmier som biler, elektronik osv. leveres typisk inden for 7-14 dage efter lodtrækningen. Vi koordinerer leveringen direkte med dig.',
    category: 'delivery',
    isActive: true,
    order: 5,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '6',
    question: 'Er der skatter eller gebyrer på gevinster?',
    answer: 'Der er ingen skjulte gebyrer fra vores side. Du modtager den fulde præmieværdi som annonceret. Dog kan gevinster over visse beløb være skattepligtige i henhold til dansk lovgivning - vi anbefaler at konsultere en skatterådgiver for større gevinster.',
    category: 'prizes',
    isActive: true,
    order: 6,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '7',
    question: 'Kan jeg ændre eller annullere mine billetter?',
    answer: 'Når billetter er købt og betaling er gennemført, kan de ikke ændres eller refunderes. Dette er for at sikre fairness i lodtrækningen. Sørg for at tjekke alle detaljer før du gennemfører dit køb.',
    category: 'general',
    isActive: true,
    order: 7,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '8',
    question: 'Hvordan opretter jeg en konto?',
    answer: 'Du kan oprette en konto ved at klikke på "Tilmeld Dig" knappen i toppen af siden. Du skal blot angive dit navn, email og vælge en adgangskode. Du skal have en konto for at købe billetter, men gratis deltagelse via postkort kræver ikke en konto.',
    category: 'account',
    isActive: true,
    order: 8,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '9',
    question: 'Hvad er instant win kampagner?',
    answer: 'Instant win kampagner giver dig chancen for at vinde øjeblikkeligt når du køber en billet. Disse kampagner er markeret med ⚡ symbolet. Resultatet vises med det samme efter dit køb - ingen ventetid på lodtrækning!',
    category: 'general',
    isActive: true,
    order: 9,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '10',
    question: 'Er DrawDash lovligt og reguleret?',
    answer: 'Ja, DrawDash opererer i fuld overensstemmelse med dansk og EU lovgivning. Vi er registreret som en legal konkurrence platform og alle vores lodtrækninger er gennemført i overensstemmelse med gældende regler for konkurencer og lodtrækninger.',
    category: 'general',
    isActive: true,
    order: 10,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
]

export const getFAQsByCategory = (category?: string): FAQ[] => {
  const activeFAQs = mockFAQs.filter(faq => faq.isActive)
  if (category && category !== 'all') {
    return activeFAQs.filter(faq => faq.category === category).sort((a, b) => a.order - b.order)
  }
  return activeFAQs.sort((a, b) => a.order - b.order)
}

export const getAllFAQs = (): FAQ[] => {
  return mockFAQs.sort((a, b) => a.order - b.order)
}

export const getFAQById = (id: string): FAQ | undefined => {
  return mockFAQs.find(faq => faq.id === id)
}
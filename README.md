# DrawDash - Premium Raffle & Draw Site

A modern, responsive raffle/draw website built with Next.js, TypeScript, and Tailwind CSS. Similar to popular raffle sites like 7daysperformance.co.uk, DrawDash offers a complete solution for running online raffles and competitions.

## 🚀 Features

### User Features
- **Browse Active Raffles**: View all available raffles with real-time countdown timers
- **Secure Entry System**: Purchase raffle tickets with integrated payment processing
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **User Authentication**: Registration, login, and account management
- **Countdown Timers**: Live countdowns showing time remaining for each raffle
- **Winner Announcements**: Display recent winners and success stories
- **Progress Tracking**: Visual progress bars showing ticket sales progress

### Admin Features
- **Admin Dashboard**: Comprehensive management panel for raffles
- **Raffle Management**: Create, edit, and manage raffles
- **Winner Selection**: Fair random winner selection system
- **Sales Analytics**: Track revenue, tickets sold, and performance metrics
- **User Management**: View and manage user accounts

### Technical Features
- **Next.js 15**: Latest version with App Router
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS**: Modern, responsive styling
- **Mock Payment Integration**: Ready for Stripe/PayPal integration
- **Database Schema**: Complete PostgreSQL schema for production use
- **SEO Optimized**: Proper meta tags and structured data

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard
│   ├── how-it-works/      # Information pages
│   ├── login/             # Authentication pages
│   ├── raffle/[id]/       # Dynamic raffle pages
│   ├── raffles/           # All raffles listing
│   ├── register/          # User registration
│   └── winners/           # Winners showcase
├── components/            # Reusable React components
│   ├── CountdownTimer.tsx # Real-time countdown functionality
│   ├── Header.tsx         # Site navigation
│   ├── PaymentForm.tsx    # Payment processing form
│   └── RaffleCard.tsx     # Raffle display component
├── lib/                  # Utilities and configurations
│   ├── database.sql      # Complete database schema
│   └── mockData.ts       # Sample raffle data
└── types/               # TypeScript type definitions
    └── raffle.ts        # Core data types
```

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run development server**
   ```bash
   npm run dev
   ```

3. **Open browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Database Setup (Production)

1. **Create PostgreSQL database**
   ```bash
   createdb drawdash
   ```

2. **Run database migrations**
   ```bash
   psql -d drawdash -f src/lib/database.sql
   ```

## 🎯 Key Pages

### Landing Page (`/`)
- Hero section with clear value proposition
- Featured active raffles
- Social proof and trust indicators
- Site benefits and features

### Raffle Details (`/raffle/[id]`)
- Detailed raffle information and images
- Interactive ticket purchase system
- Live countdown timer
- Progress tracking
- Integrated payment form

### Admin Dashboard (`/admin`)
- Raffle management interface
- Sales analytics and metrics
- Winner selection tools
- Revenue tracking

### Winners Page (`/winners`)
- Recent winner showcase
- Testimonials and success stories
- Statistics and verification
- Social proof elements

## 💳 Payment Integration

The site includes a mock payment form ready for integration with:
- **Stripe** (recommended)
- **PayPal**
- **Square**
- **Other payment processors**

Payment form includes:
- Card details capture
- Billing address collection
- Security features display
- Error handling
- Success callbacks

## 🗄️ Database Design

Complete PostgreSQL schema includes:
- **Users**: Authentication and profiles
- **Raffles**: Competition management
- **Entries**: Ticket purchases and tracking
- **Payments**: Transaction processing
- **Winners**: Result tracking
- **Audit logs**: Admin activity tracking

Key features:
- Automatic ticket number assignment
- Winner selection algorithms
- Payment status tracking
- User session management
- Security and verification

## 🔐 Security Features

- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF tokens
- Secure session management
- Payment data protection
- Admin access controls

## 🎨 Design System

Built with Tailwind CSS featuring:
- Consistent color scheme
- Responsive breakpoints
- Accessible components
- Modern UI patterns
- Mobile-first approach

Color Palette:
- Primary: Blue (`blue-600`)
- Success: Green (`green-600`)
- Warning: Yellow (`yellow-500`)
- Error: Red (`red-600`)
- Neutral: Gray scales

## 📱 Mobile Optimization

- Responsive grid layouts
- Touch-friendly interfaces
- Optimized images
- Fast loading times
- Mobile navigation
- Swipe gestures support

## 🚀 Deployment Options

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Traditional Hosting
```bash
npm run build
npm start
```

## 🔧 Environment Variables

Create `.env.local`:
```env
# Database
DATABASE_URL=postgresql://user:pass@localhost/drawdash

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Payment Processing
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 📈 Performance Features

- Server-side rendering (SSR)
- Static generation where possible
- Image optimization
- Code splitting
- Lazy loading
- Caching strategies

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

## 📋 Future Enhancements

### Phase 2 Features
- [ ] Real-time notifications
- [ ] Social media integration
- [ ] Referral system
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Multi-language support

### Integration Opportunities
- [ ] Facebook Live streaming
- [ ] Email marketing (Mailchimp)
- [ ] SMS notifications (Twilio)
- [ ] Analytics (Google Analytics)
- [ ] Customer support (Intercom)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- 📧 Email: support@drawdash.com
- 💬 Discord: [Join our community](https://discord.gg/drawdash)
- 📖 Documentation: [docs.drawdash.com](https://docs.drawdash.com)

## 🙏 Acknowledgments

- Next.js team for the excellent framework
- Tailwind CSS for the utility-first CSS framework
- Vercel for seamless deployment platform
- Open source community for amazing tools and libraries

---

**DrawDash** - Where dreams become reality through fair and exciting raffles! 🎯✨
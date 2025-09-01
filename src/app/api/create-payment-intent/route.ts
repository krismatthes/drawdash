import { NextRequest, NextResponse } from 'next/server'
import { LoyaltyCalculator } from '@/lib/loyalty'
import { paymentLimiter, getClientIP } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const limiterResult = paymentLimiter(clientIP)
    
    if (!limiterResult.success) {
      return NextResponse.json(
        { error: 'Too many payment requests. Please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': limiterResult.limit.toString(),
            'X-RateLimit-Remaining': limiterResult.remaining.toString(),
            'X-RateLimit-Reset': new Date(limiterResult.resetTime).toISOString()
          }
        }
      )
    }

    const { amount, currency = 'gbp', pointsUsed = 0, userId, ticketQuantity = 1 } = await request.json()

    // Input validation
    if (!amount || typeof amount !== 'number' || amount < 50) {
      return NextResponse.json(
        { error: 'Amount must be at least £0.50' },
        { status: 400 }
      )
    }

    if (amount > 100000) { // Max £1000
      return NextResponse.json(
        { error: 'Amount exceeds maximum limit' },
        { status: 400 }
      )
    }

    if (pointsUsed && (typeof pointsUsed !== 'number' || pointsUsed < 0)) {
      return NextResponse.json(
        { error: 'Invalid points amount' },
        { status: 400 }
      )
    }

    if (ticketQuantity && (typeof ticketQuantity !== 'number' || ticketQuantity < 1 || ticketQuantity > 100)) {
      return NextResponse.json(
        { error: 'Invalid ticket quantity' },
        { status: 400 }
      )
    }

    if (userId && typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      )
    }

    // Demo payment simulation - no real charges
    const paymentIntentId = `demo_pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // For demo, all payments succeed
    const paymentIntent = {
      id: paymentIntentId,
      amount,
      currency,
      status: 'requires_confirmation',
      metadata: {
        userId: userId || '',
        originalAmount: (amount / 100).toString(),
        pointsUsed: pointsUsed.toString(),
        ticketQuantity: ticketQuantity.toString()
      }
    }

    return NextResponse.json({
      clientSecret: `demo_secret_${paymentIntentId}`,
      paymentIntentId: paymentIntent.id,
      demo: true
    })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Initialize Stripe inside the function to avoid build-time evaluation
function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key_for_build', {
    apiVersion: '2025-07-30.basil',
  })
}

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'gbp' } = await request.json()

    if (!amount || amount < 50) {
      return NextResponse.json(
        { error: 'Amount must be at least £0.50' },
        { status: 400 }
      )
    }

    const stripe = getStripe()
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
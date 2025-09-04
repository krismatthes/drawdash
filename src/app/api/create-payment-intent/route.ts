import { NextRequest, NextResponse } from 'next/server'
import { LoyaltyCalculator } from '@/lib/loyalty'
import { paymentLimiter, getClientIP } from '@/lib/rateLimit'
import { antiFraud, createEnhancedRateLimit } from '@/lib/antiFraud'
import { paymentMethodTracking } from '@/lib/paymentMethodTracking'
import { fraudRulesEngine } from '@/lib/fraudRulesEngine'
import { bonusRewardService } from '@/lib/bonusRewardService'
import { bonusTriggerService } from '@/lib/bonusTriggerService'
import { Balance } from '@/lib/balanceService'

export async function POST(request: NextRequest) {
  try {
    const { 
      amount, 
      currency = 'gbp', 
      pointsUsed = 0, 
      userId, 
      ticketQuantity = 1, 
      email,
      raffleId,
      appliedBonusId,
      paymentMethodData // { cardNumber, expiryMonth, expiryYear, cardholderName }
    } = await request.json()
    
    // Get client information for fraud detection
    const clientIP = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || ''
    
    // Enhanced rate limiting with fraud detection
    const enhancedLimiter = createEnhancedRateLimit({
      requests: 5,
      window: 60 * 1000,
      fraudMultiplier: 0.5 // Reduce limits by 50% for high-risk users
    })
    
    const limiterResult = await enhancedLimiter(clientIP, userId)
    
    if (!limiterResult.success) {
      return NextResponse.json(
        { 
          error: limiterResult.riskAdjusted 
            ? 'Payment temporarily restricted due to security measures. Please contact support.'
            : 'Too many payment requests. Please try again later.'
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': limiterResult.limit.toString(),
            'X-RateLimit-Remaining': limiterResult.remaining.toString(),
            'X-RateLimit-Reset': new Date(limiterResult.resetTime).toISOString(),
            'X-Risk-Adjusted': limiterResult.riskAdjusted.toString()
          }
        }
      )
    }

    // Fraud assessment (UK requirement)
    if (userId && email) {
      const riskAssessment = await antiFraud.assessUserRisk(userId, clientIP, email)
      
      if (riskAssessment.recommendation === 'block') {
        return NextResponse.json(
          { error: 'Transaction blocked for security review. Please contact support.' },
          { status: 403 }
        )
      }
      
      if (riskAssessment.recommendation === 'review') {
        // Log for manual review but allow transaction
        console.warn(`High-risk transaction flagged for user ${userId}:`, riskAssessment.fraudFlags)
      }

      // Check transaction patterns
      const transactionFlags = antiFraud.checkTransactionPatterns(userId, amount, 'card')
      if (transactionFlags.some(f => f.severity === 'critical')) {
        return NextResponse.json(
          { error: 'Transaction pattern flagged for review. Please contact support.' },
          { status: 403 }
        )
      }

      // Enhanced payment method validation if payment data provided
      if (paymentMethodData) {
        const paymentValidation = await antiFraud.validatePaymentMethod(
          userId,
          paymentMethodData.cardNumber,
          paymentMethodData.expiryMonth,
          paymentMethodData.expiryYear,
          paymentMethodData.cardholderName,
          amount,
          clientIP
        )

        if (!paymentValidation.isValid) {
          return NextResponse.json(
            { error: 'Payment method not accepted. Please use a different card.' },
            { status: 403 }
          )
        }

        // Check for critical payment fraud flags
        const criticalPaymentFlags = paymentValidation.fraudFlags.filter(f => f.severity === 'critical')
        if (criticalPaymentFlags.length > 0) {
          return NextResponse.json(
            { error: 'Payment blocked for security review. Please contact support.' },
            { status: 403 }
          )
        }

        // Record payment method usage attempt
        paymentMethodTracking.recordPaymentUsage(
          paymentValidation.riskAssessment.paymentMethodId,
          userId,
          `attempt_${Date.now()}`,
          amount,
          currency,
          clientIP,
          userAgent,
          'success' // Mark as success since this is demo mode
        )
      }

      // Comprehensive fraud assessment
      const comprehensiveFraudAssessment = await fraudRulesEngine.assessUser(
        userId,
        {
          email,
          ip: clientIP,
          userAgent,
          paymentData: paymentMethodData ? {
            cardNumber: paymentMethodData.cardNumber,
            expiryMonth: paymentMethodData.expiryMonth,
            expiryYear: paymentMethodData.expiryYear,
            cardholderName: paymentMethodData.cardholderName,
            amount
          } : undefined,
          transactionHistory: [], // Would get real data from DB
          bonusHistory: bonusRewardService.getUserBonuses(userId) // Pass user bonuses as history
        }
      )

      // Block based on comprehensive assessment
      if (comprehensiveFraudAssessment.recommendation === 'block') {
        return NextResponse.json(
          { error: 'Transaction blocked for security review. Please contact support.' },
          { status: 403 }
        )
      }
    }

    // Input validation
    if (!amount || typeof amount !== 'number' || amount < 50) {
      return NextResponse.json(
        { error: 'Beløbet skal være mindst 6.50 kr' },
        { status: 400 }
      )
    }

    if (amount > 130000) { // Max 13.000 kr
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

    // Check user balance and use if available
    let balanceUsed = 0
    let remainingAmount = amount
    let balanceBreakdown = {
      bonusUsed: 0,
      freeTicketsUsed: 0,
      cashUsed: 0
    }

    if (userId) {
      const userBalance = Balance.getBalance(userId)
      
      // First, try to use free tickets for ticket purchases
      if (userBalance.freeTickets > 0 && ticketQuantity > 0) {
        const ticketsFromFree = Math.min(userBalance.freeTickets, ticketQuantity)
        const ticketPrice = amount / ticketQuantity
        const freeTicketValue = ticketsFromFree * ticketPrice
        
        balanceBreakdown.freeTicketsUsed = ticketsFromFree
        balanceUsed += freeTicketValue
        remainingAmount -= freeTicketValue
      }
      
      // Then use bonus balance if remaining amount
      if (remainingAmount > 0 && userBalance.bonusBalance > 0) {
        const bonusToUse = Math.min(userBalance.bonusBalance, remainingAmount)
        balanceBreakdown.bonusUsed = bonusToUse
        balanceUsed += bonusToUse
        remainingAmount -= bonusToUse
      }
      
      // Finally use cash balance if still remaining
      if (remainingAmount > 0 && userBalance.cashBalance > 0) {
        const cashToUse = Math.min(userBalance.cashBalance, remainingAmount)
        balanceBreakdown.cashUsed = cashToUse
        balanceUsed += cashToUse
        remainingAmount -= cashToUse
      }
    }

    // Handle bonus application
    let finalAmount = remainingAmount // Only charge external payment for remaining amount
    let bonusDiscount = 0
    let freeTicketsGranted = 0
    let pointMultiplier = 1
    let appliedBonus = null

    if (appliedBonusId && userId) {
      const bonusApplication = bonusRewardService.applyBonusToTransaction(
        appliedBonusId,
        amount,
        ticketQuantity
      )

      if (bonusApplication.success) {
        finalAmount = bonusApplication.finalAmount
        bonusDiscount = bonusApplication.discountAmount
        freeTicketsGranted = bonusApplication.freeTickets
        pointMultiplier = bonusApplication.pointMultiplier
        appliedBonus = {
          bonusId: appliedBonusId,
          discountAmount: bonusDiscount,
          freeTickets: freeTicketsGranted,
          pointMultiplier
        }
      } else {
        return NextResponse.json(
          { error: bonusApplication.error || 'Bonus kunne ikke anvendes' },
          { status: 400 }
        )
      }
    }

    // Process balance usage if any balance was used
    if (userId && balanceUsed > 0) {
      const description = `Purchase for ${raffleId || 'raffle'}: ${ticketQuantity} tickets`

      // First: deduct free tickets, if any
      if (balanceBreakdown.freeTicketsUsed > 0) {
        const ticketsToUse = Math.floor(balanceBreakdown.freeTicketsUsed)
        const ticketsResult = Balance.useTickets(userId, ticketsToUse, description, {
          raffleId,
          ticketQuantity,
        })
        if (!ticketsResult.success) {
          return NextResponse.json(
            { error: `Balance fejl (tickets): ${ticketsResult.error}` },
            { status: 400 }
          )
        }
      }

      // Then: deduct combined monetary amount (bonus + cash) in DKK
      const totalBalanceAmountDKK = (balanceBreakdown.bonusUsed + balanceBreakdown.cashUsed) / 100
      if (totalBalanceAmountDKK > 0) {
        const balanceDeduction = Balance.deductForPurchase(
          userId,
          totalBalanceAmountDKK,
          description,
          {
            raffleId,
            ticketQuantity,
            breakdown: {
              bonusUsedMinor: balanceBreakdown.bonusUsed,
              cashUsedMinor: balanceBreakdown.cashUsed,
            },
            units: 'minor'
          }
        )

        if (!balanceDeduction.success) {
          return NextResponse.json(
            { error: `Balance fejl: ${balanceDeduction.error}` },
            { status: 400 }
          )
        }
      }
    }

    // Demo payment simulation - only charge remaining amount after balance usage
    const paymentIntentId = `demo_pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // For demo, all payments succeed (or skip if fully paid with balance)
    const needsExternalPayment = finalAmount > 0
    const paymentIntent = {
      id: paymentIntentId,
      amount: finalAmount, // Use final amount after bonus discount and balance usage
      currency,
      status: needsExternalPayment ? 'requires_confirmation' : 'succeeded',
      metadata: {
        userId: userId || '',
        originalAmount: (amount / 100).toString(),
        finalAmount: (finalAmount / 100).toString(),
        balanceUsed: balanceUsed.toString(),
        bonusUsed: balanceBreakdown.bonusUsed.toString(),
        freeTicketsUsed: balanceBreakdown.freeTicketsUsed.toString(),
        cashUsed: balanceBreakdown.cashUsed.toString(),
        pointsUsed: pointsUsed.toString(),
        ticketQuantity: ticketQuantity.toString(),
        appliedBonusId: appliedBonusId || '',
        bonusDiscount: bonusDiscount.toString(),
        freeTicketsGranted: freeTicketsGranted.toString(),
        raffleId: raffleId || ''
      }
    }

    // Process purchase triggers for bonus eligibility (simulate successful payment)
    if (userId && raffleId) {
      try {
        // Get user profile for bonus eligibility checking
        const userProfile = {
          loyaltyTier: 'bronze', // Would get from DB
          points: 0, // Would get from DB
          totalSpent: amount, // Would get cumulative from DB
        }

        const bonusTriggerResults = await bonusTriggerService.processPurchaseEvent(
          userId,
          finalAmount, // Use final amount paid
          ticketQuantity,
          raffleId,
          userProfile,
          clientIP,
          userAgent
        )

        // Log any new bonuses triggered by this purchase
        const newBonuses = bonusTriggerResults.filter(result => result.triggered)
        if (newBonuses.length > 0) {
          console.log(`Purchase triggered ${newBonuses.length} new bonuses for user ${userId}`)
        }

        // Check spending milestone triggers
        const milestoneTriggerResults = await bonusTriggerService.processSpendingMilestoneEvent(
          userId,
          finalAmount, // This would be cumulative total in production
          userProfile,
          clientIP,
          userAgent
        )

        const milestones = milestoneTriggerResults.filter(result => result.triggered)
        if (milestones.length > 0) {
          console.log(`Purchase hit ${milestones.length} spending milestones for user ${userId}`)
        }
      } catch (error) {
        console.warn('Failed to process purchase triggers:', error)
        // Don't fail the payment if bonus triggers fail
      }
    }

    return NextResponse.json({
      clientSecret: needsExternalPayment ? `demo_secret_${paymentIntentId}` : null,
      paymentIntentId: paymentIntent.id,
      appliedBonus: appliedBonus,
      finalAmount: finalAmount,
      balanceUsed: balanceUsed,
      balanceBreakdown: balanceBreakdown,
      bonusDiscount: bonusDiscount,
      freeTicketsGranted: freeTicketsGranted,
      needsExternalPayment: needsExternalPayment,
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

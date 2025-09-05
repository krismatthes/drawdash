import { NextRequest, NextResponse } from 'next/server'
import { raffleServiceDB } from '@/lib/raffleServiceDB'

// GET /api/draw-audits - Get all draw audits for transparency
// GET /api/draw-audits?raffleId=xxx - Get audits for specific raffle
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const raffleId = searchParams.get('raffleId')

    const audits = await raffleServiceDB.getDrawAudits(raffleId || undefined)

    // Public transparency data (sensitive info removed)
    const publicAudits = audits.map(audit => ({
      id: audit.id,
      raffleId: audit.raffleId,
      raffleTitle: audit.raffle?.title,
      drawMethod: audit.drawMethod,
      winningTicketNumber: audit.winningTicketNumber,
      totalTickets: audit.totalTickets,
      participantCount: audit.participantCount,
      seedHash: audit.seedHash, // Pre-commitment hash (public)
      timestamp: audit.timestamp,
      isVerified: audit.isVerified,
      verifiedAt: audit.verifiedAt,
      winner: audit.winner ? {
        // Anonymized winner info for privacy
        initials: `${audit.winner.firstName[0]}.${audit.winner.lastName[0]}.`,
        email: audit.winner.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
      } : null,
      // drawProof included for verification but not randomSeed (revealed after draw)
      proofAvailable: !!audit.drawProof
    }))

    return NextResponse.json({
      success: true,
      count: publicAudits.length,
      data: publicAudits,
      transparency: {
        standard: 'PROVABLY_FAIR_CRYPTOGRAPHIC_RNG',
        authority: 'DANISH_GAMBLING_AUTHORITY',
        verification: 'All draws can be independently verified using the /api/verify-draw endpoint',
        lastUpdated: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Draw audits error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch draw audits' 
      }, 
      { status: 500 }
    )
  }
}

// POST /api/draw-audits/publish-commitment - Publish seed commitment before draw
export async function POST(request: NextRequest) {
  try {
    const { raffleId, drawScheduledAt } = await request.json()

    if (!raffleId || !drawScheduledAt) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing raffleId or drawScheduledAt' 
        }, 
        { status: 400 }
      )
    }

    // Publish seed commitment for transparency
    const commitmentHash = await raffleServiceDB.publishSeedCommitment(
      raffleId,
      new Date(drawScheduledAt)
    )

    return NextResponse.json({
      success: true,
      message: 'Seed commitment published successfully',
      data: {
        raffleId,
        commitmentHash,
        drawScheduledAt,
        publishedAt: new Date().toISOString(),
        note: 'This commitment hash will be used to verify the fairness of the draw. The actual seed will be revealed after the draw is complete.'
      }
    })
  } catch (error) {
    console.error('Seed commitment error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to publish seed commitment' 
      }, 
      { status: 500 }
    )
  }
}
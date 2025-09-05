import { NextRequest, NextResponse } from 'next/server'
import { raffleServiceDB } from '@/lib/raffleServiceDB'

// GET /api/verify-draw?raffleId=xxx&auditId=yyy
// Public endpoint for independent draw verification
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const raffleId = searchParams.get('raffleId')
    const auditId = searchParams.get('auditId')

    if (!raffleId || !auditId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing raffleId or auditId parameter' 
        }, 
        { status: 400 }
      )
    }

    // Perform verification using the secure RNG system
    const isValid = await raffleServiceDB.verifyDrawWithCommitment(raffleId, auditId)

    if (isValid) {
      // Get the audit details for transparency
      const audits = await raffleServiceDB.getDrawAudits(raffleId)
      const audit = audits.find(a => a.id === auditId)

      return NextResponse.json({
        success: true,
        verified: true,
        message: 'Draw verification successful',
        data: {
          raffleId,
          auditId,
          drawMethod: audit?.drawMethod,
          timestamp: audit?.timestamp,
          winningTicketNumber: audit?.winningTicketNumber,
          totalTickets: audit?.totalTickets,
          participantCount: audit?.participantCount,
          seedHash: audit?.seedHash, // Pre-commitment hash
          isVerified: audit?.isVerified,
          verifiedAt: audit?.verifiedAt
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        verified: false,
        message: 'Draw verification failed - results could not be reproduced',
        data: {
          raffleId,
          auditId
        }
      })
    }
  } catch (error) {
    console.error('Draw verification error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error during verification' 
      }, 
      { status: 500 }
    )
  }
}

// GET /api/verify-draw/audit-log?raffleId=xxx
// Get complete audit log for a raffle for transparency
export async function POST(request: NextRequest) {
  try {
    const { raffleId } = await request.json()

    if (!raffleId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing raffleId parameter' 
        }, 
        { status: 400 }
      )
    }

    // Generate comprehensive compliance report
    const report = await raffleServiceDB.generateComplianceReport(raffleId)

    return NextResponse.json({
      success: true,
      data: report
    })
  } catch (error) {
    console.error('Audit log error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate audit log' 
      }, 
      { status: 500 }
    )
  }
}
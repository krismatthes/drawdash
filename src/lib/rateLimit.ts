import { NextRequest } from 'next/server'

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

export interface RateLimitConfig {
  requests: number
  window: number // milliseconds
}

export function rateLimit(config: RateLimitConfig) {
  return (identifier: string): { success: boolean; limit: number; remaining: number; resetTime: number } => {
    const now = Date.now()
    const windowStart = now - config.window

    // Clean old entries
    Object.keys(store).forEach(key => {
      if (store[key].resetTime < now) {
        delete store[key]
      }
    })

    if (!store[identifier] || store[identifier].resetTime < now) {
      store[identifier] = {
        count: 1,
        resetTime: now + config.window
      }
      return {
        success: true,
        limit: config.requests,
        remaining: config.requests - 1,
        resetTime: store[identifier].resetTime
      }
    }

    store[identifier].count++

    const remaining = Math.max(0, config.requests - store[identifier].count)
    const success = store[identifier].count <= config.requests

    return {
      success,
      limit: config.requests,
      remaining,
      resetTime: store[identifier].resetTime
    }
  }
}

export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}

// Pre-configured limiters
export const paymentLimiter = rateLimit({
  requests: 5, // 5 requests
  window: 60 * 1000 // per minute
})

export const authLimiter = rateLimit({
  requests: 10, // 10 requests  
  window: 15 * 60 * 1000 // per 15 minutes
})

export const apiLimiter = rateLimit({
  requests: 100, // 100 requests
  window: 60 * 1000 // per minute
})
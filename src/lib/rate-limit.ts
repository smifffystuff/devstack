import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

let redis: Redis | null = null

function getRedis() {
  if (!redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL
    const token = process.env.UPSTASH_REDIS_REST_TOKEN
    if (!url || !token) return null
    redis = new Redis({ url, token })
  }
  return redis
}

function createLimiter(prefix: string, requests: number, window: string) {
  const client = getRedis()
  if (!client) return null

  return new Ratelimit({
    redis: client,
    limiter: Ratelimit.slidingWindow(requests, window as Parameters<typeof Ratelimit.slidingWindow>[1]),
    prefix: `ratelimit:${prefix}`,
  })
}

const limiters = {
  login: () => createLimiter("login", 5, "15 m"),
  register: () => createLimiter("register", 3, "1 h"),
  forgotPassword: () => createLimiter("forgot-password", 3, "1 h"),
  resetPassword: () => createLimiter("reset-password", 5, "15 m"),
  resendVerification: () => createLimiter("resend-verification", 3, "15 m"),
} as const

export type RateLimitEndpoint = keyof typeof limiters

export interface RateLimitResult {
  success: boolean
  remaining: number
  reset: number
}

export async function checkRateLimit(
  endpoint: RateLimitEndpoint,
  key: string
): Promise<RateLimitResult> {
  const limiter = limiters[endpoint]()

  if (!limiter) {
    return { success: true, remaining: -1, reset: 0 }
  }

  try {
    const result = await limiter.limit(key)
    return {
      success: result.success,
      remaining: result.remaining,
      reset: result.reset,
    }
  } catch {
    return { success: true, remaining: -1, reset: 0 }
  }
}

export function getIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  return forwarded?.split(",")[0].trim() ?? "unknown"
}

export function rateLimitResponse(reset: number) {
  const retryAfterSeconds = Math.ceil((reset - Date.now()) / 1000)
  const minutes = Math.ceil(retryAfterSeconds / 60)

  return new Response(
    JSON.stringify({
      error: `Too many attempts. Please try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfterSeconds),
      },
    }
  )
}

import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Create the i18n middleware
const intlMiddleware = createIntlMiddleware(routing)

// Initialize rate limiter (optional - only if Upstash is configured)
let ratelimit: Ratelimit | null = null

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
      analytics: true,
    })
  } catch (error) {
    console.error('Failed to initialize rate limiter:', error)
  }
}

export async function middleware(request: NextRequest) {
  // Apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    if (ratelimit) {
      const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? '127.0.0.1'
      const { success, limit, reset, remaining } = await ratelimit.limit(ip)

      if (!success) {
        return NextResponse.json(
          {
            error: 'Too many requests',
            details: 'Rate limit exceeded. Please try again later.',
          },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': remaining.toString(),
              'X-RateLimit-Reset': new Date(reset).toISOString(),
            },
          }
        )
      }
    }
    // If rate limiter not configured, allow the request (development mode)
    
    // API routes should not be handled by i18n middleware
    return await updateSession(request)
  }

  // First, handle i18n routing
  const intlResponse = intlMiddleware(request)

  // Then, handle Supabase session
  const supabaseResponse = await updateSession(request)

  // Merge headers from both middlewares
  if (intlResponse && intlResponse.headers) {
    // Copy headers from Supabase response to i18n response
    supabaseResponse.headers.forEach((value, key) => {
      intlResponse.headers.set(key, value)
    })
    return intlResponse
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - files with extensions
     *
     * Includes API routes for rate limiting
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

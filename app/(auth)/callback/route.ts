import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  // Validate 'next' parameter to prevent Open Redirect vulnerability
  const rawNext = searchParams.get('next') ?? '/dashboard'

  // Whitelist allowed redirect paths
  const allowedPaths = [
    '/dashboard',
    '/reports',
    '/integrations',
    '/settings',
    '/profile',
  ]

  // Validate: must be relative path, start with /, not start with //, and in whitelist
  const next =
    rawNext.startsWith('/') &&
    !rawNext.startsWith('//') &&
    allowedPaths.some(path => rawNext === path || rawNext.startsWith(path + '/'))
      ? rawNext
      : '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'

      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  const state = requestUrl.searchParams.get('state')
  const origin = requestUrl.origin

  // Parse state to get locale
  let locale = 'en'
  try {
    if (state) {
      const stateData = JSON.parse(decodeURIComponent(state))
      locale = stateData.locale || 'en'
    }
  } catch (e) {
    console.error('Failed to parse state:', e)
  }

  // Handle OAuth errors
  if (error) {
    console.error('Google OAuth error:', error, errorDescription)
    return NextResponse.redirect(
      `${origin}/${locale}/integrations?error=${encodeURIComponent(error)}`
    )
  }

  if (!code) {
    return NextResponse.redirect(
      `${origin}/${locale}/integrations?error=no_code`
    )
  }

  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.redirect(`${origin}/${locale}/signin?error=unauthenticated`)
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${origin}/api/auth/callback/google`,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      console.error('Google token exchange error:', errorData)
      return NextResponse.redirect(
        `${origin}/${locale}/integrations?error=token_exchange_failed`
      )
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token
    const refreshToken = tokenData.refresh_token

    // Get user's Google Ads accounts
    // Note: Google Ads API requires manager account (MCC) access
    // For now, we'll use a simple approach - user provides Customer ID manually
    // or we fetch it from Google Ads API

    // Fetch accessible customers using Google Ads API (v22 - latest)
    const customersResponse = await fetch(
      'https://googleads.googleapis.com/v22/customers:listAccessibleCustomers',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '',
        },
      }
    )

    if (!customersResponse.ok) {
      const errorData = await customersResponse.text()
      console.error('Failed to fetch Google Ads customers:', errorData)

      // If we can't fetch customers, save error state to cookies
      // User will be prompted to manually provide Customer ID
      const pendingAccountsData = {
        platform: 'google',
        accessToken,
        refreshToken,
        accounts: [],
        requiresManualSetup: true,
        userId: user.id,
        expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes expiry
      }

      const cookieStore = await cookies()

      cookieStore.set('pending_accounts', JSON.stringify(pendingAccountsData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60, // 15 minutes
        path: '/',
      })

      return NextResponse.redirect(
        `${origin}/${locale}/integrations/select-account?status=manual_setup`
      )
    }

    const customersData = await customersResponse.json()
    const customerIds = customersData.resourceNames || []

    if (customerIds.length === 0) {
      return NextResponse.redirect(
        `${origin}/${locale}/integrations?error=no_google_ads_accounts`
      )
    }

    // Parse customer IDs from resource names (format: "customers/1234567890")
    const accounts = customerIds.map((resourceName: string) => {
      const customerId = resourceName.split('/')[1]
      return {
        id: customerId,
        name: `Google Ads ${customerId}`,
        platform: 'google',
        currency: 'USD', // Default, will be updated when fetching account details
        timezone: 'UTC', // Default, will be updated when fetching account details
      }
    })

    // Save all customer accounts and tokens to cookies for account selection
    const pendingAccountsData = {
      platform: 'google',
      accessToken,
      refreshToken,
      accounts,
      userId: user.id,
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes expiry
    }

    const cookieStore = await cookies()

    // Store in cookie (max size ~4KB)
    cookieStore.set('pending_accounts', JSON.stringify(pendingAccountsData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    })

    // Redirect to account selection page
    return NextResponse.redirect(
      `${origin}/${locale}/integrations/select-account`
    )
  } catch (error) {
    console.error('Google OAuth callback error:', error)
    return NextResponse.redirect(
      `${origin}/${locale}/integrations?error=unknown`
    )
  }
}

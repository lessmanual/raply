import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { validateCustomerId } from '@/lib/api/google-ads'

const updateCustomerIdSchema = z.object({
  accountId: z.string().uuid(),
  customerId: z.string().regex(/^\d{3}-\d{3}-\d{4}$/, 'Customer ID must be in format: 123-456-7890'),
})

export async function POST(request: NextRequest) {
  try {
    // Validate request body
    const body = await request.json()
    const validated = updateCustomerIdSchema.parse(body)

    // Check authentication
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch ad account to get access token for validation
    const { data: account, error: accountError } = await supabase
      .from('ad_accounts')
      .select('access_token, platform')
      .eq('id', validated.accountId)
      .eq('user_id', user.id)
      .single()

    if (accountError || !account) {
      return NextResponse.json(
        { error: 'Ad account not found' },
        { status: 404 }
      )
    }

    // Ensure it's a Google Ads account
    if (account.platform !== 'google') {
      return NextResponse.json(
        { error: 'This endpoint is only for Google Ads accounts' },
        { status: 400 }
      )
    }

    // Validate customer ID with Google Ads API
    const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN
    if (!developerToken) {
      console.error('GOOGLE_ADS_DEVELOPER_TOKEN not configured')
      return NextResponse.json(
        { error: 'Google Ads API not configured' },
        { status: 500 }
      )
    }

    const isValid = await validateCustomerId(
      validated.customerId,
      account.access_token,
      developerToken
    )

    if (!isValid) {
      return NextResponse.json(
        {
          error: 'Invalid Google Ads Customer ID',
          details: 'Customer ID not found or you don\'t have access to this account'
        },
        { status: 400 }
      )
    }

    // Remove dashes from customer ID for storage (format: 1234567890)
    const cleanCustomerId = validated.customerId.replace(/-/g, '')

    // Update ad account with customer ID
    const { error: updateError } = await supabase
      .from('ad_accounts')
      .update({
        platform_account_id: cleanCustomerId,
        account_name: `Google Ads ${validated.customerId}`,
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', validated.accountId)
      .eq('user_id', user.id) // Ensure user owns this account

    if (updateError) {
      console.error('Failed to update customer ID:', updateError)
      return NextResponse.json(
        { error: 'Failed to update customer ID' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Customer ID updated successfully',
    })
  } catch (error) {
    // Zod validation error
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid customer ID format. Use: 123-456-7890', details: error.issues },
        { status: 400 }
      )
    }

    // Generic error
    console.error('Update customer ID API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

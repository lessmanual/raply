import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const disconnectSchema = z.object({
  platform: z.enum(['meta', 'google']),
  accountId: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  try {
    // Validate request body
    const body = await request.json()
    const validated = disconnectSchema.parse(body)

    // Check authentication
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete specific ad account from database
    const { error: deleteError } = await supabase
      .from('ad_accounts')
      .delete()
      .eq('id', validated.accountId)
      .eq('user_id', user.id)
      .eq('platform', validated.platform)

    if (deleteError) {
      console.error('Failed to disconnect account:', deleteError)
      return NextResponse.json(
        { error: 'Failed to disconnect account' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `${validated.platform} account disconnected successfully`,
    })
  } catch (error) {
    // Zod validation error
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }

    // Generic error
    console.error('Disconnect API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

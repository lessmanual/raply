import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { ReportEmailTemplate } from '@/components/emails/report-email'
import { z } from 'zod'

// Lazy initialization to avoid build-time errors
const getResend = () => new Resend(process.env.RESEND_API_KEY || '')

const sendEmailSchema = z.object({
  email: z.string().email(),
})

/**
 * POST /api/reports/[id]/send
 * Sends report via email
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reportId } = await params
    const body = await request.json()
    const validated = sendEmailSchema.parse(body)

    // Check authentication
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch report details
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select(`
        *,
        ad_account:ad_accounts(name, platform, currency)
      `)
      .eq('id', reportId)
      .eq('user_id', user.id)
      .single()

    if (reportError || !report) {
      return NextResponse.json(
        { error: 'Report not found or access denied' },
        { status: 404 }
      )
    }

    if (report.status !== 'completed') {
      return NextResponse.json(
        { error: 'Report is not completed yet' },
        { status: 400 }
      )
    }

    // Ensure share token exists for public link
    let shareToken = report.share_token
    if (!shareToken) {
      // Create share token if not exists
      const { data: updatedReport, error: updateError } = await supabase
        .from('reports')
        .update({
          share_token: crypto.randomUUID(),
        })
        .eq('id', reportId)
        .select('share_token')
        .single()

      if (!updateError && updatedReport) {
        shareToken = updatedReport.share_token
      }
    }

    // Prepare email data
    const platformName = report.ad_account?.platform === 'meta' ? 'Meta Ads' : 'Google Ads'
    const dateRange = `${new Date(report.date_from).toLocaleDateString()} - ${new Date(report.date_to).toLocaleDateString()}`
    const currency = report.ad_account?.currency || 'USD'
    const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL}/public/reports/${shareToken}`

    // Format metrics
    const metrics = {
      spend: new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(report.total_spend || 0),
      impressions: new Intl.NumberFormat('en-US').format(report.total_impressions || 0),
      clicks: new Intl.NumberFormat('en-US').format(report.total_clicks || 0),
      conversions: new Intl.NumberFormat('en-US').format(report.total_conversions || 0),
      roas: report.roas ? `${report.roas.toFixed(2)}x` : '-',
    }

    // Send email
    const resend = getResend()
    const { data, error } = await resend.emails.send({
      from: 'Raply <onboarding@resend.dev>', // Use default Resend testing domain or configured domain
      to: validated.email,
      subject: `Your Raply Report: ${report.name}`,
      react: (
        <ReportEmailTemplate
          reportName={report.name}
          reportUrl={publicUrl}
          platform={platformName}
          dateRange={dateRange}
          metrics={metrics}
        />
      ),
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }
    console.error('Send email error:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}

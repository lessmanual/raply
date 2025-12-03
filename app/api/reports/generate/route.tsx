import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { createReportSchema } from '@/lib/validators/report'
import { z } from 'zod'
import { fetchCampaignData } from '@/lib/api/campaign-data'
import { generateAIInsights } from '@/lib/api/ai-insights'
import { bulkCreateCampaignData } from '@/lib/db/mutations'
import type { CampaignDataInsert } from '@/lib/types'
import { Resend } from 'resend'
import { ReportNotificationEmail } from '@/components/emails/report-notification-email'

/**
 * POST /api/reports/generate
 * Generates a new advertising report
 *
 * This endpoint:
 * 1. Validates request data
 * 2. Checks authentication
 * 3. Checks plan limits (free plan: 2 reports/month)
 * 4. Creates report record in database
 * 5. Starts async report processing (fetch data + AI insights)
 * 6. Returns reportId immediately (status: generating)
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validated = createReportSchema.parse(body)

    // Check authentication
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user owns the ad account
    const { data: account, error: accountError } = await supabase
      .from('ad_accounts')
      .select('*')
      .eq('id', validated.accountId)
      .eq('user_id', user.id)
      .single()

    if (accountError || !account) {
      return NextResponse.json(
        { error: 'Ad account not found or access denied' },
        { status: 404 }
      )
    }

    // Check plan limits
    // Get user's subscription status (currently everyone is on free plan)
    const { data: existingUser } = await supabase
      .from('users')
      .select('role, subscription_plan')
      .eq('id', user.id)
      .single()

    const isAdmin = existingUser?.role === 'admin'

    // Get reports count for current month (only if not admin)
    if (!isAdmin) {
      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      const { count, error: countError } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', firstDayOfMonth.toISOString())

      if (countError) {
        console.error('Error counting reports:', countError)
        return NextResponse.json(
          { error: 'Failed to check report limits' },
          { status: 500 }
        )
      }

      // Free plan limit: 2 reports per month
      const FREE_PLAN_LIMIT = 2

      if (count !== null && count >= FREE_PLAN_LIMIT) {
        return NextResponse.json(
          {
            error: 'Monthly report limit reached',
            message: `Free plan allows ${FREE_PLAN_LIMIT} reports per month. You have generated ${count}. Upgrade to create more reports.`,
            limit: FREE_PLAN_LIMIT,
            used: count,
          },
          { status: 403 }
        )
      }
    }

    // Generate report name
    const reportName = `${validated.templateType.charAt(0).toUpperCase() + validated.templateType.slice(1)} Report - ${new Date(validated.dateRange.from).toLocaleDateString()} to ${new Date(validated.dateRange.to).toLocaleDateString()}`

    // Create report record
    const { data: report, error: createError } = await supabase
      .from('reports')
      .insert({
        user_id: user.id,
        ad_account_id: validated.accountId,
        template_type: validated.templateType,
        date_from: validated.dateRange.from,
        date_to: validated.dateRange.to,
        name: validated.name || reportName,
        status: 'generating',
      })
      .select()
      .single()

    if (createError || !report) {
      console.error('Error creating report:', createError)
      return NextResponse.json(
        { error: 'Failed to create report' },
        { status: 500 }
      )
    }

    // Start async report processing (don't await - return immediately)
    processReport(report.id, account, validated).catch((error) => {
      console.error(`Failed to process report ${report.id}:`, error)
    })

    // Return success with reportId immediately (report will be processed in background)
    return NextResponse.json({
      success: true,
      reportId: report.id,
      message: 'Report generation started',
    })
  } catch (error) {
    // Zod validation error
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: error.issues,
        },
        { status: 400 }
      )
    }

    // Generic error
    console.error('Generate report API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Send email notification when report processing completes
 */
async function sendReportNotification(
  reportId: string,
  userId: string,
  status: 'completed' | 'failed',
  errorMessage?: string
) {
  try {
    const supabase = createAdminClient()

    // Get user email
    const { data, error: userError } = await supabase.auth.admin.getUserById(userId)

    if (userError || !data?.user?.email) {
      console.error(`[Report ${reportId}] Failed to get user email:`, userError)
      return
    }

    const userEmail = data.user.email

    // Get report details
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select('name, ad_account_id, date_from, date_to')
      .eq('id', reportId)
      .single()

    if (reportError || !report) {
      console.error(`[Report ${reportId}] Failed to get report details:`, reportError)
      return
    }

    // Get ad account platform
    const { data: account, error: accountError } = await supabase
      .from('ad_accounts')
      .select('platform')
      .eq('id', report.ad_account_id)
      .single()

    if (accountError || !account) {
      console.error(`[Report ${reportId}] Failed to get account details:`, accountError)
      return
    }

    // Initialize Resend
    const resend = new Resend(process.env.RESEND_API_KEY)

    // Format date range
    const dateFrom = new Date(report.date_from).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    const dateTo = new Date(report.date_to).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    const dateRange = `${dateFrom} - ${dateTo}`

    // Create report URL
    const reportUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reports/${reportId}`

    // Send email
    const { data: emailData, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: userEmail,
      subject:
        status === 'completed'
          ? `Your report is ready: ${report.name}`
          : `Report generation failed: ${report.name}`,
      react: (
        <ReportNotificationEmail
          reportName={report.name}
          reportUrl={reportUrl}
          platform={account.platform === 'meta' ? 'Meta Ads' : 'Google Ads'}
          dateRange={dateRange}
          status={status}
          errorMessage={errorMessage}
        />
      ),
    })

    if (error) {
      console.error(`[Report ${reportId}] Failed to send email:`, error)
    } else {
      console.log(`[Report ${reportId}] Notification email sent to ${userEmail}`)
    }
  } catch (error) {
    console.error(`[Report ${reportId}] Error sending notification:`, error)
  }
}

/**
 * Process report asynchronously
 *
 * This function runs in the background after the API returns.
 * It fetches campaign data, generates AI insights, and updates the report.
 *
 * @param reportId - Report UUID
 * @param account - Ad account details from database
 * @param reportData - Validated report creation data
 */
async function processReport(
  reportId: string,
  account: any,
  reportData: z.infer<typeof createReportSchema>
) {
  const supabase = createAdminClient()
  let userId: string | null = null

  try {
    console.log(`[Report ${reportId}] Starting processing...`)

    // Get userId from report for email notification
    const { data: reportRecord, error: reportError } = await supabase
      .from('reports')
      .select('user_id')
      .eq('id', reportId)
      .single()

    if (reportError || !reportRecord) {
      console.error(`[Report ${reportId}] Failed to get report user:`, reportError)
    } else {
      userId = reportRecord.user_id
    }

    // Convert dates to YYYY-MM-DD format
    const dateFrom = new Date(reportData.dateRange.from).toISOString().split('T')[0]
    const dateTo = new Date(reportData.dateRange.to).toISOString().split('T')[0]

    // Calculate previous period dates
    const dateFromTime = new Date(dateFrom).getTime()
    const dateToTime = new Date(dateTo).getTime()
    const currentDuration = dateToTime - dateFromTime
    
    // Previous period ends 1 day before current period starts
    const previousDateToTime = dateFromTime - 86400000 // 1 day in ms
    const previousDateFromTime = previousDateToTime - currentDuration
    
    const previousDateTo = new Date(previousDateToTime).toISOString().split('T')[0]
    const previousDateFrom = new Date(previousDateFromTime).toISOString().split('T')[0]

    console.log(`[Report ${reportId}] Comparison period: ${previousDateFrom} to ${previousDateTo}`)

    // Fetch previous period data (non-blocking, errors ignored to not fail main report)
    let previousPeriodData = null
    try {
      previousPeriodData = await fetchCampaignData(
        account.platform,
        {
          platform_account_id: account.platform_account_id,
          access_token: account.access_token,
          account_name: account.account_name,
          currency: account.currency,
        },
        previousDateFrom,
        previousDateTo
      )
      console.log(`[Report ${reportId}] Fetched comparison data successfully`)
    } catch (prevError) {
      console.warn(`[Report ${reportId}] Failed to fetch comparison data:`, prevError)
    }

    // Step 1: Fetch campaign data from advertising platform
    console.log(`[Report ${reportId}] Fetching campaign data from ${account.platform}...`)

    const campaignData = await fetchCampaignData(
      account.platform,
      {
        platform_account_id: account.platform_account_id,
        access_token: account.access_token,
        account_name: account.account_name,
        currency: account.currency,
      },
      dateFrom,
      dateTo
    )

    console.log(
      `[Report ${reportId}] Fetched ${campaignData.campaigns.length} campaigns`
    )

    // Step 2: Save campaign-level data to database
    console.log(`[Report ${reportId}] Saving campaign data to database...`)

    const campaignDataInserts: CampaignDataInsert[] = campaignData.campaigns.map(
      (campaign) => ({
        report_id: reportId,
        ad_account_id: account.id,
        campaign_id: campaign.campaign_id,
        campaign_name: campaign.campaign_name,
        platform: campaignData.platform,
        date_from: campaignData.date_from,
        date_to: campaignData.date_to,
        spend: campaign.spend,
        impressions: campaign.impressions,
        clicks: campaign.clicks,
        conversions: campaign.conversions,
        // Calculate revenue from ROAS if available (for ROAS calculation in DB)
        revenue: campaign.roas ? campaign.roas * campaign.spend : 0,
        // Other fields will be auto-calculated by DB trigger
      })
    )

    const { error: campaignDataError } = await bulkCreateCampaignData(
      campaignDataInserts,
      supabase
    )

    if (campaignDataError) {
      console.error(
        `[Report ${reportId}] Failed to save campaign data:`,
        campaignDataError
      )
      // Continue anyway - campaign data is nice to have but not critical
    } else {
      console.log(
        `[Report ${reportId}] Saved ${campaignDataInserts.length} campaigns to database`
      )
    }

    // Step 3: Generate AI insights
    console.log(`[Report ${reportId}] Generating AI insights...`)

    const aiInsights = await generateAIInsights(
      campaignData,
      reportData.templateType
    )

    console.log(`[Report ${reportId}] AI insights generated successfully`)

    // Step 4: Update report with totals and AI insights
    const { error: updateError } = await supabase
      .from('reports')
      .update({
        status: 'completed',
        ai_description: aiInsights.description,
        ai_recommendations: aiInsights.recommendations,
        total_spend: campaignData.totals.spend,
        total_impressions: campaignData.totals.impressions,
        total_clicks: campaignData.totals.clicks,
        total_conversions: campaignData.totals.conversions,
        average_ctr: campaignData.totals.ctr,
        average_cpc: campaignData.totals.cpc,
        average_cpm: campaignData.totals.cpm,
        roas: campaignData.totals.roas || null,
        generated_at: new Date().toISOString(),
        // Previous period data
        previous_date_from: previousDateFrom,
        previous_date_to: previousDateTo,
        previous_spend: previousPeriodData?.totals.spend || null,
        previous_impressions: previousPeriodData?.totals.impressions || null,
        previous_clicks: previousPeriodData?.totals.clicks || null,
        previous_conversions: previousPeriodData?.totals.conversions || null,
        previous_ctr: previousPeriodData?.totals.ctr || null,
        previous_cpc: previousPeriodData?.totals.cpc || null,
        previous_cpm: previousPeriodData?.totals.cpm || null,
        previous_roas: previousPeriodData?.totals.roas || null,
      })
      .eq('id', reportId)

    if (updateError) {
      throw new Error(`Failed to update report: ${updateError.message}`)
    }

    console.log(`[Report ${reportId}] Processing completed successfully`)

    // Send success notification email
    if (userId) {
      await sendReportNotification(reportId, userId, 'completed')
    }
  } catch (error: any) {
    console.error(`[Report ${reportId}] Processing failed:`, error)

    // Update report status to failed
    await supabase
      .from('reports')
      .update({
        status: 'failed',
      })
      .eq('id', reportId)

    // Send failure notification email
    if (userId) {
      await sendReportNotification(
        reportId,
        userId,
        'failed',
        error?.message || 'Unknown error occurred'
      )
    }
  }
}

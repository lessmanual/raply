import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { ReportPDFTemplate } from '@/components/reports/pdf-template'
import { getCampaignDataByReport } from '@/lib/db/queries'

/**
 * GET /api/reports/[id]/pdf
 * Generates and downloads a PDF report
 *
 * This endpoint:
 * 1. Validates authentication
 * 2. Fetches report data from database
 * 3. Fetches campaign data
 * 4. Generates PDF using React-PDF
 * 5. Returns PDF as downloadable blob
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reportId } = await params

    // Check authentication
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch report with ad account details
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

    // Check if report is completed
    if (report.status !== 'completed') {
      return NextResponse.json(
        { error: 'Report is not yet completed' },
        { status: 400 }
      )
    }

    // Fetch campaign data
    const { data: campaignData } = await getCampaignDataByReport(reportId)

    // Format dates for display
    const dateFrom = new Date(report.date_from).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
    const dateTo = new Date(report.date_to).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })

    // Platform display name
    const platformName =
      report.ad_account?.platform === 'meta' ? 'Meta Ads' : 'Google Ads'

    // Generate PDF using React-PDF
    const pdfBuffer = await renderToBuffer(
      ReportPDFTemplate({
        reportName: report.name,
        dateFrom,
        dateTo,
        platform: platformName,
        accountName: report.ad_account?.name || 'Unknown',
        currency: report.ad_account?.currency || 'USD',
        // Metrics
        totalSpend: report.total_spend || 0,
        totalImpressions: report.total_impressions || 0,
        totalClicks: report.total_clicks || 0,
        totalConversions: report.total_conversions || 0,
        averageCtr: report.average_ctr || 0,
        averageCpc: report.average_cpc || 0,
        averageCpm: report.average_cpm || 0,
        roas: report.roas,
        // AI Insights
        aiDescription: report.ai_description,
        aiRecommendations: report.ai_recommendations,
        // Campaigns (will be filtered to top 10 in template)
        campaigns: campaignData || [],
      })
    )

    // Generate filename with date
    const filename = `raply-report-${new Date(report.created_at).toISOString().split('T')[0]}.pdf`

    // Return PDF as downloadable blob
    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}

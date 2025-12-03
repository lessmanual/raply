import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Calendar } from 'lucide-react'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { getCampaignDataByReport } from '@/lib/db/queries'
import { ReportMetricsCards } from '@/components/reports/report-metrics-cards'
import { ReportAIInsights } from '@/components/reports/report-ai-insights'
import { ReportCampaignsTable } from '@/components/reports/report-campaigns-table'
import { ReportActions } from '@/components/reports/report-actions'
import { ReportCharts } from '@/components/reports/report-charts'

export const metadata = {
  title: 'Report Details | Raply',
  description: 'View report details and insights',
}

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  const supabase = await createClient()
  const t = await getTranslations('dashboard.reportDetail')

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${locale}/signin`)
  }

  // Fetch report with ad account details
  const { data: report, error } = await supabase
    .from('reports')
    .select(`
      *,
      ad_account:ad_accounts(name, platform, currency)
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    console.error('Report fetch error:', {
      reportId: id,
      userId: user.id,
      error: error.message,
      code: error.code,
      details: error.details
    })
    notFound()
  }

  if (!report) {
    console.error('Report not found:', {
      reportId: id,
      userId: user.id
    })
    notFound()
  }

  // Increment view count (fire and forget - don't block page load)
  supabase.rpc('increment_report_views', { report_id: id }).then(({ error }) => {
    if (error) {
      console.error('Failed to increment view count:', error)
    }
  })

  // Handle missing ad_account (if deleted)
  const accountName = report.ad_account?.name || 'Deleted Account'
  const platform = report.ad_account?.platform || 'unknown'
  const currency = report.ad_account?.currency || 'USD'

  // Fetch campaign-level data
  const { data: campaignData } = await getCampaignDataByReport(id)

  // Format date range for display
  const dateFrom = new Date(report.date_from).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
  const dateTo = new Date(report.date_to).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link href={`/${locale}/reports`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Reports
          </Button>
        </Link>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">{report.name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {dateFrom} - {dateTo}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    platform === 'meta' ? 'default' : 'secondary'
                  }
                >
                  {platform === 'meta' ? 'Meta Ads' : platform === 'google' ? 'Google Ads' : 'Unknown'}
                </Badge>
                <span>•</span>
                <span>{accountName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    report.status === 'completed'
                      ? 'default'
                      : report.status === 'generating'
                      ? 'secondary'
                      : 'destructive'
                  }
                >
                  {report.status}
                </Badge>
              </div>
            </div>
          </div>
          <ReportActions
            reportId={report.id}
            reportName={report.name}
            reportStatus={report.status}
            shareToken={report.share_token}
          />
        </div>
      </div>

      {/* Status Message */}
      {report.status === 'generating' && (
        <Card className="border-blue-500/50 bg-blue-500/5">
          <CardHeader>
            <CardTitle>Report is being generated...</CardTitle>
            <CardDescription>
              This usually takes 10-30 seconds. Refresh the page to see the results.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {report.status === 'failed' && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle>Report generation failed</CardTitle>
            <CardDescription>
              There was an error generating this report. Please try creating a new one.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Metrics Cards */}
      {report.status === 'completed' && (
        <>
          <div>
            <h2 className="text-2xl font-bold mb-4">Performance Metrics</h2>
            <ReportMetricsCards
              spend={report.total_spend || 0}
              impressions={report.total_impressions || 0}
              clicks={report.total_clicks || 0}
              conversions={report.total_conversions || 0}
              ctr={report.average_ctr || 0}
              cpc={report.average_cpc || 0}
              cpm={report.average_cpm || 0}
              roas={report.roas}
              currency={currency}
              previousSpend={report.previous_spend}
              previousImpressions={report.previous_impressions}
              previousClicks={report.previous_clicks}
              previousConversions={report.previous_conversions}
              previousCtr={report.previous_ctr}
              previousCpc={report.previous_cpc}
              previousCpm={report.previous_cpm}
              previousRoas={report.previous_roas}
            />
          </div>

          {/* AI Insights */}
          <div>
            <h2 className="text-2xl font-bold mb-4">AI Insights</h2>
            <ReportAIInsights
              description={report.ai_description}
              recommendations={report.ai_recommendations}
            />
          </div>

          {/* Charts */}
          {campaignData && campaignData.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Performance Charts</h2>
              <ReportCharts
                campaigns={campaignData}
                currency={currency}
              />
            </div>
          )}

          {/* Campaigns Table */}
          {campaignData && campaignData.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Campaign Performance</h2>
              <ReportCampaignsTable
                campaigns={campaignData}
                currency={currency}
              />
            </div>
          )}

          {/* No campaigns message */}
          {(!campaignData || campaignData.length === 0) && (
            <Card className="border-muted">
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
                <CardDescription>
                  No campaign-level data available for this report
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This report was generated before campaign-level data tracking was
                  implemented. Please generate a new report to see detailed campaign
                  performance.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

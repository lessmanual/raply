import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, ExternalLink } from 'lucide-react'
import { getCampaignDataByReport } from '@/lib/db/queries'
import { ReportMetricsCards } from '@/components/reports/report-metrics-cards'
import { ReportAIInsights } from '@/components/reports/report-ai-insights'
import { ReportCampaignsTable } from '@/components/reports/report-campaigns-table'
import { Button } from '@/components/ui/button'
import { ReportCharts } from '@/components/reports/report-charts'
import Link from 'next/link'

export const metadata = {
  title: 'Shared Report | Raply',
  description: 'View shared advertising report',
}

export default async function PublicReportPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const supabase = await createClient()

  // Fetch report by share_token (no auth required)
  const { data: report, error } = await supabase
    .from('reports')
    .select(`
      *,
      ad_account:ad_accounts(name, platform, currency)
    `)
    .eq('share_token', token)
    .single()

  if (error || !report) {
    notFound()
  }

  // Check if share token has expired
  if (report.share_token_expires_at) {
    const expirationDate = new Date(report.share_token_expires_at)
    const now = new Date()

    if (now > expirationDate) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Share Link Expired</CardTitle>
              <CardDescription>
                This report share link has expired. Please request a new link from the report owner.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/">
                  Go to Raply Homepage
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }
  }

  // Check if report is completed
  if (report.status !== 'completed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Report Not Ready</CardTitle>
            <CardDescription>
              This report is still being generated. Please check back later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">Status: {report.status}</Badge>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Fetch campaign data
  const { data: campaignData } = await getCampaignDataByReport(report.id)

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

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Raply Branding Header */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="font-bold text-xl">Raply</div>
            <Badge variant="outline" className="text-xs">
              Shared Report
            </Badge>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/" target="_blank">
              <ExternalLink className="mr-2 h-4 w-4" />
              Create Your Own Reports
            </Link>
          </Button>
        </div>
      </div>

      {/* Report Content */}
      <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
        {/* Header */}
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
                  report.ad_account?.platform === 'meta' ? 'default' : 'secondary'
                }
              >
                {report.ad_account?.platform === 'meta' ? 'Meta Ads' : 'Google Ads'}
              </Badge>
              <span>•</span>
              <span>{report.ad_account?.name}</span>
            </div>
          </div>
        </div>

        {/* Metrics Cards */}
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
            currency={report.ad_account?.currency || 'USD'}
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
              currency={report.ad_account?.currency || 'USD'}
            />
          </div>
        )}

        {/* Campaigns Table */}
        {campaignData && campaignData.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Campaign Performance</h2>
            <ReportCampaignsTable
              campaigns={campaignData}
              currency={report.ad_account?.currency || 'USD'}
            />
          </div>
        )}

        {/* Watermark Footer */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                This report was generated by{' '}
                <span className="font-semibold text-primary">Raply</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Automated advertising reports with AI-powered insights
              </p>
              <Button asChild variant="default" size="sm" className="mt-4">
                <Link href="/" target="_blank">
                  Create Your Reports Free
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

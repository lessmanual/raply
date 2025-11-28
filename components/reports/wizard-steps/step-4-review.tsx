'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Facebook, Search, Users, TrendingUp, FileText, Calendar, CheckCircle2 } from 'lucide-react'
import type { AdAccount, ReportTemplate, DateRange } from '@/lib/validators/report'

interface Step4ReviewProps {
  account?: AdAccount
  template?: ReportTemplate
  dateRange?: DateRange
}

/**
 * Step 4: Review & Confirm
 * Displays summary of all selections before generating report
 */
export function Step4Review({ account, template, dateRange }: Step4ReviewProps) {
  // Template metadata
  const templateData = {
    leads: {
      name: 'Lead Generation',
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
    },
    sales: {
      name: 'Sales & Revenue',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
    },
    reach: {
      name: 'Reach & Awareness',
      icon: FileText,
      color: 'from-purple-500 to-pink-500',
    },
  }

  const currentTemplate = template ? templateData[template] : null
  const TemplateIcon = currentTemplate?.icon
  const PlatformIcon = account?.platform === 'meta' ? Facebook : Search
  const platformColor = account?.platform === 'meta' ? '#1877F2' : '#4285F4'

  // Calculate days (inclusive range - add +1)
  // Example: Jan 1 - Jan 1 = 1 day (not 0)
  const days = dateRange
    ? Math.ceil(
        (new Date(dateRange.to).getTime() - new Date(dateRange.from).getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1
    : 0

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Ad Account Summary */}
        {account && (
          <Card className="glass-intense border-primary/30">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold">Ad Account</h3>
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>

              <div className="space-y-4">
                {/* Platform Icon */}
                <div
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full"
                  style={{ backgroundColor: `${platformColor}15` }}
                >
                  {PlatformIcon && (
                    <PlatformIcon className="w-6 h-6" style={{ color: platformColor }} />
                  )}
                </div>

                {/* Account Details */}
                <div className="space-y-2">
                  <p className="font-medium text-base">{account.account_name}</p>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className="capitalize"
                      style={{
                        borderColor: platformColor,
                        color: platformColor,
                      }}
                    >
                      {account.platform === 'meta' ? 'Meta Ads' : 'Google Ads'}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {account.currency}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    ID: {account.platform_account_id}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Template Summary */}
        {template && currentTemplate && TemplateIcon && (
          <Card className="glass-intense border-primary/30">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold">Template</h3>
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>

              <div className="space-y-4">
                {/* Template Icon */}
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${currentTemplate.color}`}
                >
                  <TemplateIcon className="h-6 w-6 text-white" />
                </div>

                {/* Template Details */}
                <div className="space-y-2">
                  <p className="font-medium text-base">{currentTemplate.name}</p>

                  <Badge variant="default" className="text-xs capitalize">
                    {template} Report
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Date Range Summary */}
      {dateRange && (
        <Card className="glass-intense border-primary/30">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold">Date Range</h3>
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>

            <div className="flex items-center gap-4">
              <Calendar className="h-10 w-10 text-primary" />

              <div className="flex-1">
                <div className="flex items-center gap-2 text-base font-medium">
                  <span>{new Date(dateRange.from).toLocaleDateString()}</span>
                  <span className="text-muted-foreground">→</span>
                  <span>{new Date(dateRange.to).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{days} days of data</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generation Info */}
      <div className="p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
        <h3 className="text-lg font-semibold mb-3">What happens next?</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start">
            <span className="mr-2 mt-0.5 text-primary">✓</span>
            <span>
              We&apos;ll fetch campaign data from your advertising account for the selected period
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 mt-0.5 text-primary">✓</span>
            <span>AI will analyze the data and generate insights & recommendations</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 mt-0.5 text-primary">✓</span>
            <span>Your report will be ready to view, download (PDF), or send via email</span>
          </li>
        </ul>
      </div>

      {/* Warning if incomplete */}
      {(!account || !template || !dateRange) && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">
            <strong>Incomplete:</strong> Please complete all previous steps before generating
            the report.
          </p>
        </div>
      )}
    </div>
  )
}

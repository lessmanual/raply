import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  TrendingUp,
  Eye,
  MousePointerClick,
  DollarSign,
  Target,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'

interface ReportMetricsCardsProps {
  spend: number
  impressions: number
  clicks: number
  conversions: number
  ctr: number
  cpc: number
  cpm: number
  roas?: number | null
  currency?: string
  // Previous period metrics
  previousSpend?: number | null
  previousImpressions?: number | null
  previousClicks?: number | null
  previousConversions?: number | null
  previousCtr?: number | null
  previousCpc?: number | null
  previousCpm?: number | null
  previousRoas?: number | null
}

/**
 * Format number with thousands separator
 */
function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(num))
}

/**
 * Format currency value
 */
function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format percentage
 */
function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`
}

/**
 * Calculate percentage change
 */
function calculateChange(current: number, previous: number | null | undefined): number | null {
  if (!previous || previous === 0) return null
  return ((current - previous) / previous) * 100
}

/**
 * Change Indicator Component
 */
function ChangeIndicator({ 
  change, 
  inverse = false 
}: { 
  change: number | null, 
  inverse?: boolean // If true, higher is worse (e.g. CPC, CPM)
}) {
  if (change === null) return <span className="text-xs text-muted-foreground ml-2">vs previous</span>

  const isPositive = change > 0
  const isGood = inverse ? !isPositive : isPositive
  const colorClass = isGood ? 'text-green-600' : 'text-red-600'
  const Icon = isPositive ? ArrowUpRight : ArrowDownRight

  return (
    <div className={`flex items-center text-xs font-medium ${colorClass} ml-2`}>
      <Icon className="h-3 w-3 mr-1" />
      {Math.abs(change).toFixed(1)}%
    </div>
  )
}

export function ReportMetricsCards({
  spend,
  impressions,
  clicks,
  conversions,
  ctr,
  cpc,
  cpm,
  roas,
  currency = 'USD',
  previousSpend,
  previousImpressions,
  previousClicks,
  previousConversions,
  previousCtr,
  previousCpc,
  previousCpm,
  previousRoas,
}: ReportMetricsCardsProps) {
  const metrics = [
    {
      title: 'Total Spend',
      value: formatCurrency(spend, currency),
      icon: DollarSign,
      description: 'Total advertising spend',
      change: calculateChange(spend, previousSpend),
      inverse: true, // Higher spend isn't necessarily "better" without context, but usually we want lower spend for same results. Let's treat higher spend as "neutral/cost" but higher CPA is bad. Actually for Total Spend, color meaning is ambiguous. Let's keep it neutral or standard. Standard: Green = Up.
    },
    {
      title: 'Impressions',
      value: formatNumber(impressions),
      icon: Eye,
      description: 'Total ad impressions',
      change: calculateChange(impressions, previousImpressions),
    },
    {
      title: 'Clicks',
      value: formatNumber(clicks),
      icon: MousePointerClick,
      description: 'Total ad clicks',
      change: calculateChange(clicks, previousClicks),
    },
    {
      title: 'CTR',
      value: formatPercentage(ctr),
      icon: TrendingUp,
      description: 'Click-through rate',
      change: calculateChange(ctr, previousCtr),
    },
    {
      title: 'CPC',
      value: formatCurrency(cpc, currency),
      icon: BarChart3,
      description: 'Cost per click',
      change: calculateChange(cpc, previousCpc),
      inverse: true, // Higher CPC is bad (Red)
    },
    {
      title: 'CPM',
      value: formatCurrency(cpm, currency),
      icon: BarChart3,
      description: 'Cost per 1000 impressions',
      change: calculateChange(cpm, previousCpm),
      inverse: true, // Higher CPM is bad (Red)
    },
    {
      title: 'Conversions',
      value: formatNumber(conversions),
      icon: Target,
      description: 'Total conversions',
      change: calculateChange(conversions, previousConversions),
    },
  ]

  // Add ROAS if available
  if (roas !== null && roas !== undefined && roas > 0) {
    metrics.push({
      title: 'ROAS',
      value: `${roas.toFixed(2)}x`,
      icon: TrendingUp,
      description: 'Return on ad spend',
      change: calculateChange(roas, previousRoas),
      inverse: false,
    })
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon
        return (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center mt-1">
                {metric.change !== null && (
                  <ChangeIndicator change={metric.change} inverse={metric.inverse} />
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
  Legend,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, TrendingUp, Target } from 'lucide-react'

interface CampaignData {
  campaign_name: string
  spend: number
  impressions: number
  clicks: number
  conversions: number
  ctr: number | null
  cpc: number | null
  roas: number | null
}

interface ReportChartsProps {
  campaigns: CampaignData[]
  currency: string
}

export function ReportCharts({ campaigns, currency }: ReportChartsProps) {
  // Sort campaigns by spend and take top 5
  const topCampaignsBySpend = [...campaigns]
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 5)
    .map((c) => ({
      ...c,
      name: c.campaign_name.length > 20 ? c.campaign_name.substring(0, 20) + '...' : c.campaign_name,
    }))

  // Sort by ROAS for efficiency chart (only include campaigns with spend > 0)
  const topCampaignsByROAS = [...campaigns]
    .filter((c) => c.spend > 0)
    .sort((a, b) => (b.roas || 0) - (a.roas || 0))
    .slice(0, 5)
    .map((c) => ({
      ...c,
      name: c.campaign_name.length > 20 ? c.campaign_name.substring(0, 20) + '...' : c.campaign_name,
      roas: c.roas || 0,
    }))

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label, valuePrefix = '' }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-3 rounded-lg shadow-lg">
          <p className="font-medium text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {valuePrefix}
              {entry.name === 'Spend' || entry.name === 'Revenue'
                ? new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: currency,
                  }).format(entry.value)
                : entry.name === 'ROAS'
                ? `${entry.value.toFixed(2)}x`
                : entry.name === 'CTR' || entry.name === 'Conv. Rate'
                ? `${entry.value.toFixed(2)}%`
                : entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (campaigns.length === 0) {
    return null
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Chart 1: Spend vs ROAS */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
              Top Campaigns by Spend
            </CardTitle>
            <CardDescription>
              Comparing spend against Return on Ad Spend (ROAS)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={topCampaignsBySpend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    yAxisId="left" 
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(value) => `${value}`}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right"
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(value) => `${value}x`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar 
                    yAxisId="left" 
                    dataKey="spend" 
                    name="Spend" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]} 
                    barSize={30}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="roas"
                    name="ROAS"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ fill: '#f59e0b' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Chart 2: Engagement Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              Engagement Efficiency
            </CardTitle>
            <CardDescription>
              CTR vs Conversion Rate for top spenders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topCampaignsBySpend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar 
                    dataKey="ctr" 
                    name="CTR" 
                    fill="hsl(var(--primary))" 
                    fillOpacity={0.6}
                    radius={[4, 4, 0, 0]} 
                  />
                  {/* Calculate Conv Rate dynamically if not present, mostly it's not in struct */}
                  <Bar 
                    dataKey={(data) => (data.clicks > 0 ? (data.conversions / data.clicks) * 100 : 0)} 
                    name="Conv. Rate" 
                    fill="#10b981" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

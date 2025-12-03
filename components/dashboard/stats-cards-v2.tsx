'use client'

import { FileText, Link as LinkIcon, TrendingUp } from 'lucide-react'
import { StatCardV2 } from './stat-card-v2'
import { useTranslations } from 'next-intl'

interface StatsCardsV2Props {
  totalReports: number
  totalAccounts: number
  reportsThisMonth: number
  reportsLastMonth: number
}

/**
 * Calculate percentage change between current and previous values
 * Returns null if there's no previous data to compare
 */
function calculateChange(current: number, previous: number): number | null {
  if (previous === 0) {
    return current > 0 ? 100 : null
  }
  return ((current - previous) / previous) * 100
}

// Mock sparkline data - later can be replaced with real historical data
const generateSparklineData = (baseValue: number, trend: 'up' | 'down' | 'stable') => {
  const data = []
  const points = 7 // 7 days of data

  for (let i = 0; i < points; i++) {
    let value = baseValue

    if (trend === 'up') {
      value = baseValue * (0.7 + (i / points) * 0.3) // Gradual increase
    } else if (trend === 'down') {
      value = baseValue * (1.0 - (i / points) * 0.2) // Gradual decrease
    } else {
      // Stable with minor variations
      value = baseValue * (0.9 + Math.random() * 0.2)
    }

    data.push({ value: Math.round(value) })
  }

  return data
}

export function StatsCardsV2({
  totalReports,
  totalAccounts,
  reportsThisMonth,
  reportsLastMonth,
}: StatsCardsV2Props) {
  const t = useTranslations('dashboard.stats')

  const stats = [
    {
      title: t('totalReports'),
      value: totalReports,
      description: t('generatedReports'),
      icon: FileText,
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)', // Blue gradient
      change: null, // Total reports don't have month-over-month comparison
      sparklineData: [], // Hide sparkline until real historical data is available
    },
    {
      title: t('adAccounts'),
      value: totalAccounts,
      description: t('connectedAccounts'),
      icon: LinkIcon,
      gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)', // Green gradient
      change: null, // Accounts are persistent, no monthly change
      sparklineData: [], // Hide sparkline until real historical data is available
    },
    {
      title: t('thisMonth'),
      value: reportsThisMonth,
      description: t('reportsThisMonth'),
      icon: TrendingUp,
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)', // Purple gradient
      change: calculateChange(reportsThisMonth, reportsLastMonth),
      sparklineData: [], // Hide sparkline until real historical data is available
    },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {stats.map((stat) => (
        <StatCardV2
          key={stat.title}
          title={stat.title}
          value={stat.value}
          description={stat.description}
          icon={stat.icon}
          gradient={stat.gradient}
          change={stat.change}
          sparklineData={stat.sparklineData}
        />
      ))}
    </div>
  )
}

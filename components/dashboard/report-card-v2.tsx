'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Eye, Sparkles, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ReportWithAccount } from '@/lib/types'

interface ReportCardV2Props {
  report: ReportWithAccount
  locale: string
}

// Platform color mapping
const PLATFORM_COLORS = {
  facebook: {
    bg: 'bg-[#1877F2]',
    text: 'text-white',
    badge: 'bg-[#1877F2]/10 text-[#1877F2] border-[#1877F2]/20',
  },
  meta: {
    bg: 'bg-[#1877F2]',
    text: 'text-white',
    badge: 'bg-[#1877F2]/10 text-[#1877F2] border-[#1877F2]/20',
  },
  google: {
    bg: 'bg-[#4285F4]',
    text: 'text-white',
    badge: 'bg-[#4285F4]/10 text-[#4285F4] border-[#4285F4]/20',
  },
  default: {
    bg: 'bg-primary',
    text: 'text-primary-foreground',
    badge: 'bg-primary/10 text-primary border-primary/20',
  },
}

export function ReportCardV2({ report, locale }: ReportCardV2Props) {
  const platform = report.ad_account?.platform?.toLowerCase() || 'default'
  const colors = PLATFORM_COLORS[platform as keyof typeof PLATFORM_COLORS] || PLATFORM_COLORS.default

  // AI insights availability
  const hasAI = true // Assume all reports have AI insights
  // Use real view count from database, default to 0 if not available
  const viewsCount = (report as any).view_count ?? 0

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl',
        'glass border border-glass-border',
        'transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10',
        'cursor-pointer'
      )}
    >
      <Link href={`/${locale}/reports/${report.id}`}>
        {/* Thumbnail/Preview Section */}
        <div className={cn('relative h-40 overflow-hidden', colors.bg)}>
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />

          {/* Report Info Overlay */}
          <div className="absolute inset-0 flex flex-col justify-between p-4">
            {/* Top Row: Platform Badge */}
            <div className="flex items-start justify-between">
              {report.ad_account && (
                <Badge
                  variant="secondary"
                  className={cn(
                    'backdrop-blur-sm border',
                    colors.badge
                  )}
                >
                  {report.ad_account.platform}
                </Badge>
              )}
              {hasAI && (
                <Badge
                  variant="secondary"
                  className="backdrop-blur-sm bg-purple-500/20 text-purple-100 border-purple-400/30"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI
                </Badge>
              )}
            </div>

            {/* Bottom Row: Template Type */}
            <div className={cn('font-bold text-lg', colors.text)}>
              {report.template_type?.toUpperCase() || 'REPORT'}
            </div>
          </div>

          {/* Hover Effect */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <ExternalLink className="h-8 w-8 text-white drop-shadow-lg" />
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 space-y-3">
          {/* Report Name */}
          <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {report.name || 'Untitled Report'}
          </h3>

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(report.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{viewsCount} views</span>
            </div>
          </div>

          {/* Date Range */}
          <div className="text-xs text-muted-foreground">
            {report.date_from} → {report.date_to}
          </div>

          {/* Account Name */}
          {report.ad_account && (
            <div className="text-xs font-medium text-foreground/80 truncate">
              {report.ad_account.account_name}
            </div>
          )}
        </div>
      </Link>
    </div>
  )
}

import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StatsCardsV2 } from '@/components/dashboard/stats-cards-v2'
import { ReportsListV2 } from '@/components/dashboard/reports-list-v2'
import { EmptyState } from '@/components/dashboard/empty-state'
import { SubscriptionBanner } from '@/components/dashboard/subscription-banner'
import { AIInsights } from '@/components/dashboard/ai-insights'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getDashboardStats, getReports } from '@/lib/db/queries'
import { isAdmin } from '@/lib/utils/auth'
import Link from 'next/link'
import { ArrowRight, Plus } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export const metadata = {
  title: 'Dashboard | Raply',
  description: 'Your advertising reports dashboard',
}

// Loading skeleton for stats
function StatsCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
            <div className="h-3 w-32 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Loading skeleton for reports list
function ReportsListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-muted animate-pulse rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                <div className="h-3 w-64 bg-muted animate-pulse rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

async function DashboardStats({ userId, locale }: { userId: string; locale: string }) {
  const { data: stats } = await getDashboardStats(userId)

  if (!stats) {
    return null
  }

  return <StatsCardsV2 {...stats} />
}

async function RecentReports({ userId, locale }: { userId: string; locale: string }) {
  const t = await getTranslations('dashboard.home')
  const { data: reports } = await getReports(userId)

  if (!reports || reports.length === 0) {
    return (
      <EmptyState
        locale={locale}
        title={t('emptyStateHeading')}
        description={t('emptyStateDescription')}
        actionLabel={t('connectAccountButton')}
        actionHref="/integrations"
      />
    )
  }

  return (
    <>
      <ReportsListV2 reports={reports} locale={locale} limit={6} />
      {reports.length > 6 && (
        <div className="mt-6 text-center">
          <Link href={`/${locale}/reports`}>
            <Button variant="outline">
              {t('viewAllReportsButton')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}
    </>
  )
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()
  const t = await getTranslations('dashboard.home')
  const tSub = await getTranslations('dashboard.subscription')

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${locale}/signin`)
  }

  const admin = await isAdmin()

  // Check if user is on free plan and show banner
  // For now, we assume all non-admin users are on free plan
  // TODO: Replace with actual subscription check when Stripe is integrated
  const showFreePlanBanner = !admin

  // Fetch stats to determine if we should show AI Insights
  const { data: stats } = await getDashboardStats(user.id)
  const hasAdAccounts = (stats?.totalAccounts ?? 0) > 0
  const hasReports = (stats?.totalReports ?? 0) > 0

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">
          {t('welcome')} {user.email?.split('@')[0]}!
        </h1>
      </div>

      {/* Subscription Banner (Free Plan) */}
      {showFreePlanBanner && (
        <SubscriptionBanner
          locale={locale}
          message={tSub('freePlanBanner')}
          actionLabel={tSub('upgradeBannerButton')}
          actionHref="/pricing"
        />
      )}

      {/* Empty State: No Accounts */}
      {!hasAdAccounts && (
        <EmptyState
          locale={locale}
          title={t('emptyStateNoAccountsTitle')}
          description={t('emptyStateNoAccountsDescription')}
          actionLabel={t('emptyStateNoAccountsAction')}
          actionHref="/integrations"
        />
      )}

      {/* Empty State: No Reports (but has accounts) */}
      {hasAdAccounts && !hasReports && (
        <EmptyState
          locale={locale}
          title={t('emptyStateNoReportsTitle')}
          description={t('emptyStateNoReportsDescription')}
          actionLabel={t('emptyStateNoReportsAction')}
          actionHref="/reports/new"
        />
      )}

      {/* Stats Cards - Only show if user has accounts */}
      {hasAdAccounts && (
        <Suspense fallback={<StatsCardsSkeleton />}>
          <DashboardStats userId={user.id} locale={locale} />
        </Suspense>
      )}

      {/* AI Insights Section - Only show if user has accounts */}
      {!admin && hasAdAccounts && <AIInsights hasAdAccounts={hasAdAccounts} hasReports={hasReports} />}

      {/* Recent Reports - Only show if user has reports */}
      {hasReports && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">{t('recentReportsHeading')}</h2>
            <Link href={`/${locale}/reports/new`}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t('createReportButton')}
              </Button>
            </Link>
          </div>
          <Suspense fallback={<ReportsListSkeleton />}>
            <RecentReports userId={user.id} locale={locale} />
          </Suspense>
        </div>
      )}
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ReportWizard } from '@/components/reports/report-wizard'
import type { AdAccount } from '@/lib/validators/report'

export const metadata = {
  title: 'Create Report | Raply',
  description: 'Create a new advertising report',
}

export default async function NewReportPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${locale}/signin`)
  }

  // Fetch user's connected ad accounts
  const { data: accounts, error } = await supabase
    .from('ad_accounts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching ad accounts:', error)
  }

  const adAccounts: AdAccount[] = accounts || []

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
        <h1 className="text-4xl font-bold text-foreground">Create New Report</h1>
        <p className="mt-2 text-muted-foreground">
          Generate a professional advertising report in 4 easy steps
        </p>
      </div>

      {/* Report Wizard */}
      <ReportWizard locale={locale} accounts={adAccounts} />
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardNav } from '@/components/dashboard/dashboard-nav'
import { TopBar } from '@/components/dashboard/top-bar'
import { CommandPalette } from '@/components/dashboard/command-palette'
import { FloatingActionButton } from '@/components/dashboard/floating-action-button'
import { isAdmin } from '@/lib/utils/auth'

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
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

  const admin = await isAdmin()

  return (
    <div className="flex min-h-screen font-sans antialiased">
      {/* Sidebar Navigation */}
      <DashboardNav userEmail={user.email || ''} isAdmin={admin} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar with Dark Mode Toggle */}
        <TopBar />

        {/* Page Content */}
        <main className="flex-1 bg-muted/10">
          <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {/* Command Palette (Cmd+K) */}
      <CommandPalette isAdmin={admin} />

      {/* Floating Action Button */}
      <FloatingActionButton href={`/${locale}/reports/new`} label="Create Report" />
    </div>
  )
}

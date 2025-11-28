import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { signOut } from '@/lib/auth/actions'

export const metadata = {
  title: 'Dashboard | Raply',
  description: 'Your advertising reports dashboard',
}

function SignOutButton() {
  async function handleSignOut() {
    'use server'
    await signOut()
    redirect('/signin')
  }

  return (
    <form action={handleSignOut}>
      <Button variant="outline">Sign Out</Button>
    </form>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/signin')
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user.email}
          </p>
        </div>
        <SignOutButton />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-2">Reports</h3>
          <p className="text-2xl font-bold">0</p>
          <p className="text-sm text-muted-foreground mt-1">
            Total reports generated
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-2">Ad Accounts</h3>
          <p className="text-2xl font-bold">0</p>
          <p className="text-sm text-muted-foreground mt-1">
            Connected accounts
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-2">Getting Started</h3>
          <p className="text-sm text-muted-foreground">
            Connect your first ad account to start generating reports
          </p>
          <Button className="mt-4" size="sm">
            Connect Account
          </Button>
        </div>
      </div>

      <div className="mt-8 rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Reports</h2>
        <p className="text-muted-foreground">
          No reports yet. Create your first report to see it here.
        </p>
      </div>
    </div>
  )
}

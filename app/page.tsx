import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createClient()

  // Check if user is logged in with error handling
  let user = null
  try {
    const {
      data: { user: fetchedUser },
    } = await supabase.auth.getUser()
    user = fetchedUser
  } catch (error) {
    // Log error but continue to show landing page
    console.error('Failed to fetch user:', error)
  }

  // If user is logged in, redirect to dashboard
  if (user) {
    redirect('/dashboard')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center max-w-2xl">
        <h1 className="text-6xl font-bold mb-4">Raply</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Automated Advertising Reports with AI Insights
        </p>
        <p className="text-muted-foreground mb-8">
          Generate professional advertising reports from Meta Ads and Google Ads
          with AI-powered insights and recommendations.
        </p>

        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/signup">Get Started</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/signin">Sign In</Link>
          </Button>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div>
            <h3 className="font-semibold mb-2">🤖 AI-Powered Insights</h3>
            <p className="text-sm text-muted-foreground">
              Get intelligent campaign descriptions and optimization recommendations
              powered by Claude AI
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">📊 Multi-Platform Support</h3>
            <p className="text-sm text-muted-foreground">
              Connect your Meta Ads and Google Ads accounts to generate unified
              reports
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">📧 Export & Share</h3>
            <p className="text-sm text-muted-foreground">
              Download reports as PDF or send them directly to clients via email
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

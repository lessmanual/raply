'use client'

import { Sparkles } from 'lucide-react'

interface AIInsightsProps {
  hasAdAccounts: boolean
  hasReports: boolean
}

export function AIInsights({ hasAdAccounts, hasReports }: AIInsightsProps) {
  // Show empty state if user has no ad accounts or reports
  if (!hasAdAccounts || !hasReports) {
    return (
      <div className="glass rounded-2xl p-8 border">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-500/10">
            <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-xl font-semibold">AI Insights</h2>
        </div>
        <p className="text-muted-foreground">
          {!hasAdAccounts
            ? 'Połącz konta reklamowe i wygeneruj pierwszy raport, aby zobaczyć spersonalizowane rekomendacje AI.'
            : 'Wygeneruj pierwszy raport, aby zobaczyć spersonalizowane rekomendacje AI na podstawie Twoich kampanii.'}
        </p>
      </div>
    )
  }

  // TODO: Fetch real insights from API
  // For now, show analyzing message
  return (
    <div className="glass rounded-2xl p-8 border">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-500/10">
          <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
        </div>
        <h2 className="text-xl font-semibold">AI Insights</h2>
      </div>
      <p className="text-muted-foreground">
        Analizujemy Twoje kampanie, aby dostarczyć spersonalizowane rekomendacje...
      </p>
      <p className="text-sm text-muted-foreground mt-2">
        Rekomendacje AI będą dostępne wkrótce. Na razie możesz przeglądać swoje raporty i metryki.
      </p>
    </div>
  )

}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lightbulb, Sparkles } from 'lucide-react'

interface ReportAIInsightsProps {
  description: string | null
  recommendations: string | null
}

export function ReportAIInsights({
  description,
  recommendations,
}: ReportAIInsightsProps) {
  // Show placeholder if no AI insights available
  if (!description && !recommendations) {
    return (
      <Card className="border-muted">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Insights
          </CardTitle>
          <CardDescription>
            AI-powered analysis of your campaign performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              No AI insights available for this report
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* AI Description */}
      {description && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Performance Summary
            </CardTitle>
            <CardDescription>
              AI-generated overview of your campaign results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {description}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Recommendations */}
      {recommendations && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              Recommendations
            </CardTitle>
            <CardDescription>
              AI-suggested actions to improve performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {recommendations}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

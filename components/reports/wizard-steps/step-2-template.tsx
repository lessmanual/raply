'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, TrendingUp, FileText, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ReportTemplate } from '@/lib/validators/report'

interface Step2TemplateProps {
  selectedTemplate?: ReportTemplate
  onSelectTemplate: (template: ReportTemplate) => void
}

/**
 * Step 2: Template Selection
 * Displays report templates (Leads, Sales, Reach) with descriptions and metrics
 */
export function Step2Template({
  selectedTemplate,
  onSelectTemplate,
}: Step2TemplateProps) {
  const templates = [
    {
      id: 'leads' as ReportTemplate,
      name: 'Lead Generation',
      description: 'Track lead generation campaigns, analyze CPL and conversion rates',
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      metrics: ['Total Leads', 'Cost Per Lead', 'Conversion Rate', 'Form Submissions'],
    },
    {
      id: 'sales' as ReportTemplate,
      name: 'Sales & Revenue',
      description: 'Monitor sales performance, ROAS, and revenue metrics',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
      metrics: ['Revenue', 'ROAS', 'Average Order Value', 'Purchase Conversions'],
    },
    {
      id: 'reach' as ReportTemplate,
      name: 'Reach & Awareness',
      description: 'Measure brand awareness, impressions, and audience reach',
      icon: FileText,
      color: 'from-purple-500 to-pink-500',
      metrics: ['Impressions', 'Reach', 'CPM', 'Frequency'],
    },
  ]

  // Keyboard accessibility handler (WCAG compliance)
  const handleKeyDown = (e: React.KeyboardEvent, templateId: ReportTemplate) => {
    // Activate on Enter or Space key
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelectTemplate(templateId)
    }
  }

  return (
    <div className="space-y-4">
      {/* Template Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {templates.map((template) => {
          const isSelected = template.id === selectedTemplate
          const Icon = template.icon

          return (
            <Card
              key={template.id}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              aria-label={`Select ${template.name} template`}
              className={cn(
                'relative cursor-pointer transition-all duration-300 hover:scale-[1.02]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                isSelected
                  ? 'glass-intense border-primary shadow-lg ring-2 ring-primary'
                  : 'glass border-border hover:border-primary/50'
              )}
              onClick={() => onSelectTemplate(template.id)}
              onKeyDown={(e) => handleKeyDown(e, template.id)}
            >
              {/* Selected Indicator */}
              {isSelected && (
                <div className="absolute top-4 right-4 z-10">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
              )}

              <CardHeader>
                {/* Icon with Gradient */}
                <div className="mb-3">
                  <div
                    className={cn(
                      'inline-flex items-center justify-center w-14 h-14 rounded-lg bg-gradient-to-br',
                      template.color
                    )}
                  >
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                </div>

                <CardTitle className="text-xl">{template.name}</CardTitle>
                <CardDescription className="min-h-[3rem]">
                  {template.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Key Metrics:
                    </p>
                    <ul className="space-y-1.5">
                      {template.metrics.map((metric, index) => (
                        <li
                          key={index}
                          className="text-sm text-muted-foreground flex items-center"
                        >
                          <span className="mr-2 text-primary">•</span>
                          {metric}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Help Text */}
      <div className="p-4 bg-muted/50 rounded-lg border border-border">
        <p className="text-sm text-muted-foreground">
          <strong>Tip:</strong> Choose the template that best matches your
          campaign goals. Each template includes specific metrics and insights
          tailored to that objective.
        </p>
      </div>
    </div>
  )
}

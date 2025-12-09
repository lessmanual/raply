'use client'

import { useTranslations } from 'next-intl'
import { Zap, Brain, BarChart, Clock, FileText, Mail } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function Features() {
  const t = useTranslations('features')

  const features = [
    {
      icon: Zap,
      title: t('feature1Title'),
      description: t('feature1Description'),
    },
    {
      icon: Brain,
      title: t('feature2Title'),
      description: t('feature2Description'),
    },
    {
      icon: BarChart,
      title: t('feature3Title'),
      description: t('feature3Description'),
    },
    {
      icon: Clock,
      title: t('feature4Title'),
      description: t('feature4Description'),
    },
    {
      icon: FileText,
      title: t('feature5Title'),
      description: t('feature5Description'),
    },
    {
      icon: Mail,
      title: t('feature6Title'),
      description: t('feature6Description'),
    },
  ]

  return (
    <section id="features" className="bg-muted/20 py-24 sm:py-32 border-t border-border/40">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <h2 className="mb-6 font-serif-display text-4xl text-foreground sm:text-5xl">
            {t('heading')}{' '}
            <span className="text-primary italic">{t('headingHighlight')}</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {t('subheading')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="group relative overflow-hidden border border-border bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5 transition-colors group-hover:bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-foreground">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check } from 'lucide-react'

export function Pricing() {
  const params = useParams()
  const locale = params.locale as string
  const t = useTranslations('pricing')

  const plans = [
    {
      name: t('plan1Name'),
      price: 0,
      period: null,
      description: t('plan1Description'),
      features: [
        t('plan1Feature1'),
        t('plan1Feature2'),
        t('plan1Feature3'),
        t('plan1Feature4'),
        t('plan1Feature5'),
        t('plan1Feature6'),
      ],
      cta: t('plan1Cta'),
      ctaVariant: 'outline' as const,
      highlighted: false,
    },
    {
      name: t('plan2Name'),
      price: 47,
      period: t('period'),
      description: t('plan2Description'),
      features: [
        t('plan2Feature1'),
        t('plan2Feature2'),
        t('plan2Feature3'),
        t('plan2Feature4'),
        t('plan2Feature5'),
        t('plan2Feature6'),
      ],
      cta: t('plan2Cta'),
      ctaVariant: 'outline' as const,
      highlighted: false,
    },
    {
      name: t('plan3Name'),
      price: 87,
      period: t('period'),
      description: t('plan3Description'),
      features: [
        t('plan3Feature1'),
        t('plan3Feature2'),
        t('plan3Feature3'),
        t('plan3Feature4'),
        t('plan3Feature5'),
        t('plan3Feature6'),
        t('plan3Feature7'),
      ],
      cta: t('plan3Cta'),
      ctaVariant: 'default' as const, // Changed to default (filled) for highlighted
      highlighted: true,
    },
    {
      name: t('plan4Name'),
      price: 177,
      period: t('period'),
      description: t('plan4Description'),
      features: [
        t('plan4Feature1'),
        t('plan4Feature2'),
        t('plan4Feature3'),
        t('plan4Feature4'),
        t('plan4Feature5'),
        t('plan4Feature6'),
        t('plan4Feature7'),
        t('plan4Feature8'),
      ],
      cta: t('plan4Cta'),
      ctaVariant: 'outline' as const,
      highlighted: false,
    },
  ]

  return (
    <section id="pricing" className="bg-background py-24 sm:py-32 border-t border-border/40">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <h2 className="mb-6 font-serif-display text-4xl text-foreground sm:text-5xl">
            {t('heading')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('subheading')}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 items-start">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative transition-all duration-300 ${
                plan.highlighted
                  ? 'border-primary bg-card shadow-xl shadow-primary/10 scale-105 z-10'
                  : 'border-border bg-muted/20 hover:border-primary/30 hover:bg-card'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                        Most Popular
                    </span>
                </div>
              )}

              <CardHeader className="pb-8 pt-8">
                <CardTitle className="text-center">
                  <div className="mb-4 text-sm font-bold uppercase tracking-widest text-primary">
                    {plan.name}
                  </div>
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-mono-numbers font-bold text-foreground tracking-tight">
                      {plan.price === 0 ? 'Free' : plan.price}
                    </span>
                    {plan.period && (
                      <span className="ml-1 text-lg text-muted-foreground font-normal">
                        {t('currency')}{plan.period}
                      </span>
                    )}
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed px-2">
                    {plan.description}
                  </p>
                </CardTitle>
              </CardHeader>

              <CardContent>
                <Button
                  asChild
                  variant={plan.ctaVariant === 'default' ? 'default' : 'outline'}
                  className={`mb-8 w-full h-11 ${plan.highlighted ? 'bg-primary hover:bg-primary/90' : ''}`}
                >
                  <Link href={`/${locale}/signup`}>{plan.cta}</Link>
                </Button>

                <ul className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <div className="mr-3 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 shrink-0">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enterprise CTA */}
        <div className="mt-16 text-center p-8 bg-muted/30 rounded-2xl border border-border">
          <p className="text-muted-foreground">
            {t('enterpriseText')}{' '}
            <Link
              href="mailto:contact@raply.app"
              className="font-serif-display text-xl text-foreground hover:text-primary transition-colors ml-2 border-b border-primary/30 hover:border-primary"
            >
              {t('enterpriseLink')}
            </Link>{' '}
            {t('enterpriseTextEnd')}
          </p>
        </div>
      </div>
    </section>
  )
}

'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import { Quote } from 'lucide-react'

export function Testimonials() {
  const t = useTranslations('testimonials')

  const testimonials = [
    {
      quote: t('testimonial1Quote'),
      author: t('testimonial1Author'),
      role: t('testimonial1Role'),
      company: t('testimonial1Company'),
      rating: 5,
    },
    {
      quote: t('testimonial2Quote'),
      author: t('testimonial2Author'),
      role: t('testimonial2Role'),
      company: t('testimonial2Company'),
      rating: 5,
    },
    {
      quote: t('testimonial3Quote'),
      author: t('testimonial3Author'),
      role: t('testimonial3Role'),
      company: t('testimonial3Company'),
      rating: 5,
    },
  ]

  return (
    <section className="bg-background py-24 sm:py-32 border-t border-border/40">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <h2 className="mb-6 font-serif-display text-4xl text-foreground sm:text-5xl">
            {t('heading')}
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {t('subheading')}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-border bg-muted/10 hover:bg-muted/20 transition-colors">
              <CardContent className="pt-8 pb-8 px-6 flex flex-col h-full">
                {/* Quote Icon */}
                <Quote className="h-8 w-8 text-primary/20 mb-6" />

                {/* Quote */}
                <blockquote className="mb-8 flex-grow">
                  <p className="font-serif-display text-xl text-foreground leading-relaxed">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                </blockquote>

                {/* Author */}
                <div className="mt-auto border-t border-border/50 pt-4">
                  <div className="font-bold text-foreground">
                    {testimonial.author}
                  </div>
                  <div className="flex flex-wrap gap-1 text-sm text-muted-foreground mt-1">
                    <span>{testimonial.role}</span>
                    <span>@</span>
                    <span className="text-primary font-medium">{testimonial.company}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

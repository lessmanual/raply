'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, TrendingUp, BarChart2, PieChart } from 'lucide-react'

export function Hero() {
  const params = useParams()
  const locale = params.locale as string
  const t = useTranslations('hero')

  return (
    <section className="relative overflow-hidden bg-background pt-20 pb-24 sm:pt-32 sm:pb-40">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px]" />
      </div>

      <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-12 items-center">
          {/* Left Column - Content */}
          <div className="flex flex-col justify-center max-w-2xl lg:max-w-none mx-auto lg:mx-0 text-center lg:text-left">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center justify-center lg:justify-start">
              <span className="inline-flex items-center space-x-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{t('badge')}</span>
              </span>
            </div>

            {/* Headline */}
            <h1 className="mb-6 font-serif-display text-5xl leading-[1.1] text-foreground sm:text-6xl lg:text-7xl">
              {t('headline')}{' '}
              <span className="relative inline-block text-primary">
                {t('headlineHighlight')}
                <span className="absolute bottom-2 left-0 w-full h-[0.15em] bg-primary/20 -z-10 rotate-1"></span>
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mb-10 text-lg text-muted-foreground sm:text-xl leading-relaxed max-w-lg mx-auto lg:mx-0">
              {t('subheadline')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
              <Button asChild size="lg" className="h-12 px-8 text-base bg-primary text-primary-foreground hover:bg-primary/90 rounded-full shadow-lg shadow-primary/20 w-full sm:w-auto">
                <Link href={`/${locale}/signup`}>
                  {t('ctaPrimary')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base border-primary/20 text-foreground hover:bg-primary/5 hover:text-primary hover:border-primary/50 rounded-full w-full sm:w-auto transition-all duration-300">
                <Link href="#how-it-works">{t('ctaSecondary')}</Link>
              </Button>
            </div>

            {/* Social Proof - Editorial Style */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-8 text-sm text-muted-foreground border-t border-border/40 pt-8 w-full">
              <div className="flex items-center space-x-2">
                 <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium text-muted-foreground">
                            {i === 1 ? 'A' : i === 2 ? 'M' : 'J'}
                        </div>
                    ))}
                 </div>
                 <span className="text-foreground font-medium">{t('socialProof1Label')}</span>
              </div>
              <div className="hidden sm:block h-4 w-px bg-border" />
              <div className="flex items-center">
                <TrendingUp className="mr-2 h-4 w-4 text-accent" />
                <span className="font-medium text-foreground mr-1">{t('socialProof2Label')}</span>
                <span>{t('socialProof2Text')}</span>
              </div>
            </div>
          </div>

          {/* Right Column - Abstract Data Visual (Glassmorphism) */}
          <div className="relative lg:h-[600px] flex items-center justify-center perspective-1000">
             {/* Main Card */}
             <div className="relative w-full max-w-md aspect-[4/5] lg:aspect-square bg-card border border-border/50 rounded-2xl shadow-2xl p-6 flex flex-col overflow-hidden z-10 rotate-y-[-5deg] rotate-x-[5deg] hover:rotate-0 transition-transform duration-500 ease-out">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="space-y-1">
                        <div className="h-2 w-24 bg-muted-foreground/20 rounded-full"></div>
                        <div className="h-2 w-16 bg-muted-foreground/10 rounded-full"></div>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                </div>

                {/* Chart Area */}
                <div className="flex-1 flex items-end space-x-4 mb-8 px-2">
                    {[35, 55, 45, 70, 60, 85, 95].map((h, i) => (
                        <div key={i} className="flex-1 group relative">
                            <div 
                                className="w-full bg-primary/10 rounded-t-md transition-all duration-500 group-hover:bg-primary/20"
                                style={{ height: `${h}%` }}
                            ></div>
                            {i === 6 && (
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm">
                                    +24% ROAS
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Insights Panel */}
                <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50 flex items-start space-x-3">
                        <div className="w-2 h-2 mt-1.5 rounded-full bg-accent shrink-0" />
                        <div className="space-y-1">
                            <div className="h-2 w-full bg-foreground/10 rounded-full"></div>
                            <div className="h-2 w-3/4 bg-foreground/5 rounded-full"></div>
                        </div>
                    </div>
                     <div className="p-3 rounded-lg bg-muted/30 border border-border/50 flex items-start space-x-3 opacity-60">
                        <div className="w-2 h-2 mt-1.5 rounded-full bg-primary shrink-0" />
                        <div className="space-y-1">
                            <div className="h-2 w-5/6 bg-foreground/10 rounded-full"></div>
                            <div className="h-2 w-1/2 bg-foreground/5 rounded-full"></div>
                        </div>
                    </div>
                </div>
             </div>

             {/* Floating Elements */}
             <div className="absolute -top-10 -right-10 p-4 bg-card/80 backdrop-blur-md border border-border/50 rounded-xl shadow-xl animate-bounce-slow z-20 hidden sm:block hover:scale-105 transition-transform cursor-default">
                 <div className="flex items-center space-x-3">
                     <div className="p-2 bg-accent/10 rounded-lg">
                         <PieChart className="h-5 w-5 text-accent" />
                     </div>
                     <div>
                         <div className="text-xs text-muted-foreground">Efficiency</div>
                         <div className="text-sm font-bold font-mono-numbers text-foreground dark:text-white">+12.5%</div>
                     </div>
                 </div>
             </div>
             
             <div className="absolute -bottom-5 -left-5 p-4 bg-card/80 backdrop-blur-md border border-border/50 rounded-xl shadow-xl animate-bounce-slow delay-75 z-20 hidden sm:block hover:scale-105 transition-transform cursor-default">
                 <div className="flex items-center space-x-3">
                     <div className="p-2 bg-primary/10 rounded-lg">
                         <BarChart2 className="h-5 w-5 text-primary" />
                     </div>
                     <div>
                         <div className="text-xs text-muted-foreground">Revenue</div>
                         <div className="text-sm font-bold font-mono-numbers text-foreground dark:text-white">$4,250.00</div>
                     </div>
                 </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  )
}

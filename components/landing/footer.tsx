'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Mail, Linkedin, Twitter } from 'lucide-react'

export function Footer() {
  const t = useTranslations('footer')

  const footerLinks = {
    product: [
      { name: t('productFeatures'), href: '#features' },
      { name: t('productHowItWorks'), href: '#how-it-works' },
      { name: t('productPricing'), href: '#pricing' },
      { name: t('productChangelog'), href: '#' },
    ],
    company: [
      { name: t('companyAbout'), href: '#' },
      { name: t('companyBlog'), href: '#' },
      { name: t('companyCareers'), href: '#' },
      { name: t('companyContact'), href: 'mailto:contact@raply.app' },
    ],
    legal: [
      { name: t('legalPrivacy'), href: '#' },
      { name: t('legalTerms'), href: '#' },
      { name: t('legalCookies'), href: '#' },
      { name: t('legalGdpr'), href: '#' },
    ],
  }

  const socialLinks = [
    { name: 'Email', href: 'mailto:contact@raply.app', icon: Mail },
    { name: 'LinkedIn', href: '#', icon: Linkedin },
    { name: 'Twitter', href: '#', icon: Twitter },
  ]

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="lg:col-span-1 space-y-6">
            <Link href="/" className="inline-block group">
               <div className="flex items-center gap-2">
                   <img
                        src="/images/raply-logo.svg"
                        alt="Raply"
                        className="h-6 w-auto grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
                   />
                   <span className="text-2xl font-serif-display font-medium text-foreground">Raply</span>
               </div>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              {t('description')}
            </p>
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <Link
                    key={social.name}
                    href={social.href}
                    className="text-muted-foreground transition-colors hover:text-primary p-2 hover:bg-primary/5 rounded-full"
                    aria-label={social.name}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Links Columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 lg:col-span-3">
            {/* Product */}
            <div>
              <h3 className="mb-6 text-sm font-bold uppercase tracking-widest text-foreground">
                {t('productHeading')}
              </h3>
              <ul className="space-y-4">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="mb-6 text-sm font-bold uppercase tracking-widest text-foreground">
                {t('companyHeading')}
              </h3>
              <ul className="space-y-4">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="mb-6 text-sm font-bold uppercase tracking-widest text-foreground">
                {t('legalHeading')}
              </h3>
              <ul className="space-y-4">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 border-t border-border/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            {t('copyright')}
          </p>
          <p className="text-xs text-muted-foreground/50">
             Designed with "Radical Clarity"
          </p>
        </div>
      </div>
    </footer>
  )
}

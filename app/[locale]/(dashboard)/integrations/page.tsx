import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Facebook, Chrome, Plus, CheckCircle2 } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { ConnectMetaButton } from '@/components/integrations/connect-meta-button'
import { ConnectGoogleButton } from '@/components/integrations/connect-google-button'
import { DisconnectButton } from '@/components/integrations/disconnect-button'
import { SetupGoogleCustomerId } from '@/components/integrations/setup-google-customer-id'

export const metadata = {
  title: 'Integrations | Raply',
  description: 'Connect your advertising accounts',
}

export default async function IntegrationsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()
  const t = await getTranslations('dashboard.integrations')

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${locale}/signin`)
  }

  // Fetch connected accounts
  const { data: accounts } = await supabase
    .from('ad_accounts')
    .select('*')
    .eq('user_id', user.id)

  const hasMetaAds = accounts?.some((acc) => acc.platform === 'meta')
  const hasGoogleAds = accounts?.some((acc) => acc.platform === 'google')

  const integrations = [
    {
      id: 'meta',
      name: 'Meta Ads',
      description: t('metaDescription'),
      icon: Facebook,
      iconColor: 'text-[#1877F2]',
      iconBg: 'bg-[#1877F2]/10',
      connected: hasMetaAds,
      comingSoon: false,
    },
    {
      id: 'google',
      name: 'Google Ads',
      description: t('googleDescription'),
      icon: Chrome,
      iconColor: 'text-[#4285F4]',
      iconBg: 'bg-[#4285F4]/10',
      connected: hasGoogleAds,
      comingSoon: false,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">{t('heading')}</h1>
        <p className="mt-2 text-muted-foreground">{t('subheading')}</p>
      </div>

      {/* Coming Soon Notice */}
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle>{t('comingSoonTitle')}</CardTitle>
          <CardDescription>{t('comingSoonDescription')}</CardDescription>
        </CardHeader>
      </Card>

      {/* Connected Accounts Summary */}
      {accounts && accounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('connectedAccountsTitle')}</CardTitle>
            <CardDescription>
              {t('connectedAccountsCount', { count: accounts.length })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      account.platform === 'meta'
                        ? 'bg-[#1877F2]/10'
                        : 'bg-[#4285F4]/10'
                    }`}>
                      {account.platform === 'meta' ? (
                        <Facebook className="h-5 w-5 text-[#1877F2]" />
                      ) : (
                        <Chrome className="h-5 w-5 text-[#4285F4]" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{account.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {account.platform} Ads
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {t('connectedBadge')}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Google Ads Setup Required */}
      {accounts?.some(acc => acc.platform === 'google' && acc.platform_account_id === 'setup_required') && (
        <SetupGoogleCustomerId
          accountId={accounts.find(acc => acc.platform === 'google' && acc.platform_account_id === 'setup_required')!.id}
        />
      )}

      {/* Available Integrations */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">{t('availableIntegrationsTitle')}</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {integrations.map((integration) => {
            const Icon = integration.icon
            return (
              <Card
                key={integration.id}
                className={`glass transition-all duration-300 ${
                  integration.connected
                    ? 'border-green-500/50 bg-green-500/5'
                    : 'hover:scale-[1.02]'
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${integration.iconBg}`}>
                        <Icon className={`h-6 w-6 ${integration.iconColor}`} />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{integration.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {integration.description}
                        </CardDescription>
                      </div>
                    </div>
                    {integration.connected && (
                      <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {t('connectedBadge')}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary" />
                      <span>{t('feature1')}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary" />
                      <span>{t('feature2')}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary" />
                      <span>{t('feature3')}</span>
                    </div>
                    {integration.connected ? (
                      <DisconnectButton
                        platform={integration.id as 'meta' | 'google'}
                        accountId={accounts!.find(acc => acc.platform === integration.id)!.id}
                        label={t('disconnectButton')}
                      />
                    ) : integration.id === 'meta' ? (
                      <ConnectMetaButton locale={locale} label={t('connectButton')} />
                    ) : integration.id === 'google' ? (
                      <ConnectGoogleButton locale={locale} label={t('connectButton')} />
                    ) : (
                      <Button className="w-full" disabled>
                        <Plus className="mr-2 h-4 w-4" />
                        {t('connectButton')}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t('needHelpTitle')}</CardTitle>
          <CardDescription>{t('needHelpDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline">
            {t('viewDocumentationButton')}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

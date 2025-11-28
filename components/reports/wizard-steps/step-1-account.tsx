'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Facebook, Chrome, CheckCircle2, AlertCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AdAccount } from '@/lib/validators/report'

interface Step1AccountProps {
  accounts: AdAccount[]
  selectedAccountId?: string
  onSelectAccount: (accountId: string) => void
}

/**
 * Step 1: Ad Account Selection
 * Displays user's connected ad accounts (Meta & Google) as cards
 */
export function Step1Account({
  accounts,
  selectedAccountId,
  onSelectAccount,
}: Step1AccountProps) {
  // Filter active accounts
  const activeAccounts = accounts.filter((acc) => acc.status === 'active')

  if (activeAccounts.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Active Accounts</h3>
        <p className="text-sm text-muted-foreground mb-6">
          You need to connect an advertising account before creating reports.
        </p>
        <Link
          href="/integrations"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          Connect Account
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Account Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {activeAccounts.map((account) => {
          const isSelected = account.id === selectedAccountId
          const PlatformIcon = account.platform === 'meta' ? Facebook : Chrome
          const platformColor =
            account.platform === 'meta' ? '#1877F2' : '#4285F4'

          return (
            <Card
              key={account.id}
              className={cn(
                'relative cursor-pointer transition-all duration-300 hover:scale-[1.02]',
                isSelected
                  ? 'glass-intense border-primary shadow-lg ring-2 ring-primary'
                  : 'glass border-border hover:border-primary/50'
              )}
              onClick={() => onSelectAccount(account.id)}
            >
              <CardContent className="p-6">
                {/* Selected Indicator */}
                {isSelected && (
                  <div className="absolute top-4 right-4">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                )}

                {/* Platform Icon */}
                <div
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4"
                  style={{ backgroundColor: `${platformColor}15` }}
                >
                  <PlatformIcon
                    className="w-6 h-6"
                    style={{ color: platformColor }}
                  />
                </div>

                {/* Account Info */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg line-clamp-1">
                    {account.account_name}
                  </h3>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Platform Badge */}
                    <Badge
                      variant="outline"
                      className="capitalize"
                      style={{
                        borderColor: platformColor,
                        color: platformColor,
                      }}
                    >
                      {account.platform === 'meta' ? 'Meta Ads' : 'Google Ads'}
                    </Badge>

                    {/* Currency */}
                    <Badge variant="secondary" className="text-xs">
                      {account.currency}
                    </Badge>

                    {/* Status */}
                    <Badge
                      variant={
                        account.status === 'active'
                          ? 'default'
                          : account.status === 'error'
                          ? 'destructive'
                          : 'secondary'
                      }
                      className="text-xs"
                    >
                      {account.status === 'active' && (
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                      )}
                      {account.status === 'error' && (
                        <XCircle className="h-3 w-3 mr-1" />
                      )}
                      {account.status}
                    </Badge>
                  </div>

                  {/* Account ID */}
                  <p className="text-xs text-muted-foreground truncate">
                    ID: {account.platform_account_id}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Help Text */}
      <div className="p-4 bg-muted/50 rounded-lg border border-border">
        <p className="text-sm text-muted-foreground">
          <strong>Tip:</strong> Select the advertising account you want to
          generate the report for. Only active accounts with valid credentials
          are shown.
        </p>
      </div>
    </div>
  )
}

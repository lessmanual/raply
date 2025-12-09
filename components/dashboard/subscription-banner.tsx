import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

interface SubscriptionBannerProps {
  locale: string
  message: string
  actionLabel: string
  actionHref: string
}

export function SubscriptionBanner({
  locale,
  message,
  actionLabel,
  actionHref,
}: SubscriptionBannerProps) {
  return (
    <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/40 dark:border-blue-800 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">{message}</p>
        </div>
        <Link href={`/${locale}${actionHref}`}>
          <Button variant="default" size="sm" className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500">
            {actionLabel}
          </Button>
        </Link>
      </div>
    </div>
  )
}

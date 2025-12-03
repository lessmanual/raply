'use client'

import { Button } from '@/components/ui/button'
import { XCircle } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface DisconnectButtonProps {
  platform: 'meta' | 'google'
  accountId: string
  label: string
}

export function DisconnectButton({ platform, accountId, label }: DisconnectButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleDisconnect() {
    try {
      if (!confirm(`Are you sure you want to disconnect your ${platform === 'meta' ? 'Meta' : 'Google'} Ads account?`)) {
        return
      }

      setIsLoading(true)

      const response = await fetch('/api/integrations/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ platform, accountId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to disconnect account')
      }

      // Refresh the page to update the UI
      router.refresh()
    } catch (error) {
      console.error('Disconnect error:', error)
      alert(error instanceof Error ? error.message : 'Failed to disconnect account. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={handleDisconnect}
      disabled={isLoading}
    >
      <XCircle className="mr-2 h-4 w-4" />
      {isLoading ? 'Disconnecting...' : label}
    </Button>
  )
}

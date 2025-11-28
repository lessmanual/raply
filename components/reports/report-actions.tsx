'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Mail, Share2, Loader2, Send } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ReportActionsProps {
  reportId: string
  reportName: string
  reportStatus: 'generating' | 'completed' | 'failed'
  shareToken?: string | null
}

export function ReportActions({
  reportId,
  reportName,
  reportStatus,
  shareToken,
}: ReportActionsProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [isCopying, setIsCopying] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [email, setEmail] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  /**
   * Download PDF report
   */
  async function handleDownloadPDF() {
    try {
      setIsDownloading(true)

      // Fetch PDF from API
      const response = await fetch(`/api/reports/${reportId}/pdf`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to download PDF')
      }

      // Get blob from response
      const blob = await response.blob()

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${reportName.toLowerCase().replace(/\s+/g, '-')}.pdf`
      document.body.appendChild(a)
      a.click()

      // Cleanup
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: 'PDF Downloaded',
        description: 'Your report has been downloaded successfully.',
      })
    } catch (error: any) {
      console.error('Download PDF error:', error)
      toast({
        title: 'Download Failed',
        description: error.message || 'Failed to download PDF report.',
        variant: 'destructive',
      })
    } finally {
      setIsDownloading(false)
    }
  }

  /**
   * Copy share link to clipboard
   */
  async function handleCopyShareLink() {
    if (!shareToken) {
      toast({
        title: 'Share Link Not Available',
        description: 'This report does not have a share link.',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsCopying(true)

      // Get base URL (works in both dev and production)
      const baseUrl = window.location.origin
      const shareUrl = `${baseUrl}/public/reports/${shareToken}`

      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl)

      toast({
        title: 'Link Copied!',
        description: 'Share link has been copied to your clipboard.',
      })
    } catch (error: any) {
      console.error('Copy link error:', error)
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy link to clipboard.',
        variant: 'destructive',
      })
    } finally {
      setIsCopying(false)
    }
  }

  /**
   * Send report via email
   */
  async function handleSendEmail(e: React.FormEvent) {
    e.preventDefault()

    if (!email) {
      toast({
        title: 'Email Required',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsSending(true)

      const response = await fetch(`/api/reports/${reportId}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send email')
      }

      toast({
        title: 'Email Sent!',
        description: `Report has been sent to ${email}`,
      })

      setIsDialogOpen(false)
      setEmail('')
    } catch (error: any) {
      console.error('Send email error:', error)
      toast({
        title: 'Send Failed',
        description: error.message || 'Failed to send email.',
        variant: 'destructive',
      })
    } finally {
      setIsSending(false)
    }
  }

  const canDownload = reportStatus === 'completed'
  const canShare = reportStatus === 'completed' && shareToken

  return (
    <div className="flex gap-2">
      {/* Download Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownloadPDF}
        disabled={!canDownload || isDownloading}
      >
        {isDownloading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Download className="mr-2 h-4 w-4" />
        )}
        {isDownloading ? 'Downloading...' : 'Download PDF'}
      </Button>

      {/* Email Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" disabled={!canDownload}>
            <Mail className="mr-2 h-4 w-4" />
            Send Email
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Send Report via Email</DialogTitle>
            <DialogDescription>
              Enter the recipient&apos;s email address. They will receive a link to view the report.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSendEmail}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSending}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSending}>
                {isSending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                {isSending ? 'Sending...' : 'Send Report'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Share Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyShareLink}
        disabled={!canShare || isCopying}
      >
        {isCopying ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Share2 className="mr-2 h-4 w-4" />
        )}
        {isCopying ? 'Copying...' : 'Copy Link'}
      </Button>
    </div>
  )
}
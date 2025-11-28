'use client'

import { useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react'

interface CampaignData {
  id: string
  campaign_id: string
  campaign_name: string
  platform: 'meta' | 'google'
  spend: number
  impressions: number
  clicks: number
  conversions: number
  ctr: number | null
  cpc: number | null
  cpm: number | null
  roas: number | null
  revenue: number | null
}

interface ReportCampaignsTableProps {
  campaigns: CampaignData[]
  currency?: string
}

type SortKey = 'campaign_name' | 'spend' | 'impressions' | 'clicks' | 'conversions' | 'ctr' | 'roas'
type SortDirection = 'asc' | 'desc'

const ITEMS_PER_PAGE = 20

/**
 * Format number with thousands separator
 */
function formatNumber(num: number | null): string {
  if (num === null) return '-'
  return new Intl.NumberFormat('en-US').format(Math.round(num))
}

/**
 * Format currency value
 */
function formatCurrency(amount: number | null, currency: string = 'USD'): string {
  if (amount === null) return '-'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format percentage
 */
function formatPercentage(value: number | null): string {
  if (value === null) return '-'
  return `${value.toFixed(2)}%`
}

export function ReportCampaignsTable({
  campaigns,
  currency = 'USD',
}: ReportCampaignsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('spend')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [currentPage, setCurrentPage] = useState(1)

  // Sort campaigns
  const sortedCampaigns = useMemo(() => {
    const sorted = [...campaigns].sort((a, b) => {
      let aValue: number | string = 0
      let bValue: number | string = 0

      switch (sortKey) {
        case 'campaign_name':
          aValue = a.campaign_name.toLowerCase()
          bValue = b.campaign_name.toLowerCase()
          break
        case 'spend':
          aValue = a.spend
          bValue = b.spend
          break
        case 'impressions':
          aValue = a.impressions
          bValue = b.impressions
          break
        case 'clicks':
          aValue = a.clicks
          bValue = b.clicks
          break
        case 'conversions':
          aValue = a.conversions
          bValue = b.conversions
          break
        case 'ctr':
          aValue = a.ctr ?? 0
          bValue = b.ctr ?? 0
          break
        case 'roas':
          aValue = a.roas ?? 0
          bValue = b.roas ?? 0
          break
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      return sortDirection === 'asc' 
        ? (aValue as number) - (bValue as number) 
        : (bValue as number) - (aValue as number)
    })

    return sorted
  }, [campaigns, sortKey, sortDirection])

  // Pagination
  const totalPages = Math.ceil(sortedCampaigns.length / ITEMS_PER_PAGE)
  const paginatedCampaigns = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return sortedCampaigns.slice(startIndex, endIndex)
  }, [sortedCampaigns, currentPage])

  // Handle sort
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('desc')
    }
    setCurrentPage(1) // Reset to first page when sorting
  }

  // Show empty state if no campaigns
  if (campaigns.length === 0) {
    return (
      <div className="rounded-lg border border-muted bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No campaign data available for this report
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-lg border border-muted bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-muted">
                <th className="px-4 py-3 text-left">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('campaign_name')}
                    className="font-semibold"
                  >
                    Campaign Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </th>
                <th className="px-4 py-3 text-left">
                  <span className="text-sm font-semibold">Platform</span>
                </th>
                <th className="px-4 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('spend')}
                    className="font-semibold"
                  >
                    Spend
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </th>
                <th className="px-4 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('impressions')}
                    className="font-semibold"
                  >
                    Impressions
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </th>
                <th className="px-4 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('clicks')}
                    className="font-semibold"
                  >
                    Clicks
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </th>
                <th className="px-4 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('ctr')}
                    className="font-semibold"
                  >
                    CTR
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </th>
                <th className="px-4 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('conversions')}
                    className="font-semibold"
                  >
                    Conversions
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </th>
                <th className="px-4 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('roas')}
                    className="font-semibold"
                  >
                    ROAS
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedCampaigns.map((campaign) => (
                <tr key={campaign.id} className="border-b border-muted last:border-0">
                  <td className="px-4 py-3 font-medium">{campaign.campaign_name}</td>
                  <td className="px-4 py-3">
                    <Badge variant={campaign.platform === 'meta' ? 'default' : 'secondary'}>
                      {campaign.platform === 'meta' ? 'Meta Ads' : 'Google Ads'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {formatCurrency(campaign.spend, currency)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {formatNumber(campaign.impressions)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {formatNumber(campaign.clicks)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {formatPercentage(campaign.ctr)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {formatNumber(campaign.conversions)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {campaign.roas !== null && campaign.roas > 0
                      ? `${campaign.roas.toFixed(2)}x`
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
            {Math.min(currentPage * ITEMS_PER_PAGE, sortedCampaigns.length)} of{' '}
            {sortedCampaigns.length} campaigns
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

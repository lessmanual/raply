/**
 * Campaign Data Fetcher - Unified interface for Meta and Google Ads
 *
 * Fetches campaign metrics from advertising platforms and normalizes to consistent format.
 */

import {
  getMetaCampaignInsights,
  type MetaCampaignInsights,
} from './meta-ads'
import {
  getGoogleAdsCampaignMetrics,
  type GoogleAdsCampaignMetrics,
} from './google-ads'

/**
 * Unified campaign metrics (normalized from Meta/Google)
 */
export interface CampaignMetrics {
  campaign_id: string
  campaign_name: string
  impressions: number
  clicks: number
  spend: number // Normalized to actual currency value
  reach?: number // Meta only
  frequency?: number // Meta only
  ctr: number // Click-through rate (%)
  cpc: number // Cost per click
  cpm: number // Cost per 1000 impressions
  conversions: number
  cost_per_conversion: number
  roas?: number // Return on ad spend (Meta has this)
  conversion_value?: number // Google has this
}

/**
 * Aggregated campaign data for report
 */
export interface AggregatedCampaignData {
  platform: 'meta' | 'google'
  account_name: string
  currency: string
  date_from: string
  date_to: string
  campaigns: CampaignMetrics[]
  totals: {
    spend: number
    impressions: number
    clicks: number
    conversions: number
    reach?: number
    ctr: number
    cpc: number
    cpm: number
    roas?: number
    conversion_value?: number
  }
}

/**
 * Fetch campaign data from Meta Ads
 */
async function fetchMetaCampaignData(
  adAccountId: string,
  accessToken: string,
  accountName: string,
  currency: string,
  dateFrom: string,
  dateTo: string
): Promise<AggregatedCampaignData> {
  const insights = await getMetaCampaignInsights(
    adAccountId,
    accessToken,
    dateFrom,
    dateTo
  )

  // Normalize Meta insights to CampaignMetrics format
  const campaigns: CampaignMetrics[] = insights.map((insight) => ({
    campaign_id: insight.campaign_id,
    campaign_name: insight.campaign_name,
    impressions: insight.impressions,
    clicks: insight.clicks,
    spend: insight.spend,
    reach: insight.reach,
    frequency: insight.frequency,
    ctr: insight.ctr,
    cpc: insight.cpc,
    cpm: insight.cpm,
    conversions: insight.conversions,
    cost_per_conversion: insight.cost_per_conversion,
    roas: insight.roas,
  }))

  // Calculate totals
  const totals = campaigns.reduce(
    (acc, campaign) => ({
      spend: acc.spend + campaign.spend,
      impressions: acc.impressions + campaign.impressions,
      clicks: acc.clicks + campaign.clicks,
      conversions: acc.conversions + campaign.conversions,
      reach: (acc.reach || 0) + (campaign.reach || 0),
      ctr: 0, // Will calculate after
      cpc: 0, // Will calculate after
      cpm: 0, // Will calculate after
      roas: 0, // Will calculate after
    }),
    {
      spend: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      reach: 0,
      ctr: 0,
      cpc: 0,
      cpm: 0,
      roas: 0,
    }
  )

  // Calculate averages
  if (totals.impressions > 0) {
    totals.ctr = (totals.clicks / totals.impressions) * 100
    totals.cpm = (totals.spend / totals.impressions) * 1000
  }
  if (totals.clicks > 0) {
    totals.cpc = totals.spend / totals.clicks
  }
  // Calculate ROAS from campaign revenues
  // ROAS = Revenue / Spend
  // If campaign has ROAS, then Revenue = ROAS * Spend
  if (totals.spend > 0) {
    const totalRevenue = campaigns.reduce(
      (sum, c) => sum + ((c.roas || 0) * c.spend),
      0
    )
    totals.roas = totalRevenue / totals.spend
  }

  return {
    platform: 'meta',
    account_name: accountName,
    currency,
    date_from: dateFrom,
    date_to: dateTo,
    campaigns,
    totals,
  }
}

/**
 * Fetch campaign data from Google Ads
 */
async function fetchGoogleAdsCampaignData(
  customerId: string,
  accessToken: string,
  developerToken: string,
  accountName: string,
  currency: string,
  dateFrom: string,
  dateTo: string
): Promise<AggregatedCampaignData> {
  const metrics = await getGoogleAdsCampaignMetrics(
    customerId,
    accessToken,
    developerToken,
    dateFrom,
    dateTo
  )

  // Normalize Google metrics to CampaignMetrics format
  const campaigns: CampaignMetrics[] = metrics.map((metric) => ({
    campaign_id: metric.campaign_id,
    campaign_name: metric.campaign_name,
    impressions: metric.impressions,
    clicks: metric.clicks,
    spend: metric.cost_micros / 1_000_000, // Convert micros to actual value
    ctr: metric.ctr * 100, // Convert to percentage
    cpc: metric.average_cpc_micros / 1_000_000,
    cpm: metric.average_cpm_micros / 1_000_000,
    conversions: metric.conversions,
    cost_per_conversion:
      metric.conversions > 0
        ? metric.cost_micros / 1_000_000 / metric.conversions
        : 0,
    conversion_value: metric.conversion_value,
  }))

  // Calculate totals
  const totals = campaigns.reduce(
    (acc, campaign) => ({
      spend: acc.spend + campaign.spend,
      impressions: acc.impressions + campaign.impressions,
      clicks: acc.clicks + campaign.clicks,
      conversions: acc.conversions + campaign.conversions,
      conversion_value: (acc.conversion_value || 0) + (campaign.conversion_value || 0),
      ctr: 0, // Will calculate after
      cpc: 0, // Will calculate after
      cpm: 0, // Will calculate after
    }),
    {
      spend: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      conversion_value: 0,
      ctr: 0,
      cpc: 0,
      cpm: 0,
    }
  )

  // Calculate averages
  if (totals.impressions > 0) {
    totals.ctr = (totals.clicks / totals.impressions) * 100
    totals.cpm = (totals.spend / totals.impressions) * 1000
  }
  if (totals.clicks > 0) {
    totals.cpc = totals.spend / totals.clicks
  }

  return {
    platform: 'google',
    account_name: accountName,
    currency,
    date_from: dateFrom,
    date_to: dateTo,
    campaigns,
    totals,
  }
}

/**
 * Fetch campaign data from advertising platform (Meta or Google)
 *
 * @param platform - 'meta' or 'google'
 * @param adAccount - Ad account details from database
 * @param dateFrom - Start date (YYYY-MM-DD)
 * @param dateTo - End date (YYYY-MM-DD)
 * @returns Aggregated campaign data with metrics
 */
export async function fetchCampaignData(
  platform: 'meta' | 'google',
  adAccount: {
    platform_account_id: string
    access_token: string
    account_name: string
    currency: string
  },
  dateFrom: string,
  dateTo: string
): Promise<AggregatedCampaignData> {
  if (platform === 'meta') {
    return fetchMetaCampaignData(
      adAccount.platform_account_id,
      adAccount.access_token,
      adAccount.account_name,
      adAccount.currency,
      dateFrom,
      dateTo
    )
  } else {
    // Google Ads requires developer token from env
    const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN
    if (!developerToken) {
      throw new Error('GOOGLE_ADS_DEVELOPER_TOKEN not configured')
    }

    return fetchGoogleAdsCampaignData(
      adAccount.platform_account_id,
      adAccount.access_token,
      developerToken,
      adAccount.account_name,
      adAccount.currency,
      dateFrom,
      dateTo
    )
  }
}

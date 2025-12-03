/**
 * Google Ads API Wrapper
 * Documentation: https://developers.google.com/google-ads/api/docs/start
 *
 * API Version: v22 (updated October 2025)
 * Previous: v17 (June 2024) - 4 major versions behind
 */

const GOOGLE_ADS_API_VERSION = process.env.GOOGLE_ADS_API_VERSION || 'v22'
const GOOGLE_ADS_API = `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}`

export interface GoogleAdsCampaign {
  id: string
  name: string
  status: string
  advertising_channel_type: string
  bidding_strategy_type: string
  start_date?: string
  end_date?: string
}

export interface GoogleAdsCampaignMetrics {
  campaign_id: string
  campaign_name: string
  impressions: number
  clicks: number
  cost_micros: number // Cost in micros (divide by 1,000,000 for actual cost)
  conversions: number
  conversion_value: number
  ctr: number
  average_cpc_micros: number
  average_cpm_micros: number
  date_start: string
  date_stop: string
}

/**
 * Fetch campaigns from Google Ads account
 */
export async function getGoogleAdsCampaigns(
  customerId: string,
  accessToken: string,
  developerToken: string
): Promise<GoogleAdsCampaign[]> {
  try {
    // Google Ads Query Language (GAQL)
    const query = `
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.advertising_channel_type,
        campaign.bidding_strategy_type,
        campaign.start_date,
        campaign.end_date
      FROM campaign
      WHERE campaign.status != 'REMOVED'
      ORDER BY campaign.name
    `

    const response = await fetch(
      `${GOOGLE_ADS_API}/customers/${customerId}/googleAds:search`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'developer-token': developerToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(
        `Failed to fetch Google Ads campaigns: ${error.error?.message || 'Unknown error'}`
      )
    }

    const data = await response.json()
    const results = data.results || []

    return results.map((result: any) => ({
      id: result.campaign.id,
      name: result.campaign.name,
      status: result.campaign.status,
      advertising_channel_type: result.campaign.advertisingChannelType,
      bidding_strategy_type: result.campaign.biddingStrategyType,
      start_date: result.campaign.startDate,
      end_date: result.campaign.endDate,
    }))
  } catch (error) {
    console.error('Error fetching Google Ads campaigns:', error)
    throw error
  }
}

/**
 * Fetch campaign metrics from Google Ads account
 */
export async function getGoogleAdsCampaignMetrics(
  customerId: string,
  accessToken: string,
  developerToken: string,
  dateFrom: string, // Format: YYYY-MM-DD
  dateTo: string // Format: YYYY-MM-DD
): Promise<GoogleAdsCampaignMetrics[]> {
  try {
    // Google Ads Query Language (GAQL)
    const query = `
      SELECT
        campaign.id,
        campaign.name,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions,
        metrics.conversions_value,
        metrics.ctr,
        metrics.average_cpc,
        metrics.average_cpm,
        segments.date
      FROM campaign
      WHERE
        campaign.status != 'REMOVED'
        AND segments.date BETWEEN '${dateFrom}' AND '${dateTo}'
      ORDER BY campaign.name
    `

    const response = await fetch(
      `${GOOGLE_ADS_API}/customers/${customerId}/googleAds:search`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'developer-token': developerToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(
        `Failed to fetch Google Ads metrics: ${error.error?.message || 'Unknown error'}`
      )
    }

    const data = await response.json()
    const results = data.results || []

    // Group by campaign and aggregate metrics
    const campaignMetrics = new Map<string, GoogleAdsCampaignMetrics>()

    results.forEach((result: any) => {
      const campaignId = result.campaign.id
      const existing = campaignMetrics.get(campaignId)

      if (existing) {
        // Aggregate metrics
        existing.impressions += parseInt(result.metrics.impressions || '0')
        existing.clicks += parseInt(result.metrics.clicks || '0')
        existing.cost_micros += parseInt(result.metrics.costMicros || '0')
        existing.conversions += parseFloat(result.metrics.conversions || '0')
        existing.conversion_value += parseFloat(
          result.metrics.conversionsValue || '0'
        )
      } else {
        campaignMetrics.set(campaignId, {
          campaign_id: campaignId,
          campaign_name: result.campaign.name,
          impressions: parseInt(result.metrics.impressions || '0'),
          clicks: parseInt(result.metrics.clicks || '0'),
          cost_micros: parseInt(result.metrics.costMicros || '0'),
          conversions: parseFloat(result.metrics.conversions || '0'),
          conversion_value: parseFloat(result.metrics.conversionsValue || '0'),
          ctr: parseFloat(result.metrics.ctr || '0'),
          average_cpc_micros: parseInt(result.metrics.averageCpc || '0'),
          average_cpm_micros: parseInt(result.metrics.averageCpm || '0'),
          date_start: dateFrom,
          date_stop: dateTo,
        })
      }
    })

    return Array.from(campaignMetrics.values())
  } catch (error) {
    console.error('Error fetching Google Ads campaign metrics:', error)
    throw error
  }
}

/**
 * Get Google Ads customer account details
 */
export async function getGoogleAdsCustomer(
  customerId: string,
  accessToken: string,
  developerToken: string
) {
  try {
    const query = `
      SELECT
        customer.id,
        customer.descriptive_name,
        customer.currency_code,
        customer.time_zone,
        customer.manager
      FROM customer
      WHERE customer.id = ${customerId}
    `

    const response = await fetch(
      `${GOOGLE_ADS_API}/customers/${customerId}/googleAds:search`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'developer-token': developerToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(
        `Failed to fetch Google Ads customer: ${error.error?.message || 'Unknown error'}`
      )
    }

    const data = await response.json()
    return data.results?.[0]?.customer || null
  } catch (error) {
    console.error('Error fetching Google Ads customer:', error)
    throw error
  }
}

/**
 * Validate Google access token
 */
export async function validateGoogleToken(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`
    )
    return response.ok
  } catch (error) {
    console.error('Error validating Google token:', error)
    return false
  }
}

/**
 * Refresh Google access token using refresh token
 */
export async function refreshGoogleToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<{ accessToken: string; expiresIn: number } | null> {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Failed to refresh Google token:', error)
      return null
    }

    const data = await response.json()
    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in,
    }
  } catch (error) {
    console.error('Error refreshing Google token:', error)
    return null
  }
}

/**
 * Validate Google Ads Customer ID by attempting to fetch customer details
 * Returns true if customer ID is valid and accessible, false otherwise
 */
export async function validateCustomerId(
  customerId: string,
  accessToken: string,
  developerToken: string
): Promise<boolean> {
  try {
    // Remove dashes if present (format: 1234567890)
    const cleanCustomerId = customerId.replace(/-/g, '')

    // Try to fetch customer details - if successful, customer ID is valid
    const customer = await getGoogleAdsCustomer(
      cleanCustomerId,
      accessToken,
      developerToken
    )

    return customer !== null
  } catch (error: any) {
    console.error('Customer ID validation failed:', error)

    // Check for specific error codes
    if (error.message?.includes('CUSTOMER_NOT_FOUND')) {
      return false
    }

    if (error.message?.includes('PERMISSION_DENIED')) {
      console.warn('Customer ID exists but access denied - likely valid but no permissions')
      return false
    }

    // For other errors, consider it invalid
    return false
  }
}

/**
 * Meta Marketing API Wrapper
 * Documentation: https://developers.facebook.com/docs/marketing-api
 */

const META_API_VERSION = process.env.META_GRAPH_API_VERSION || 'v18.0'
const META_GRAPH_API = `https://graph.facebook.com/${META_API_VERSION}`

export interface MetaCampaign {
  id: string
  name: string
  status: string
  objective: string
  daily_budget?: string
  lifetime_budget?: string
  start_time?: string
  stop_time?: string
}

export interface MetaCampaignInsights {
  campaign_id: string
  campaign_name: string
  impressions: number
  clicks: number
  spend: number
  reach: number
  frequency: number
  ctr: number
  cpc: number
  cpm: number
  cpp: number
  conversions: number
  cost_per_conversion: number
  roas: number
  date_start: string
  date_stop: string
}

/**
 * Fetch campaigns from Meta Ad Account
 */
export async function getMetaCampaigns(
  adAccountId: string,
  accessToken: string
): Promise<MetaCampaign[]> {
  try {
    const response = await fetch(
      `${META_GRAPH_API}/${adAccountId}/campaigns?` +
        new URLSearchParams({
          fields: [
            'id',
            'name',
            'status',
            'objective',
            'daily_budget',
            'lifetime_budget',
            'start_time',
            'stop_time',
          ].join(','),
          access_token: accessToken,
          limit: '100',
        })
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(
        `Failed to fetch Meta campaigns: ${error.error?.message || 'Unknown error'}`
      )
    }

    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching Meta campaigns:', error)
    throw error
  }
}

/**
 * Fetch campaign insights (metrics) from Meta Ad Account
 */
export async function getMetaCampaignInsights(
  adAccountId: string,
  accessToken: string,
  dateFrom: string, // Format: YYYY-MM-DD
  dateTo: string // Format: YYYY-MM-DD
): Promise<MetaCampaignInsights[]> {
  try {
    const response = await fetch(
      `${META_GRAPH_API}/${adAccountId}/insights?` +
        new URLSearchParams({
          fields: [
            'campaign_id',
            'campaign_name',
            'impressions',
            'clicks',
            'spend',
            'reach',
            'frequency',
            'ctr',
            'cpc',
            'cpm',
            'cpp',
            'conversions',
            'cost_per_conversion',
            'purchase_roas',
          ].join(','),
          time_range: JSON.stringify({
            since: dateFrom,
            until: dateTo,
          }),
          level: 'campaign',
          access_token: accessToken,
          limit: '100',
        })
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(
        `Failed to fetch Meta insights: ${error.error?.message || 'Unknown error'}`
      )
    }

    const data = await response.json()
    const insights = data.data || []

    // Transform insights to our format
    return insights.map((insight: any) => ({
      campaign_id: insight.campaign_id,
      campaign_name: insight.campaign_name,
      impressions: parseInt(insight.impressions || '0'),
      clicks: parseInt(insight.clicks || '0'),
      spend: parseFloat(insight.spend || '0'),
      reach: parseInt(insight.reach || '0'),
      frequency: parseFloat(insight.frequency || '0'),
      ctr: parseFloat(insight.ctr || '0'),
      cpc: parseFloat(insight.cpc || '0'),
      cpm: parseFloat(insight.cpm || '0'),
      cpp: parseFloat(insight.cpp || '0'),
      conversions: parseInt(insight.conversions || '0'),
      cost_per_conversion: parseFloat(insight.cost_per_conversion || '0'),
      roas: parseFloat(insight.purchase_roas?.[0]?.value || '0'),
      date_start: insight.date_start,
      date_stop: insight.date_stop,
    }))
  } catch (error) {
    console.error('Error fetching Meta campaign insights:', error)
    throw error
  }
}

/**
 * Get Meta Ad Account details
 */
export async function getMetaAdAccount(
  adAccountId: string,
  accessToken: string
) {
  try {
    const response = await fetch(
      `${META_GRAPH_API}/${adAccountId}?` +
        new URLSearchParams({
          fields: [
            'id',
            'name',
            'account_status',
            'currency',
            'timezone_name',
            'amount_spent',
            'balance',
          ].join(','),
          access_token: accessToken,
        })
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(
        `Failed to fetch Meta ad account: ${error.error?.message || 'Unknown error'}`
      )
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching Meta ad account:', error)
    throw error
  }
}

/**
 * Validate Meta access token
 */
export async function validateMetaToken(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${META_GRAPH_API}/me?access_token=${accessToken}`
    )
    return response.ok
  } catch (error) {
    console.error('Error validating Meta token:', error)
    return false
  }
}

import { createClient } from '@/lib/supabase/server'
import { SupabaseClient } from '@supabase/supabase-js'
import type {
  UserInsert,
  UserUpdate,
  AdAccountInsert,
  AdAccountUpdate,
  ReportInsert,
  ReportUpdate,
  CampaignDataInsert,
} from '@/lib/types'

/**
 * User mutations
 */
export async function updateUser(userId: string, updates: UserUpdate) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating user:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Unexpected error in updateUser:', error)
    return { data: null, error }
  }
}

/**
 * Ad Account mutations
 */
export async function createAdAccount(account: AdAccountInsert) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('ad_accounts')
      .insert(account)
      .select()
      .single()

    if (error) {
      console.error('Error creating ad account:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Unexpected error in createAdAccount:', error)
    return { data: null, error }
  }
}

export async function updateAdAccount(accountId: string, updates: AdAccountUpdate) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('ad_accounts')
      .update(updates)
      .eq('id', accountId)
      .select()
      .single()

    if (error) {
      console.error('Error updating ad account:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Unexpected error in updateAdAccount:', error)
    return { data: null, error }
  }
}

export async function deleteAdAccount(accountId: string) {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('ad_accounts')
      .delete()
      .eq('id', accountId)

    if (error) {
      console.error('Error deleting ad account:', error)
      return { success: false, error }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Unexpected error in deleteAdAccount:', error)
    return { success: false, error }
  }
}

/**
 * Report mutations
 */
export async function createReport(report: ReportInsert) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('reports')
      .insert(report)
      .select()
      .single()

    if (error) {
      console.error('Error creating report:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Unexpected error in createReport:', error)
    return { data: null, error }
  }
}

export async function updateReport(reportId: string, updates: ReportUpdate) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('reports')
      .update(updates)
      .eq('id', reportId)
      .select()
      .single()

    if (error) {
      console.error('Error updating report:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Unexpected error in updateReport:', error)
    return { data: null, error }
  }
}

export async function deleteReport(reportId: string) {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', reportId)

    if (error) {
      console.error('Error deleting report:', error)
      return { success: false, error }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Unexpected error in deleteReport:', error)
    return { success: false, error }
  }
}

/**
 * Campaign Data mutations
 */
export async function createCampaignData(campaignData: CampaignDataInsert) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('campaigns_data')
      .insert(campaignData)
      .select()
      .single()

    if (error) {
      console.error('Error creating campaign data:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Unexpected error in createCampaignData:', error)
    return { data: null, error }
  }
}

export async function bulkCreateCampaignData(
  campaignDataArray: CampaignDataInsert[],
  supabaseClient?: SupabaseClient
) {
  try {
    const supabase = supabaseClient || await createClient()

    const { data, error } = await supabase
      .from('campaigns_data')
      .insert(campaignDataArray)
      .select()

    if (error) {
      console.error('Error bulk creating campaign data:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Unexpected error in bulkCreateCampaignData:', error)
    return { data: null, error }
  }
}

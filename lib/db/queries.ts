import { createClient } from '@/lib/supabase/server'
import type { User, AdAccount, Report, ReportWithAccount, ReportWithAll } from '@/lib/types'

/**
 * User queries
 */
export async function getUserById(userId: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Unexpected error in getUserById:', error)
    return { data: null, error }
  }
}

/**
 * Ad Accounts queries
 */
export async function getAdAccounts(userId: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('ad_accounts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching ad accounts:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Unexpected error in getAdAccounts:', error)
    return { data: null, error }
  }
}

export async function getAdAccountById(accountId: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('ad_accounts')
      .select('*')
      .eq('id', accountId)
      .single()

    if (error) {
      console.error('Error fetching ad account:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Unexpected error in getAdAccountById:', error)
    return { data: null, error }
  }
}

/**
 * Reports queries
 */
export async function getReports(userId: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('reports')
      .select(`
        *,
        ad_account:ad_accounts(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching reports:', error)
      return { data: null, error }
    }

    return { data: data as ReportWithAccount[], error: null }
  } catch (error) {
    console.error('Unexpected error in getReports:', error)
    return { data: null, error }
  }
}

export async function getReportById(reportId: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('reports')
      .select(`
        *,
        ad_account:ad_accounts(*),
        campaigns_data(*)
      `)
      .eq('id', reportId)
      .single()

    if (error) {
      console.error('Error fetching report:', error)
      return { data: null, error }
    }

    return { data: data as ReportWithAll, error: null }
  } catch (error) {
    console.error('Unexpected error in getReportById:', error)
    return { data: null, error }
  }
}

export async function getReportsByAdAccount(accountId: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('ad_account_id', accountId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching reports by account:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Unexpected error in getReportsByAdAccount:', error)
    return { data: null, error }
  }
}

/**
 * Campaign Data queries
 */
export async function getCampaignDataByReport(reportId: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('campaigns_data')
      .select('*')
      .eq('report_id', reportId)
      .order('spend', { ascending: false })

    if (error) {
      console.error('Error fetching campaign data:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Unexpected error in getCampaignDataByReport:', error)
    return { data: null, error }
  }
}

/**
 * Dashboard queries
 */
export async function getDashboardStats(userId: string) {
  try {
    const supabase = await createClient()

    // Get total reports count
    const { count: totalReports, error: reportsError } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (reportsError) {
      console.error('Error fetching reports count:', reportsError)
      return { data: null, error: reportsError }
    }

    // Get total ad accounts count
    const { count: totalAccounts, error: accountsError } = await supabase
      .from('ad_accounts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (accountsError) {
      console.error('Error fetching accounts count:', accountsError)
      return { data: null, error: accountsError }
    }

    // Get reports from this month
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const { count: reportsThisMonth, error: monthError } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', firstDayOfMonth.toISOString())

    if (monthError) {
      console.error('Error fetching month reports:', monthError)
      return { data: null, error: monthError }
    }

    // Get reports from last month for comparison
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

    const { count: reportsLastMonth, error: lastMonthError } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', lastMonthStart.toISOString())
      .lte('created_at', lastMonthEnd.toISOString())

    if (lastMonthError) {
      console.error('Error fetching last month reports:', lastMonthError)
      // Don't return error, just use 0 for comparison
    }

    return {
      data: {
        totalReports: totalReports ?? 0,
        totalAccounts: totalAccounts ?? 0,
        reportsThisMonth: reportsThisMonth ?? 0,
        reportsLastMonth: reportsLastMonth ?? 0,
      },
      error: null,
    }
  } catch (error) {
    console.error('Unexpected error in getDashboardStats:', error)
    return { data: null, error }
  }
}

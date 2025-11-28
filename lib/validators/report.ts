import { z } from 'zod'

export const reportTemplateSchema = z.enum(['leads', 'sales', 'reach'])

export const dateRangeSchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
}).refine(
  (data) => {
    const from = new Date(data.from)
    const to = new Date(data.to)
    return from < to
  },
  {
    message: 'End date must be after start date',
  }
)

export const createReportSchema = z.object({
  accountId: z.string().uuid('Invalid account ID'),
  templateType: reportTemplateSchema,
  dateRange: dateRangeSchema,
  name: z.string().min(1, 'Report name is required').max(255).optional(),
})

export const updateReportSchema = z.object({
  name: z.string().min(1).max(255).optional(),
})

export type ReportTemplate = z.infer<typeof reportTemplateSchema>
export type DateRange = z.infer<typeof dateRangeSchema>
export type CreateReportInput = z.infer<typeof createReportSchema>
export type UpdateReportInput = z.infer<typeof updateReportSchema>

/**
 * Ad Account Type for Wizard
 */
export interface AdAccount {
  id: string
  platform: 'meta' | 'google'
  account_name: string
  platform_account_id: string
  currency: string
  status: 'active' | 'error' | 'inactive'
}

/**
 * Date Range Presets for Wizard
 */
export const dateRangePresets = [
  {
    id: 'last7days',
    label: 'Last 7 days',
    getValue: () => ({
      from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      to: new Date().toISOString(),
    }),
  },
  {
    id: 'last30days',
    label: 'Last 30 days',
    getValue: () => ({
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      to: new Date().toISOString(),
    }),
  },
  {
    id: 'last90days',
    label: 'Last 90 days',
    getValue: () => ({
      from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      to: new Date().toISOString(),
    }),
  },
  {
    id: 'thisMonth',
    label: 'This month',
    getValue: () => {
      const now = new Date()
      return {
        from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
        to: now.toISOString(),
      }
    },
  },
  {
    id: 'lastMonth',
    label: 'Last month',
    getValue: () => {
      const now = new Date()
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
      return {
        from: lastMonth.toISOString(),
        to: lastMonthEnd.toISOString(),
      }
    },
  },
]

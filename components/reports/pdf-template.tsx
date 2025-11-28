import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'

// Register fonts (optional - using default Helvetica for now)
// Font.register({ family: 'Inter', src: '/fonts/Inter-Regular.ttf' })

interface CampaignData {
  campaign_name: string
  platform: 'meta' | 'google'
  spend: number
  impressions: number
  clicks: number
  conversions: number
  ctr: number | null
  roas: number | null
}

interface ReportPDFTemplateProps {
  reportName: string
  dateFrom: string
  dateTo: string
  platform: string
  accountName: string
  currency: string
  // Metrics
  totalSpend: number
  totalImpressions: number
  totalClicks: number
  totalConversions: number
  averageCtr: number
  averageCpc: number
  averageCpm: number
  roas: number | null
  // AI Insights
  aiDescription: string | null
  aiRecommendations: string | null
  // Campaigns (top 10)
  campaigns: CampaignData[]
}

// Styles for PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottom: '2 solid #e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#111827',
  },
  subtitle: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#111827',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCard: {
    width: '23%',
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
    border: '1 solid #e5e7eb',
  },
  metricLabel: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  insightBox: {
    padding: 12,
    backgroundColor: '#f0f9ff',
    borderRadius: 4,
    marginBottom: 10,
    border: '1 solid #bfdbfe',
  },
  insightTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#1e40af',
  },
  insightText: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#374151',
  },
  table: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderBottom: '1 solid #d1d5db',
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '1 solid #e5e7eb',
  },
  tableCell: {
    fontSize: 9,
    color: '#374151',
  },
  tableCellHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#111827',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#9ca3af',
    paddingTop: 10,
    borderTop: '1 solid #e5e7eb',
  },
})

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

/**
 * Report PDF Template
 * A4 format, professional design, black & white optimized
 */
export function ReportPDFTemplate({
  reportName,
  dateFrom,
  dateTo,
  platform,
  accountName,
  currency,
  totalSpend,
  totalImpressions,
  totalClicks,
  totalConversions,
  averageCtr,
  averageCpc,
  averageCpm,
  roas,
  aiDescription,
  aiRecommendations,
  campaigns,
}: ReportPDFTemplateProps) {
  // Get top 10 campaigns by spend
  const top10Campaigns = campaigns.slice(0, 10)

  const generatedDate = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{reportName}</Text>
          <Text style={styles.subtitle}>
            {dateFrom} - {dateTo}
          </Text>
          <Text style={styles.subtitle}>
            Platform: {platform} • Account: {accountName}
          </Text>
        </View>

        {/* Metrics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Total Spend</Text>
              <Text style={styles.metricValue}>
                {formatCurrency(totalSpend, currency)}
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Impressions</Text>
              <Text style={styles.metricValue}>
                {formatNumber(totalImpressions)}
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Clicks</Text>
              <Text style={styles.metricValue}>{formatNumber(totalClicks)}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Conversions</Text>
              <Text style={styles.metricValue}>
                {formatNumber(totalConversions)}
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>CTR</Text>
              <Text style={styles.metricValue}>
                {formatPercentage(averageCtr)}
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>CPC</Text>
              <Text style={styles.metricValue}>
                {formatCurrency(averageCpc, currency)}
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>CPM</Text>
              <Text style={styles.metricValue}>
                {formatCurrency(averageCpm, currency)}
              </Text>
            </View>
            {roas !== null && roas > 0 && (
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>ROAS</Text>
                <Text style={styles.metricValue}>{roas.toFixed(2)}x</Text>
              </View>
            )}
          </View>
        </View>

        {/* AI Insights */}
        {(aiDescription || aiRecommendations) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI Insights</Text>
            {aiDescription && (
              <View style={styles.insightBox}>
                <Text style={styles.insightTitle}>Performance Summary</Text>
                <Text style={styles.insightText}>{aiDescription}</Text>
              </View>
            )}
            {aiRecommendations && (
              <View style={styles.insightBox}>
                <Text style={styles.insightTitle}>Recommendations</Text>
                <Text style={styles.insightText}>{aiRecommendations}</Text>
              </View>
            )}
          </View>
        )}

        {/* Top Campaigns Table */}
        {top10Campaigns.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Top {top10Campaigns.length} Campaigns by Spend
            </Text>
            <View style={styles.table}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCellHeader, { width: '30%' }]}>
                  Campaign
                </Text>
                <Text style={[styles.tableCellHeader, { width: '15%', textAlign: 'right' }]}>
                  Spend
                </Text>
                <Text style={[styles.tableCellHeader, { width: '15%', textAlign: 'right' }]}>
                  Impressions
                </Text>
                <Text style={[styles.tableCellHeader, { width: '12%', textAlign: 'right' }]}>
                  Clicks
                </Text>
                <Text style={[styles.tableCellHeader, { width: '10%', textAlign: 'right' }]}>
                  CTR
                </Text>
                <Text style={[styles.tableCellHeader, { width: '12%', textAlign: 'right' }]}>
                  Conv.
                </Text>
                <Text style={[styles.tableCellHeader, { width: '10%', textAlign: 'right' }]}>
                  ROAS
                </Text>
              </View>
              {/* Table Rows */}
              {top10Campaigns.map((campaign, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { width: '30%' }]}>
                    {campaign.campaign_name.length > 30
                      ? campaign.campaign_name.substring(0, 27) + '...'
                      : campaign.campaign_name}
                  </Text>
                  <Text style={[styles.tableCell, { width: '15%', textAlign: 'right' }]}>
                    {formatCurrency(campaign.spend, currency)}
                  </Text>
                  <Text style={[styles.tableCell, { width: '15%', textAlign: 'right' }]}>
                    {formatNumber(campaign.impressions)}
                  </Text>
                  <Text style={[styles.tableCell, { width: '12%', textAlign: 'right' }]}>
                    {formatNumber(campaign.clicks)}
                  </Text>
                  <Text style={[styles.tableCell, { width: '10%', textAlign: 'right' }]}>
                    {formatPercentage(campaign.ctr)}
                  </Text>
                  <Text style={[styles.tableCell, { width: '12%', textAlign: 'right' }]}>
                    {formatNumber(campaign.conversions)}
                  </Text>
                  <Text style={[styles.tableCell, { width: '10%', textAlign: 'right' }]}>
                    {campaign.roas !== null && campaign.roas > 0
                      ? `${campaign.roas.toFixed(2)}x`
                      : '-'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Generated by Raply on {generatedDate}
          </Text>
        </View>
      </Page>
    </Document>
  )
}

import * as React from 'react'

interface ReportEmailTemplateProps {
  reportName: string
  reportUrl: string
  platform: string
  dateRange: string
  metrics: {
    spend: string
    impressions: string
    clicks: string
    conversions: string
    roas: string
  }
}

export const ReportEmailTemplate: React.FC<ReportEmailTemplateProps> = ({
  reportName,
  reportUrl,
  platform,
  dateRange,
  metrics,
}) => (
  <div style={{ fontFamily: 'sans-serif', lineHeight: '1.5', color: '#333' }}>
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#000', fontSize: '24px', margin: '0' }}>Raply</h1>
        <p style={{ color: '#666', fontSize: '14px', margin: '5px 0 0' }}>
          Automated Advertising Reports
        </p>
      </div>

      <div
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '24px',
          backgroundColor: '#ffffff',
        }}
      >
        <h2 style={{ fontSize: '20px', margin: '0 0 10px', color: '#111' }}>
          {reportName}
        </h2>
        <p style={{ margin: '0 0 20px', color: '#666', fontSize: '14px' }}>
          {platform} • {dateRange}
        </p>

        <div style={{ marginBottom: '24px' }}>
          <h3
            style={{
              fontSize: '16px',
              fontWeight: '600',
              margin: '0 0 12px',
              color: '#333',
            }}
          >
            Key Metrics
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
            }}
          >
            <div style={{ backgroundColor: '#f9fafb', padding: '10px', borderRadius: '4px' }}>
              <div style={{ fontSize: '12px', color: '#666' }}>Spend</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{metrics.spend}</div>
            </div>
            <div style={{ backgroundColor: '#f9fafb', padding: '10px', borderRadius: '4px' }}>
              <div style={{ fontSize: '12px', color: '#666' }}>ROAS</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{metrics.roas}</div>
            </div>
            <div style={{ backgroundColor: '#f9fafb', padding: '10px', borderRadius: '4px' }}>
              <div style={{ fontSize: '12px', color: '#666' }}>Impressions</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                {metrics.impressions}
              </div>
            </div>
            <div style={{ backgroundColor: '#f9fafb', padding: '10px', borderRadius: '4px' }}>
              <div style={{ fontSize: '12px', color: '#666' }}>Conversions</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                {metrics.conversions}
              </div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <a
            href={reportUrl}
            style={{
              display: 'inline-block',
              backgroundColor: '#000',
              color: '#fff',
              textDecoration: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            View Full Report
          </a>
        </div>
      </div>

      <div
        style={{
          textAlign: 'center',
          marginTop: '30px',
          color: '#999',
          fontSize: '12px',
        }}
      >
        <p>© {new Date().getFullYear()} Raply. All rights reserved.</p>
      </div>
    </div>
  </div>
)

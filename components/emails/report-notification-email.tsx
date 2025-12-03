import * as React from 'react'

interface ReportNotificationEmailProps {
  reportName: string
  reportUrl: string
  platform: string
  dateRange: string
  status: 'completed' | 'failed'
  errorMessage?: string
}

export const ReportNotificationEmail: React.FC<ReportNotificationEmailProps> = ({
  reportName,
  reportUrl,
  platform,
  dateRange,
  status,
  errorMessage,
}) => {
  const isSuccess = status === 'completed'

  return (
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
          {isSuccess ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    margin: '0 auto 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ fontSize: '32px', color: '#fff' }}>✓</span>
                </div>
                <h2 style={{ fontSize: '20px', margin: '0 0 8px', color: '#111' }}>
                  Your Report is Ready!
                </h2>
              </div>

              <p style={{ margin: '0 0 20px', color: '#666', fontSize: '14px', textAlign: 'center' }}>
                We&apos;ve finished generating your advertising report.
              </p>

              <div
                style={{
                  backgroundColor: '#f9fafb',
                  padding: '16px',
                  borderRadius: '6px',
                  marginBottom: '24px',
                }}
              >
                <div style={{ fontSize: '14px', color: '#333', marginBottom: '8px', fontWeight: '600' }}>
                  {reportName}
                </div>
                <div style={{ fontSize: '13px', color: '#666' }}>
                  {platform} • {dateRange}
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
                    padding: '12px 32px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                >
                  View Report
                </a>
              </div>
            </>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: '#ef4444',
                    margin: '0 auto 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ fontSize: '32px', color: '#fff' }}>✕</span>
                </div>
                <h2 style={{ fontSize: '20px', margin: '0 0 8px', color: '#111' }}>
                  Report Generation Failed
                </h2>
              </div>

              <p style={{ margin: '0 0 20px', color: '#666', fontSize: '14px', textAlign: 'center' }}>
                We encountered an error while generating your report.
              </p>

              <div
                style={{
                  backgroundColor: '#f9fafb',
                  padding: '16px',
                  borderRadius: '6px',
                  marginBottom: '24px',
                }}
              >
                <div style={{ fontSize: '14px', color: '#333', marginBottom: '8px', fontWeight: '600' }}>
                  {reportName}
                </div>
                <div style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
                  {platform} • {dateRange}
                </div>
                {errorMessage && (
                  <div
                    style={{
                      fontSize: '13px',
                      color: '#ef4444',
                      backgroundColor: '#fef2f2',
                      padding: '8px',
                      borderRadius: '4px',
                    }}
                  >
                    {errorMessage}
                  </div>
                )}
              </div>

              <div style={{ textAlign: 'center' }}>
                <a
                  href={reportUrl}
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#000',
                    color: '#fff',
                    textDecoration: 'none',
                    padding: '12px 32px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                >
                  Try Again
                </a>
              </div>
            </>
          )}
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
          <p style={{ marginTop: '8px' }}>
            <a href="https://raply.app" style={{ color: '#999', textDecoration: 'none' }}>
              raply.app
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

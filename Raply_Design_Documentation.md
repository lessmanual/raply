# Raply - Design Documentation
## Google Ads API Integration

**Version:** 1.0
**Date:** October 22, 2025
**Company:** Less Manual AI (kontakt[at]lessmanual[dot]ai)

---

## 1. Product Overview

**Raply** is a SaaS platform that automates advertising report generation for marketing agencies and businesses. The platform aggregates data from multiple advertising platforms (Google Ads, Meta Ads) and generates professional, AI-enhanced reports delivered via email or PDF download.

### Key Features
- **Multi-platform integration**: Google Ads, Meta Ads
- **Automated report generation**: Scheduled daily, weekly, or monthly reports
- **AI-powered insights**: Claude API generates campaign descriptions and recommendations
- **Professional PDF export**: Branded reports ready for client delivery
- **Email delivery**: Automatic report distribution via Resend

---

## 2. Google Ads API Integration

### Purpose
Raply uses the Google Ads API **exclusively for reading campaign performance data**. We do NOT create, modify, or manage campaigns.

### API Usage
- **Read-only access** to campaign metrics
- **Data fetched**:
  - Campaign names and IDs
  - Performance metrics: impressions, clicks, conversions, cost, CTR, CPC
  - Date-range filtered data
  - Account information: name, currency, timezone

### API Endpoints Used
1. `customers:listAccessibleCustomers` - Get accessible customer accounts
2. `GoogleAdsService.SearchStream` - Fetch campaign data with GAQL queries
3. `CustomerService.GetCustomer` - Get account metadata

### Campaign Types Supported
- Search campaigns
- Display campaigns
- Video campaigns
- Shopping campaigns
- Performance Max campaigns
- App campaigns
- Local campaigns
- Discovery campaigns
- Smart campaigns

### API Rate Limiting & Error Handling

#### Rate Limits
- **QPS (Queries Per Second)**: 1 query per second per client ID (Google Ads API standard limit)
- **Daily quota**: 15,000 operations per day per developer token
- **Concurrent requests**: Maximum 10 concurrent requests per user
- **Burst limit**: 5 requests allowed in burst, then throttled to 1 QPS

#### Retry Strategy
All Google Ads API calls implement **exponential backoff** with jitter:

1. **Initial request** → Fails → Wait 1s (+ random 0-500ms) → Retry
2. **Second retry** → Fails → Wait 2s (+ random 0-1000ms) → Retry
3. **Third retry** → Fails → Wait 4s (+ random 0-2000ms) → Retry
4. **Fourth retry** → Fails → Wait 8s (+ random 0-4000ms) → Final attempt
5. **All retries exhausted** → Return error to user

**Total attempts**: 5 (1 initial + 4 retries)
**Maximum wait time**: ~15 seconds (worst case)
**Jitter**: Random delay added to prevent thundering herd

#### Error Code Handling

**`RESOURCE_TEMPORARILY_EXHAUSTED` (Rate limit exceeded)**
- Triggered when QPS limit or daily quota exceeded
- **Response**: Automatic retry with exponential backoff
- **User message**: "Too many requests. Retrying automatically..."
- **Backend action**: Queue request for delayed retry
- **Fallback**: If persistent (>5 retries), show user error with "Try again in 1 minute" button

**`RESOURCE_EXHAUSTED` (Quota exceeded)**
- Daily API quota limit reached
- **Response**: No automatic retry (quota won't refresh mid-day)
- **User message**: "Daily API limit reached. Please try again tomorrow."
- **Backend action**: Log incident for monitoring
- **Mitigation**: Implement caching to reduce API calls

**`DEADLINE_EXCEEDED` (Timeout)**
- Request took longer than 30 seconds
- **Response**: Retry with exponential backoff (max 2 retries)
- **User message**: "Request timed out. Retrying..."
- **Backend action**: Break down large date ranges into smaller chunks

**`UNAVAILABLE` (Service temporarily unavailable)**
- Google Ads API experiencing downtime
- **Response**: Retry with exponential backoff
- **User message**: "Google Ads API temporarily unavailable. Retrying..."
- **Fallback**: After 4 failed retries, show status page link

#### Request Queue Management
- **Priority queue**: User-initiated requests prioritized over background jobs
- **Circuit breaker**: After 10 consecutive failures, pause API calls for 5 minutes
- **Health check**: Ping Google Ads API health endpoint every minute
- **Graceful degradation**: Serve cached data when API is unavailable

---

## 3. User Flow

### 3.1 Initial Setup
```
1. User signs up → Email verification
2. Navigate to Integrations page
3. Click "Connect Google Ads"
4. OAuth 2.0 authentication with Google
5. Grant read-only permissions (scope: https://www.googleapis.com/auth/adwords)
6. Account connected → Data syncing begins
```

### 3.2 Report Generation
```
1. User navigates to Reports → New Report
2. Select connected Google Ads account
3. Choose template type (Leads, Sales, Reach)
4. Select date range (Last 7 days, Last 30 days, Custom)
5. Preview report with live data
6. Generate PDF or schedule email delivery
```

### 3.3 Error Handling & Recovery

#### OAuth Authentication Failures
- **Error**: User denies Google OAuth permissions
  - **Message**: "Google Ads connection cancelled. Please try again to connect your account."
  - **Recovery**: User can retry connection from Integrations page

- **Error**: OAuth token expires or is revoked
  - **Message**: "Your Google Ads connection expired. Please reconnect to continue."
  - **Recovery**: Automatic redirect to OAuth flow; data preserved after reconnection

#### Network & API Errors
- **Error**: Network timeout during report generation (>30s)
  - **Message**: "Report generation is taking longer than expected. We'll email you when it's ready."
  - **Recovery**: Background job continues; email notification on completion

- **Error**: Google Ads API rate limit exceeded
  - **Message**: "Too many requests. Please wait a moment and try again."
  - **Recovery**: Automatic retry with exponential backoff (1s, 2s, 4s, 8s)

- **Error**: Google Ads API returns invalid data
  - **Message**: "Unable to fetch campaign data. Please check your account connection."
  - **Recovery**: User prompted to reconnect account or contact support

#### Data Validation Errors
- **Error**: Invalid date range (end date before start date)
  - **Message**: "End date must be after start date."
  - **Recovery**: Form validation prevents submission; highlight invalid fields

- **Error**: Date range exceeds maximum (>365 days)
  - **Message**: "Date range cannot exceed 365 days. Please select a shorter period."
  - **Recovery**: User adjusts date range

- **Error**: Future date selected
  - **Message**: "Cannot generate reports for future dates."
  - **Recovery**: Date picker restricted to past dates only

#### Report Generation Errors
- **Error**: No campaigns found for selected date range
  - **Message**: "No active campaigns found for this period. Try selecting a different date range."
  - **Recovery**: User adjusts date selection

- **Error**: PDF generation fails
  - **Message**: "Failed to generate PDF. Please try again or download as CSV."
  - **Recovery**: Retry button; alternative export format offered

- **Error**: Email delivery fails
  - **Message**: "Failed to send email. You can download the report instead."
  - **Recovery**: PDF download link provided; option to retry email

#### Retry Logic
All API calls implement exponential backoff retry strategy:
1. Initial request fails → Wait 1 second → Retry
2. Second failure → Wait 2 seconds → Retry
3. Third failure → Wait 4 seconds → Retry
4. Fourth failure → Wait 8 seconds → Final retry
5. All retries exhausted → Show user-facing error message with recovery options

Maximum retries: 4 attempts
Total max wait time: ~15 seconds

---

## 4. Technical Architecture

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui (Radix UI primitives)

### Backend
- **API Routes**: Next.js API Routes
- **Authentication**: Supabase Auth (OAuth 2.0)
- **Database**: PostgreSQL (Supabase)
- **External APIs**:
  - Google Ads API v22
  - Meta Marketing API
  - Claude API (Anthropic)

### Data Flow
```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       ↓
┌─────────────────────────┐
│  Raply Web App          │
│  (Next.js)              │
└──────┬──────────────────┘
       │
       ↓
┌─────────────────────────┐
│  Google Ads API         │
│  (Read-only)            │
└──────┬──────────────────┘
       │
       ↓
┌─────────────────────────┐
│  Supabase Database      │
│  (Store reports)        │
└─────────────────────────┘
```

---

## 5. Security & Privacy

### Data Handling
- **OAuth tokens**: Encrypted at rest in Supabase database using **AES-256-GCM encryption**
- **API requests**: All requests over **HTTPS with TLS 1.2+** minimum
- **Data retention**: Campaign data cached for 24 hours max, then automatically purged
- **User data**: Only accessible to account owner (Row-Level Security enforced at database level)
- **Sensitive data**: All environment variables and secrets stored in Vercel Environment Variables (encrypted at rest)

### Encryption Standards
- **Algorithm**: AES-256-GCM (Galois/Counter Mode)
- **Key derivation**: PBKDF2 with SHA-256 (100,000 iterations minimum)
- **Transport security**: TLS 1.2 or higher for all API communications
- **Database encryption**: Supabase default encryption at rest for all stored data
- **Secrets management**: Environment variables never committed to version control

### Key Management Policy
- **OAuth tokens**: Rotated on each API call (refresh token flow)
- **API keys**: Stored in Vercel environment variables, rotated quarterly
- **Database credentials**: Managed by Supabase, rotated automatically on security events
- **Session tokens**: JWT with 7-day expiration, httpOnly cookies
- **Service role keys**: Limited to server-side usage only, never exposed to client

### Token Revocation Procedure
1. **User-initiated revocation**: User can disconnect account from Integrations page
   - Token immediately deleted from database
   - Google OAuth revocation API called to invalidate token
   - User redirected to success confirmation

2. **Automatic revocation triggers**:
   - Token expires (refresh fails 3 consecutive times)
   - User deletes account
   - Suspicious activity detected (multiple failed API calls)
   - User changes Google account password

3. **Revocation verification**:
   - Token deletion confirmed in database
   - OAuth provider notified of revocation
   - User session invalidated
   - Audit log entry created

### Cache Handling After Expiration
- **In-memory cache**: Redis with automatic TTL (24 hours)
- **Expiration handling**:
  1. Cache miss detected → Fresh data fetched from Google Ads API
  2. Cache write with new TTL
  3. Old data automatically evicted by Redis
- **Manual purge triggers**: User disconnects account, data deleted immediately
- **Privacy compliance**: No campaign data persists beyond 24 hours unless explicitly saved in report

### Audit Logging
All security-relevant events are logged:
- **Authentication events**: Login, logout, OAuth connections, disconnections
- **API access**: All Google Ads API calls (timestamp, user, endpoint, status)
- **Data access**: Report generation, PDF downloads, email sends
- **Security events**: Failed login attempts, suspicious activity, rate limit hits
- **Retention**: Logs kept for 90 days, then archived for compliance (1 year total)

### Permissions
- **Google Ads API scope**: `https://www.googleapis.com/auth/adwords` (read-only)
- **No write permissions**: Raply cannot create, modify, or delete campaigns
- **User consent**: Explicit OAuth consent screen before access
- **Principle of least privilege**: Each service has minimal required permissions

### Compliance
- **GDPR**: User data deletion on request (within 30 days)
- **Data residency**: EU users' data stored in EU region (Supabase Frankfurt)
- **Right to access**: Users can export all their data via settings
- **Breach notification**: Security incidents reported within 72 hours
- **Regular audits**: Quarterly security reviews and penetration testing

---

## 6. UI Screenshots

### 6.1 Integrations Page
The main page where users connect their advertising accounts:
- **OAuth buttons** for Google Ads and Meta Ads
- **Connected accounts** summary with status badges
- **Disconnect functionality** for account management

### 6.2 Report Creator
Wizard-style interface for report creation:
- **Account selection**: Choose from connected accounts
- **Template selection**: Pre-built templates (Leads, Sales, Reach)
- **Date range picker**: Flexible date selection
- **Preview mode**: Live data preview before generation

### 6.3 Report Preview
Professional report display:
- **Executive summary**: AI-generated insights
- **Performance metrics**: Key KPIs with visualizations
- **Campaign breakdown**: Detailed campaign-level data
- **Export options**: PDF download, email delivery

---

## 7. Google Ads API Compliance

### Read-only Operations
Raply performs **ONLY read operations**:
- ✅ Fetch campaign performance data
- ✅ Read account information
- ✅ Query metrics for date ranges
- ❌ Create campaigns
- ❌ Modify campaigns
- ❌ Delete campaigns
- ❌ Manage budgets
- ❌ Change targeting

### User Benefits
1. **Time savings**: Automate hours of manual reporting work
2. **Multi-platform view**: Combine Google Ads + Meta Ads data
3. **AI insights**: Claude-powered campaign recommendations
4. **Professional output**: Client-ready PDF reports
5. **Scheduled delivery**: Set it and forget it automation

---

## 8. Support & Contact

**Company**: Less Manual AI
**Email**: kontakt[at]lessmanual[dot]ai
**Website**: https://raply.vercel.app
**API Token**: Developer token applied for Basic Access

---

## 9. Future Enhancements

### Planned Features
- Additional platforms: TikTok Ads, LinkedIn Ads
- Custom report templates builder
- White-label reports for agencies
- Advanced analytics and forecasting
- Team collaboration features

### Google Ads API Expansion
- Support for Shopping campaigns detail
- Ad group level reporting
- Keyword performance analysis
- Geographic performance breakdown

---

**Document Version**: 1.0
**Last Updated**: October 22, 2025
**Status**: Initial submission for Google Ads API Basic Access

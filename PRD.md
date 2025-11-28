# PRD - Raply MVP Beta Ready

## Cel tego dokumentu
Ten PRD definiuje **MINIMUM FUNKCJONALNOŚCI** potrzebnej do uruchomienia Raply w wersji beta dla pierwszych testerów.

**Główny cel:** Działająca aplikacja gdzie użytkownik może:
1. Połączyć konto Meta Ads lub Google Ads
2. Wygenerować raport z kampanii
3. Zobaczyć metryki + AI insights
4. Pobrać raport jako PDF

**Nie-cel:** Pełna implementacja wszystkich feature'ów ze specyfikacji. To MVP do testów, nie produkcja.

---

## Status obecny (co DZIAŁA vs co NIE DZIAŁA)

### ✅ DZIAŁA (nie trzeba robić):
1. **Authentication** - signin/signup/reset password
2. **Dashboard** - główna strona z listą raportów
3. **Integrations** - OAuth flow dla Meta i Google Ads (account selection works)
4. **Report Wizard** - 4-step form (account → template → dates → review)
5. **Data Fetching** - Meta Ads API, Google Ads API wrappers działają
6. **AI Integration** - OpenAI/Claude generate insights (backend działa)
7. **Database** - tabele `reports`, `ad_accounts`, `campaigns_data` istnieją

### ⚠️ CZĘŚCIOWO DZIAŁA (trzeba dokończyć):
1. **API `/api/reports/generate`**:
   - ✅ Tworzy rekord w `reports`
   - ✅ Fetchuje dane z Meta/Google
   - ✅ Generuje AI insights
   - ❌ **NIE zapisuje** campaign-level data do `campaigns_data` table
   - **FIX NEEDED:** Dodać wywołanie `bulkCreateCampaignData()` w `processReport()`

### ❌ NIE DZIAŁA (trzeba zbudować):
1. **Report Preview Page** - pokazuje tylko placeholder, brak:
   - Metrics cards (spend, impressions, clicks, CTR, CPC, CPM, ROAS)
   - AI insights display (description + recommendations)
   - Campaigns table (lista kampanii z metrykami)
   - Charts/visualizations

2. **PDF Export** - kompletnie nie istnieje:
   - Brak React-PDF lub jsPDF
   - Brak API route `/api/reports/[id]/pdf`
   - Brak PDF template

3. **Email Sending** - kompletnie nie istnieje:
   - Brak Resend integration
   - Brak email templates
   - Brak API route `/api/reports/[id]/send`

---

## MVP Beta - User Journey (musi działać)

**Krok 1: Connect Account** ✅ DZIAŁA
```
User → /integrations
     → Click "Connect Meta Ads"
     → OAuth flow
     → Select account(s)
     → Success ✅
```

**Krok 2: Create Report** ✅ DZIAŁA (wizard)
```
User → /reports/new
     → Step 1: Select account ✅
     → Step 2: Select template (Leady/Sprzedaż/Zasięg) ✅
     → Step 3: Select date range ✅
     → Step 4: Review & Generate ✅
     → API call to /api/reports/generate ✅
```

**Krok 3: Generate Report** ⚠️ CZĘŚCIOWO
```
Backend:
  ✅ Fetch campaigns from Meta/Google
  ✅ Calculate totals (spend, impressions, clicks)
  ✅ Generate AI insights (description + recommendations)
  ✅ Save to reports table
  ❌ Save campaign-level data to campaigns_data ← FIX NEEDED
```

**Krok 4: View Report** ❌ NIE DZIAŁA
```
User → /reports/[id]
     → ❌ Currently shows placeholder
     → ✅ NEEDS: Metrics cards, AI insights, campaigns table
```

**Krok 5: Export PDF** ❌ NIE DZIAŁA
```
User → Click "Download PDF"
     → ❌ Currently disabled
     → ✅ NEEDS: PDF generation with React-PDF or jsPDF
```

**Krok 6: Share Report** ⏸️ OPTIONAL FOR BETA
```
Option A: Email (NICE TO HAVE)
  → User enters email → Send via Resend

Option B: Link (SIMPLER FOR MVP)
  → User copies link → Shares manually
  → Public report view (no auth required)
```

---

## TASKS - Co trzeba zrobić (priorytet)

### 🔴 CRITICAL (bez tego beta nie działa)

#### **TASK 1: Fix Campaign Data Saving**
**Problem:** Campaign-level data jest fetchowane z API ale NIE jest zapisywane do bazy.

**Solution:**
1. W `/app/api/reports/generate/route.ts` funkcja `processReport()`:
   - Po fetchowaniu `campaignData` z `fetchCampaignData()`
   - **Dodaj:** `await bulkCreateCampaignData(reportId, campaignData.campaigns)`
   - Funkcja już istnieje w `/lib/db/mutations.ts`, tylko nie jest wywołana

**Files to modify:**
- `/app/api/reports/generate/route.ts` (linia ~200, w `processReport()`)

**Acceptance Criteria:**
- [ ] Po wygenerowaniu raportu, tabela `campaigns_data` zawiera rekordy
- [ ] Każdy campaign ma metryki: spend, impressions, clicks, conversions, etc.
- [ ] Foreign key `report_id` jest poprawnie ustawiony

**Estimated Time:** 1h

---

#### **TASK 2: Build Report Preview Page**
**Problem:** `/reports/[id]` page pokazuje tylko placeholder.

**Solution:** Zbudować pełną stronę wyświetlającą raport z:

**2.1 Metrics Cards** (Recharts sparklines optional)
```typescript
// Wyświetl totals z reports table:
- Total Spend (z currency formatting)
- Impressions
- Clicks
- CTR (%)
- CPC (average)
- CPM (average)
- Conversions
- ROAS (jeśli available)
```

**2.2 AI Insights Section**
```typescript
// Wyświetl z reports.ai_description i reports.ai_recommendations
- Description (AI generated human-readable summary)
- Recommendations (AI suggested actions)
```

**2.3 Campaigns Table**
```typescript
// Fetch z campaigns_data table (filtered by report_id)
Columns:
- Campaign Name
- Platform (Meta/Google)
- Spend
- Impressions
- Clicks
- CTR
- Conversions
- ROAS (if applicable)

Features:
- Sortowanie (by spend, clicks, conversions)
- Pagination (if > 20 campaigns)
```

**2.4 Header Section**
```typescript
// Report metadata
- Report name/title
- Platform (Meta Ads / Google Ads)
- Account name
- Date range (from - to)
- Status badge (completed/generating/failed)
- Actions: Download PDF, Share Link, Edit
```

**Files to create/modify:**
- `/app/[locale]/(dashboard)/reports/[id]/page.tsx` (major refactor)
- `/components/reports/report-metrics-cards.tsx` (new)
- `/components/reports/report-ai-insights.tsx` (new)
- `/components/reports/report-campaigns-table.tsx` (new)
- `/lib/db/queries.ts` - add `getCampaignDataByReport(reportId)`

**Design:** Use SnowUI components (Card, Table, Badge) + existing design system.

**Acceptance Criteria:**
- [ ] Metrics cards pokazują totals z poprawnym formatowaniem
- [ ] AI insights są czytelne i sformatowane
- [ ] Campaigns table wyświetla wszystkie kampanie z raportu
- [ ] Table jest sortowalna i paginowana (jeśli > 20 rows)
- [ ] Loading states podczas fetchowania
- [ ] Error states jeśli raport nie istnieje

**Estimated Time:** 8-10h

---

#### **TASK 3: Implement PDF Export**
**Problem:** PDF export kompletnie nie istnieje.

**Solution:** Zaimplementować basic PDF export używając React-PDF.

**3.1 Setup Dependencies**
```bash
npm install @react-pdf/renderer
```

**3.2 Create PDF Template**
```typescript
// /components/reports/pdf-template.tsx
- Header: Report title, date range, logo (optional)
- Metrics Section: Key metrics in table/grid
- AI Insights: Description + Recommendations
- Campaigns Table: Top 10 campaigns by spend
- Footer: Generated by Raply + timestamp
```

**3.3 Create API Route**
```typescript
// /app/api/reports/[id]/pdf/route.ts
GET /api/reports/[id]/pdf

1. Fetch report data from DB
2. Fetch campaigns data from DB
3. Generate PDF using React-PDF
4. Return as blob with proper headers
```

**3.4 Add Download Button**
```typescript
// In /app/[locale]/(dashboard)/reports/[id]/page.tsx
- Button "Download PDF"
- onClick → fetch /api/reports/[id]/pdf
- Download file as "report-{reportId}-{date}.pdf"
```

**Files to create:**
- `/components/reports/pdf-template.tsx` (new)
- `/app/api/reports/[id]/pdf/route.ts` (new)
- Update report detail page with download button

**Design:** Professional, clean, black & white (color optional), A4 format.

**Acceptance Criteria:**
- [ ] PDF contains all key metrics
- [ ] AI insights are included and readable
- [ ] Top campaigns table is included
- [ ] PDF can be downloaded from report page
- [ ] File naming: `raply-report-{date}.pdf`

**Estimated Time:** 6-8h

---

### 🟡 HIGH (ważne ale nie blokujące beta)

#### **TASK 4: Add Public Report Link (Share)**
**Problem:** User nie może sharować raportu bez wysyłki email.

**Solution:** Publiczny link do raportu bez auth.

**4.1 Generate Shareable Token**
```typescript
// Add column to reports table: share_token (UUID)
// Generate on report creation
```

**4.2 Create Public Route**
```typescript
// /app/public/reports/[token]/page.tsx
- No authentication required
- Fetch report by share_token
- Display same view as /reports/[id] but simplified
- Watermark: "Generated by Raply" (branding)
```

**4.3 Copy Link Button**
```typescript
// In report detail page
- Button "Copy Share Link"
- onClick → copy to clipboard: https://raply.com/public/reports/{token}
```

**Acceptance Criteria:**
- [ ] Share link works without login
- [ ] Link expires after 30 days (optional)
- [ ] PDF download works from public page

**Estimated Time:** 4h

---

#### **TASK 5: Email Report Sending (Resend)**
**Problem:** User nie może wysłać raportu emailem.

**Solution:** Integracja z Resend.

**5.1 Setup Resend**
```bash
npm install resend
```

**5.2 Create Email Template**
```typescript
// /components/emails/report-email.tsx (React Email)
- Subject: "Your Advertising Report - {date}"
- Body: Summary + link to view online + PDF attachment
```

**5.3 Create API Route**
```typescript
// /app/api/reports/[id]/send/route.ts
POST /api/reports/[id]/send
Body: { emails: string[] }

1. Validate emails
2. Generate PDF (reuse from TASK 3)
3. Send via Resend with PDF attachment
4. Return success/error
```

**5.4 Add Send Button**
```typescript
// In report detail page
- Button "Send Email"
- Modal: input email addresses (comma separated)
- Submit → call API → show success toast
```

**Acceptance Criteria:**
- [ ] Email wysyłany z PDF attachmentem
- [ ] Email zawiera link do online view
- [ ] Możliwość wysłania do wielu adresów
- [ ] Toast notification po sukcesie/błędzie

**Estimated Time:** 4-5h

---

### 🟢 OPTIONAL (nice to have, ale można skipnąć dla beta)

#### **TASK 6: Add Charts to Report Preview**
Using Recharts (już w dependencies).

**Charts:**
- Spend over time (line chart)
- Impressions vs Clicks (bar chart)
- Top 5 campaigns by ROAS (bar chart)

**Estimated Time:** 3-4h

---

#### **TASK 7: Period Comparison**
Dodać porównanie MoM, WoW.

**Estimated Time:** 5-6h

---

#### **TASK 8: White-label Branding**
Logo upload, color customization.

**Estimated Time:** 6-8h

---

## Timeline i Priorytet Wykonania

### Week 1: Core Functionality (MUST HAVE)
**Day 1:**
- [ ] TASK 1: Fix Campaign Data Saving (1h)
- [ ] Start TASK 2: Report Preview Page (8-10h total)

**Day 2-3:**
- [ ] Finish TASK 2: Report Preview Page
- [ ] Test end-to-end flow (wizard → generate → view)

**Day 4-5:**
- [ ] TASK 3: PDF Export (6-8h)
- [ ] Test PDF download

**End of Week 1 Milestone:**
✅ User może wygenerować raport i zobaczyć metryki + AI insights
✅ User może pobrać PDF

---

### Week 2: Sharing & Polish (NICE TO HAVE)
**Day 1-2:**
- [ ] TASK 4: Public Report Link (4h)
- [ ] TASK 5: Email Sending (4-5h)

**Day 3-5:**
- [ ] Testing z beta users
- [ ] Bug fixes
- [ ] Optional: TASK 6 (Charts) if time allows

**End of Week 2 Milestone:**
✅ Beta-ready product
✅ Users can share reports
✅ Bug fixes done

---

## Success Metrics (jak zmierzymy sukces beta)

**Technical:**
- [ ] 100% raportów generuje się bez błędów
- [ ] Campaign data jest zapisywana do bazy
- [ ] PDF export działa dla wszystkich raportów
- [ ] AI insights generują się w < 10 sekund

**User Experience:**
- [ ] User może wygenerować raport od zera w < 2 minuty
- [ ] Report preview ładuje się w < 2 sekundy
- [ ] PDF download działa w < 5 sekund

**Beta Tester Feedback:**
- [ ] 5+ beta testerów używa apki regularnie
- [ ] 80%+ testerów rozumie co pokazuje raport
- [ ] 0 critical bugs reported w pierwszym tygodniu

---

## Out of Scope (NIE robimy w beta)

❌ Stripe payments (Phase 2)
❌ Automated reports (cron jobs)
❌ Team accounts
❌ CRM module
❌ TikTok/LinkedIn Ads integration
❌ Marketplace templates
❌ Multi-language support
❌ Mobile app
❌ Advanced analytics (trends, anomalies)

**Dlaczego?** Bo to BETA. Cel to zwalidować core value proposition:
- "Czy users potrzebują automated ad reports?"
- "Czy AI insights są pomocne?"
- "Czy PDF export jest wystarczający?"

Po pozytywnym feedbacku z beta → budujemy Phase 2.

---

## Definition of Done

**Beta jest gotowa kiedy:**
1. ✅ User może połączyć Meta Ads account
2. ✅ User może połączyć Google Ads account
3. ✅ User może wygenerować raport (wizard działa)
4. ✅ Raport pokazuje metryki + AI insights
5. ✅ User może pobrać raport jako PDF
6. ✅ BONUS: User może sharować raport linkiem
7. ✅ BONUS: User może wysłać raport emailem
8. ✅ Zero critical bugs w core flow

**Co dostaje beta tester:**
- Darmowe konto (freemium plan: 1 account, 2 reports/month)
- Dostęp do wszystkich core features
- Możliwość feedback przez built-in form lub email

**Timeline:** 2 tygodnie intensywnej pracy = beta ready

---

## Appendix: Obecny Tech Stack (nie zmieniamy)

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS, SnowUI
- **Backend:** Next.js API routes, Supabase (database + auth)
- **AI:** OpenAI (GPT-5) lub Claude (4.5 Haiku)
- **Ads APIs:** Meta Marketing API, Google Ads API v22
- **Email:** Resend (do dodania)
- **PDF:** React-PDF (do dodania)
- **Charts:** Recharts (już jest w deps, do wykorzystania)

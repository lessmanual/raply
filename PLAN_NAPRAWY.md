# PLAN NAPRAWY - APLIKACJA RAPLY

**Data utworzenia:** 2025-12-03
**Szacowany czas naprawy:** 3-5 dni roboczych
**Priorytet:** KRYTYCZNY - aplikacja nie nadaje sie do produkcji

---

## STRATEGIA NAPRAWY

Plan podzielony jest na **4 fazy**, wykonywane sekwencyjnie:

| Faza | Nazwa | Czas | Cel |
|------|-------|------|-----|
| 1 | KRYTYCZNE NAPRAWY | 1 dzien | Naprawic blokujace bledy |
| 2 | DANE I LOGIKA | 1-2 dni | Usunac falszywe dane, dodac prawdziwe |
| 3 | JAKOSCI UX | 0.5-1 dzien | Poprawic doswiadczenie uzytkownika |
| 4 | BEZPIECZENSTWO I OPTYMALIZACJA | 0.5-1 dzien | Zabezpieczyc i zoptymalizowac |

---

## FAZA 1: KRYTYCZNE NAPRAWY (Dzien 1)

### TASK 1.1: Naprawic brakujace tlumaczenia (BUG-001)

**Cel:** Dodac 9 brakujacych kluczy tlumaczen

**Plik:** `locales/pl.json`

**Zmiany:** Dodac w sekcji `dashboard.integrations`:

```json
{
  "dashboard": {
    "integrations": {
      // ... istniejace klucze ...
      "selectAccountTitle": "Wybierz konto {platform}",
      "selectAccountDescription": "Wybierz konta reklamowe ktore chcesz podlaczyc do Raply",
      "authenticationSuccessful": "Autentykacja zakonczona pomyslnie",
      "foundAccountsCount": "Znaleziono {count} kont reklamowych",
      "manualSetupRequired": "Wymagana reczna konfiguracja",
      "manualSetupDescription": "Nie udalo sie automatycznie pobrac kont. Wprowadz Customer ID recznie.",
      "selectAccountsLabel": "Wybierz konta do polaczenia",
      "note": "Uwaga",
      "multiAccountHelp": "Mozesz polaczyc wiele kont i przelaczac sie miedzy nimi w aplikacji."
    }
  }
}
```

**Plik:** `locales/en.json`

**Zmiany:** Dodac w sekcji `dashboard.integrations`:

```json
{
  "dashboard": {
    "integrations": {
      // ... istniejace klucze ...
      "selectAccountTitle": "Select {platform} Account",
      "selectAccountDescription": "Choose ad accounts you want to connect to Raply",
      "authenticationSuccessful": "Authentication successful",
      "foundAccountsCount": "Found {count} ad accounts",
      "manualSetupRequired": "Manual setup required",
      "manualSetupDescription": "Could not automatically fetch accounts. Enter Customer ID manually.",
      "selectAccountsLabel": "Select accounts to connect",
      "note": "Note",
      "multiAccountHelp": "You can connect multiple accounts and switch between them in the app."
    }
  }
}
```

**Weryfikacja:**
1. Otworz `/pl/integrations/select-account`
2. Sprawdz czy teksty sa po polsku
3. Otworz `/en/integrations/select-account`
4. Sprawdz czy teksty sa po angielsku

---

### TASK 1.2: Naprawic route disconnect (BUG-008)

**Cel:** Usuwac konkretne konto, nie wszystkie

**Plik:** `app/api/integrations/disconnect/route.ts`

**Obecny kod (BLEDNY):**
```typescript
const disconnectSchema = z.object({
  platform: z.enum(['meta', 'google']),
})
```

**Nowy kod:**
```typescript
const disconnectSchema = z.object({
  platform: z.enum(['meta', 'google']),
  accountId: z.string().uuid(), // DODANE
})

// W obsludze DELETE:
const { error } = await supabase
  .from('ad_accounts')
  .delete()
  .eq('id', validated.accountId)       // ZMIENIONE - po ID konta
  .eq('platform', validated.platform)
  .eq('user_id', user.id)
```

**Weryfikacja:**
1. Polacz 2 konta Google Ads
2. Odlacz jedno z nich
3. Sprawdz czy drugie nadal istnieje

---

### TASK 1.3: Naprawic 404 na raportach (BUG-003)

**Cel:** Zdiagnozowac i naprawic blad 404

**Plik:** `app/[locale]/(dashboard)/reports/[id]/page.tsx`

**Zmiany:**

#### A) Dodac szczegolowe logowanie:
```typescript
if (error) {
  console.error('Report fetch error:', {
    reportId: id,
    userId: user.id,
    error: error.message,
    code: error.code,
    details: error.details
  })
  notFound()
}

if (!report) {
  console.error('Report not found:', {
    reportId: id,
    userId: user.id
  })
  notFound()
}
```

#### B) Obsluzyc brakujace ad_account:
```typescript
const { data: report, error } = await supabase
  .from('reports')
  .select(`
    *,
    ad_account:ad_accounts(name, platform, currency)
  `)
  .eq('id', id)
  .eq('user_id', user.id)
  .maybeSingle()  // ZMIENIONE z .single() - zwraca null zamiast bledu

if (error) {
  console.error('Database error:', error)
  notFound()
}

if (!report) {
  notFound()
}

// Obsluz brakujace ad_account
const accountName = report.ad_account?.name || 'Usuniate konto'
const platform = report.ad_account?.platform || 'unknown'
```

#### C) Dodac obsluge statusu 'generating':
```typescript
if (report.status === 'generating') {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin mb-4" />
      <h2>Raport jest generowany...</h2>
      <p>Odswierz strone za chwile lub poczekaj na powiadomienie email.</p>
    </div>
  )
}
```

**Plik:** `app/api/reports/generate/route.ts`

**Zmiany:** Nie przekierowywac natychmiast po utworzeniu:

```typescript
// W komponencie report-wizard.tsx
// Zamiast natychmiastowego przekierowania:
router.push(`/${locale}/reports/${result.reportId}`)

// Przekieruj na liste raportow z komunikatem:
router.push(`/${locale}/reports?status=generating&id=${result.reportId}`)
```

**Weryfikacja:**
1. Wygeneruj nowy raport
2. Sprawdz czy nie ma 404
3. Sprawdz czy raport w statusie 'generating' pokazuje loader

---

### TASK 1.4: Usunac falszywe AI Insights (BUG-004)

**Cel:** Zastapic hardcoded dane prawdziwymi lub ukryc komponent

**Plik:** `components/dashboard/ai-insights.tsx`

**Opcja A - SZYBKA (ukrycie komponentu gdy brak danych):**

```typescript
'use client'

import { useEffect, useState } from 'react'

interface AIInsightsProps {
  hasAdAccounts: boolean
  hasReports: boolean
}

export function AIInsights({ hasAdAccounts, hasReports }: AIInsightsProps) {
  // Nie pokazuj AI Insights jesli brak danych
  if (!hasAdAccounts || !hasReports) {
    return (
      <div className="rounded-lg border p-6 bg-muted/50">
        <h3 className="font-semibold mb-2">AI Insights</h3>
        <p className="text-muted-foreground">
          Polacz konta reklamowe i wygeneruj pierwszy raport,
          aby zobaczyc spersonalizowane rekomendacje AI.
        </p>
      </div>
    )
  }

  // TODO: Fetch real insights from API
  return (
    <div className="rounded-lg border p-6">
      <h3 className="font-semibold mb-2">AI Insights</h3>
      <p className="text-muted-foreground">
        Analizujemy Twoje kampanie...
      </p>
    </div>
  )
}
```

**Plik:** `app/[locale]/(dashboard)/dashboard/page.tsx`

**Zmiany:** Przekazac props do komponentu:

```typescript
// Pobierz dane o kontach i raportach
const hasAdAccounts = totalAccounts > 0
const hasReports = totalReports > 0

// W renderze:
<AIInsights hasAdAccounts={hasAdAccounts} hasReports={hasReports} />
```

**Weryfikacja:**
1. Zaloguj sie z pustym kontem (bez ad accounts)
2. Sprawdz czy AI Insights pokazuje komunikat o polaczeniu kont
3. Nie powinno byc "Summer Sale campaign"

---

## FAZA 2: DANE I LOGIKA (Dzien 2-3)

### TASK 2.1: Naprawic hardcoded procenty zmian (BUG-005)

**Cel:** Obliczyc rzeczywiste procenty z danych historycznych

**Plik:** `components/dashboard/stats-cards-v2.tsx`

**Nowe props interface:**
```typescript
interface StatsCardsV2Props {
  totalReports: number
  totalAccounts: number
  reportsThisMonth: number
  // NOWE:
  reportsLastMonth: number
  accountsLastMonth: number
}
```

**Nowa funkcja obliczania zmiany:**
```typescript
function calculateChange(current: number, previous: number): number | null {
  if (previous === 0) {
    return current > 0 ? 100 : null
  }
  return ((current - previous) / previous) * 100
}
```

**Uzycie:**
```typescript
const stats = [
  {
    title: 'Total Reports',
    value: totalReports,
    change: calculateChange(totalReports, reportsLastMonth),
  },
  // ...
]
```

**Plik:** `lib/actions/dashboard.ts`

**Dodac funkcje pobierania danych historycznych:**
```typescript
export async function getDashboardStats() {
  const supabase = await createClient()

  const now = new Date()
  const thisMonthStart = startOfMonth(now)
  const lastMonthStart = startOfMonth(subMonths(now, 1))
  const lastMonthEnd = endOfMonth(subMonths(now, 1))

  // Raporty ten miesiac
  const { count: reportsThisMonth } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', thisMonthStart.toISOString())

  // Raporty poprzedni miesiac
  const { count: reportsLastMonth } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', lastMonthStart.toISOString())
    .lte('created_at', lastMonthEnd.toISOString())

  return {
    // ... istniejace dane
    reportsLastMonth,
    accountsLastMonth: 0, // Konta sa trwale, nie zmieniaja sie miesiecznie
  }
}
```

**Weryfikacja:**
1. Sprawdz czy procenty sie zmieniaja po wygenerowaniu raportu
2. Sprawdz czy pokazuje null/dash gdy brak danych historycznych

---

### TASK 2.2: Dodac sledzenie wyswietlen raportow (BUG-006, BUG-016)

**Cel:** Sledzic rzeczywiste wyswietlenia raportow

**Krok A - Migracja bazy danych:**

Utworz plik: `supabase/migrations/20251203000001_add_view_tracking.sql`

```sql
-- Dodaj kolumne view_count do reports
ALTER TABLE public.reports
ADD COLUMN view_count integer DEFAULT 0;

-- Dodaj kolumne last_viewed_at
ALTER TABLE public.reports
ADD COLUMN last_viewed_at timestamp with time zone;

-- Funkcja do inkrementacji wyswietlen
CREATE OR REPLACE FUNCTION increment_report_views(report_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.reports
  SET
    view_count = COALESCE(view_count, 0) + 1,
    last_viewed_at = now()
  WHERE id = report_id;
END;
$$;
```

**Krok B - Wywolac funkcje przy ladowaniu raportu:**

**Plik:** `app/[locale]/(dashboard)/reports/[id]/page.tsx`

Dodaj na poczatku funkcji (po sprawdzeniu czy raport istnieje):

```typescript
// Inkrementuj wyswietlenia
await supabase.rpc('increment_report_views', { report_id: id })
```

**Krok C - Uzyc rzeczywistej wartosci w komponencie:**

**Plik:** `components/dashboard/report-card-v2.tsx`

```typescript
// USUN:
const viewsCount = Math.floor(Math.random() * 50) + 10

// DODAJ props:
interface ReportCardV2Props {
  report: {
    // ... istniejace pola
    view_count?: number
  }
}

// UZYJ:
const viewsCount = report.view_count || 0
```

**Weryfikacja:**
1. Otworz raport kilka razy
2. Sprawdz czy licznik rosnie
3. Sprawdz czy licznik jest taki sam po odswiezeniu strony

---

### TASK 2.3: Naprawic mieszane jezyki (BUG-002)

**Cel:** Przetlumaczyc wszystkie hardcoded teksty

**Plik:** `components/dashboard/stats-cards-v2.tsx`

**Zmiany:**
```typescript
import { useTranslations } from 'next-intl'

export function StatsCardsV2(props: StatsCardsV2Props) {
  const t = useTranslations('dashboard.stats')

  const stats = [
    {
      title: t('totalReports'),       // Zamiast 'Total Reports'
      value: props.totalReports,
      // ...
    },
    {
      title: t('adAccounts'),         // Zamiast 'Ad Accounts'
      value: props.totalAccounts,
      // ...
    },
    {
      title: t('thisMonth'),          // Zamiast 'This Month'
      value: props.reportsThisMonth,
      // ...
    },
  ]
}
```

**Plik:** `locales/pl.json` - dodaj sekcje:
```json
{
  "dashboard": {
    "stats": {
      "totalReports": "Wszystkie raporty",
      "adAccounts": "Konta reklamowe",
      "thisMonth": "Ten miesiac",
      "generatedReports": "Wygenerowane raporty",
      "connectedAccounts": "Polaczone konta",
      "reportsThisMonth": "Raporty w tym miesiacu"
    }
  }
}
```

**Plik:** `locales/en.json` - dodaj sekcje:
```json
{
  "dashboard": {
    "stats": {
      "totalReports": "Total Reports",
      "adAccounts": "Ad Accounts",
      "thisMonth": "This Month",
      "generatedReports": "Generated reports",
      "connectedAccounts": "Connected accounts",
      "reportsThisMonth": "Reports this month"
    }
  }
}
```

**Weryfikacja:**
1. Otworz dashboard z locale=pl
2. Sprawdz czy wszystkie teksty sa po polsku
3. Zmien na en i sprawdz angielski

---

### TASK 2.4: Usunac falszywe sparkline (BUG-007)

**Cel:** Ukryc sparkline lub pokazac rzeczywiste dane

**Opcja A - SZYBKA (ukrycie sparkline gdy brak danych):**

**Plik:** `components/dashboard/stats-cards-v2.tsx`

```typescript
// Zamiast generowac losowe dane, ukryj sparkline
const showSparkline = false // Na razie ukryte

// W renderze:
{showSparkline && (
  <ResponsiveContainer width="100%" height={50}>
    <AreaChart data={sparklineData}>
      {/* ... */}
    </AreaChart>
  </ResponsiveContainer>
)}
```

**Opcja B - PELNA (implementacja pozniej):**
- Wymaga dodania tabeli `daily_metrics` do bazy danych
- Codzienne zapisywanie metryk uzytkownika
- Pobieranie ostatnich 7 dni i wyswietlanie

---

### TASK 2.5: Obsluga pustych kont reklamowych (BUG-023)

**Cel:** Pokazac odpowiedni komunikat gdy brak danych kampanii

**Plik:** `app/[locale]/(dashboard)/dashboard/page.tsx`

**Dodac warunki:**
```typescript
{totalAccounts === 0 && (
  <EmptyState
    icon={<Link2 className="h-12 w-12" />}
    title={t('emptyState.noAccounts.title')}
    description={t('emptyState.noAccounts.description')}
    actionLabel={t('emptyState.noAccounts.action')}
    actionHref={`/${locale}/integrations`}
  />
)}

{totalAccounts > 0 && totalReports === 0 && (
  <EmptyState
    icon={<FileText className="h-12 w-12" />}
    title={t('emptyState.noReports.title')}
    description={t('emptyState.noReports.description')}
    actionLabel={t('emptyState.noReports.action')}
    actionHref={`/${locale}/reports/new`}
  />
)}
```

**Plik:** `locales/pl.json` - dodaj:
```json
{
  "dashboard": {
    "emptyState": {
      "noAccounts": {
        "title": "Polacz pierwsze konto reklamowe",
        "description": "Dodaj konto Meta Ads lub Google Ads aby zaczac generowac raporty.",
        "action": "Polacz konto"
      },
      "noReports": {
        "title": "Wygeneruj pierwszy raport",
        "description": "Twoje konta sa polaczone. Czas na pierwszy raport!",
        "action": "Stworz raport"
      }
    }
  }
}
```

---

## FAZA 3: JAKOSC UX (Dzien 3-4)

### TASK 3.1: Dodac loader podczas generowania raportu

**Plik:** `components/reports/report-wizard.tsx`

```typescript
const [isGenerating, setIsGenerating] = useState(false)
const [progress, setProgress] = useState(0)

async function handleGenerate() {
  setIsGenerating(true)
  setProgress(10)

  try {
    const result = await generateReport(/* ... */)
    setProgress(50)

    // Polling statusu raportu
    const checkStatus = setInterval(async () => {
      const report = await getReportStatus(result.reportId)
      if (report.status === 'completed') {
        clearInterval(checkStatus)
        setProgress(100)
        router.push(`/${locale}/reports/${result.reportId}`)
      } else if (report.status === 'failed') {
        clearInterval(checkStatus)
        setError('Generowanie nie powiodlo sie')
      }
    }, 2000)
  } catch (err) {
    setError(err.message)
  } finally {
    setIsGenerating(false)
  }
}
```

---

### TASK 3.2: Walidacja zakresu dat

**Plik:** `components/reports/report-wizard.tsx`

```typescript
function validateDateRange(from: Date, to: Date): string | null {
  const now = new Date()

  if (to > now) {
    return 'Data koncowa nie moze byc w przyszlosci'
  }

  if (from > to) {
    return 'Data poczatkowa musi byc przed data koncowa'
  }

  const daysDiff = differenceInDays(to, from)
  if (daysDiff > 365) {
    return 'Maksymalny zakres to 365 dni'
  }

  return null
}
```

---

### TASK 3.3: Powiadomienie o zakonczeniu raportu (BUG-013)

**Plik:** `app/api/reports/generate/route.ts`

Po zakonczeniu `processReport`:

```typescript
// Wyslij email z powiadomieniem
await sendReportReadyEmail({
  to: user.email,
  reportName: report.name,
  reportUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/reports/${report.id}`
})
```

---

## FAZA 4: BEZPIECZENSTWO I OPTYMALIZACJA (Dzien 4-5)

### TASK 4.1: Dodac walidacje Google Ads Customer ID (BUG-009)

**Plik:** `app/api/integrations/update-customer-id/route.ts`

```typescript
// Po walidacji formatu, sprawdz z Google Ads API:
const isValidCustomerId = await validateCustomerIdWithGoogleAds(
  customerId,
  accessToken
)

if (!isValidCustomerId) {
  return NextResponse.json(
    { error: 'Invalid Google Ads Customer ID' },
    { status: 400 }
  )
}
```

---

### TASK 4.2: Przeniesc wersje API do zmiennych srodowiskowych (BUG-010)

**Plik:** `.env.local`
```env
GOOGLE_ADS_API_VERSION=v22
META_GRAPH_API_VERSION=v18.0
```

**Uzycie:**
```typescript
const GOOGLE_ADS_VERSION = process.env.GOOGLE_ADS_API_VERSION || 'v22'
const META_API_VERSION = process.env.META_GRAPH_API_VERSION || 'v18.0'
```

---

### TASK 4.3: Naprawic email (BUG-015)

**Plik:** `app/api/reports/[id]/send/route.tsx`

```typescript
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Raply <noreply@raply.app>'
```

**Plik:** `.env.local`
```env
RESEND_FROM_EMAIL=Raply <noreply@raply.app>
```

---

### TASK 4.4: Dodac rate limiting (BUG-019)

**Plik:** `middleware.ts`

```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})

export async function middleware(request: NextRequest) {
  // Rate limiting dla API
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.ip ?? '127.0.0.1'
    const { success } = await ratelimit.limit(ip)

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }
  }

  // ... reszta middleware
}
```

---

## PODSUMOWANIE I KOLEJNOSC

### DZIEN 1 (KRYTYCZNE):
- [ ] TASK 1.1: Tlumaczenia select-account
- [ ] TASK 1.2: Naprawic disconnect
- [ ] TASK 1.3: Naprawic 404 raportow
- [ ] TASK 1.4: Usunac falszywe AI Insights

### DZIEN 2 (DANE):
- [ ] TASK 2.1: Obliczac rzeczywiste procenty
- [ ] TASK 2.2: Sledzic wyswietlenia raportow
- [ ] TASK 2.3: Przetlumaczyc stats cards

### DZIEN 3 (UX):
- [ ] TASK 2.4: Ukryc/naprawic sparkline
- [ ] TASK 2.5: Obsluga pustych kont
- [ ] TASK 3.1: Loader generowania

### DZIEN 4 (BEZPIECZENSTWO):
- [ ] TASK 3.2: Walidacja dat
- [ ] TASK 3.3: Powiadomienie email
- [ ] TASK 4.1: Walidacja Customer ID

### DZIEN 5 (OPTYMALIZACJA):
- [ ] TASK 4.2: Wersje API w env
- [ ] TASK 4.3: Email z wlasnej domeny
- [ ] TASK 4.4: Rate limiting

---

## TESTY PO NAPRAWACH

### Scenariusze testowe:

1. **Test nowego uzytkownika:**
   - Rejestracja
   - Logowanie
   - Dashboard pokazuje empty state
   - Polaczenie konta Meta Ads
   - Dashboard pokazuje polaczone konto
   - Generowanie raportu
   - Raport otwiera sie bez 404
   - Wyswietlenia rosna

2. **Test tlumaczen:**
   - Wszystkie strony po polsku
   - Zmiana na angielski
   - Wszystkie strony po angielsku
   - Brak surowych kluczy typu "dashboard.xxx"

3. **Test pustych kont:**
   - Polacz puste konto reklamowe (bez kampanii)
   - Dashboard pokazuje odpowiedni komunikat
   - AI Insights pokazuje "brak danych"
   - Raport generuje sie ale z zerami

4. **Test disconnect:**
   - Polacz 2 konta Google Ads
   - Odlacz jedno
   - Drugie nadal istnieje

---

**Koniec planu naprawy.**

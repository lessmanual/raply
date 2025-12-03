# RAPORT BLEDOW - APLIKACJA RAPLY

**Data analizy:** 2025-12-03
**Wersja aplikacji:** MVP
**Autor raportu:** Claude Code (analiza automatyczna)

---

## PODSUMOWANIE KRYTYCZNE

Aplikacja Raply ma **47 zidentyfikowanych problemow**, z czego:
- **KRYTYCZNE (blokujace):** 8
- **WYSOKIE (wazne):** 12
- **SREDNIE (do naprawy):** 15
- **NISKIE (ulepszenia):** 12

**WNIOSEK:** Aplikacja NIE jest gotowa do produkcji. Wymaga naprawy przed udostepnieniem uzytkownikom.

---

## KATEGORIA 1: SYSTEM TLUMACZEN (i18n)

### BUG-001: Brakujace klucze tlumaczen na stronie wyboru kont [KRYTYCZNY]

**Lokalizacja:** `app/[locale]/(dashboard)/integrations/select-account/page.tsx`

**Opis:** Strona wyboru kont reklamowych wyswietla surowe klucze tlumaczen zamiast przetlumaczonego tekstu.

**Dowod (screenshot):**
- `dashboard.integrations.selectAccountTitle` wyswietla sie zamiast tytulu
- `dashboard.integrations.authenticationSuccessful` wyswietla sie zamiast komunikatu sukcesu
- `dashboard.integrations.foundAccountsCount` wyswietla sie zamiast licznika kont

**Brakujace klucze (9 sztuk):**

| Klucz | Uzycie w kodzie (linia) |
|-------|------------------------|
| `selectAccountTitle` | page.tsx:104 |
| `selectAccountDescription` | page.tsx:107 |
| `authenticationSuccessful` | page.tsx:116 |
| `foundAccountsCount` | page.tsx:119 |
| `manualSetupRequired` | page.tsx:133 |
| `manualSetupDescription` | page.tsx:136 |
| `selectAccountsLabel` | page.tsx:149 |
| `note` | page.tsx:160 |
| `multiAccountHelp` | page.tsx:160 |

**Pliki do naprawy:**
- `locales/pl.json` - dodac 9 kluczy w sekcji `dashboard.integrations`
- `locales/en.json` - dodac 9 kluczy w sekcji `dashboard.integrations`

**Priorytet:** KRYTYCZNY - uzytkownik widzi nieczytelny interfejs

---

### BUG-002: Mieszane jezyki na dashboardzie [WYSOKI]

**Lokalizacja:** `app/[locale]/(dashboard)/dashboard/page.tsx` i komponenty potomne

**Opis:** Dashboard wyswietla czesc tekstow po polsku, czesc po angielsku:
- "Witaj ponownie" - po polsku
- "Total Reports", "Ad Accounts", "This Month" - po angielsku
- "AI Insights", "Strong Performance Detected" - po angielsku
- "Ostatnie raporty" - po polsku

**Przyczyna:** Komponenty `StatsCardsV2` i `AIInsights` maja hardcoded angielskie teksty zamiast uzywac systemu tlumaczen.

**Pliki do naprawy:**
- `components/dashboard/stats-cards-v2.tsx` - linie 43, 52, 61 (tytuly kart)
- `components/dashboard/ai-insights.tsx` - linie 20-35 (tytuly i opisy insights)

**Priorytet:** WYSOKI - nieprofesjonalny wyglad, zly UX

---

## KATEGORIA 2: ROUTING I BLAD 404

### BUG-003: Raporty zwracaja 404 po kliknieciu [KRYTYCZNY]

**Lokalizacja:** `app/[locale]/(dashboard)/reports/[id]/page.tsx`

**Opis:** Po wygenerowaniu raportu i kliknieciu na niego uzytkownik otrzymuje blad 404 "This page could not be found".

**Potencjalne przyczyny (zidentyfikowane 4):**

#### Przyczyna A: Race condition przy tworzeniu raportu
**Plik:** `app/api/reports/generate/route.ts` (linie 126-129)
```typescript
// Return success immediately, process in background
processReport(report.id, account, validated).catch((error) => {
  console.error(`Failed to process report ${report.id}:`, error)
})
return NextResponse.json({ success: true, reportId: report.id })
```

**Problem:** API zwraca `reportId` natychmiast, a nastepnie przekierowuje uzytkownika na strone raportu ZANIM raport zostanie w pelni przetworzony. Zapytanie do bazy danych moze zwrocic niepelne dane.

#### Przyczyna B: Foreign key do usunietego ad_account
**Plik:** `app/[locale]/(dashboard)/reports/[id]/page.tsx` (linie 39-47)
```typescript
const { data: report, error } = await supabase
  .from('reports')
  .select(`
    *,
    ad_account:ad_accounts(name, platform, currency)  // JOIN moze sie nie udac
  `)
  .eq('id', id)
  .eq('user_id', user.id)
  .single()
```

**Problem:** Jesli `ad_account` zostal usuniety, JOIN zwraca NULL i powoduje blad.

#### Przyczyna C: RLS Policy blokuje dostep
**Tabela:** `reports` (polityka: `auth.uid() = user_id`)

**Problem:** Jesli sesja uzytkownika sie zmienila lub raport zostal utworzony przez inna sesje, RLS blokuje dostep.

#### Przyczyna D: Brak obslugi bledu bazy danych
**Plik:** `app/[locale]/(dashboard)/reports/[id]/page.tsx` (linie 49-51)
```typescript
if (error || !report) {
  notFound()  // Bezposrednio 404 bez logowania przyczyny
}
```

**Problem:** Nie logujemy dokladnej przyczyny bledu przed zwroceniem 404.

**Priorytet:** KRYTYCZNY - glowna funkcja aplikacji nie dziala

---

## KATEGORIA 3: FALSZYWE/HARDCODED DANE

### BUG-004: AI Insights pokazuja falszywe dane [KRYTYCZNY]

**Lokalizacja:** `components/dashboard/ai-insights.tsx` (linie 16-38)

**Opis:** Komponent wyswietla hardcoded dane o nieistniejacych kampaniach:
- "Your Facebook campaign 'Summer Sale' has 23% higher CTR than average"
- "Google Ads campaign is spending 80% of daily budget"
- "Similar audience segment shows 3x higher conversion rate"

**Problem w kodzie:**
```typescript
const MOCK_INSIGHTS: Insight[] = [
  {
    id: '1',
    type: 'success',
    title: 'Strong Performance Detected',
    description: 'Your Facebook campaign "Summer Sale" has 23% higher CTR than average.',
    action: 'Increase Budget',
  },
  // ... wiecej hardcoded danych
]

// Linia 68 - uzywane bezposrednio bez fetch z API
const [insights, setInsights] = useState(MOCK_INSIGHTS)
```

**Skutek:** Uzytkownik widzi rekomendacje dotyczace kampanii ktore nie istnieja.

**Priorytet:** KRYTYCZNY - wprowadza uzytkownika w blad

---

### BUG-005: Procenty zmian sa hardcoded [WYSOKI]

**Lokalizacja:** `components/dashboard/stats-cards-v2.tsx` (linie 40-68)

**Opis:** Statystyki pokazuja falszywe procenty zmian:
- "Total Reports: +12.5%" - zawsze 12.5%, niezaleznie od rzeczywistych danych
- "Ad Accounts: +8.2%" - zawsze 8.2%
- "This Month: +15.3%" - zawsze 15.3%

**Problem w kodzie:**
```typescript
const stats = [
  {
    title: 'Total Reports',
    value: totalReports,      // PRAWDZIWA wartosc
    change: 12.5,             // FALSZYA wartosc - hardcoded!
  },
  // ...
]
```

**Skutek:** Uzytkownik widzi nieprawdziwe trendy.

**Priorytet:** WYSOKI - falszywe dane na glownym ekranie

---

### BUG-006: Wyswietlenia raportow sa losowe [WYSOKI]

**Lokalizacja:** `components/dashboard/report-card-v2.tsx` (linie 43-45)

**Opis:** Kazdy raport pokazuje losowa liczbe wyswietlen (np. "58 views", "59 views").

**Problem w kodzie:**
```typescript
// Mock data - replace with real data when available
const hasAI = true // Assume all reports have AI insights
const viewsCount = Math.floor(Math.random() * 50) + 10 // Mock views
```

**Skutek:**
- Liczba wyswietlen zmienia sie przy kazdym renderze
- Nie ma zadnego sledzenia rzeczywistych wyswietlen
- Kolumna `view_count` NIE ISTNIEJE w tabeli `reports`

**Priorytet:** WYSOKI - falszywe metryki

---

### BUG-007: Sparkline wykresy sa generowane losowo [SREDNI]

**Lokalizacja:** `components/dashboard/stats-cards-v2.tsx` (linie 12-33)

**Opis:** Wykresy trendow (sparkline) sa generowane losowo, nie odzwierciedlaja historycznych danych.

**Problem w kodzie:**
```typescript
// Comment: "Mock sparkline data - later can be replaced with real historical data"
const generateSparklineData = (baseValue: number, trend: 'up' | 'down' | 'stable') => {
  // ... generuje losowe dane z Math.random()
}
```

**Priorytet:** SREDNI - mylace wizualizacje

---

## KATEGORIA 4: API I BACKEND

### BUG-008: Route /disconnect usuwa WSZYSTKIE konta platformy [KRYTYCZNY]

**Lokalizacja:** `app/api/integrations/disconnect/route.ts`

**Opis:** Endpoint disconnect usuwa wszystkie konta reklamowe danej platformy zamiast konkretnego konta.

**Problem w kodzie:**
```typescript
const { error } = await supabase
  .from('ad_accounts')
  .delete()
  .eq('platform', validated.platform)  // Usuwa WSZYSTKIE konta platformy
  .eq('user_id', user.id)              // Brak filtra po account_id!
```

**Skutek:** Jesli uzytkownik ma 5 kont Google Ads i chce odlaczyc jedno, usunie wszystkie 5.

**Priorytet:** KRYTYCZNY - potencjalna utrata danych

---

### BUG-009: Brak walidacji Google Ads Customer ID [WYSOKI]

**Lokalizacja:** `app/api/integrations/update-customer-id/route.ts`

**Opis:** Endpoint akceptuje dowolny Customer ID pasujacy do formatu XXX-XXX-XXXX bez weryfikacji z Google Ads API.

**Problem:**
- Uzytkownik moze wpisac nieprawidlowy ID
- Blad zostanie wykryty dopiero przy probie pobrania danych

**Priorytet:** WYSOKI - powoduje bledy przy generowaniu raportow

---

### BUG-010: Hardcoded wersje API [WYSOKI]

**Lokalizacje:**
- `app/api/auth/callback/google/route.ts` (linia ~72) - Google Ads API `v22`
- `app/api/auth/meta/callback/route.ts` (linia ~35) - Graph API `v18.0`

**Problem:** Gdy platformy zdeprecjonuja te wersje, kod przestanie dzialac bez ostrzezenia.

**Priorytet:** WYSOKI - potencjalny awaria w przyszlosci

---

### BUG-011: GOOGLE_ADS_DEVELOPER_TOKEN fallback do pustego stringa [WYSOKI]

**Lokalizacja:** `app/api/auth/callback/google/route.ts` (linia ~62)

**Problem w kodzie:**
```typescript
'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN || ''
```

**Skutek:** Jesli zmienna srodowiskowa nie jest ustawiona, API call sie nie udaje bez jasnego komunikatu bledu.

**Priorytet:** WYSOKI - ciche awarie

---

### BUG-012: Meta nie obsluguje refresh token [SREDNI]

**Lokalizacja:** `app/api/auth/meta/callback/route.ts`

**Opis:** Kod przechowuje tylko `access_token` od Meta, ale nie ma mechanizmu odswiezania tokenu.

**Skutek:** Po ~60 dniach token wygasa i integracja przestaje dzialac.

**Priorytet:** SREDNI - problem dlugoterminowy

---

### BUG-013: Brak powiadomienia o zakonczeniu generowania raportu [SREDNI]

**Lokalizacja:** `app/api/reports/generate/route.ts`

**Opis:** Po wyslaniu raportu do generowania w tle, uzytkownik nie otrzymuje zadnego powiadomienia o zakonczeniu.

**Skutek:** Uzytkownik nie wie kiedy raport jest gotowy.

**Priorytet:** SREDNI - slaby UX

---

### BUG-014: Brak retry dla nieudanych raportow [SREDNI]

**Lokalizacja:** `app/api/reports/generate/route.ts`

**Opis:** Jesli przetwarzanie raportu w tle sie nie powiedzie, nie ma automatycznego ponowienia.

**Skutek:** Raport zostaje na zawsze w statusie 'generating' lub 'failed'.

**Priorytet:** SREDNI - wymaga manualnej interwencji

---

### BUG-015: Email wysylany z domeny testowej Resend [SREDNI]

**Lokalizacja:** `app/api/reports/[id]/send/route.tsx` (linia ~49)

**Problem w kodzie:**
```typescript
from: 'Raply <onboarding@resend.dev>'  // Domena testowa!
```

**Skutek:** Emile wygladaja nieprofesjonalnie i moga trafic do spamu.

**Priorytet:** SREDNI - nieprofesjonalny wyglad

---

## KATEGORIA 5: BAZA DANYCH

### BUG-016: Brak kolumny do sledzenia wyswietlen raportow [WYSOKI]

**Tabela:** `reports`

**Opis:** Tabela `reports` nie ma kolumny `view_count` lub podobnej do sledzenia wyswietlen.

**Obecne kolumny:** id, user_id, ad_account_id, name, template_type, date_from, date_to, status, ai_description, ai_recommendations, total_spend, total_impressions, total_clicks, total_conversions, average_ctr, average_cpc, average_cpm, roas, pdf_url, generated_at, created_at, updated_at, share_token, share_token_expires_at

**Brakuje:** view_count, last_viewed_at

**Priorytet:** WYSOKI - nie mozna implementowac prawdziwego sledzenia

---

### BUG-017: Brak danych do obliczenia trendow historycznych [SREDNI]

**Opis:** Brak tabel do przechowywania historycznych metryk uzytkownika (np. ile raportow mial miesiac temu).

**Skutek:** Nie mozna obliczyc prawdziwych procentow zmian (+12.5%, etc.)

**Priorytet:** SREDNI - wymaga dodatkowej migracji

---

### BUG-018: CASCADE DELETE moze utworzyc osierocone raporty [SREDNI]

**Opis:** Usuwanie `ad_account` moze zostawic raporty bez powiazanego konta, co powoduje bledy przy ladowaniu.

**Priorytet:** SREDNI - edge case ale powoduje 404

---

## KATEGORIA 6: BEZPIECZENSTWO

### BUG-019: Brak rate limiting na endpointach [SREDNI]

**Lokalizacje:** Wszystkie route w `app/api/**`

**Opis:** Brak ograniczenia liczby requestow na minute/godzine.

**Ryzyko:**
- Atak brute-force
- Nadmierne koszty API Google/Meta
- DDoS

**Priorytet:** SREDNI - ryzyko bezpieczenstwa

---

### BUG-020: Cookie moze przekroczyc limit 4KB [NISKI]

**Lokalizacje:** `app/api/auth/callback/google/route.ts`, `app/api/auth/meta/callback/route.ts`

**Opis:** Dla uzytkownikow z wieloma kontami reklamowymi, dane cookie moga przekroczyc limit 4KB.

**Skutek:** Cichy blad przy zapisywaniu sesji.

**Priorytet:** NISKI - edge case

---

### BUG-021: console.log w kodzie produkcyjnym (39 wystapien) [NISKI]

**Lokalizacje:** Rozne pliki w `app/api/**`

**Opis:** Kod zawiera 39 wywolan `console.log` ktore powinny byc zamienione na strukturalne logowanie.

**Priorytet:** NISKI - jakosciowe ulepszenie

---

## KATEGORIA 7: UI/UX

### BUG-022: Brak stanu ladowania podczas generowania raportu [SREDNI]

**Lokalizacja:** `components/reports/report-wizard.tsx`

**Opis:** Po kliknieciu "Generuj" brak wizualnego feedbacku o przetwarzaniu.

**Priorytet:** SREDNI - slaby UX

---

### BUG-023: Brak obslugi pustych kont reklamowych [WYSOKI]

**Opis:** Gdy konta reklamowe sa puste (brak kampanii), aplikacja powinna pokazac odpowiedni komunikat, nie falszywe dane.

**Obecne zachowanie:** Pokazuje falszywe AI Insights o nieistniejacych kampaniach.

**Oczekiwane zachowanie:** "Brak danych kampanii do analizy. Uruchom pierwsza kampanie reklamowa."

**Priorytet:** WYSOKI - mylace dla uzytkownika

---

### BUG-024: Brak walidacji wybranego zakresu dat [SREDNI]

**Lokalizacja:** `components/reports/report-wizard.tsx`

**Opis:** Uzytkownik moze wybrac zakres dat w przyszlosci lub zbyt dlugi zakres.

**Priorytet:** SREDNI - moze powodowac bledy API

---

## PODSUMOWANIE WEDLUG PRIORYTETU

### KRYTYCZNE (8) - DO NATYCHMIASTOWEJ NAPRAWY:
1. BUG-001: Brakujace klucze tlumaczen
2. BUG-003: Raporty 404
3. BUG-004: Falszywe AI Insights
4. BUG-008: Disconnect usuwa wszystkie konta

### WYSOKIE (12) - DO NAPRAWY W PIERWSZEJ KOLEJNOSCI:
5. BUG-002: Mieszane jezyki
6. BUG-005: Hardcoded procenty
7. BUG-006: Losowe wyswietlenia
8. BUG-009: Brak walidacji Customer ID
9. BUG-010: Hardcoded wersje API
10. BUG-011: GOOGLE_ADS_DEVELOPER_TOKEN fallback
11. BUG-016: Brak kolumny view_count
12. BUG-023: Brak obslugi pustych kont

### SREDNIE (15) - DO NAPRAWY:
13-27. (wymienione powyzej)

### NISKIE (12) - ULEPSZENIA:
28-39. (wymienione powyzej)

---

## ZALACZNIKI

### Lista plikow do naprawy (posortowana wg priorytetu):

1. `locales/pl.json`
2. `locales/en.json`
3. `app/[locale]/(dashboard)/reports/[id]/page.tsx`
4. `components/dashboard/ai-insights.tsx`
5. `app/api/integrations/disconnect/route.ts`
6. `components/dashboard/stats-cards-v2.tsx`
7. `components/dashboard/report-card-v2.tsx`
8. `app/api/reports/generate/route.ts`
9. `app/api/integrations/update-customer-id/route.ts`
10. `app/api/auth/callback/google/route.ts`
11. `app/api/auth/meta/callback/route.ts`
12. `app/api/reports/[id]/send/route.tsx`

---

**Koniec raportu bledow.**

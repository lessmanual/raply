# Raply Database Export

Eksport pełnej struktury bazy danych projektu **Raply** z Supabase.

## 📋 Co zostało wyeksportowane

- ✅ **Custom Types (Enums)** - wszystkie typy wyliczeniowe
- ✅ **Tables** - struktura 4 głównych tabel (users, ad_accounts, reports, campaigns_data)
- ✅ **Constraints** - klucze obce i relacje między tabelami
- ✅ **Indexes** - wszystkie indeksy dla optymalizacji wydajności
- ✅ **Functions** - funkcja pomocnicza `is_admin()`
- ✅ **RLS Policies** - kompletne zasady bezpieczeństwa Row Level Security

## 📁 Struktura plików

```
supabase-export/
├── 01_types.sql           # Custom types (enums) - uruchom PIERWSZE
├── 02_tables.sql          # Definicje tabel
├── 03_constraints.sql     # Foreign keys i relacje
├── 04_indexes.sql         # Indeksy wydajności
├── 05_functions.sql       # Funkcja is_admin()
├── 06_rls_policies.sql    # Row Level Security policies
└── README.md              # Ten plik
```

## 🚀 Jak wdrożyć na nowy projekt Supabase

### Krok 1: Przygotowanie

1. Zaloguj się do nowego projektu Supabase
2. Otwórz SQL Editor (w menu bocznym)
3. Upewnij się, że baza danych jest pusta lub gotowa na import

### Krok 2: Wykonanie migracji (WAŻNA KOLEJNOŚĆ!)

**UWAGA:** Musisz uruchamiać pliki w określonej kolejności!

```sql
-- 1. Najpierw utwórz custom types
-- Skopiuj i uruchom zawartość: 01_types.sql

-- 2. Następnie utwórz tabele
-- Skopiuj i uruchom zawartość: 02_tables.sql

-- 3. Dodaj foreign keys
-- Skopiuj i uruchom zawartość: 03_constraints.sql

-- 4. Utwórz indeksy
-- Skopiuj i uruchom zawartość: 04_indexes.sql

-- 5. Dodaj funkcję is_admin()
-- Skopiuj i uruchom zawartość: 05_functions.sql

-- 6. Na końcu włącz RLS i dodaj policies
-- Skopiuj i uruchom zawartość: 06_rls_policies.sql
```

### Krok 3: Weryfikacja

Po wykonaniu wszystkich plików sprawdź czy:

```sql
-- Sprawdź czy tabele zostały utworzone
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- Sprawdź czy RLS jest włączone
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Sprawdź ilość policies
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public';
```

Powinieneś zobaczyć:
- ✅ 4 tabele: `users`, `ad_accounts`, `reports`, `campaigns_data`
- ✅ RLS włączone na wszystkich tabelach
- ✅ 19 RLS policies

## 📊 Struktura bazy danych

### Główne tabele

1. **users** - Profile użytkowników (rozszerza auth.users)
   - Kolumny: id, email, full_name, company_name, phone, avatar_url, role
   - Role: `user` (domyślna) lub `admin` (nieograniczony dostęp)

2. **ad_accounts** - Połączone konta reklamowe (Meta Ads, Google Ads)
   - Platforma: `meta` lub `google`
   - Status: `active`, `disconnected`, `error`
   - Przechowuje tokeny OAuth (szyfrowanie na poziomie aplikacji zalecane)

3. **reports** - Wygenerowane raporty reklamowe z AI insights
   - Template: `leads`, `sales`, `reach`
   - Status: `generating`, `completed`, `failed`
   - Zawiera opisy i rekomendacje wygenerowane przez Claude AI

4. **campaigns_data** - Cache danych kampanii z Meta/Google Ads
   - Metryki: spend, impressions, clicks, conversions, CTR, CPC, CPM, ROAS
   - raw_data: pełne dane z API w formacie JSON

### Relacje

```
auth.users (Supabase Auth)
    ↓
users (id FK to auth.users.id)
    ↓
ad_accounts (user_id FK)
    ↓
    ├── reports (ad_account_id FK)
    │       ↓
    │   campaigns_data (report_id FK)
    │
    └── campaigns_data (ad_account_id FK)
```

## 🔒 Row Level Security (RLS)

Wszystkie tabele mają włączone RLS z następującymi zasadami:

### Użytkownicy zwykli (`user` role)
- ✅ Mogą widzieć tylko swoje dane
- ✅ Mogą edytować tylko swoje dane
- ✅ Mogą usuwać tylko swoje dane

### Administratorzy (`admin` role)
- ✅ Mają pełny dostęp do wszystkich danych
- ✅ Mogą wykonywać wszystkie operacje na wszystkich tabelach

**Funkcja pomocnicza:** `is_admin()` sprawdza czy aktualny użytkownik ma rolę admin.

## ⚠️ Ważne uwagi

1. **auth.users.id MUSI istnieć** zanim utworzysz rekord w `public.users`
   - Najpierw użytkownik musi się zarejestrować przez Supabase Auth
   - Następnie trigger lub kod aplikacji tworzy rekord w `public.users`

2. **Tokeny OAuth powinny być szyfrowane** na poziomie aplikacji
   - Kolumny `access_token` i `refresh_token` w `ad_accounts`
   - Rozważ użycie Supabase Vault dla dodatkowego bezpieczeństwa

3. **Unique constraint** na `ad_accounts`
   - Użytkownik nie może połączyć tego samego konta reklamowego dwa razy
   - Kombinacja: (user_id, platform, platform_account_id) musi być unikalna

4. **CASCADE deletes** są włączone
   - Usunięcie użytkownika usuwa wszystkie jego ad_accounts
   - Usunięcie ad_account usuwa wszystkie powiązane reports i campaigns_data
   - Usunięcie report usuwa wszystkie powiązane campaigns_data

## 🔧 Sugerowane dodatkowe kroki

Po wdrożeniu schematu rozważ:

1. **Trigger dla automatycznego tworzenia profilu użytkownika:**
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

2. **Trigger dla updated_at:**
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ad_accounts_updated_at BEFORE UPDATE ON public.ad_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

3. **Storage bucket dla PDF raportów:**
```sql
-- W Storage UI utwórz bucket "reports"
-- Następnie dodaj RLS policy:
CREATE POLICY "Users can view own report PDFs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'reports' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

## 📞 Wsparcie

Jeśli masz pytania lub problemy z importem, sprawdź:
- Dokumentacja Supabase: https://supabase.com/docs
- Logi błędów w SQL Editor
- Kolejność wykonywania plików (musi być 01 → 06)

---

**Data eksportu:** 2025-12-02
**Projekt źródłowy:** Raply (mfkfbmfaxcbqixiuacvi)
**Region:** eu-north-1

# Claude Notes - Current Work Status

**Data utworzenia:** 2025-10-22
**Status:** FIXING CODERABBIT ISSUES - BEFORE NORMAL DEVELOPMENT

---

## 🚨 WAŻNE - PRIORYTET PRACY

**NAJPIERW:** Naprawić wszystkie problemy z CodeRabbit review (24 taski)
**POTEM:** Powrót do normalnego rozwoju aplikacji (Task Master MVP)

---

## 📋 Aktualny Stan

### Ukończone wcześniej:
- ✅ Problem 1: "Failed to create report" - usunięto `data: null` z insert
- ✅ Problem 2: Floating button overlap - ukryto na `/reports/new`
- ✅ Problem 3: Mixed PL/EN texts - dodano tłumaczenia do nav
- ✅ Task 8: AI Integration dla raportów (campaign data + AI insights)

### Do zrobienia TERAZ (CodeRabbit Fixes):

#### 🔴 CRITICAL (Rób NAJPIERW - dziś):
1. **CR-1:** Open Redirect vulnerability - validate `next` param w OAuth callback
2. **CR-2:** Unsecured AI test endpoint - dodaj production check
3. **CR-3:** Błędne obliczenie ROAS - popraw formułę matematyczną

#### 🟠 HIGH (Tydzień 1):
4. **CR-4:** Google Ads API v17 → v22 (4 wersje do tyłu!)
5. **CR-5:** Brak error handling w `supabase.auth.getUser()`
6. **CR-6:** Zły identifier Claude: `claude-4.5-haiku` → `claude-haiku-4-5`
7. **CR-7:** Brak user feedback przy błędach w wizardzie
8. **CR-8:** Off-by-one error w datach (same-day = 0 days)

#### 🟡 MEDIUM (Tydzień 2):
9. **CR-9:** Keyboard accessibility dla template cards (WCAG)
10. **CR-10:** Floating button - `includes()` → `exact match`
11. **CR-11:** Walidacja API response `reportId`
12. **CR-12:** Przywróć i18n zamiast hardcoded texts
13. **CR-13:** Chrome icon → Google icon dla Google Ads
14. **CR-14:** Usuń niepotrzebny `async` z SignOutButton
15. **CR-15:** Timezone bugs w date conversion
16. **CR-16:** Error context preservation w ai-insights

#### 🔵 LOW (Tydzień 3):
17. **CR-17:** Usuń dane osobowe z test files
18. **CR-18:** Obfuskuj email w dokumentacji
19. **CR-19:** Zaktualizuj datę w docs (Oct 14 → Oct 22)
20. **CR-20:** Dodaj error handling docs
21. **CR-21:** Uzupełnij security docs
22. **CR-22:** Dodaj rate limiting docs

#### 🎯 META:
23. **Re-review:** Uruchom CodeRabbit ponownie po fixach
24. **Return:** Wróć do normalnego developmentu

---

## 📄 Dokumentacja

- **PRD.md** - Pełna specyfikacja wszystkich problemów z CodeRabbit
- **Raport CodeRabbit** - Dostępny w output z `coderabbit review --plain`
- **Todo List** - TodoWrite zawiera wszystkie 24 taski

---

## 🎯 Następne Kroki

1. Przeczytaj ten plik przy każdej nowej sesji
2. Zacznij od CR-1 (CRITICAL)
3. Pracuj po kolei według priorytetów
4. Oznaczaj taski jako completed w TodoWrite
5. Po zakończeniu wszystkich CR-1 do CR-22:
   - Uruchom CodeRabbit re-review
   - Sprawdź czy 0 CRITICAL issues
   - Wróć do Task Master MVP tasków

---

## ⚠️ PRZYPOMNIENIE

**NIE WRACAJ DO NORMALNEGO DEVELOPMENTU** dopóki wszystkie problemy CRITICAL i HIGH nie będą naprawione i przetestowane!

Security vulnerabilities (CR-1, CR-2) są **krytyczne** i mogą spowodować:
- Przejęcie kont użytkowników (Open Redirect)
- Nieautoryzowane koszty AI API (Unsecured endpoint)
- Błędne dane w raportach (ROAS bug)

---

**Ostatnia aktualizacja:** 2025-10-22 po uruchomieniu CodeRabbit review

# PROJ-16: Test-Strategie & Qualitätssicherung

## Status: Planned
**Created:** 2026-03-12
**Last Updated:** 2026-03-12

## Dependencies
- Gilt für: alle PROJ-Features (PROJ-1 bis PROJ-15+)
- Technische Basis: Next.js 16, TypeScript, Supabase, Tailwind

## Übersicht
Vollständige Test-Strategie die mit jedem implementierten Feature mitwächst. Das System besteht aus drei Testebenen (Unit → Integration → E2E) und folgt dem Prinzip: **Jedes fertiggestellte Feature wird sofort mit Tests abgesichert — nicht als nachträglicher Schritt.** Tests werden in CI/CD (Vercel Preview Deployments) automatisch ausgeführt.

## Philosophie: Testing Pyramid für Train Smarter

```
        /\
       /E2E\          ← Wenige, kritische User-Journeys
      /------\
     /Integrat.\      ← API Routes, DB-Queries, Auth-Flows
    /------------\
   /  Unit Tests  \   ← Utilities, Validierung, Berechnungen
  /________________\
```

**Regel:** Je höher in der Pyramide, desto langsamer und teurer der Test → sparsam einsetzen. Unit Tests sind billig → großzügig einsetzen.

## Test-Tools

| Ebene | Tool | Begründung |
|---|---|---|
| Unit + Integration | **Vitest** | Schneller als Jest, native TypeScript, kompatibel mit Next.js App Router |
| E2E | **Playwright** | Browserübergreifend, Supabase Auth testbar, GitHub Actions Integration, Screenshot-Vergleiche |
| Accessibility | **axe-core** (via Playwright) | WCAG AA Checks automatisiert, kein manuelles Testen nötig |
| Coverage | **v8 (via Vitest)** | Native Coverage ohne Babel-Overhead |
| Supabase (Test-DB) | **Supabase CLI local** | Lokale Postgres-Instanz für Tests, keine Prod-DB |

## Ebene 1: Unit Tests (Vitest)

### Was wird unit-getestet
- **Validierungs-Schemas (Zod):** Alle Formular-Schemas aus PROJ-4, PROJ-5, PROJ-6 etc.
- **Utility-Funktionen:** Datums-Berechnungen (Makrozyklus-Dauer, Wochenoffsets), Gewichts-Progression (+2.5/5%), RPE-Berechnungen
- **Business Logic:** Einladungs-Token-Ablauf-Check, Retention-Policy-Berechnungen (30-Tage-Grace-Period)
- **Komponenten-Logik (isoliert):** Custom Hooks (useNotifications, useTrainingPlan), State-Transformationen
- **Permissions-Logik:** Rolle-basierte Sichtbarkeit (Trainer vs. Athlet vs. Admin)

### Konvention
```
src/
  lib/
    utils.test.ts         ← neben der getesteten Datei
  hooks/
    useNotifications.test.ts
  components/
    notification-bell.test.tsx
```

### Coverage-Ziel
- Utilities & Validierung: **90%+**
- Custom Hooks: **80%+**
- Komponenten: **60%+** (nur Logik, kein CSS)

## Ebene 2: Integration Tests (Vitest + Supabase Local)

### Was wird integration-getestet
- **API Route Handlers** (Next.js Route Handlers): alle Endpoints unter `src/app/api/`
- **Supabase RLS Policies:** Prüfen dass Trainer NICHT die Daten anderer Trainer sieht
- **Auth-Flows:** Registrierung → E-Mail-Verifizierung → Onboarding-Completion-Flag
- **Datenbank-Kaskaden:** Account-Löschung löscht alle verknüpften Daten (PROJ-11)
- **Edge Functions:** Einladungs-Token-Validierung, Daten-Export-Job

### RLS Test-Matrix (kritisch für Datenschutz)
Für jede Tabelle: Test dass User A NICHT User B's Daten lesen/schreiben kann.

| Tabelle | Test |
|---|---|
| `trainer_athlete_connections` | Trainer sieht nur eigene Verbindungen |
| `notifications` | User sieht nur eigene Notifications |
| `user_consents` | User kann nur eigene Consents lesen |
| `plans` (PROJ-7) | Trainer sieht nur eigene Pläne |
| `exercises` (PROJ-12) | Trainer sieht nur eigene + globale Übungen |

### Konvention
```
src/
  app/
    api/
      athletes/
        route.test.ts    ← neben dem Route Handler
  tests/
    rls/
      athlete-connections.test.ts
    auth/
      registration-flow.test.ts
```

## Ebene 3: E2E Tests (Playwright)

### Kritische User-Journeys (müssen IMMER grün sein)

Folgende Flows werden als E2E-Tests abgesichert — in dieser Priorität:

| # | Flow | PROJ | Kritikalität |
|---|---|---|---|
| 1 | Registrierung → DSGVO-Consent → Onboarding → Dashboard | PROJ-4, PROJ-11 | **Pflicht** |
| 2 | Login → Passwort vergessen → Reset → Login | PROJ-4 | **Pflicht** |
| 3 | Trainer lädt Athlet ein → Athlet nimmt an → Verbindung aktiv | PROJ-5, PROJ-13 | **Pflicht** |
| 4 | Trainer erstellt Plan → Autosave → Speichern & Schließen | PROJ-7 | **Pflicht** |
| 5 | Athlet öffnet Workout → Satz abhaken → Einheit abschließen | PROJ-7 | **Pflicht** |
| 6 | Athlet macht täglichen Check-in → Trainer sieht in Monitoring | PROJ-6 | **Hoch** |
| 7 | Account löschen → Bestätigungsmail → Daten weg nach 30d | PROJ-11 | **Hoch** |
| 8 | Notification-Präferenz auf „Keine" → keine In-App-Notification | PROJ-14 | **Mittel** |
| 9 | Globale Suche Cmd+K → Athlet suchen → Navigation | PROJ-15 | **Mittel** |
| 10 | Admin erstellt Template → Trainer findet es in Bibliothek | PROJ-10, PROJ-7 | **Mittel** |

### Playwright-Konfiguration
```
tests/
  e2e/
    01-auth/
      registration.spec.ts
      password-reset.spec.ts
    02-athletes/
      invite-athlete.spec.ts
    03-training/
      create-plan.spec.ts
      athlete-workout.spec.ts
    04-monitoring/
      daily-checkin.spec.ts
    05-account/
      delete-account.spec.ts
    06-notifications/
      notification-preferences.spec.ts
    07-search/
      global-search.spec.ts
```

### Playwright-Besonderheiten
- **Auth-Fixture:** Login-State wird einmalig pro Test-Session gecacht (kein Login in jedem Test)
- **Supabase Test-User:** Dedizierte Test-Accounts (`test-trainer@train-smarter.at`, `test-athlete@train-smarter.at`) mit bekannten Passwörtern — werden in Test-DB verwendet, niemals Prod
- **Screenshot bei Fehler:** Automatisch bei fehlgeschlagenem Test
- **Accessibility-Check:** Jeder E2E-Test prüft automatisch auf axe-core Violations (kein manueller Schritt)

## Sofort-Maßnahmen (Quick Wins — vor dem großen Test-Framework)

Diese Punkte werden **als erstes** implementiert, weil sie direkt verhindern dass funktionierende Dinge kaputtgehen — ohne dass Vitest oder Playwright installiert sein müssen.

### 1. Environment-Validierung beim Startup

Ein `src/lib/env.ts` Modul das beim App-Start alle required Env-Vars prüft und mit klarer Fehlermeldung abbricht wenn etwas fehlt:

```ts
// Pflicht-Vars die validiert werden:
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_SITE_URL
```

Bei fehlendem Key: Startup schlägt fehl mit `Error: Missing required env var: NEXT_PUBLIC_SUPABASE_ANON_KEY` — kein stiller 500er mehr.

### 2. Pre-commit Hooks (Husky + lint-staged)

Vor jedem `git commit` wird automatisch ausgeführt:
- `npm run lint` — ESLint Fehler blockieren den Commit
- `tsc --noEmit` — TypeScript Fehler blockieren den Commit
- Formatierung (Prettier wenn eingesetzt)

Verhindert dass kaputtes Code committed wird.

### 3. `npm run check` Script

Neues Script das alle lokalen Checks auf einmal ausführt:
```bash
npm run check   # lint + type-check + build
```

Wird als Pflicht-Schritt vor jedem Deploy dokumentiert.

### 4. `.env.example` Datei

Eine `.env.example` mit allen Pflicht-Variablen (ohne Werte) die ins Repository eingecheckt wird. Verhindert dass Keys vergessen werden wenn jemand das Projekt neu aufsetzt.

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=
```

### Akzeptanzkriterien Sofort-Maßnahmen

- [ ] `src/lib/env.ts` validiert alle Pflicht-Env-Vars beim Start — klare Fehlermeldung statt 500
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` fehlt → App startet nicht, zeigt welche Variable fehlt
- [ ] Husky installiert: `git commit` mit Lint-Fehler schlägt fehl
- [ ] Husky installiert: `git commit` mit TypeScript-Fehler schlägt fehl
- [ ] `.env.example` mit allen Pflicht-Vars existiert im Repository
- [ ] `npm run check` führt lint + type-check durch

## CI/CD Integration

### GitHub Actions Pipeline
```
Push zu Feature-Branch:
  ├── lint (npm run lint)
  ├── type-check (tsc --noEmit)
  ├── unit + integration tests (vitest)
  └── E2E Tests auf Vercel Preview URL (Playwright)

Merge zu main:
  ├── alle obigen Tests
  └── E2E Tests auf Production URL (Smoke Tests)
```

### Fail-Policy
- **Unit + Integration Tests fehlschlagen** → Merge blockiert
- **E2E kritische Tests fehlschlagen** → Merge blockiert (Journeys 1–5)
- **E2E mittlere Tests fehlschlagen** → Warnung, Merge nicht blockiert
- **Accessibility-Violations** → Warnung im PR-Kommentar

## Test-Wachstum: Mit jedem PROJ

Das Test-System wächst mit jeder Feature-Implementierung:

| Wann | Was wird hinzugefügt |
|---|---|
| PROJ fertig (Backend) | RLS Integration Tests für neue Tabellen |
| PROJ fertig (Frontend) | Unit Tests für neue Utilities + Hooks |
| PROJ fertig (QA) | E2E Test für den kritischsten Flow des Features |
| Bugfix | Regression Test der den Bug reproduziert (bevor Fix) |

**Regel:** Kein Feature gilt als fertig bis mindestens ein E2E-Test den kritischen Flow abdeckt.

## Lokales Testen

```bash
# Unit + Integration Tests
npm run test              # einmalig
npm run test:watch        # watch mode

# E2E Tests (benötigt lokalen Supabase + Dev-Server)
npm run test:e2e          # headless
npm run test:e2e:ui       # mit Playwright UI (Debug-Modus)

# Coverage Report
npm run test:coverage
```

## Supabase Test-Datenbank

- Lokale Supabase-Instanz via `supabase start` (Docker)
- Test-Migrations werden vor E2E-Tests automatisch ausgeführt (`supabase db reset`)
- Seed-Script: erstellt Test-User, Test-Athleten, Test-Pläne für E2E-Tests
- Prod-Datenbank wird nie für Tests verwendet

## Test-Daten-Konventionen

- Test-E-Mails immer: `test-*@train-smarter.at` (Webgo blockiert diese für echten Versand)
- Test-User IDs sind konstant (im Seed-Script definiert) — kein Zufalls-ID-Problem
- Sensible Daten in Tests: niemals echte Körperdaten oder echte RPE-Werte — nur Dummy-Zahlen

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

**Last Updated:** 2026-03-14

### Leitprinzip: Lebende Tests — Tests wachsen mit dem Code

Das Testsystem ist kein einmaliges Setup, sondern ein **lebendes System**. Jede Code-Änderung zieht automatisch eine Test-Anpassung nach sich:

```
Neuer Code / Bugfix
  ↓
Skill (/frontend, /backend, /qa) schreibt Tests als Teil der Lieferung
  ↓
Pre-commit Hook validiert Format + Qualität
  ↓
CI/CD blockiert Merge wenn Tests rot sind
  ↓
Coverage-Gate verhindert dass Coverage sinkt
```

**Konsequenz:** Kein Feature ist "fertig" ohne Tests. Der `/qa` Skill schreibt nach jedem Bugfix einen Regressionstest der den Bug reproduziert — bevor der Fix committed wird.

---

### Phase 1: Sofort-Maßnahmen (diese Woche — kein Testframework nötig)

#### A) Typesafe Env-Validierung mit `@t3-oss/env-nextjs`

Empfehlung der Experten: **Nicht selbst bauen** — `@t3-oss/env-nextjs` (das Standard-Tool der Next.js Community) löst das Problem besser:

- Validiert **bei Build-Zeit** (nicht nur Runtime) — der Build schlägt fehl wenn eine Variable fehlt
- Vollständig typsicher — TypeScript kennt alle Env-Vars und ihre Typen
- Unterscheidet Server-only vars (`SUPABASE_SERVICE_ROLE_KEY`) von Client-safe vars (`NEXT_PUBLIC_*`)
- Klare Fehlermeldung: "❌ Invalid environment variables: NEXT_PUBLIC_SUPABASE_ANON_KEY: Required"

**Dateien:**
```
src/lib/env.ts           ← Zentrale Env-Definition (einmal, überall importiert)
.env.example             ← Alle Pflicht-Vars ohne Werte (ins Repo eingecheckt)
```

#### B) Pre-commit Hooks (Husky v9 + lint-staged)

```
git commit
  ↓
lint-staged:
  ├── *.{ts,tsx} → eslint --fix (Lint-Fehler blockieren)
  ├── *.{ts,tsx} → tsc --noEmit (TS-Fehler blockieren)
  └── *.{ts,tsx} → prettier --write (automatisch formatieren)
```

**Wichtig:** Husky v9 verwendet das neue `.husky/` Format ohne separate Konfigurationsdatei.

#### C) `npm run check` + `npm run typecheck` Scripts

```
npm run typecheck    → tsc --noEmit (nur Type-Checking)
npm run check        → lint + typecheck (läuft in CI und lokal vor Deploy)
```

---

### Phase 2: Unit + Integration Tests (Vitest)

#### Warum Vitest statt Jest?

| Kriterium | Jest | Vitest |
|---|---|---|
| Startup-Zeit | ~3-5s | ~0.3s |
| TypeScript | Babel-Transform nötig | Nativ |
| Next.js App Router | Aufwendige Konfiguration | Out-of-the-box |
| ESM Support | Problematisch | Nativ |

**Fazit:** Für diesen Stack (Next.js 16 + TypeScript) ist Vitest die klare Wahl.

#### Supabase in Unit Tests: MSW (Mock Service Worker)

**Expertenempfehlung:** Für Unit Tests wird Supabase **nicht** mit einer echten DB gemockt, sondern mit **MSW (Mock Service Worker)**:
- Interceptet HTTP-Anfragen auf Netzwerk-Ebene (nicht nur API-Mocks)
- Tests laufen ohne Docker / lokale Supabase-Instanz
- Realistische Response-Simulation ohne Prod-Daten

Für **Integration Tests** (RLS-Policies, Datenbanklogik): Hier wird die **lokale Supabase-Instanz** via `supabase start` verwendet — weil RLS-Policies echte SQL brauchen und nicht simulierbar sind.

#### Dateistruktur

```
src/
  lib/
    env.ts                    ← Phase 1
    env.test.ts               ← Testet dass Validierung funktioniert
    utils.test.ts             ← Bestehende utils.ts abdecken
    validations/
      auth.test.ts            ← Zod-Schemas testen (schon vorhanden)
    athletes/
      actions.test.ts         ← Server Actions (mit MSW)
      queries.test.ts         ← Queries (mit lokaler Supabase)
  hooks/
    use-avatar-upload.test.ts ← Upload-Logik + Magic-Byte-Validierung
tests/
  integration/
    rls/
      athlete-connections.test.ts
    auth/
      registration-flow.test.ts
  e2e/
    01-auth/...
    02-athletes/...
```

---

### Phase 3: E2E Tests (Playwright)

#### Auth-State Sharing — wichtigstes Performance-Thema

Playwright-Best-Practice: Login **einmal** pro Test-Run, State wird gespeichert und wiederverwendet:

```
tests/e2e/
  fixtures/
    auth.setup.ts        ← Login als Trainer + als Athlet, speichert State
  playwright.config.ts   ← globalSetup zeigt auf auth.setup.ts
  01-auth/...            ← Tests starten bereits eingeloggt
```

Ohne dieses Pattern: Login-Zeit verdoppelt jeden Test. Mit diesem Pattern: Login passiert einmal für alle Tests.

#### Test-Isolation: Supabase Test-User

Alle E2E-Tests laufen gegen **dedizierte Test-Accounts** in der **Prod-Supabase-Instanz** (separates Schema) oder einer **Staging-Instanz**:

```
test-trainer@train-smarter.at  (Passwort in GitHub Secrets)
test-athlete@train-smarter.at  (Passwort in GitHub Secrets)
```

Ein **Cleanup-Hook** (`afterAll`) löscht Test-Daten nach jedem Run. Niemals Prod-User-Daten verwenden.

---

### Lebende Tests: Wie das System sich selbst aktualisiert

**Das wichtigste Prinzip:** Das Testsystem veraltet nie, weil Regeln erzwingen dass es mitgepflegt wird.

#### Regel 1: Coverage-Gate (Ratchet Pattern)

Die Coverage-Schwelle wird **nie gesenkt**, kann aber erhöht werden:

```
Aktuell:   utils 90% / hooks 80% / components 60%
Nach Fix:  Coverage darf nicht sinken → CI schlägt fehl wenn Coverage fällt
```

Dieser "Ratchet" verhindert schleichende Test-Erosion.

#### Regel 2: Bugfix → Regressionstest (Pflicht)

Workflow bei jedem Bug:
1. Test schreiben der den Bug **reproduziert** (Test ist rot)
2. Fix implementieren (Test wird grün)
3. Test bleibt im Repository — der Bug kann nie wieder unbemerkt einschleichen

#### Regel 3: Neue API-Route → Route Handler Test (Pflicht)

Jede neue Datei unter `src/app/api/` braucht eine `route.test.ts` daneben. Der Pre-commit Hook warnt (nicht blockiert) wenn eine neue API-Route kein Test-File hat.

#### Regel 4: Neue Supabase-Tabelle → RLS Test (Pflicht)

Bei jeder neuen Migration die eine Tabelle erstellt: ein RLS-Integrationstest wird hinzugefügt der User-A-kann-nicht-User-B-Daten-lesen verifiziert. Dieser Test wird vom `/backend` Skill automatisch erstellt.

---

### GitHub Actions Pipeline (vollständig)

```
.github/workflows/
  ci.yml          ← Läuft bei jedem Push + PR
  e2e.yml         ← Läuft bei PR zu main (teurer, deshalb separat)
```

**`ci.yml`** (schnell, <2min):
```
1. checkout + npm ci
2. npm run check (lint + typecheck)
3. npm run test (vitest unit + integration)
4. Coverage-Gate prüfen
```

**`e2e.yml`** (langsamer, ~5-10min, nur bei PR zu main):
```
1. Warten auf Vercel Preview Deployment
2. Playwright Tests gegen Preview URL
3. Screenshot-Artifacts bei Fehler hochladen
4. Accessibility-Report als PR-Kommentar posten
```

---

### Abhängigkeiten (neue Pakete)

| Paket | Zweck | Phase |
|---|---|---|
| `@t3-oss/env-nextjs` | Typesafe env-Validierung | 1 |
| `husky` | Pre-commit Hooks | 1 |
| `lint-staged` | Nur geänderte Dateien linten | 1 |
| `vitest` | Unit + Integration Test-Runner | 2 |
| `@vitejs/plugin-react` | React-Support in Vitest | 2 |
| `@vitest/coverage-v8` | Coverage-Reports | 2 |
| `msw` | HTTP-Mocking für Unit Tests | 2 |
| `@testing-library/react` | Komponenten-Tests | 2 |
| `playwright` | E2E Tests | 3 |
| `@axe-core/playwright` | Accessibility in E2E | 3 |

---

### Expertenantworten: Langfristig das Beste rausholen

**1. "Test-first" vs. "Test-alongside" für Solo-Entwickler**
Echtes TDD (Test-first) ist für Solo-Entwickler oft zu langsam. Empfehlung: **"Test-alongside"** — Unit Tests für jede neue Utility-Funktion sofort schreiben, E2E Tests für jeden abgeschlossenen Flow. Das gibt 80% des Sicherheitsnetzes bei 40% des Aufwands.

**2. Snapshot Tests für UI-Komponenten**
Playwright kann Screenshots von Seiten machen und mit dem letzten Stand vergleichen (**Visual Regression Testing**). Empfehlung: Nur für die 3-4 kritischsten Seiten (Dashboard, Athletes-Overview, Profile). Zu viele Snapshots = zu viele falsch-positive Fehler.

**3. Der wertvollste Test für dieses Projekt**
RLS-Integrationstests. Ein Trainer der versehentlich die Athleten eines anderen Trainers sieht ist ein Datenschutz-Incident — der schlimmste mögliche Bug. Diese Tests kosten wenig, schützen vor viel.

**4. Monitoring ergänzt Tests**
Tests prüfen ob Code korrekt ist — aber nicht ob er in Produktion läuft. Empfehlung (nach PROJ-16 Phase 1+2): Sentry Error Tracking (bereits im `/deploy` Skill) für Runtime-Fehler. Tests + Monitoring = vollständiges Sicherheitsnetz.

**5. Priorisierung für Solo-Entwickler**
Reihenfolge die den höchsten ROI liefert:
1. Phase 1 (Husky + Env-Validierung) — **sofort, heute**
2. RLS Integration Tests — **höchste Sicherheitsprioritität**
3. Auth E2E Tests (Login/Register/Reset) — **kritischster User-Flow**
4. Unit Tests für Utility-Funktionen — **billigste Tests, hohe Coverage**
5. Visuelles Monitoring (Sentry) — **ergänzt, ersetzt keine Tests**

## QA Test Results
_To be added: Diese Spec IST die Test-Strategie — keine QA-Results hier_

## Deployment
_To be added by /deploy_

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
_To be added by /architecture_

## QA Test Results
_To be added: Diese Spec IST die Test-Strategie — keine QA-Results hier_

## Deployment
_To be added by /deploy_

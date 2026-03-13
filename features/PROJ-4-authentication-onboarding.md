# PROJ-4: Authentication & Onboarding

## Status: In Progress
**Created:** 2026-03-12
**Last Updated:** 2026-03-13

## Role Architecture Decision (Phase 1 — implemented in PROJ-3)
> **IMPORTANT:** This spec governs how role data is stored and managed. The following decisions were made before implementation to ensure future-proofness:

### UserRole = "ATHLETE" | "TRAINER" — No ADMIN type
- `UserRole` contains only `"ATHLETE"` and `"TRAINER"`
- There is **no** `"ADMIN"` UserRole. Platform admins are TRAINER (or ATHLETE) accounts with an additional flag.

### Role Storage: `app_metadata` (server-controlled)
- `app_metadata.role: UserRole` — set by the server/Supabase function, **not** editable by the client
- `app_metadata.is_platform_admin: boolean` — grants access to the `/admin` area
- `user_metadata` contains only display data: `first_name`, `last_name`, `avatar_url`

### Why `app_metadata` instead of `user_metadata`?
- `user_metadata` in Supabase Auth is writable by the authenticated user via `supabase.auth.updateUser()`
- `app_metadata` can only be written via the Supabase service-role key (server-side only)
- Storing roles in `user_metadata` would allow any user to escalate their own privileges — a critical security vulnerability

### Onboarding Role Selection
- Step 2 of Onboarding: User selects "Ich bin Trainer" or "Ich bin Athlet"
- This triggers a server-side Supabase Edge Function that sets `app_metadata.role` via service-role key
- `is_platform_admin` defaults to `false` and is only set manually by the platform team

## Dependencies
- Requires: PROJ-1 (Design System Foundation)
- Requires: PROJ-2 (UI Component Library) — Button, Input, Alert, Card

## Übersicht
Komplettes Authentifizierungssystem mit Supabase Auth: Registrierung, Login, Passwort-Reset und E-Mail-Verifizierung. Nach der ersten Anmeldung durchlaufen neue Benutzer einen einfachen Onboarding-Wizard (Profil-Setup + Rollenauswahl). In Figma werden alle Auth-Screens und der Onboarding-Flow dokumentiert.

## User Stories
- Als neuer Benutzer möchte ich mich mit E-Mail + Passwort registrieren, damit ich einen Account anlegen kann
- Als registrierter Benutzer möchte ich mich einloggen und eingeloggt bleiben, damit ich nicht jedes Mal neu eingeben muss
- Als Benutzer der sein Passwort vergessen hat möchte ich eine Reset-E-Mail bekommen, damit ich wieder Zugang erhalte
- Als neuer Benutzer möchte ich nach der Registrierung durch ein kurzes Onboarding geleitet werden, damit ich sofort mit dem Wichtigsten starte
- Als eingeladener Athlet möchte ich mich über den Einladungslink direkt registrieren, damit ich automatisch mit meinem Trainer verknüpft werde

## Acceptance Criteria

### Figma Screens
- [ ] Figma Screen: Login-Seite (Desktop + Mobile)
- [ ] Figma Screen: Registrierungs-Seite (Desktop + Mobile)
- [ ] Figma Screen: Passwort vergessen (Desktop + Mobile)
- [ ] Figma Screen: E-Mail-Bestätigung ausstehend (Info-Screen)
- [ ] Figma Screen: Onboarding Step 1 — Profilbild + Name + Geburtsdatum
- [ ] Figma Screen: Onboarding Step 2 — Rolle wählen (Trainer / Athlet)
- [ ] Figma Screen: Onboarding Step 3 — Als Trainer: Ersten Athleten einladen / Als Athlet: Trainer-Code eingeben

### Login
- [ ] Felder: E-Mail, Passwort (toggle Sichtbarkeit)
- [ ] Supabase `signInWithPassword` Aufruf
- [ ] Fehler "Invalid credentials" zeigt Alert (keine Unterscheidung ob E-Mail oder Passwort falsch → Sicherheit)
- [ ] "Eingeloggt bleiben" Checkbox (Session-Dauer: 30 Tage)
- [ ] Link zu "Passwort vergessen"
- [ ] Link zu "Registrieren"
- [ ] Nach Login: Redirect zu `/dashboard` (oder `returnUrl` wenn vorhanden)
- [ ] Bereits eingeloggter User der `/login` aufruft → Redirect zu `/dashboard`

### Registrierung
- [ ] Felder: Vorname, Nachname, E-Mail, Passwort, Passwort bestätigen
- [ ] Passwort-Anforderungen: Min. 8 Zeichen, 1 Großbuchstabe, 1 Zahl
- [ ] Client-seitige Validierung mit Zod vor dem API-Aufruf
- [ ] Supabase `signUp` Aufruf
- [ ] Nach Registrierung: Weiterleitung zu "E-Mail bestätigen" Screen
- [ ] Einladungslink: URL-Parameter `inviteToken` wird in Session gespeichert, nach Verifizierung automatisch verknüpft

### Passwort Reset
- [ ] Schritt 1: E-Mail-Adresse eingeben → Supabase `resetPasswordForEmail`
- [ ] Bestätigungs-Screen: "Wenn diese E-Mail existiert, erhältst du einen Link"
- [ ] Schritt 2 (via Link in E-Mail): Neues Passwort + Bestätigen → Supabase `updateUser`
- [ ] Nach Reset: Redirect zu `/login` mit Erfolgs-Alert

### E-Mail-Verifizierung
- [ ] Unbestätigter User: Info-Screen mit Anweisung + "Erneut senden" Button (Rate-limited: 60s Cooldown)
- [ ] Nach Klick auf Bestätigungs-Link: Automatischer Redirect zur App
- [ ] Alle geschützten Routen prüfen Verifizierungsstatus

### Onboarding Wizard
- [ ] Wird nur angezeigt wenn `profile.onboarding_completed = false`
- [ ] **Step 1 — DSGVO-Einwilligungen** (Pflicht, nicht überspringbar):
  - Pflicht-Checkbox: „Ich akzeptiere die AGB und Datenschutzerklärung" (Links öffnen in neuem Tab, kein Pre-Check)
  - Opt-in: „Ich erlaube die Verarbeitung meiner Körperdaten (Gewicht, Maße, Schlaf, Wellness-Score)" — standardmäßig **nicht** angehakt
  - Opt-in: „Ich erlaube die Verarbeitung meines Ernährungstagebuchs" — standardmäßig **nicht** angehakt
  - Ohne Pflicht-Checkbox: „Weiter"-Button deaktiviert
  - Einwilligungen werden in `user_consents`-Tabelle gespeichert (Datenmodell → PROJ-11)
- [ ] Step 2: Name (vorausgefüllt aus Registrierung), Geburtsdatum, Profilbild (optional, Supabase Storage Upload)
- [ ] Step 3: Rollenauswahl — "Ich bin Trainer" oder "Ich bin Athlet"
- [ ] Step 4 (Trainer): Optionale Einladung eines ersten Athleten per E-Mail
- [ ] Step 4 (Athlet): Optionaler Trainer-Einladungscode eingeben
- [ ] „Überspringen" ab Step 2 möglich — setzt `onboarding_completed = true`
- [ ] Nach Abschluss: Redirect zu `/dashboard`

> **Experten-Entscheidung:** Consent-Step gehört in PROJ-4 (Onboarding-UI), nicht nur in PROJ-11. Begründung: Ein Entwickler der PROJ-4 implementiert, muss alle Wizard-Steps kennen — inkl. Consent. PROJ-11 bleibt die Quelle der Wahrheit für das Datenmodell (`user_consents`-Tabelle) und die Datenschutz-Einstellungsseite. PROJ-4 implementiert den Wizard-Step, referenziert PROJ-11 für die Speicherlogik.

## Edge Cases
- E-Mail bereits registriert bei Registrierung → Fehlermeldung ohne zu verraten ob Account existiert
- Token abgelaufen bei Passwort-Reset → Klarer Fehler mit "Neuen Link anfordern" CTA
- Benutzer schließt Browser während Onboarding → Beim nächsten Login wieder zum Onboarding
- Einladungstoken ungültig/abgelaufen → Fehlermeldung + Option sich normal zu registrieren
- Profilbild Upload > 5MB → Client-seitige Größenprüfung vor Upload

## Technical Requirements
- Security: Passwörter werden ausschließlich über Supabase Auth gehandhabt (kein eigenes Hashing)
- Security: CSRF-Schutz durch Supabase JWT-Tokens
- Security: Rate-Limiting auf Auth-Endpunkten (Supabase built-in)
- Security: Vorname, Nachname und alle Freitext-Felder im Onboarding werden server-seitig HTML-escaped — verhindert XSS falls Daten später in E-Mail-Templates oder anderen Kontexten gerendert werden
- Security: `user_metadata` (first_name, last_name) darf keine HTML-Tags enthalten — Zod-Schema validiert: nur Buchstaben, Leerzeichen, Bindestriche, max. 100 Zeichen
- Validation: Zod-Schemas für alle Formulare, serverseitige Validierung via Next.js Route Handlers
- Performance: Auth-Check per Supabase `getSession()` im Server Component (kein Client-Waterfall)

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

**Designed:** 2026-03-13

### A) Component Structure

```
src/app/[locale]/
│
├── (auth)/                             ← Unauthenticated-only layout (no sidebar)
│   ├── login/page.tsx                  — Login form
│   ├── register/page.tsx               — Registration form
│   ├── forgot-password/page.tsx        — Password reset request
│   ├── reset-password/page.tsx         — New password (via email link)
│   └── verify-email/page.tsx           — "Check your inbox" info screen
│
└── (protected)/
    └── onboarding/page.tsx             — Multi-step Wizard (client component)
        ├── OnboardingWizard            ← Orchestrates steps + progress bar
        │   ├── WizardProgressBar       — Step indicator (1 of 4)
        │   ├── Step1Consents           — DSGVO checkboxes (required, non-skippable)
        │   ├── Step2Profile            — Name (prefilled), Geburtsdatum, Avatar upload
        │   ├── Step3RoleSelect         — "Ich bin Trainer" / "Ich bin Athlet"
        │   ├── Step4Trainer            — Optional: Ersten Athleten einladen
        │   └── Step4Athlete            — Optional: Trainer-Einladungscode eingeben
        └── [Reuses: FormField, Modal, Button, Input, Avatar from PROJ-2]

src/middleware.ts                       — Edge route guard (runs before every request)
src/lib/supabase/
    ├── client.ts                       — Browser-side Supabase client
    ├── server.ts                       — Server-side Supabase client (cookies)
    └── middleware.ts                   — Session refresh helper for middleware

src/app/api/auth/
    └── set-role/route.ts               — Next.js Route Handler: calls Edge Function

Supabase Edge Function:
    └── set-user-role                   — Sets app_metadata.role via service-role key
```

### B) Data Model

**Supabase Auth (built-in, managed by Supabase):**
```
auth.users
├── id: uuid (primary key)
├── email: text
├── email_confirmed_at: timestamp | null   ← email verification state
├── app_metadata.role: "TRAINER" | "ATHLETE"   ← set by Edge Function only
└── app_metadata.is_platform_admin: boolean    ← manual flag, default false
```

**profiles table** (created in PROJ-4 backend):
```
profiles
├── id: uuid (FK → auth.users, 1:1, CASCADE DELETE)
├── first_name: text (max 100 chars, letters/spaces/hyphens only)
├── last_name: text (max 100 chars, letters/spaces/hyphens only)
├── avatar_url: text | null              ← path in Supabase Storage
├── birth_date: date | null
└── onboarding_completed: boolean (default: false)
```

**user_consents table** (schema defined in PROJ-11, inserted in PROJ-4):
```
user_consents
├── user_id: uuid (FK → auth.users)
├── terms_accepted: boolean              ← required, blocks wizard Step 1
├── body_data_consent: boolean           ← opt-in, default false
├── nutrition_consent: boolean           ← opt-in, default false
└── consented_at: timestamp
```

**Supabase Storage Bucket: `avatars`**
```
avatars/{user_id}/avatar.{jpg|png|webp}
├── Max size: 5 MB (client-side check before upload)
├── Accepted types: JPG, PNG, WebP
├── Server-side resize: 400×400px (via Supabase Image Transform)
└── RLS: authenticated users can only write their own folder
```

### C) Middleware Route Guard Logic

The `middleware.ts` edge function intercepts every request and applies these rules in order:

| Condition | Redirect To |
|-----------|-------------|
| No session + protected route | `/login` |
| Session + email not verified | `/verify-email` |
| Session + `onboarding_completed = false` | `/onboarding` |
| Session + visiting `/login` or `/register` | `/dashboard` |
| All good | Continue to requested page |

This means **no auth state can leak** to protected pages, and **no infinite redirects** are possible — the `/onboarding` and `/verify-email` routes are excluded from the onboarding/verification guards respectively.

### D) Role-Setting Flow (Security Critical)

```
Browser                Next.js API Route         Supabase Edge Function
  │                         │                            │
  │── POST /api/auth/set-role ──▶                        │
  │   { role: "TRAINER" }   │                            │
  │                         │── invoke Edge Function ──▶ │
  │                         │                            │── adminUpdateUserById()
  │                         │                            │   (service-role key)
  │                         │◀── { success: true } ──── │
  │◀── 200 OK ──────────── │                            │
  │                         │

The service-role key NEVER leaves the server environment.
The browser only knows the call succeeded or failed.
```

### E) Tech Decisions

| Decision | Chosen Approach | Why |
|----------|----------------|-----|
| Auth provider | Supabase Auth | Password hashing, email verification, rate limiting, and JWT rotation are built-in — no custom implementation needed |
| Route protection | Next.js `middleware.ts` (edge) | Runs before page render on the server edge — protected pages never flash to unauthenticated users. More reliable than client-side guards |
| Role storage | `app_metadata` via Edge Function | `user_metadata` is writable by any authenticated user (privilege escalation risk). `app_metadata` requires the service-role key — server-only |
| Session management | `@supabase/ssr` (cookie-based) | The standard Supabase package for Next.js App Router. Cookie sessions work in middleware + Server Components without a client waterfall |
| Onboarding state | `profiles.onboarding_completed` in DB | Survives browser closes and device switches. Client-writable `user_metadata` would be a bypass risk |
| Consent storage | `user_consents` table | Separate table with timestamps — needed for DSGVO audit trail. Cannot be in `profiles` (different legal requirement) |
| Avatar resize | Supabase Image Transform | Serverless, no custom Lambda needed. Resizes to 400×400px on-the-fly via URL parameter |

### F) Dependencies to Install

| Package | Purpose | Status |
|---------|---------|--------|
| `@supabase/ssr` | Server-side Supabase client for Next.js App Router (cookies-based sessions, middleware helper) | **NOT installed — install before PROJ-4 backend** |
| `@supabase/supabase-js` | Supabase client | Already installed |
| `react-hook-form` | Form state management | Already installed |
| `zod` | Schema validation | Already installed |

### G) Pages That Need to Be Created

| Route | Type | Auth State |
|-------|------|------------|
| `/[locale]/(auth)/login` | Server + Client Form | Unauthenticated only |
| `/[locale]/(auth)/register` | Server + Client Form | Unauthenticated only |
| `/[locale]/(auth)/forgot-password` | Client Form | Unauthenticated only |
| `/[locale]/(auth)/reset-password` | Client Form | Via email link |
| `/[locale]/(auth)/verify-email` | Server | Authenticated, unverified |
| `/[locale]/(protected)/onboarding` | Client Wizard | Authenticated, unverified onboarding |
| `/api/auth/set-role` | Route Handler | Authenticated |

### H) New i18n Namespaces Required

```
auth.login.*        — Login page strings
auth.register.*     — Registration page strings
auth.forgotPassword.*
auth.resetPassword.*
auth.verifyEmail.*
onboarding.*        — All 4 wizard steps
```

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_

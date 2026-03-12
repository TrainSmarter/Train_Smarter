# AI Coding Starter Kit

> A Next.js template with an AI-powered development workflow using specialized skills for Requirements, Architecture, Frontend, Backend, QA, and Deployment.

## Tech Stack

- **Framework:** Next.js 16 (App Router), TypeScript
- **Styling:** Tailwind CSS + shadcn/ui (copy-paste components)
- **i18n:** next-intl — German (`de`, default) + English (`en`)
- **Backend:** Supabase (PostgreSQL + Auth + Storage) - optional
- **Deployment:** Vercel
- **Validation:** Zod + react-hook-form
- **State:** React useState / Context API

## Project Structure

```
src/
  app/
    [locale]/         ALL pages live here (locale-prefixed routing)
      (protected)/    Authenticated pages
  components/
    ui/               shadcn/ui components (NEVER recreate these)
  hooks/              Custom React hooks
  i18n/               next-intl config (routing.ts, request.ts, navigation.ts)
  lib/                Utilities (supabase.ts, utils.ts)
  messages/           Translation files (de.json, en.json)
features/             Feature specifications (PROJ-X-name.md)
  INDEX.md            Feature status overview
docs/
  PRD.md              Product Requirements Document
  production/         Production guides (Sentry, security, performance)
```

## i18n (MANDATORY — see `.claude/rules/i18n.md`)

- **NEVER hardcode user-facing strings** — all text goes into `src/messages/de.json` + `src/messages/en.json`
- **German umlauts must be correct:** ä ö ü ß — never ae, oe, ue, sz
- **Navigation:** always import `usePathname`, `useRouter`, `Link` from `@/i18n/navigation` (NOT from `next/navigation`)
- **Server components:** `const t = await getTranslations("namespace")`
- **Client components:** `const t = useTranslations("namespace")`
- **New pages** go under `src/app/[locale]/` — never at root `src/app/`

## Development Workflow

1. `/requirements` - Create feature spec from idea
2. `/architecture` - Design tech architecture (PM-friendly, no code)
3. `/frontend` - Build UI components (shadcn/ui first!)
4. `/backend` - Build APIs, database, RLS policies
5. `/qa` - Test against acceptance criteria + security audit
6. `/deploy` - Deploy to Vercel + production-ready checks

## Feature Tracking

All features tracked in `features/INDEX.md`. Every skill reads it at start and updates it when done. Feature specs live in `features/PROJ-X-name.md`.

## Key Conventions

- **Feature IDs:** PROJ-1, PROJ-2, etc. (sequential)
- **Commits:** `feat(PROJ-X): description`, `fix(PROJ-X): description`
- **Single Responsibility:** One feature per spec file
- **shadcn/ui first:** NEVER create custom versions of installed shadcn components
- **Human-in-the-loop:** All workflows have user approval checkpoints

## Figma Sync (MANDATORY)

**Figma is the Single Source of Truth for all design decisions.**

Whenever a component is created or modified, or design tokens change, the Figma file MUST be updated automatically via the Figma MCP server — without waiting for an explicit request.

- **Channel:** `24frju6h`
- **File:** `https://www.figma.com/design/AxOnJViNOMcviAAUmcudhA/Train-Smarter2.0`
- **Full rules:** @.claude/rules/figma-sync.md

## Build & Test Commands

```bash
npm run dev        # Development server (localhost:3000)
npm run build      # Production build
npm run lint       # ESLint
npm run start      # Production server
```

## Product Context

@docs/PRD.md

## Feature Overview

@features/INDEX.md

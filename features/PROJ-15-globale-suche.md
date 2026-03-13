# PROJ-15: Globale Suche

## Status: Planned
**Created:** 2026-03-12
**Last Updated:** 2026-03-12

## Dependencies
- Requires: PROJ-1–PROJ-4 (Fundament)
- Requires: PROJ-5 (Athleten-Management) — Athleten-Suchergebnisse
- Requires: PROJ-7 (Training Workspace) — Pläne-Suchergebnisse
- Requires: PROJ-12 (Übungsbibliothek) — Übungs-Suchergebnisse

## Übersicht
Plattformweite Schnellsuche über alle relevanten Entitäten (Athleten, Pläne, Übungen, Platform Templates) erreichbar via Tastaturkürzel `Cmd+K` / `Ctrl+K` oder Such-Icon im Header. Ergebnisse werden nach Typ gruppiert, per Tastatur navigierbar und führen mit Enter direkt zur Ressource. Enthält Quick Actions für häufige Operationen.

## User Stories
- Als Trainer möchte ich mit `Cmd+K` jederzeit eine Schnellsuche öffnen und sofort den Namen eines Athleten eingeben, damit ich in Sekunden zur richtigen Seite komme ohne durch die Navigation zu navigieren
- Als Trainer möchte ich Übungen nach Name oder Muskelgruppe suchen und direkt zur Übungs-Detail-Ansicht springen, damit ich nicht erst in die Bibliothek navigieren muss
- Als Trainer möchte ich meine eigenen Pläne nach Name suchen und direkt öffnen, damit ich schnell zwischen Plänen wechseln kann
- Als User möchte ich Quick Actions (z.B. „Athleten einladen", „Neuen Plan erstellen") über die Suche ausführen, damit ich häufige Aktionen ohne Navigation starten kann
- Als User möchte ich mit Pfeiltasten durch die Suchergebnisse navigieren und mit Enter öffnen, damit ich nie die Maus brauche

## Acceptance Criteria

### Figma Screens
- [ ] Figma Screen: Suche-Modal offen (Desktop — zentriert mit Backdrop)
- [ ] Figma Screen: Suche-Modal mit Ergebnissen (gruppiert nach Typ)
- [ ] Figma Screen: Suche-Modal leer (Recent Searches + Quick Actions)
- [ ] Figma Screen: Mobile Suche (Full-Screen Modal oder Bottom Sheet)

### Öffnen der Suche
- [ ] Tastaturkürzel: `Cmd+K` (macOS) / `Ctrl+K` (Windows/Linux) öffnet Such-Modal jederzeit
- [ ] Such-Icon im App-Header (Lupe) öffnet dasselbe Modal per Klick
- [ ] Modal öffnet mit Fokus direkt im Suchfeld — keine Mausaktion nötig
- [ ] `Escape` schließt das Modal
- [ ] Klick auf Backdrop schließt das Modal

### Leerer Zustand (noch keine Eingabe)
- [ ] „Zuletzt angesehen" — bis zu 5 zuletzt besuchte Seiten/Entitäten
- [ ] Quick Actions (immer sichtbar, unabhängig von Sucheingabe):
  - Trainer: „Athleten einladen", „Neuen Plan erstellen", „Neue Übung erstellen"
  - Athlet: „Heutiges Workout öffnen"
  - Admin: „Neue Platform-Übung erstellen", „Neues Template erstellen"
- [ ] Quick Actions per Tastatur auswählbar (Pfeiltasten + Enter)

### Suchergebnisse
- [ ] Suche beginnt ab 2 eingegebenen Zeichen (Debounce: 200ms)
- [ ] Ergebnisse werden nach Typ gruppiert mit Gruppen-Header:
  - **Athleten** (nur für Trainer: eigene Athleten) — zeigt Avatar-Initial + Name + Status
  - **Pläne** (eigene Pläne des Trainers) — zeigt Plan-Name + zuletzt bearbeitet
  - **Übungen** (globale + eigene) — zeigt Name + Muskelgruppen-Tags + Quelle (Platform/Eigene)
  - **Platform Templates** — zeigt Name + Level + Sport-Typ
- [ ] Max. 3 Ergebnisse pro Gruppe (Klick auf „Mehr anzeigen" öffnet gefilterte Vollansicht)
- [ ] Kein Ergebnis: „Keine Ergebnisse für „[Suchbegriff]"" + Vorschlag „Neue Übung mit diesem Namen erstellen"
- [ ] Such-Treffer werden **fett hervorgehoben** im Ergebnis-Text

### Tastatur-Navigation
- [ ] `↓` / `↑` navigiert durch alle Ergebnisse (überspringt Gruppen-Header, springt zwischen Gruppen)
- [ ] `Enter` öffnet das markierte Ergebnis / führt Quick Action aus
- [ ] `Tab` springt zum nächsten Gruppen-Header
- [ ] Erstes Ergebnis ist beim Öffnen der Ergebnisse automatisch fokussiert

### Navigation zu Ergebnis
- [ ] Klick oder Enter auf Athleten-Ergebnis → `/organisation/athletes/[id]`
- [ ] Klick oder Enter auf Plan-Ergebnis → öffnet Plan im Training Workspace
- [ ] Klick oder Enter auf Übungs-Ergebnis → Übungs-Detail in Bibliothek `/training/exercises`
- [ ] Klick oder Enter auf Template-Ergebnis → Template-Vorschau im Training Workspace
- [ ] Navigation schließt das Modal automatisch

### Suchhistorie
- [ ] Letzte 10 Suchen werden lokal (localStorage) gespeichert
- [ ] „Zuletzt gesucht" zeigt die 3 häufigsten Terms wenn Suchfeld leer
- [ ] „X" Button neben jedem History-Eintrag löscht ihn
- [ ] „Verlauf löschen" Link am Ende der History-Liste

### Rollen-abhängige Ergebnisse
- [ ] Trainer: Athleten (nur eigene), Pläne (nur eigene), Übungen (global + eigene), Platform Templates
- [ ] Athlet: Nur eigene Pläne + Übungen (keine Athleten-Ergebnisse)
- [ ] Admin: Zusätzlich Platform Templates und alle globalen Übungen

## Edge Cases
- Suche während Supabase offline → Cached-Ergebnisse aus letzter Session (wenn vorhanden), sonst Fehlermeldung „Suche momentan nicht verfügbar"
- Sehr langer Suchbegriff (> 100 Zeichen) → Suche abbrechen, Hinweis „Suchbegriff zu lang"
- Sonderzeichen in Suche (`<`, `>`, `'`) → HTML-escaping, SQL-Injection-Schutz (parametrisierte Queries)
- User gibt E-Mail-Adresse eines Athleten ein → Suche findet Athleten auch nach E-Mail (nicht nur Name)
- Trainer hat 0 Athleten → Athleten-Gruppe wird ausgeblendet, nur Übungen + Templates

## Technical Requirements
- Performance: Suchergebnisse in < 200ms (Debounce verhindert zu viele Requests)
- Security: Suche läuft über RLS-gesicherte Supabase Queries — kein User kann Daten anderer User sehen
- Search: Supabase `ilike` für einfache Suche; bei > 500 Einträgen: Postgres Full-Text Search (`tsvector`) für Übungen
- Accessibility: Modal hat `role="dialog"`, Suchfeld hat `aria-label`, Ergebnisse als `role="listbox"` + `aria-selected`
- Keyboard: Vollständig tastatursteuerbar ohne Maus (WCAG 2.1 Kriterium 2.1.1)

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_

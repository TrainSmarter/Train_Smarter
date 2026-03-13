# PROJ-12: Übungsbibliothek

## Status: Planned
**Created:** 2026-03-12
**Last Updated:** 2026-03-12

## Dependencies
- Requires: PROJ-1 (Design System Foundation)
- Requires: PROJ-2 (UI Component Library) — Card, Modal, Button, Input, Badge, EmptyState
- Requires: PROJ-3 (App Shell & Navigation) — Tab innerhalb /training
- Requires: PROJ-4 (Authentication) — Trainer-Session + Rolle
- Informs: PROJ-7 (Training Workspace) — Übungen werden in Trainingsplanung verwendet
- Informs: PROJ-10 (Admin-Bereich) — Admin verwaltet globale Übungen (teilt dieselbe exercises-Tabelle)

## Navigation-Kontext
Übungsbibliothek ist ein **Tab innerhalb der Training-Sektion**:

```
/training
  /                ← Training Workspace (PROJ-7)
  /calendar        ← Trainingskalender (PROJ-8)
  /exercises       ← Übungsbibliothek (PROJ-12)
```

## Übersicht
Trainer haben Zugang zu einer zweigeteilten Übungsbibliothek: globale Übungen (vom Admin gepflegt, für alle Trainer verfügbar) und eigene Übungen (nur in der eigenen Bibliothek sichtbar). Trainer können globale Übungen direkt 1:1 verwenden oder als eigene Kopie klonen und anpassen. Alle Übungen — global wie personal — stehen in der Trainingsplanung (PROJ-7) zur Verfügung.

## User Stories
- Als Trainer möchte ich alle verfügbaren Übungen (global + meine eigenen) in einer einheitlichen Bibliothek sehen, damit ich schnell die richtige Übung finde
- Als Trainer möchte ich eigene Übungen anlegen, damit ich spezifische Übungen für mein Training verwenden kann die nicht in der globalen Bibliothek sind
- Als Trainer möchte ich eine globale Übung klonen und für mich anpassen, damit ich sie mit meiner eigenen Beschreibung oder Variante speichern kann
- Als Trainer möchte ich globale Übungen direkt ohne Klonen in der Trainingsplanung verwenden, damit ich keine unnötige Kopie anlegen muss
- Als Trainer möchte ich Übungen nach Muskelgruppe, Name und Typ filtern, damit ich schnell die passende Übung finde
- Als Trainer möchte ich eigene Übungen bearbeiten und löschen, damit meine Bibliothek aktuell bleibt

## Acceptance Criteria

### Figma Screens
- [ ] Figma Screen: Übungsbibliothek-Tab (Liste mit Filter/Suche, Desktop + Mobile)
- [ ] Figma Screen: Übung erstellen/bearbeiten (Modal oder Detailseite)
- [ ] Figma Screen: Übungs-Detail-Ansicht (globale Übung mit „Klonen"-Option)
- [ ] Figma Screen: Leerer Zustand (keine eigenen Übungen, noch keine globalen vorhanden)

### Übungsbibliothek-Übersicht
- [ ] Route: `/training/exercises`
- [ ] Zwei Sektionen in einer Ansicht:
  - **Globale Übungen** (Badge „Platform") — vom Admin erstellt, read-only für Trainer
  - **Meine Übungen** (Badge „Eigene") — vom Trainer selbst erstellt oder geklont
- [ ] Darstellung: Liste oder Grid (umschaltbar), Card zeigt: Name, Muskelgruppen-Tags, Quelle (Platform / Eigene)
- [ ] Suche: Live-Suche nach Übungsname (über beide Sektionen gleichzeitig)
- [ ] Filter: Muskelgruppe (Multi-Select), Quelle (Alle / Nur Platform / Nur Eigene)
- [ ] Sortierung: Alphabetisch A–Z / Z–A, Zuletzt erstellt
- [ ] Button „Neue Übung erstellen" (primary, oben rechts) — öffnet Erstellen-Modal
- [ ] Leerer Zustand Eigene Übungen: EmptyState-Komponente „Du hast noch keine eigenen Übungen — erstelle deine erste oder verwende eine Platform-Übung"
- [ ] Leerer Zustand gesamt (keine Ergebnisse bei Suche/Filter): „Keine Übungen gefunden"

### Übung erstellen (Trainer-Personal)
- [ ] Modal: Name (Pflicht, max 100 Zeichen), Beschreibung (optional, Textarea max 1000 Zeichen), Muskelgruppen (Multi-Select Tags), Video-URL (optional, externe URL — kein Upload in v1.0)
- [ ] Validierung: Name darf nicht leer sein
- [ ] Duplikat-Prüfung innerhalb eigener Bibliothek: Warnung „Du hast bereits eine Übung mit diesem Namen" — nicht blockierend
- [ ] Nach Speichern: Übung erscheint sofort in „Meine Übungen" Sektion

### Übung bearbeiten und löschen (nur eigene Übungen)
- [ ] Bearbeiten: Alle Felder editierbar (Name, Beschreibung, Muskelgruppen, Video-URL)
- [ ] Löschen: Soft-Delete mit ConfirmDialog „Diese Übung löschen? Sie wird aus deiner Bibliothek entfernt, bleibt aber in bestehenden Trainingsplänen erhalten ([Übung gelöscht] Placeholder)"
- [ ] Globale Übungen: Kein Bearbeiten- oder Löschen-Button sichtbar (read-only)

### Globale Übungen verwenden
- [ ] Trainer kann globale Übungen **direkt** in der Trainingsplanung (PROJ-7) verwenden — ohne vorheriges Klonen
- [ ] In der Trainingsplanung werden globale Übungen im Universal-Selector angezeigt (Badge „Platform")
- [ ] Detail-Ansicht einer globalen Übung zeigt: Name, Beschreibung, Muskelgruppen, Video (falls vorhanden), Badge „Platform-Übung"

### Globale Übung klonen
- [ ] Button „In meine Bibliothek kopieren" auf jeder globalen Übung
- [ ] Klon wird sofort in „Meine Übungen" gespeichert mit Suffix „(Kopie)" am Namen — editierbar
- [ ] Alle Felder der Original-Übung werden übernommen, danach vollständig editierbar
- [ ] Klon ist unabhängig vom Original: Änderungen am Original (durch Admin) aktualisieren die Kopie **nicht**
- [ ] Klon ist als eigene Übung markiert (Badge „Eigene"), nicht mehr als „Platform"
- [ ] Mehrfaches Klonen derselben Übung: Warnung „Du hast diese Übung bereits geklont ([Datum])" — nicht blockierend

### Integration Training Workspace (PROJ-7)
- [ ] Beim Hinzufügen einer Übung im Training Workspace: Übungs-Picker zeigt globale + eigene Übungen
- [ ] Übungs-Picker hat dieselbe Suche/Filter-Logik wie die Bibliothek
- [ ] Gelöschte eigene Übungen in bestehenden Plänen: werden als „[Übung gelöscht]" angezeigt (kein Hard-Delete)
- [ ] Gelöschte globale Übungen (Admin Soft-Delete): werden in bestehenden Plänen als „[Übung entfernt]" angezeigt

## Edge Cases
- Trainer löscht eigene Übung die in einem aktiven Trainingsplan verwendet wird → Soft-Delete, Plan zeigt „[Übung gelöscht]" Placeholder, kein Datenverlust
- Admin löscht globale Übung die ein Trainer direkt (ohne Klonen) in einem Plan verwendet → Plan zeigt „[Übung entfernt]" Placeholder
- Trainer klont eine globale Übung, Admin ändert danach die Original-Übung → Klon ist unberührt (isolierter Snapshot)
- Übungs-Picker im Training Workspace: mehr als 100 Übungen → Pagination oder virtualisierte Liste
- Video-URL ungültig (404) → Fehlermeldung beim Speichern: „Die Video-URL scheint nicht erreichbar zu sein" — Warnung, nicht blockierend
- Trainer-Account gelöscht (PROJ-11) → eigene Übungen werden mit Account gelöscht (Soft-Delete, Pläne behalten Placeholder)

## Technical Requirements
- Security: RLS — Trainer kann ausschließlich seine eigenen Übungen (`created_by = trainer_id`) schreiben/löschen. Globale Übungen (`is_global = true`) sind für alle Trainer les-bar, aber nur via Admin-Service-Role schreibbar
- Performance: Übungs-Suche filtert client-seitig bei < 200 Übungen, server-seitig bei mehr
- Performance: Bibliothek lädt in < 500ms (initialer Load, ohne Suche)
- Soft-Delete: Übungen werden nie hart gelöscht — `is_deleted = true` + `deleted_at` Timestamp

## Datenbankschema: exercises

```
exercises
├── id: uuid (PK)
├── name: text (NOT NULL)
├── description: text | null
├── muscle_groups: text[]          — z.B. ["Quadrizeps", "Gluteus", "Core"]
├── video_url: text | null         — externe URL, kein Upload in v1.0
├── created_by: uuid | null        — null = Platform (Admin), uuid = Trainer-ID
├── is_global: boolean             — true = Admin erstellt, allen Trainern sichtbar
│                                     false = Trainer-Personal, nur creator sieht sie
├── cloned_from: uuid | null       — FK → exercises.id (wenn Klon einer globalen Übung)
├── is_deleted: boolean (default: false)
├── deleted_at: timestamp | null
└── created_at: timestamp
```

### Sichtbarkeits-Regeln (RLS)
| Übung | Wer sieht sie | Wer kann schreiben |
|---|---|---|
| `is_global = true` | Alle Trainer (read) | Nur Admin (service-role) |
| `is_global = false`, `created_by = trainer_id` | Nur dieser Trainer | Nur dieser Trainer |

### Abgrenzung PROJ-12 vs. PROJ-10
| | PROJ-12 (Trainer-Bibliothek) | PROJ-10 (Admin-Bereich) |
|---|---|---|
| Route | `/training/exercises` | `/admin/exercises` |
| Zielgruppe | Trainer (eigene + globale anzeigen) | Platform-Admin (nur globale verwalten) |
| Schreiben | Eigene Übungen anlegen/bearbeiten | Globale Übungen anlegen/bearbeiten |
| Datengrundlage | Dieselbe `exercises`-Tabelle | Dieselbe `exercises`-Tabelle |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_

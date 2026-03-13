# PROJ-11: DSGVO-Compliance & Datenschutz

## Status: Planned
**Created:** 2026-03-12
**Last Updated:** 2026-03-12

## Dependencies
- Requires: PROJ-1 (Design System Foundation)
- Requires: PROJ-2 (UI Component Library) — Button, Dialog, Card, Badge, Checkbox
- Requires: PROJ-3 (App Shell & Navigation) — Account-Seiten, Footer
- Requires: PROJ-4 (Authentication & Onboarding) — Einwilligungs-Schritt in Registrierung
- Informs: PROJ-5 (Athleten-Management) — can_see_* Flags ergänzen user_consents
- Informs: PROJ-10 (Admin-Bereich) — Audit-Log Anonymisierung

## Übersicht
Vollständige DSGVO-Compliance nach österreichischem/EU-Recht. Umfasst alle fünf Betroffenenrechte (Auskunft, Löschung, Portabilität, Berichtigung, Widerspruch), granulares Einwilligungs-Management bei Registrierung und in den Einstellungen, Account-Löschung mit Kaskaden-Löschung, Daten-Export (JSON/CSV), Pflicht-Seiten (Datenschutzerklärung, Impressum, AGB) und Daten-Retention-Policy. Rechtsgrundlage: DSGVO Art. 12–22, österreichisches DSG.

## Besonderheit: Sensible Datenkategorien
Körpergewicht, Körpermaße, Schlafqualität, Wellness-Score und Ernährungsdaten werden vorsorglich wie **Gesundheitsdaten (Art. 9 DSGVO)** behandelt. Das erfordert **ausdrückliche, granulare Einwilligung** (Opt-in, kein Pre-Check).

## User Stories
- Als neuer Benutzer möchte ich bei der Registrierung klar und granular einwilligen, welche Datenkategorien verarbeitet werden dürfen, damit ich die Kontrolle über meine Daten habe
- Als Benutzer möchte ich alle meine gespeicherten Daten als Export herunterladen, damit ich von meinem Recht auf Datenportabilität (Art. 20 DSGVO) Gebrauch machen kann
- Als Benutzer möchte ich meinen Account und alle meine Daten vollständig löschen können, damit mein Recht auf Vergessenwerden (Art. 17 DSGVO) gewährt ist
- Als Benutzer möchte ich meine Einwilligungen jederzeit einsehen und widerrufen können, damit ich dauerhaft die Kontrolle behalte
- Als Benutzer möchte ich die Datenschutzerklärung, das Impressum und die AGB jederzeit ohne Login einsehen können, damit ich informiert bin
- Als Benutzer möchte ich bei Account-Löschung eine klare Bestätigung und Übersicht der Konsequenzen erhalten, damit ich eine bewusste Entscheidung treffe

## Acceptance Criteria

### Pflicht-Seiten (ohne Login zugänglich)
- [ ] Route: `/datenschutz` — Datenschutzerklärung (SSG, kein Auth erforderlich)
- [ ] Route: `/impressum` — Impressum (Pflicht nach österreichischem Mediengesetz)
- [ ] Route: `/agb` — Allgemeine Geschäftsbedingungen
- [ ] Link zu allen drei Seiten im App-Footer und auf Login/Registrierungs-Seite
- [ ] Datenschutzerklärung dokumentiert: welche Daten, Zweck, Rechtsgrundlage, Speicherdauer, Auftragsverarbeiter (Supabase/Vercel mit EU-DPA), Betroffenenrechte, Kontakt DSB
- [ ] Alle drei Seiten statisch gerendert (SSG) — kein Datenbankaufruf nötig

### Einwilligungs-Management (Onboarding — PROJ-4 Integration)
- [ ] Neuer Pflicht-Schritt im Onboarding-Wizard: Einwilligungen
- [ ] **Pflicht-Checkbox (blockierend):** „Ich akzeptiere die AGB und Datenschutzerklärung" — Link öffnet jeweilige Seite in neuem Tab, Pre-Check NICHT erlaubt
- [ ] **Opt-in Körper & Wellness-Daten:** „Ich erlaube die Verarbeitung meiner Körperdaten (Gewicht, Maße, Schlaf, Wellness-Score)" — standardmäßig **nicht** angehakt
- [ ] **Opt-in Ernährungsdaten:** „Ich erlaube die Verarbeitung meines Ernährungstagebuchs" — standardmäßig **nicht** angehakt
- [ ] Einwilligungen werden mit Timestamp, Policy-Version und Opt-in/Opt-out-Status in `user_consents`-Tabelle gespeichert (append-only)
- [ ] Ohne Pflicht-Checkbox-Zustimmung: Registrierung nicht abschließbar
- [ ] Opt-ins (Körper, Ernährung) können übersprungen werden — Feature ist dann für diesen User deaktiviert

### Datenschutz-Einstellungen (/account/datenschutz)
- [ ] Route: `/account/datenschutz`
- [ ] Übersicht aller erteilten Einwilligungen mit Datum der Erteilung und aktueller Policy-Version
- [ ] Toggle zum Widerrufen jeder Opt-in-Einwilligung — mit ConfirmDialog: „Was passiert wenn du widerrufst: Die Verarbeitung dieser Datenkategorie wird sofort gestoppt. Bereits erfasste Daten bleiben bis zu einer expliziten Löschung erhalten."
- [ ] Widerruf wird sofort wirksam und in `user_consents` mit `revoked_at`-Timestamp gespeichert
- [ ] Nach Widerruf von Körperdaten-Einwilligung: Check-in Formular blendet Körperdaten-Felder aus
- [ ] Anzeige des Trainer-Datenzugriffs (can_see_body_data, can_see_nutrition, can_see_calendar aus PROJ-5) mit direktem Link zu den Verbindungs-Einstellungen
- [ ] Button: „Alle meine Daten exportieren" → startet asynchronen Daten-Export (siehe unten)
- [ ] Button: „Account löschen" (danger) → startet Account-Löschungs-Flow (siehe unten)

### Daten-Export — Art. 20 DSGVO (Datenportabilität)
- [ ] Export-Anfrage erstellt asynchronen Job (Supabase Edge Function)
- [ ] Bestätigungs-E-Mail: „Dein Export wird vorbereitet — du erhältst einen Link sobald er bereit ist"
- [ ] Fertigstellungs-E-Mail mit Download-Link (signed URL, gültig 48h) — Maximale Wartezeit: 24h
- [ ] **Export-Inhalt (JSON + CSV, gepackt als ZIP):**
  - `profil.json` — Name, E-Mail, Geburtsdatum, Rolle, Registrierungsdatum
  - `trainingsplaene.json` + `trainingsplaene.csv` — alle eigenen Pläne, Einheiten, Übungen
  - `koerperdaten.json` + `koerperdaten.csv` — Gewicht, Maße (nur wenn Einwilligung erteilt)
  - `check-ins.json` + `check-ins.csv` — Wellness/Schlaf-Daten (nur wenn Einwilligung erteilt)
  - `ernaehrung.json` + `ernaehrung.csv` — Ernährungsdaten (nur wenn Einwilligung erteilt)
  - `verbindungen.json` — Trainer-Athlet-Verbindungen (Status, Datum — keine fremden personenbezogenen Daten)
  - `einwilligungen.json` — vollständige Einwilligungs-Historie
  - `README.txt` — Erklärung der exportierten Datenstruktur
- [ ] Export enthält KEIN Passwort-Hash, KEINE internen IDs anderer User, KEINE Daten anderer User
- [ ] Rate-Limit: 1 Export-Anfrage pro 30 Tage — Fehlermeldung zeigt Datum des letzten Exports
- [ ] Download-Link wird nach 48h automatisch invalidiert

### Account-Löschung — Art. 17 DSGVO (Recht auf Vergessenwerden)
- [ ] Zweistufige Bestätigung:
  - Schritt 1: Dialog mit Auflistung aller Konsequenzen (Datenverlust, Verbindungs-Trennung, kein Reaktivierungs-Self-Service)
  - Schritt 2: E-Mail-Adresse des Accounts eingeben zur finalen Bestätigung — Typo-Schutz
- [ ] Löschungs-Ablauf (serverseitig via Edge Function, nicht client-seitig):
  - **Sofort:** Supabase Auth Account deaktivieren (kein Login mehr möglich)
  - **Sofort:** Alle aktiven Sessions invalidieren
  - **Sofort:** Trainer-Athlet-Verbindungen auf Status `"disconnected"` setzen
  - **Sofort:** Profilbild aus Supabase Storage löschen
  - **Sofort:** Persönliche Daten pseudonymisieren: Name → „[Gelöschter Benutzer]", E-Mail → anonymisierter Hash
  - **30-Tage-Grace-Period:** Vollständige Löschung aller verbleibenden Datensätze (DSGVO erlaubt angemessene technische Frist)
- [ ] Audit-Log: User-ID (UUID) bleibt als anonymer Identifier erhalten, Name/E-Mail/alle PII werden entfernt
- [ ] Trainer die diesen User als Athleten hatten: sehen „[Gelöschter Benutzer]" bis Verbindung bereinigt
- [ ] Athleten die diesen User als Trainer hatten: Benachrichtigung „Dein Trainer hat die Plattform verlassen — die Verbindung wurde getrennt"
- [ ] Bestätigungs-E-Mail nach Initiierung der Löschung (mit Hinweis auf 30-Tage-Frist und Support-Kontakt für Reaktivierung)

### Daten-Retention Policy (technisch dokumentiert)
- [ ] Personenbezogene Daten: Aktiv solange Account aktiv → 30-Tage-Grace-Period nach Löschantrag → vollständige Löschung
- [ ] Audit-Log-Einträge: 12 Monate aufbewahrt (PROJ-10 Archivierung geplant)
- [ ] Einladungs-Tokens: 7 Tage (bereits in PROJ-5)
- [ ] Daten-Export-Links: 48h (signed URL)
- [ ] Session-Daten: 30 Tage bei „Eingeloggt bleiben" (Supabase Auth Standard)
- [ ] Retention-Regeln sind in der Datenschutzerklärung dokumentiert

### Auskunftsrecht — Art. 15 DSGVO
- [ ] `/account/datenschutz` zeigt Übersicht: welche Datenkategorien gespeichert sind, zu welchem Zweck, seit wann
- [ ] Formaler Auskunftsantrag jenseits des Self-Service: Link zu datenschutz@train-smarter.at (kein automatisierter Flow in v1.0)

### Berichtigungsrecht — Art. 16 DSGVO
- [ ] Profildaten (Name, E-Mail, Geburtsdatum) auf `/account` jederzeit bearbeitbar
- [ ] E-Mail-Änderung: Bestätigungs-E-Mail an neue Adresse (Supabase Auth Flow) — alte E-Mail bleibt bis Bestätigung aktiv
- [ ] Audit-Log-Einträge sind nicht korrigierbar (append-only — korrekt nach DSGVO)

### Infrastruktur: Supabase EU-Region
- [ ] Supabase-Projekt auf Region `eu-central-1` (Frankfurt) konfiguriert — kein anderer Region erlaubt
- [ ] Vercel Edge Functions auf EU-Region (Frankfurt) konfiguriert
- [ ] Supabase DPA (Data Processing Agreement) akzeptiert und Nachweis dokumentiert
- [ ] Kein Transfer personenbezogener Daten außerhalb des EWR ohne Standard-Vertragsklauseln
- [ ] Vercel DPA akzeptiert (Vercel verarbeitet Logs mit personenbezogenen Daten)

## Edge Cases
- User löscht Account während Export-Job läuft → Export wird abgebrochen, Löschung hat Vorrang
- Trainer-Account gelöscht → Alle Athleten dieses Trainers erhalten Benachrichtigung, Verbindungen werden sofort getrennt
- Einwilligung für Körperdaten widerrufen, aber Trainer hat `can_see_body_data = true` → Flag wird automatisch auf `false` gesetzt (Einwilligung geht vor Trainer-Einstellung)
- User versucht zweiten Export innerhalb 30 Tage → Fehlermeldung: „Du hast bereits am [Datum] einen Export angefordert. Nächster Export möglich ab [Datum]."
- Account in 30-Tage-Grace-Period — User möchte Löschung rückgängig machen → Nur via Support-E-Mail, kein Self-Service
- Minderjähriger (< 16 Jahre) bei Geburtsdatum-Eingabe → Hinweis: „Für Nutzer unter 16 Jahren ist die Zustimmung eines Erziehungsberechtigten erforderlich. Bitte kontaktiere uns unter [E-Mail]." — Registrierung blockiert
- Mehrfach-Einwilligung (Policy-Update) → User wird beim nächsten Login auf neue Version hingewiesen, muss erneut zustimmen

## Technical Requirements
- Security: Account-Löschung und Daten-Export ausschließlich via serverseitiger Edge Function (kein client-seitiger Trigger möglich)
- Security: Export-Link ist signed URL mit 48h TTL (Supabase Storage signed URLs)
- Security: Löschungs-Bestätigung via E-Mail-Adresse verhindert versehentliche Selbstlöschung
- Compliance: `user_consents`-Tabelle ist append-only — Einwilligungen werden nie überschrieben, nur neue Einträge hinzugefügt (vollständige Audit-Trail)
- Compliance: Alle Lösch- und Export-Vorgänge werden im Audit-Log mit Timestamp, User-ID und Aktions-Typ protokolliert
- Compliance: IP-Adresse bei Einwilligung loggen (Dokumentationspflicht DSGVO Art. 7)
- Infrastructure: Supabase eu-central-1 ist Pflicht — kein Deployment in andere Regionen
- Legal: Texte für Datenschutzerklärung, Impressum und AGB müssen von einem Rechtsanwalt für österreichisches Recht geprüft werden (außerhalb des Software-Scopes, aber Voraussetzung für Go-Live)

## Datenbankschema: user_consents

```
user_consents
├── id: uuid (PK)
├── user_id: uuid (FK → auth.users)
├── consent_type: "terms_privacy" | "body_wellness_data" | "nutrition_data"
├── granted: boolean          — true = Einwilligung erteilt, false = widerrufen
├── granted_at: timestamp     — Zeitpunkt der Einwilligung/des Widerrufs
├── policy_version: text      — Version der Datenschutzerklärung zum Zeitpunkt
└── ip_address: text | null   — für DSGVO-Dokumentationspflicht (Art. 7)

UNIQUE constraint: (user_id, consent_type, policy_version)
Append-only: keine UPDATE-Operationen auf bestehende Zeilen
```

### Abgrenzung: user_consents vs. can_see_* Flags
| | `user_consents` | `can_see_*` in `trainer_athlete_connections` |
|---|---|---|
| Was | Plattform darf Daten verarbeiten | Trainer darf Daten einsehen |
| Gesetzt von | User bei Registrierung / Einstellungen | Athlet in Verbindungs-Einstellungen |
| DSGVO-Basis | Einwilligung Art. 6/9 | Datenweitergabe-Kontrolle |
| Bei Widerruf Körperdaten | `body_wellness_data = false` | `can_see_body_data` wird automatisch `false` |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_

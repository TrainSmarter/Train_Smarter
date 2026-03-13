# PROJ-13: E-Mail & Transaktions-Benachrichtigungen

## Status: Planned
**Created:** 2026-03-12
**Last Updated:** 2026-03-12

## Dependencies
- Requires: PROJ-4 (Authentication & Onboarding) — Auth-E-Mails (Registrierung, Passwort-Reset, E-Mail-Bestätigung)
- Informs: PROJ-5 (Athleten-Management) — Einladungs-E-Mails
- Informs: PROJ-11 (DSGVO) — Daten-Export-fertig-E-Mail, Account-Löschungs-Bestätigung

## E-Mail-Infrastruktur

**Provider:** Webgo Hosting SMTP (train-smarter.at Domain)

```
noreply@train-smarter.at  → alle automatischen Transaktions-Mails (kein Reply möglich)
office@train-smarter.at   → Support-Kontaktadresse (wird als Reply-To in relevanten Mails gesetzt)
```

**Konfiguration:**
- SMTP-Zugangsdaten von Webgo Hosting-Panel (train-smarter.at)
- Supabase Auth E-Mails werden auf Webgo SMTP umgeleitet (Supabase Custom SMTP Einstellung)
- Eigene App-E-Mails (nicht Auth) werden über Supabase Edge Function + SMTP versandt

## Übersicht
Vollständige E-Mail-Infrastruktur für alle Transaktions-Mails der App. Umfasst: Supabase Auth-E-Mails (über Custom SMTP geleitet), Athleten-Einladungen, Daten-Export-Benachrichtigungen, Account-Löschungs-Bestätigungen und weitere App-Events. Alle E-Mails werden von noreply@train-smarter.at gesendet, relevante haben office@train-smarter.at als Reply-To.

## User Stories
- Als neuer Benutzer möchte ich eine Bestätigungs-E-Mail von einer erkennbaren Absenderadresse (@train-smarter.at) erhalten, damit ich der Plattform vertraue
- Als eingeladener Athlet möchte ich eine professionell gestaltete Einladungs-E-Mail erhalten, die klar erklärt wer mich einlädt und was Train Smarter ist
- Als Benutzer der einen Daten-Export angefordert hat möchte ich eine E-Mail erhalten sobald der Export bereit ist, damit ich nicht warten oder nachschauen muss
- Als Benutzer möchte ich nach der Account-Löschung eine Bestätigungs-E-Mail erhalten, damit ich sicher bin dass meine Daten verarbeitet werden
- Als Trainer möchte ich informiert werden wenn ein Athlet meine Einladung annimmt oder ablehnt

## Acceptance Criteria

### E-Mail-Infrastruktur Setup
- [ ] Supabase Custom SMTP konfiguriert: Webgo SMTP-Server, Port 587 (TLS), noreply@train-smarter.at
- [ ] SPF-Eintrag für train-smarter.at DNS gesetzt (verhindert Spam-Klassifizierung)
- [ ] DKIM-Signatur konfiguriert (Webgo Hosting Panel → E-Mail-Authentifizierung)
- [ ] Test-E-Mail erfolgreich zugestellt (kein Spam-Ordner)
- [ ] Alle E-Mails haben korrekte Headers: From, Reply-To, List-Unsubscribe (für transaktionale Mails optional)

### Supabase Auth E-Mails (via Custom SMTP)
- [ ] **Registrierung / E-Mail-Bestätigung:** Betreff „Bitte bestätige deine E-Mail-Adresse — Train Smarter", Absender noreply@train-smarter.at
- [ ] **Passwort-Reset:** Betreff „Passwort zurücksetzen — Train Smarter", Link gültig 1h
- [ ] **E-Mail-Adresse ändern:** Bestätigungs-E-Mail an neue Adresse, Hinweis-E-Mail an alte Adresse
- [ ] Alle Auth-E-Mails: Deutschsprachig, konsistentes Layout (Logo, Farben aus Design System PROJ-1)

### Athleten-Einladung (PROJ-5)
- [ ] **Trigger:** Trainer lädt Athleten ein
- [ ] **Absender:** noreply@train-smarter.at, **Reply-To:** office@train-smarter.at
- [ ] **Betreff:** „[Trainer-Name] hat dich zu Train Smarter eingeladen"
- [ ] **Inhalt:**
  - Trainer-Name + optionale persönliche Nachricht (aus Einladungs-Modal)
  - Kurze Erklärung was Train Smarter ist (1–2 Sätze)
  - CTA-Button: „Einladung annehmen" → Link zur Registrierung/Login mit Invite-Token
  - Link-Ablauf: 7 Tage (Hinweis in der Mail)
  - Footer: Datenschutzerklärung-Link, „Du hast diese E-Mail erhalten weil [Trainer-Name] deine Adresse angegeben hat"

### Einladung angenommen / abgelehnt (PROJ-5)
- [ ] **Einladung angenommen:** E-Mail an Trainer — Betreff: „[Athlet-Name] hat deine Einladung angenommen"
- [ ] **Einladung abgelehnt:** E-Mail an Trainer — Betreff: „[Athlet-Name] hat deine Einladung abgelehnt"
- [ ] Beide: kurze Info, CTA „Athleten-Übersicht öffnen"

### Verbindung getrennt (PROJ-5)
- [ ] **Trainer trennt Athlet:** E-Mail an Athlet — „Dein Trainer [Name] hat die Verbindung getrennt"
- [ ] **Athlet trennt Trainer:** E-Mail an Trainer — „[Athlet-Name] hat die Verbindung zu dir getrennt"

### Daten-Export bereit (PROJ-11)
- [ ] **Trigger:** Export-Job abgeschlossen
- [ ] **Betreff:** „Dein Daten-Export ist bereit — Train Smarter"
- [ ] **Inhalt:** CTA-Button „Export herunterladen" (signed URL, 48h gültig), Hinweis auf Ablaufzeit
- [ ] **Reply-To:** office@train-smarter.at (User könnte Fragen haben)

### Account-Löschung (PROJ-11)
- [ ] **Initiierungs-Bestätigung:** Betreff „Account-Löschung eingeleitet — Train Smarter"
  - Inhalt: Löschung initiiert, Grace-Period 30 Tage, Support-Kontakt (office@train-smarter.at) für Reaktivierung
- [ ] **Abschluss-Bestätigung** (nach 30-Tage-Löschung): Betreff „Dein Account wurde gelöscht — Train Smarter"
  - Inhalt: Bestätigung vollständiger Löschung gemäß DSGVO

### Trainer verlässt Plattform (PROJ-11)
- [ ] **E-Mail an alle Athleten des gelöschten Trainers:** „Dein Trainer [Name] hat die Plattform verlassen — die Verbindung wurde automatisch getrennt"

### E-Mail-Template Design
- [ ] Einheitliches HTML-Template für alle E-Mails: Logo oben, Teal-Primärfarbe (#0D9488) für CTAs, Footer mit Links
- [ ] Responsive HTML (funktioniert auf Mobile Mail-Clients)
- [ ] Plain-Text-Fallback für alle E-Mails (Spam-Filter-Optimierung)
- [ ] Deutschsprachig (Österreich-DE: keine Helvetismen, kein „ss" statt „ß")

## Edge Cases
- SMTP-Server nicht erreichbar → E-Mail wird in Queue (Retry-Mechanismus: 3 Versuche in 1h) gespeichert, danach Fehler-Log
- E-Mail-Adresse nicht zustellbar (Bounce) → Fehler wird geloggt, kein Retry, Admin-Benachrichtigung bei wiederholten Bounces
- Einladungs-E-Mail landet im Spam → Hinweis auf Einladungs-Seite: „Falls du keine E-Mail erhalten hast, prüfe deinen Spam-Ordner"
- Doppelter Export-Request (Rate-Limit greift) → keine E-Mail, nur UI-Fehlermeldung (bereits in PROJ-11)
- E-Mail-Versand für gelöschten Account → Systemprüfung: keine E-Mail an bereits gelöschte Adressen

## Technical Requirements
- Infrastructure: Webgo SMTP (train-smarter.at Hosting) als primärer Mail-Provider
- Integration: Supabase Custom SMTP für alle Auth-E-Mails (Registrierung, Passwort-Reset, E-Mail-Änderung)
- Integration: Supabase Edge Function für App-Events-E-Mails (Einladungen, Export, Verbindungen)
- Security: SMTP-Credentials als Umgebungsvariablen (nie im Code), in Supabase Secrets + Vercel Env gespeichert
- Deliverability: SPF + DKIM konfiguriert für train-smarter.at
- Logging: Alle versandten E-Mails werden mit Timestamp, Empfänger-Hash (kein Klartext), Typ und Erfolg/Fehler geloggt
- Rate-Limiting: Supabase Auth hat built-in Rate-Limits für Auth-E-Mails; App-E-Mails haben eigenes Rate-Limit pro User pro Event-Typ

## E-Mail-Übersicht (alle Templates)

| # | Trigger | Betreff | Empfänger |
|---|---------|---------|-----------|
| 1 | Registrierung | Bitte bestätige deine E-Mail-Adresse | Neuer User |
| 2 | Passwort-Reset | Passwort zurücksetzen | User |
| 3 | E-Mail-Änderung | Bestätige deine neue E-Mail-Adresse | Neuer + alter User |
| 4 | Athlet eingeladen | [Trainer] hat dich eingeladen | Eingeladener Athlet |
| 5 | Einladung angenommen | [Athlet] hat deine Einladung angenommen | Trainer |
| 6 | Einladung abgelehnt | [Athlet] hat deine Einladung abgelehnt | Trainer |
| 7 | Verbindung getrennt (Trainer) | Dein Trainer hat die Verbindung getrennt | Athlet |
| 8 | Verbindung getrennt (Athlet) | [Athlet] hat die Verbindung getrennt | Trainer |
| 9 | Daten-Export bereit | Dein Daten-Export ist bereit | User |
| 10 | Account-Löschung initiiert | Account-Löschung eingeleitet | User |
| 11 | Account-Löschung abgeschlossen | Dein Account wurde gelöscht | User |
| 12 | Trainer verlässt Plattform | Dein Trainer hat die Plattform verlassen | Alle Athleten des Trainers |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_

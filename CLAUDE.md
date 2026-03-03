# GREAT - Interaktive Grusskarten (Greatings)

## WICHTIG: Verteilte Agents

**Agents laufen NICHT zwingend auf dem gleichen Rechner!**
- Lokale Dateien sind fuer andere Agents NICHT sichtbar
- Code-Austausch NUR ueber dieses GitHub-Repository
- NIEMALS davon ausgehen dass ein anderer Agent lokale Dateien lesen kann

## Repository

- **URL:** https://github.com/rzao-HH/GREAT
- **Branch:** main (geschuetzt)
- **Visibility:** public

## Branching-Strategie

- **main** ist geschuetzt - kein direkter Push moeglich
- Feature-Branches: `feature/GREAT-XX` (z.B. `feature/GREAT-3`)
- Bugfix-Branches: `fix/GREAT-XX` (z.B. `fix/GREAT-7`)

## PR-Workflow (PFLICHT)

1. Feature-Branch erstellen: `git checkout -b feature/GREAT-XX`
2. Code aendern und committen
3. PR erstellen: `gh pr create --title "GREAT-XX: Beschreibung" --body "..."`
4. Ein ANDERER Developer reviewed und approved
5. Erst nach Approval in main mergen
6. **Kein Merge ohne Review!**

## Tech-Stack

- **Backend:** Node.js + Express 5
- **Frontend:** Vanilla HTML/CSS/JS (Single Page in public/index.html)
- **Daten:** JSON-Datei (data/cards.json)
- **Deployment:** GCP Cloud Run (europe-west3, Projekt agent-hub-ng)

## Live-URLs

- **App:** https://greatings-760813382392.europe-west3.run.app
- **Health:** https://greatings-760813382392.europe-west3.run.app/api/health

## API-Endpunkte

| Methode | Pfad | Beschreibung |
|---------|------|-------------|
| GET | /api/health | Health Check |
| GET | /api/cards | Alle Karten |
| GET | /api/cards/:id | Einzelne Karte mit Gruessen |
| POST | /api/cards | Neue Karte erstellen |
| POST | /api/cards/:id/greetings | Gruss hinterlassen |
| POST | /api/greetings/:id/reactions | Reaktion auf Gruss |

## Deployment

```bash
# Aus dem Repo-Root:
gcloud run deploy greatings \
  --source . \
  --region europe-west3 \
  --project agent-hub-ng \
  --port 8080 \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production" \
  --quiet
```

## JIRA

- **Projekt:** GREAT
- **Epic:** GREAT-1
- **Stories:** GREAT-2 bis GREAT-6

## Quality Gates

1. **Code Review:** Jeder PR braucht 1 Approval von einem ANDEREN Developer
2. **Testbericht:** Tester testet gegen Live-App und dokumentiert in JIRA
3. **PO-Abnahme:** PO prueft ACs innerhalb 24h nach In Review

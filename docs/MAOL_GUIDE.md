# MAOL — Minimal Agent Observability Layer
## Quick Reference Guide

### Status: ✅ OPERATIONAL

---

## Configuration (`.env.local`)

```env
NEXT_PUBLIC_MAOL_ENABLED=true
MAOL_SECRET=FOJWLmzwq1RcPDrtbyk2H6ueQMsgvY4i
```

> ⚠️ Keep `MAOL_SECRET` private. Change it before production deployment.

---

## How It Works

```
Browser opens page
    ↓
MaolProvider (auto-mounted) creates session cookie: maol_XXXXXXXXXX
    ↓
Errors    → window.error      → sendBeacon → POST /api/maol/ingest
Warnings  → console.warn      → sendBeacon → POST /api/maol/ingest
DOM tree  → [data-ui-id] scan → sendBeacon → POST /api/maol/ingest
    ↓
Server writes to: logs/maol.sqlite
    ↓
Agent reads: GET /api/maol/session/:sessionId
```

---

## Endpoints

### POST `/api/maol/ingest`
Receives events from the browser. No authentication needed (client-accessible).

```json
{
  "sessionId": "maol_XXXXXXXXXX",
  "events": [
    {
      "type": "error",
      "message": "...",
      "route": "/home",
      "timestamp": 1234567890,
      "uiContext": "UI_HOME_PROMO_BANNER_ACTION",
      "env": "dev"
    }
  ]
}
```

### GET `/api/maol/session/:sessionId`
Returns full observability data for a session. **Requires authentication.**

```bash
curl -H "Authorization: Bearer FOJWLmzwq1RcPDrtbyk2H6ueQMsgvY4i" \
     http://localhost:3001/api/maol/session/maol_XXXXXXXXXX
```

Alternative header:
```bash
curl -H "x-maol-token: FOJWLmzwq1RcPDrtbyk2H6ueQMsgvY4i" \
     http://localhost:3001/api/maol/session/maol_XXXXXXXXXX
```

---

## Response Format

```json
{
  "sessionId": "maol_XXXXXXXXXX",
  "errors": [
    {
      "type": "error",
      "message": "TypeError: ...",
      "stack": "at Component.tsx:42",
      "route": "/home",
      "timestamp": 1234567890,
      "uiContext": "UI_HOME_CURATED_OFFERS_MORE",
      "env": "dev"
    }
  ],
  "warnings": [
    {
      "type": "warning",
      "message": "[UI Registry Deprecation] ...",
      "route": "/home",
      "component": "PromoBanner",
      "severity": "high",
      "timestamp": 1234567890,
      "env": "dev"
    }
  ],
  "dom": [
    {
      "route": "/home",
      "timestamp": 1234567890,
      "totalIdentified": 7,
      "tree": {
        "type": "page",
        "children": [
          {
            "name": "home",
            "uiIds": ["UI_HOME_PROMO_BANNER_ACTION", "..."],
            "tags": ["button"]
          }
        ]
      }
    }
  ],
  "summary": {
    "totalErrors": 1,
    "totalWarnings": 1,
    "totalWarningsByseverity": { "low": 0, "medium": 0, "high": 1 },
    "routesVisited": ["/home"],
    "sessionStart": "2026-06-15T03:36:16.053Z",
    "lastActivity": "2026-06-15T03:36:16.254Z"
  }
}
```

---

## Warning Severity Rules

| Pattern in message | Severity |
|---|---|
| `[UI Registry Deprecation]` | **high** |
| `[UI Registry Error]` | **high** |
| `[MAOL] HIGH` | **high** |
| `[MAOL]` (any) | **medium** |
| Everything else | **low** |

> In PROD mode: only `high` and `medium` severity warnings are forwarded.

---

## Finding Your Session ID

Open Browser DevTools → Application → Cookies → `maol_session`

The value is your `sessionId` (format: `maol_XXXXXXXXXX`).

---

## Storage

- File: `logs/maol.sqlite`
- Mode: WAL (Write-Ahead Logging) — safe concurrent reads
- Max: 200 records per session per table (FIFO eviction)
- Tables: `maol_errors`, `maol_warnings`, `maol_dom`

---

## NPM Scripts

```bash
npm run maol:test   # Run end-to-end system test
npm run maol:diff   # Run UI identity diff tracker
```

---

## DEV vs PROD Mode

| Feature | DEV | PROD |
|---|---|---|
| Stack traces | ✅ Full | ❌ Stripped |
| Component names in warnings | ✅ Yes | ❌ No |
| All DOM elements | ✅ All identified | ⚡ Interactive only |
| Low severity warnings forwarded | ✅ Yes | ❌ No |

---

## Security

- `MAOL_SECRET` required on all agent reads
- `sessionId` must match `maol_*` format
- All payloads JSON-sanitized before DB write
- No keystrokes, form values, or PII captured
- Disabled entirely when `NEXT_PUBLIC_MAOL_ENABLED != 'true'`

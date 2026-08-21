# Aira ops dashboard — build progress

Plan: `/home/arsenii/.claude/plans/warm-brewing-shell.md`
Last updated: 2026-08-22 (Europe/Lisbon)

## Status: IN PROGRESS — n8n backend live, building dashboard.html next

## Resolved open questions (per Arseniy, 2026-08-22)

1. MRR: hardcode €250 (David/CIS, only confirmed recurring client) with ⚠️ badge.
2. File name: `dashboard.html` at repo root.
3. Daily report schedule: 09:00 Europe/Lisbon.
4. n8n API key: fresh Personal API key provided, verified HTTP 200 against `/api/v1/workflows`. Used only in headers over SSH, never committed to git.

## Done

- **`aira-panel-data-collector`** (id `Sk7BHwvTIPfVWOwD`) — Execute Workflow Trigger (passthrough) sub-workflow. Builds a Python script via heredoc, runs it through the existing `vps-cmd.aira-ai.net` → command-server relay (reused shared secret, no new credential). Script queries `/root/aira_panel.sqlite` (clients/contacts/tasks/custom_calls/scheduled_calls) and host/docker state (4 containers, n8n errors 24h, disk, load) directly via sqlite3/docker inspect in one round trip. Active.
- **`aira-dashboard-data`** (id `qyMoTEr3oy2iCDhB`) — `GET /webhook/dashboard-data`, calls the collector sub-workflow, responds JSON with `Access-Control-Allow-Origin: *`. Active.
- **Verified live**: `curl https://n8n.aira-ai.net/webhook/dashboard-data` → HTTP 200, real business + tech + mrr JSON (2 clients, 12 contacts, all 4 containers running, disk 57%, load 0.06).
- Note found during testing: some `tasks`/`custom_calls`/`scheduled_calls` status values in the panel DB are raw error strings (e.g. `"error:The read operation timed out"`), not clean status enums — this is pre-existing data, not something this task introduced. `dashboard.html` should treat status keys as opaque labels rather than assuming a small fixed set.
- n8n version on VPS is 2.35.4; `executeWorkflowTrigger` (typeVersion 1.1) requires an explicit `inputSource` param (`passthrough` used here) or activation fails — undocumented in the plan, discovered via node source inspection since no existing example existed in this n8n instance.

## Next steps

1. Write `/home/arsenii/aira-live/dashboard.html` (fetch pattern from `v2/drafts/index.html`), commit locally (no push yet).
2. Build **`aira-daily-report`** workflow — Schedule Trigger 09:00 Europe/Lisbon → Execute Workflow (reuse collector) → Code (format Telegram text) → Telegram node (credential `s9IXEQC67HawYT0C`, chat `1700389702`).
3. Manually trigger `aira-daily-report` once to confirm Telegram delivery before relying on schedule.
4. Diff `katerina-briefing-webhook` / `katerina-scheduled-telegram-briefing` against pre-task state to confirm untouched.
5. Final summary + explicit confirmation request before any push to `main`.

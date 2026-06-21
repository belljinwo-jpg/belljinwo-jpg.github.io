---
name: frantic-board-health-audit
description: Audit captured Frantic public board, status, ledger, and bounty responses for count consistency, stale or confusing inventory, duplicated scopes, and concrete operator curation actions. Use for reproducible Frantic board-health reviews backed by captured public API evidence.
---

# Frantic board health audit

Run the bundled validator against the immutable captures in `captures/`.

1. Reconcile open, claimed, delivered, accepted, paid, and total counts.
2. Confirm `/v1/status`, `/v1/board`, and `/v1/ledger` are present.
3. Confirm at least five individual bounty pages were captured.
4. Identify crowded or overlapping inventory and return exact bounty URLs.
5. Emit JSON suitable for a governed receipt and a public evidence bundle.

Do not infer private state. Treat the captured public responses as the only source of truth.


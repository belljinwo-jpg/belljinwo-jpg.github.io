# Frantic live board health audit

Captured on 2026-06-21 from the public Frantic status, board, ledger, and nine bounty-detail API pages. The governed audit ran with `runx-cli 0.6.8`.

## Inventory

- Open: **14**
- Claimed: **1**
- Delivered: **9**
- Accepted: **1**
- Paid: **20**
- Total: **45**

The status endpoint's `bounties_open=14` matches the 14 open rows in the board capture, and all status buckets sum to the 45 captured records.

## Findings and exact next actions

- **Issue-mirror backlog:** `/v1/status` reports `all_ok=false` and 20 pending mirror items. **Action:** process or retry the pending queue, publish oldest-pending age, and alert when the queue remains nonzero across two observations.
- **Overcrowded runx-skill inventory:** six open bounties (#27, #28, #29, #34, #36, #37) occupy the same broad theme. **Action:** stagger their publication and add a one-line outcome tag to each title so agents can distinguish implementation, audit, and documentation work.
- **Likely superseded overlap:** open #34 (inbox triage to drafted reply) overlaps paid #32 (support triage and reply draft). **Action:** close #34 as superseded, or rewrite its acceptance criteria to identify a distinct system, input set, and output not covered by #32; link both records.
- **Confusing zero-reward listing:** #49 offers $0 with 99 slots. **Action:** label it `goodwill / non-cash` in the title and state exactly which public artifact receives acceptance.
- **Stale founding language:** #1 remains open with day-one framing and a three-paid-bounty prerequisite while identity access is staged. **Action:** rewrite it with current eligibility tiers and a current deadline, or close it after the founding window.
- **Adjacent Sourcey work is valid:** #33 publishes the Sourcey documentation set; #45 audits gaps in that set. **Action:** keep both, cross-link them, and sequence #33 before #45 so the audit has a stable baseline.
- **Read-model reconciliation is clean:** public board buckets total 45 and match the captured rows. **Action:** keep this invariant as a status check and expose a reconciliation warning if it diverges.
- **Public detail access is clean:** nine exact bounty API pages were captured successfully without authentication. **Action:** retain stable detail URLs and add `last_updated_at` to each public record for future stale-item audits.

## Reproduction

```sh
runx --version
runx skill frantic-board-audit/skill --json --receipts "$RUNNER_TEMP/receipts"
```

The immutable inputs are published under `frantic-board-audit/skill/captures/`. The machine-readable findings are in `evidence.json`.

Receipt reference: `pending`

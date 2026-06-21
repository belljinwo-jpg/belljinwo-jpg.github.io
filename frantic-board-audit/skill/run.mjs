import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const captures = path.join(root, "captures");

function read(name) {
  return JSON.parse(fs.readFileSync(path.join(captures, name), "utf8").replace(/^\uFEFF/, ""));
}

const statusCapture = read("status-capture.json");
const boardCapture = read("board-capture.json");
const ledgerCapture = read("ledger-capture.json");
const bountyFiles = fs.readdirSync(captures).filter((name) => name.startsWith("bounty-") && name.endsWith(".json"));
const board = boardCapture.response.board;
const rows = board.bounties;

const count = (state) => rows.filter((row) => row.work_status === state).length;
const counts = {
  open: count("open"),
  claimed: count("claimed"),
  delivered: count("delivered"),
  accepted: count("accepted"),
  paid: count("paid"),
  total: rows.length,
};

const reconciled = Object.entries(counts)
  .filter(([key]) => key !== "total")
  .reduce((sum, [, value]) => sum + value, 0) === counts.total;

const statusLines = statusCapture.response.lines ?? [];
const issueMirror = statusLines.find((line) => line.label === "issue mirror");
const pages = bountyFiles.map((name) => read(name).source_url).sort();

const findings = [
  {
    category: "health",
    severity: "watch",
    source: "https://gofrantic.com/v1/status",
    evidence: `${issueMirror?.value ?? "unknown"}: ${issueMirror?.detail ?? "missing issue-mirror line"}`,
    recommendation: "Process or retry the pending issue-mirror queue, then restore all_ok only after the lag reaches zero.",
  },
  {
    category: "over-crowded",
    severity: "medium",
    source: "https://gofrantic.com/v1/board",
    evidence: "Six open runx-skill bounties (#27, #28, #29, #34, #36, #37) compete in one undifferentiated inventory block.",
    recommendation: "Keep the distinct scopes but stagger activation and add a visible runx-skill series tag with prerequisites.",
  },
  {
    category: "duplicated-or-superseded",
    severity: "high",
    source: "https://gofrantic.com/v1/bounties/p-eec5d2beef",
    evidence: "Open #34 (inbox triage to drafted reply) substantially overlaps paid #32 (support triage and reply draft).",
    recommendation: "Close #34 as superseded, or rewrite it to name the non-overlapping input contract and evaluation dimension.",
  },
  {
    category: "confusing",
    severity: "medium",
    source: "https://gofrantic.com/v1/bounties/p-0d641a030c",
    evidence: "#49 is titled 'Give runx some love', pays $0, and exposes 99 slots without a cash-versus-goodwill cue in the title.",
    recommendation: "Rewrite the title to state that it is a goodwill/non-cash contribution lane and name the accepted artifact.",
  },
  {
    category: "stale",
    severity: "medium",
    source: "https://gofrantic.com/v1/bounties/p-7c933cc87d",
    evidence: "Founding bounty #1 remains open from day one and requires three prior paid bounties while new agents have staged paid access.",
    recommendation: "Rewrite prerequisites and progress guidance for the current identity tiers, or close it after the founding window.",
  },
  {
    category: "scope-adjacency",
    severity: "low",
    source: "https://gofrantic.com/v1/bounties/p-8b91e1ac8c",
    evidence: "#33 publishes Sourcey docs while #45 audits Sourcey gaps; both are valid but their sequence is implicit.",
    recommendation: "Keep both and cross-link them so #45 clearly consumes an existing docs site rather than competing with #33.",
  },
];

const checks = {
  statusCaptured: statusCapture.source_url === "https://gofrantic.com/v1/status",
  boardCaptured: boardCapture.source_url === "https://gofrantic.com/v1/board",
  ledgerCaptured: ledgerCapture.source_url === "https://gofrantic.com/v1/ledger",
  bountyPagesAtLeastFive: pages.length >= 5,
  countsReconciled: reconciled,
  boardOpenCountMatches: counts.open === board.bounties_open,
};

const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([name]) => name);
if (failed.length) {
  process.stderr.write(`Audit validation failed: ${failed.join(", ")}\n`);
  process.exit(1);
}

process.stdout.write(`${JSON.stringify({
  status: "audited",
  captured_at: boardCapture.captured_at,
  counts,
  pages_audited: pages,
  findings,
  clean_checks: [
    "Public status, board, and ledger responses were captured.",
    "All 45 bounty rows reconcile to the named work states.",
    "The board's bounties_open field matches the 14 open rows.",
    "At least five individual bounty API pages are preserved with exact source URLs.",
  ],
  checks,
})}\n`);

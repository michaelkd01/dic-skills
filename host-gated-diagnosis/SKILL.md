---
name: host-gated-diagnosis
description: Assert host identity before making any claim about machine state, and keep every such claim scoped to a named host. Use whenever a task inspects or reports on filesystem paths, installed binaries, PATH, npm/pip globals, launchd or cron jobs, running processes, listening ports, credential files, or git repo state ... and whenever two reports disagree about the same path, a tool is "missing", a folder looks "stale", or something works on one machine but not another. Triggers on "is X installed", "why is X stale", "verify the install", "diagnose", "it works on my other machine", and any multi-machine investigation. Do NOT use for pure cloud or account-level state (MCP connectors, SaaS APIs), which is host-independent.
---

# Host-Gated Diagnosis

Michael's estate is two Macs: orchestrator-mini (primary, Tailscale 100.88.137.28) and a
MacBook Pro (secondary). A finding true on one is routinely false on the other. Every rule
below exists because that assumption once cost three turns and a false systemic alarm.

## 1. Open with a host gate

Any prompt touching machine state starts with:

    scutil --get ComputerName

and a STOP instruction if it is not the expected host. `hostname` is not sufficient ...
it returned `Mac.lan` on the machine whose ComputerName is `orchestrator-mini`.

## 2. Scope every finding to a named host

Never "the CLI is installed". Always "installed on orchestrator-mini at
/opt/homebrew/bin/plaud". Repo state is scoped to host plus absolute path, because the
same path on two machines can hold different repos ... or no repo at all.

## 3. Classify per-machine vs per-account before assuming

| Per-machine | Per-account |
|---|---|
| Binaries, npm/pip globals, PATH | MCP connectors |
| Token files (~/.config, ~/.<tool>) | SaaS credentials, OAuth held connector-side |
| launchd jobs, Keychain items | Cloud state, remote git |
| Local checkouts and worktrees | Linear, GitHub, Notion |

Installing or authenticating a per-machine tool on one host leaves the other untouched.
Say so explicitly when advising an install ... the operator may be on the other machine.

## 4. Enumerate copies before diagnosing divergence

Before concluding a folder is stale, corrupt, or unsynced, find every copy:
`mdfind -name <name>` plus a bounded `find` over ~, ~/Desktop, ~/Developer,
~/Library/CloudStorage, ~/Library/Mobile Documents. For each hit report path, git status,
HEAD, and newest mtime. Orphaned copies are the common explanation, not breakage.

## 5. Contradiction protocol

When two reports disagree about the same path, hypotheses in order:

1. Different host
2. Different copy on the same host
3. Only then: corruption, silent job failure, or divergence

Escalating to systemic-integrity framing ("the knowledge layer may be compromised")
before step 1 and 2 are eliminated is a defect, not caution.

## 6. Planner obligation

No host-scoped claim enters the wiki, an ADR, or a verification brief as fact unless the
host is named in the sentence. A "verified" label on an unscoped claim is worse than no
claim, because it survives into documents that later contradict live state.

## Worked example

Plaud CLI, 2026-07-26/27. A report placed the binary at /opt/homebrew/bin/plaud and
described ~/Developer/llm-wiki as "not a git repo, missing recent files". The operator's
shell on orchestrator-mini returned `command not found` and `rev-parse` = true. Both
reports were accurate ... for the MacBook Pro, and for one of two orphaned vault copies
frozen at a 2026-07-14 snapshot. Nothing was broken. Three turns were spent proving it.

---
name: codex-rescue
description: Delegate stuck or failing work to OpenAI Codex from within manual Claude Code sessions
---

# Codex Rescue ... Second-Opinion Delegation

## Context

The Codex plugin for Claude Code (`openai/codex-plugin-cc`) lets you hand tasks to OpenAI's Codex agent without leaving Claude Code. This skill covers the **rescue** use case only ... delegating work to a different model when Claude Code is stuck, looping, or burning iterations on a problem it can't solve.

This applies to **manual Claude Code sessions only** (not automated pipeline execution).

## Prerequisites

- Codex CLI installed globally: `npm install -g @openai/codex`
- Codex authenticated: `codex login` (ChatGPT subscription or OpenAI API key)
- Plugin installed in Claude Code:
  ```
  /plugin marketplace add openai/codex-plugin-cc
  /plugin install codex@openai-codex
  ```
- Verify setup: `/codex:setup`

## When to Use Rescue

Use `/codex:rescue` when Claude Code is **stuck** ... not as a default or first-pass tool. Triggers:

1. **Three-strikes rule fires.** Same problem recurred after 3 fix attempts. Before declaring "triggering deep dive" and stopping, consider whether Codex rescue with a fresh model perspective could break the loop.
2. **Max iterations burned.** Claude Code has exhausted its iteration budget without resolution. Rather than re-prompting with the same model, delegate the specific failing piece to Codex.
3. **Model blindspot suspected.** The failure pattern suggests a systematic model weakness (e.g., a library Claude consistently misuses, a pattern it keeps reverting to despite correction). A different model may not share the blindspot.
4. **Investigation before fix.** You need a diagnostic pass on WHY something is broken before committing to an approach. Codex can investigate while you context-switch.

**Do NOT use rescue for:**
- Tasks Claude Code hasn't attempted yet (just run them normally)
- Broad refactors or multi-file rewrites (rescue works best on focused problems)

## Commands Reference

### Delegate Work

```
/codex:rescue {describe the specific problem}
```

Flags:
- `--background` ... run in background, free up Claude Code session (recommended for anything non-trivial)
- `--wait` ... block until Codex finishes (use for quick investigations)
- `--resume` ... continue the most recent rescue thread for this repo
- `--fresh` ... force a new thread (ignore prior rescue context)
- `--model {model}` ... override default model (e.g., `gpt-5.4-mini`, `spark`)
- `--effort {level}` ... reasoning effort (`low`, `medium`, `high`, `xhigh`)

### Check Progress

```
/codex:status              # all running/recent jobs
/codex:status task-abc123  # specific job
```

### Get Results

```
/codex:result              # latest finished job
/codex:result task-abc123  # specific job
```

Returns the Codex output plus a session ID for resuming in Codex directly if needed.

### Cancel

```
/codex:cancel              # cancel active job
/codex:cancel task-abc123  # cancel specific job
```

## Rescue Patterns

### Pattern 1: Stuck After Three Strikes

Claude Code has failed the same fix 3 times. Instead of continuing the loop:

```
/codex:rescue --background investigate why {describe the specific failure} ... Claude Code has attempted {describe what was tried} three times without success. Focus on root cause, not another fix attempt.
```

Wait for results, then use the diagnostic output to inform your next Claude Code prompt.

### Pattern 2: Iteration Budget Exhausted

Claude Code hit max iterations. The work is partially done but incomplete:

```
/codex:rescue --background continue from where Claude Code stopped. The goal is {describe remaining work}. Current state: {describe what's done vs what's not}.
```

### Pattern 3: Targeted Investigation

You need to understand a bug before deciding on an approach:

```
/codex:rescue --wait investigate why {describe the symptom}. Do not fix anything. Report: 1) root cause, 2) affected files, 3) recommended fix approach.
```

Use `--wait` here because you need the answer before proceeding.

### Pattern 4: Different Model Perspective

Claude keeps misusing a specific API or pattern:

```
/codex:rescue --model gpt-5.4-mini --effort high fix the {specific issue} in {specific file}. The correct API usage is {paste correct usage if known}. 
```

## Configuration

### Project-Level Defaults

Create `.codex/config.toml` at repo root to set defaults for rescue tasks in that project:

```toml
model = "gpt-5.4-mini"
model_reasoning_effort = "high"
```

### User-Level Defaults

`~/.codex/config.toml` applies across all repos.

## Rules

- Rescue is a second opinion, not a replacement. Always attempt with Claude Code first.
- Background is the default for anything that might take more than 30 seconds.
- Always check `/codex:result` before acting on Codex output ... treat it as a hypothesis, same as Claude Code COMPLETE signals.
- Codex rescue runs count against your OpenAI usage limits. Be targeted, not exploratory.
- Do NOT use the review gate (`--enable-review-gate`) in automated or long-running sessions ... it creates Claude/Codex loops that drain both providers' limits.
- Codex operates on the same local checkout. Any changes it makes are local and uncommitted until you explicitly commit.
- After a rescue, you return to the Claude Code session to evaluate, commit, and push. The normal verification and commit steps from the execution prompt standard still apply.

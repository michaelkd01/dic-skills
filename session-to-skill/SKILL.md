---
name: session-to-skill
description: Closing ritual that checks whether the current session surfaced a recurring, non-obvious procedure worth preserving as a skill, and if so proposes it for one-word approval. Trigger at the natural end of any substantial interactive session ... when the user signals wrap-up ("that's done", "thanks, that's all", "good for now", "wrapping up"), when a multi-step piece of work reaches completion, or when the user explicitly asks ("any skills from this session?", "extract a skill from this", "should this be a skill?", "worth preserving?"). Also trigger when the user corrects the same behaviour twice or more in one session, since repeated correction is the strongest signal of an uncaptured procedure. Do NOT trigger mid-task or on short, single-question sessions.
---

# Session to Skill

Closing-ritual skill. At the end of a substantial session, ask one question: did this session produce a recurring, non-obvious procedure worth preserving? Most of the time the answer is no, and that is the correct outcome. The quality bar exists to protect the skill library from preference sprawl.

Scope: interactive claude.ai / Claude Cowork sessions only. Cyrus and headless Claude Code sessions are out of scope for v1.

## When to run

Run the extraction check when any of these hold:

1. The user signals session close after substantial work (multiple tool-using turns, a real deliverable, or a multi-step procedure executed).
2. The user explicitly asks whether anything from the session should become a skill.
3. The user corrected the same Claude behaviour two or more times in the session ... repeated correction means an uncaptured procedure exists.

Never run it:

- Mid-task, or when the user is clearly moving to the next piece of work
- On short factual or conversational sessions
- More than once per session
- When the session itself was primarily about creating or editing a skill (circular)

## The quality bar

A procedure clears the bar only if ALL of the following are true. Evaluate silently; do not narrate the checklist.

1. **Recurring** ... the situation will plausibly arise again across future sessions, not a one-off.
2. **Non-obvious** ... a fresh Claude session would NOT do this correctly from general competence plus existing memory. If default behaviour already gets it right, it is not a skill.
3. **Procedural** ... it has steps, ordering, tool choices, boundaries, or verification. A bare preference ("shorter answers", "no emojis") belongs in memory or preferences, never in a skill.
4. **Stable** ... the procedure will not be invalidated by the next tool or repo change. Volatile details belong in the repo's CLAUDE.md or a wiki note, not a skill.
5. **Not already covered** ... check the available_skills list and, if ambiguous, the SKILL REGISTRY (collection://7b698d21-a9d2-4096-81d6-a7b66424f8f3). If an existing skill owns this ground, the correct output is a proposed EDIT to that skill, flagged as such, not a new one.

If any criterion fails, say nothing about skills at all. Silence is the default output of this skill. Do not report "no skill candidates this session" ... that is noise.

## The proposal

When a procedure clears the bar, propose it in this exact compact form, appended after the session's closing response:

```
Skill candidate: {kebab-case-name}
Job: {one line ... what it owns}
Bar: {one line ... why a fresh session would get this wrong today}
Create it? (yes / no)
```

Rules:

- Maximum ONE candidate per session. If two genuinely clear the bar, propose the stronger and mention the other exists in half a sentence.
- The proposal is three lines plus the question. Never longer. No selling.
- If the candidate is an edit to an existing skill, replace the first line with `Skill edit: {existing-skill-name}` and the question with `Update it? (yes / no)`.
- A "no", a dismissal, or any non-affirmative reply kills the candidate permanently. Do not re-raise it in this or future sessions, do not log it anywhere, do not ask why.

## On approval

An affirmative reply triggers three steps, in order:

### 1. Extract the procedure spec

From the session history, capture:

- **Trigger**: when the skill should activate, including negative triggers (when NOT to run)
- **Job**: the specific ground the skill owns, and its boundaries
- **Procedure**: the steps, tool choices, and ordering that actually worked ... including any corrections the user made along the way (the corrected version is the spec, not the first attempt)
- **Output shape**: what the deliverable looks like
- **Verification**: what evidence must exist before the work is called done

The user's corrections during the session are the highest-value content. A procedure extracted without its corrections re-ships the original mistakes.

### 2. Build via skill-creator

Hand off to the skill-creator skill (/mnt/skills/examples/skill-creator/SKILL.md) to draft the SKILL.md, package it with package_skill.py, and present the .skill file for install. Follow skill-creator's claude.ai-specific instructions. Style: direct, no emojis, ellipses instead of dashes, consistent with the existing skill library's voice.

For a skill edit: copy the installed skill to a writable location, apply the edit, package under the ORIGINAL name (never -v2), and present it.

### 3. Log to SKILL REGISTRY

Create one row in the SKILL REGISTRY Notion data source (collection://7b698d21-a9d2-4096-81d6-a7b66424f8f3):

- Name: human-readable skill name
- Skill ID: the kebab-case folder name
- Status: Draft
- Category: best fit of Lifecycle / Pipeline / Research / Design / Scheduled
- Trigger: one line, from the spec
- Output: one line, from the spec
- Last Updated: today

Tell the user to flip Status to Active in the registry once the .skill is installed. For an edit to an existing skill, update that skill's existing row (Last Updated, and Trigger/Output if changed) instead of creating a new one.

## Constraints

- This skill produces skill candidates, not tasks. Never create Linear issues, Todoist tasks, or Obsidian notes from it.
- Never store secrets, credentials, or personal identifiers inside a generated skill.
- The bar is deliberately high. A month with zero extracted skills is a healthy month, not a failure of this skill.

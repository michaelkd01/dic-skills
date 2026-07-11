---
name: video-insights
description: Pull a YouTube video's transcript via the TranscriptAPI connector, summarise it, and surface themes personally relevant to Michael's ventures and interests. Use this skill EVERY time a YouTube link appears in the conversation (youtube.com/watch, youtu.be, youtube.com/shorts, youtube.com/live, m.youtube.com), whether or not the user asks for anything explicitly. Also trigger on phrases like "summarise this video", "what's this video about", "watch this for me", "key points from this video", "is this video worth watching", or when the user shares a link from the YouTube app. Successor to the Snap Insight product workflow.
---

# Video Insights

Turn a YouTube link into an inline summary, a personal-relevance read, and an adoption call. Output is inline only ... never write to Notion, Linear, Todoist, or Obsidian, and never create tasks, issues, or notes. The Adopt this? section may recommend adoption and propose tasks or notes, but it only proposes them ... the user decides and actions them through the normal scoping flow. Surface and recommend; never execute.

## Pipeline

### 1. Extract the video reference

Accept any YouTube URL form: `youtube.com/watch?v=ID`, `youtu.be/ID`, `youtube.com/shorts/ID`, `youtube.com/live/ID`, `m.youtube.com/...`, or a bare 11-character video ID. Pass the URL or ID directly to the TranscriptAPI tools ... do not attempt web_fetch on YouTube URLs (this fails with rate limits and returns metadata only; this was proven empirically). Retain the canonical 11-character video ID for the whole session ... it is required to build timestamp deep links in the output.

### 2. Validate before fetching

Call `TranscriptAPI:get_youtube_video_info` first (free call). This confirms the video exists and returns metadata plus available transcript languages.

- If no transcript exists in any language: report this plainly, give a one-line metadata-only description from the title/description, and stop. Do not attempt fallbacks.
- If the tool errors (rate limit, invalid ID): report the failure and stop. No silent retries via other methods.

### 3. Fetch the transcript

Call `TranscriptAPI:get_youtube_transcript` with the URL/ID. Prefer English; if only another language is available, fetch it and summarise in English, noting the original language.

### 4. Load personal context

Two layers, both required:

1. **Memory** ... already in context. Covers current ventures and recent activity.
2. **Interest graph** ... read the Obsidian note `wiki/reference/interest-graph.md` via the Obsidian MCP `read_note` tool. This is the authoritative, user-maintained list of ventures, active themes, and watch-list topics.

If the Obsidian read fails (server down, note missing), proceed with memory only and say so in one line at the end of the output. Never block the summary on the interest graph.

### 5. Produce the output

Structure, inline in chat, in this order:

**Header** ... one line: title, channel, duration, publish date.

**TL;DR** ... two to three scannable bullet points (not a paragraph) capturing the thesis and conclusion, one line each. Write them so the user can decide in five seconds whether to keep reading.

**Honest read** ... a few scannable bullet points (not a paragraph) giving a straight quality and credibility assessment: worth watching or not; substantive vs thin, derivative, or clickbait relative to its title; how credible the central claims are. No glazing. If claims are extraordinary or unverifiable, say so plainly.

**Relevant to you** ... map content against the interest graph and memory. Rules:

- Only genuine, specific matches. "This is about AI and you work with AI" is not a match. "The guest describes async video screening pricing at $X/interview, directly comparable to AnytimeInterview's model" is a match.
- For each hit: the theme, which venture/interest it maps to, and why it matters in one or two sentences, ending with the timestamp as a clickable bracket link (see Timestamp deep links).
- If nothing genuinely lands, say exactly: "No direct relevance to active projects or tracked interests." Do not pad or force connections.
- This section maps only ... it names what connects and why. Adoption verdicts and proposed actions live in the next section, never here.

**Adopt this?** ... a prescriptive call on whether anything here is worth taking into work or personal life. Builds on the Honest read and Relevant to you sections. Rules:

- Only recommend when there is a specific, defensible reason. Same anti-padding bar as Relevant to you ... no manufactured advice, no adopting for the sake of a filled section. If the content is thin or already known, say so and move on.
- If nothing warrants action, say exactly: "Nothing here worth adopting." Then stop.
- Each candidate gets a one-line verdict token, then the specifics. Format:
  - **Adopt · short label** ... the specific point, where it applies (which venture, or which part of personal life), why it clears the bar, and the proposed action. End with the timestamp. [12:40–15:10]
  - **Try · short label** ... same, but framed as a bounded experiment: the smallest test that would prove or kill it.
  - **Skip · short label** ... use sparingly, only when a point is tempting but you would be better not chasing it (already covered, low ROI, shiny object). One line on why not.
- Route proposed actions, do not create them:
  - Work items name the target Linear team and project (ANY, BES, G2G, STM, PRO, INF) so the item can be queued via the normal scoping flow.
  - Personal items name where they land (an interest-graph or Obsidian note, a practice/shopping note, or just a plain suggestion). Personal life is in scope: golf, wine, cooking, family, home systems, cycling.
- Each entry ends with its timestamp as a clickable bracket link (see Timestamp deep links).
- Propose only. This skill still never writes to Linear, Todoist, Obsidian, or Notion, and never opens issues. It stops at the recommendation.
- No glazing. A weak idea gets a Skip or gets left out, not a soft Adopt.

**Timestamp deep links** ... every timestamp shown in Relevant to you, Adopt this?, and Key points IS itself the clickable link. Keep the square brackets and wrap the whole bracket as the link text ... there is no separate line beneath. Convert the START of the range to total seconds and build it exactly as:

`[[6:35–8:55]](https://youtu.be/{ID}?t={seconds})` ... which renders as a clickable [6:35–8:55].

Link to the range start only ... YouTube deep links target a single moment, not a span. Use the video ID retained in step 1. Omit for Shorts and for any output that has no per-point timestamps.

**Key points** ... always the last section. The video's main claims and structure. Format each point exactly as:

- **Short bolded heading** (three to six words, sentence case): the specifics ... numbers, named tools, frameworks, people, prices ... not vague gestures at topics. End the point with the timestamp range as a clickable bracket link. [[4:12–6:30]](https://youtu.be/{ID}?t=252)

The bolded heading comes first, the timestamp comes last and is itself the link (see Timestamp deep links) ... there is no separate line beneath. Never lead a point with the timestamp. Scale to content: a 10-minute video gets 4-6 points; a 2-hour podcast gets sectioned points under topic headings.

### 6. Follow-ups

The transcript stays in context. Answer deep-dive questions from it directly ... do not re-fetch. If the user asks about a section the summary compressed, quote-level detail is fine (paraphrased, not verbatim blocks).

## Constraints and edge cases

- **Long videos**: for transcripts over roughly 40,000 words, summarise section by section and keep the Key points layer coarser. Warn the user if the transcript appears truncated by the tool.
- **Multiple links in one message**: process each in turn, clearly separated. If more than three, confirm before burning the tool calls.
- **Shorts / very short videos**: compress the whole output to header + 2-3 sentence summary + relevance line. No point structure.
- **Playlists / channel links**: this skill handles single videos. For a playlist or channel link, list the videos via the TranscriptAPI list tools and ask which to process.
- **Style**: direct, no emojis, ellipses instead of dashes, no glazing. The Honest read section carries the worth-watching judgement ... do not soften it elsewhere to compensate.

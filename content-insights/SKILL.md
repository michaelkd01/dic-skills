---
name: content-insights
description: Summarise and assess a piece of content ... an honest quality read, relevance to Michael's ventures, and an adopt/try/skip verdict. Successor to video-insights. Auto-trigger on any video (a link to YouTube/X/TikTok/Vimeo/etc. or an uploaded video file). For text ... an email, newsletter, article URL, or pasted/screenshotted copy ... trigger when the user shares it or asks things like 'summarise this', 'assess this email', 'is this worth reading or watching', 'key points from this'.
---

# Content Insights

Turn any piece of content ... a video, an email, an article, or pasted copy ... into an inline summary, a personal-relevance read, and an adopt call. Output is inline only ... never write to Notion, Linear, Todoist, or Obsidian, and never create tasks, issues, or notes. The Adopt this? section may recommend adoption and propose tasks or notes, but it only proposes them ... the user decides and actions them through the normal scoping flow. Surface and recommend; never execute.

## Pipeline

### 0. Route by source

Determine the ingestion path from the input before doing anything else. Video sources are auto-assessed on sight; text sources are assessed ONLY when the user explicitly asks or shares the content as the subject of the message ... never auto-scan email or fire on a message merely present in context.

- **YouTube** (youtube.com/watch, youtu.be, youtube.com/shorts, youtube.com/live, m.youtube.com, or a bare 11-character video ID) -> **TranscriptAPI path**: steps 1-3, then converge at step 4.
- **Other video source** (x.com / twitter.com, vimeo.com, tiktok.com, facebook.com, reddit, a direct .mp4 / .m3u8 / .webm URL, or an uploaded video file) -> **Sandbox path**: step 3b, then converge at step 4.
- **Email / newsletter** (a Gmail message the user points at, forwards, pastes, or screenshots) -> **Text path**: step 3c, then converge at step 4. Explicit-trigger only.
- **Article / pasted copy** (an article URL, or text the user pastes) -> **Text path**: step 3c, then converge at step 4. Explicit-trigger only.

The Sandbox path requires a code-execution environment (this app or Cowork). If the current surface has no sandbox, say plainly that the non-YouTube video path is unavailable in this surface, give a one-line metadata description if one is available, and stop. Never fail silently. The Text path needs no sandbox.

### 1. Extract the video reference (YouTube path)

Accept any YouTube URL form: `youtube.com/watch?v=ID`, `youtu.be/ID`, `youtube.com/shorts/ID`, `youtube.com/live/ID`, `m.youtube.com/...`, or a bare 11-character video ID. Pass the URL or ID directly to the TranscriptAPI tools ... do not attempt web_fetch on YouTube URLs (this fails with rate limits and returns metadata only; this was proven empirically). Retain the canonical 11-character video ID for the whole session ... it is required to build timestamp deep links in the output.

### 2. Validate before fetching (YouTube path)

Call `TranscriptAPI:get_youtube_video_info` first (free call). This confirms the video exists and returns metadata plus available transcript languages.

- If no transcript exists in any language: report this plainly, give a one-line metadata-only description from the title/description, and stop. Do not attempt fallbacks.
- If the tool errors (rate limit, invalid ID): report the failure and stop. No silent retries via other methods.

### 3. Fetch the transcript (YouTube path)

Call `TranscriptAPI:get_youtube_transcript` with the URL/ID. Prefer English; if only another language is available, fetch it and summarise in English, noting the original language.

### 3b. Sandbox transcript (non-YouTube / uploaded video)

Run this in the code-execution sandbox. It downloads audio and transcribes locally with Whisper. Deepgram is not used here (no key plumbing in the sandbox); faster-whisper runs offline on CPU.

1. Preflight and install (idempotent; the sandbox is ephemeral, so this runs each session, ~30-60s):

   ```bash
   which ffmpeg || echo "NO_FFMPEG"   # ffmpeg is preinstalled in the sandbox
   pip install -q yt-dlp faster-whisper --break-system-packages
   ```

2. Obtain the audio:
   - **Remote URL**: download and extract audio. The sandbox egress proxy presents a self-signed certificate, so `--no-check-certificates` is REQUIRED or yt-dlp fails with `CERTIFICATE_VERIFY_FAILED`:

     ```bash
     yt-dlp -x --audio-format mp3 --no-playlist --no-check-certificates -o "clip.%(ext)s" "<VIDEO_URL>"
     ```

   - **Uploaded file**: the file is at `/mnt/user-data/uploads/`. Use it directly as the transcription input; no yt-dlp needed. faster-whisper reads video containers via ffmpeg, so no separate extraction step is required.

3. Transcribe with faster-whisper (base, int8, VAD) and write a segment JSON (for timestamps) plus flat text:

   ```python
   from faster_whisper import WhisperModel
   import json
   model = WhisperModel("base", device="cpu", compute_type="int8")
   segments, info = model.transcribe("clip.mp3", beam_size=1, vad_filter=True)
   segs = [{"start": round(s.start,1), "end": round(s.end,1), "text": s.text.strip()} for s in segments]
   json.dump({"language": info.language, "duration": info.duration, "segments": segs}, open("transcript.json","w"))
   open("transcript.txt","w").write(" ".join(x["text"] for x in segs))
   ```

   Substitute the uploaded file path for `"clip.mp3"` when transcribing an upload.

4. Throughput: base/int8 runs at roughly 4-8x realtime on the sandbox CPU (a 31-minute clip transcribed in ~3.7 minutes in the validation run). For inputs over ~60 minutes, warn the user it will take several minutes and keep the base model (do not upgrade to small/medium in-sandbox; too slow). If the transcript looks truncated, note it.

5. Machine transcription has no speaker labels and will mangle some proper nouns. Correct obvious errors silently when summarising, and never present raw ASR text as verbatim quotes.

Then converge at step 4. The `transcript.json` segments carry the start times used for the Key points / Relevant / Adopt timestamps.

### 3c. Fetch text content (email / article / pasted)

No transcript pipeline ... just retrieve the text:

- **Gmail message**: if you have a message ID, fetch the full message content (subject, sender, date, body) via the Gmail MCP. If the user pasted or screenshotted the email, read it directly ... do not re-fetch.
- **Article URL**: web_fetch the URL for the full page. Search snippets are not enough.
- **Pasted copy**: use the text as given.

Strip boilerplate (signatures, unsubscribe footers, tracking links) before assessing. Do not reproduce the source verbatim in the output beyond short (under 15-word) anchor phrases; paraphrase everything else (copyright). Then converge at step 4.

### 4. Load personal context

Two layers, both required:

1. **Memory** ... already in context. Covers current ventures and recent activity.
2. **Interest graph** ... read the Obsidian note `wiki/reference/interest-graph.md` via the Obsidian MCP `read_note` tool. This is the authoritative, user-maintained list of ventures, active themes, and watch-list topics.

If the Obsidian read fails (server down, note missing), proceed with memory only and say so in one line at the end of the output. Never block the summary on the interest graph.

### 5. Produce the output

Structure, inline in chat, in this order:

**Header** ... one line. Video: title, channel, duration, publish date. Email: sender, subject, date. Article: title, site, date.

**TL;DR** ... two to three scannable bullet points (not a paragraph) capturing the thesis and conclusion, one line each. Write them so the user can decide in five seconds whether to keep reading.

**Honest read** ... a few scannable bullet points (not a paragraph) giving a straight quality and credibility assessment: worth watching or not; substantive vs thin, derivative, or clickbait relative to its title; how credible the central claims are. No glazing. If claims are extraordinary or unverifiable, say so plainly.

**Relevant to you** ... map content against the interest graph and memory. Rules:

- Only genuine, specific matches. "This is about AI and you work with AI" is not a match. "The guest describes async video screening pricing at $X/interview, directly comparable to AnytimeInterview's model" is a match.
- For each hit: the theme, which venture/interest it maps to, and why it matters in one or two sentences, ending with the anchor (timestamp deep link for YouTube, plain marker for other video, short quoted phrase for text) per Anchors and locators.
- If nothing genuinely lands, say exactly: "No direct relevance to active projects or tracked interests." Do not pad or force connections.
- This section maps only ... it names what connects and why. Adoption verdicts and proposed actions live in the next section, never here.

**Adopt this?** ... a prescriptive call on whether anything here is worth taking into work or personal life. Builds on the Honest read and Relevant to you sections. Rules:

- Only recommend when there is a specific, defensible reason. Same anti-padding bar as Relevant to you ... no manufactured advice, no adopting for the sake of a filled section. If the content is thin or already known, say so and move on.
- If nothing warrants action, say exactly: "Nothing here worth adopting." Then stop.
- Each candidate gets a one-line verdict token, then the specifics. Format:
  - **Adopt · short label** ... the specific point, where it applies (which venture, or which part of personal life), why it clears the bar, and the proposed action. End with the anchor (timestamp deep link for YouTube, plain marker for other video, short quoted phrase for text) per Anchors and locators.
  - **Try · short label** ... same, but framed as a bounded experiment: the smallest test that would prove or kill it.
  - **Skip · short label** ... use sparingly, only when a point is tempting but you would be better not chasing it (already covered, low ROI, shiny object). One line on why not.
- Route proposed actions, do not create them:
  - Work items name the target Linear team and project (ANY, BES, G2G, STM, PRO, INF) so the item can be queued via the normal scoping flow.
  - Personal items name where they land (an interest-graph or Obsidian note, a practice/shopping note, or just a plain suggestion). Personal life is in scope: golf, wine, cooking, family, home systems, cycling.
- Each entry ends with the anchor (timestamp deep link for YouTube, plain marker for other video, short quoted phrase for text) per Anchors and locators.
- Propose only. This skill still never writes to Linear, Todoist, Obsidian, or Notion, and never opens issues. It stops at the recommendation.
- No glazing. A weak idea gets a Skip or gets left out, not a soft Adopt.

**Anchors and locators** ... how each point is located depends on source:

- **YouTube**: every locator in Relevant to you, Adopt this?, and Key points IS a clickable deep link. Convert the range START to total seconds and build it as `[[6:35–8:55]](https://youtu.be/{ID}?t={seconds})`, which renders as a clickable [6:35–8:55]. Range start only. Use the video ID retained in step 1. Omit for Shorts.
- **Other video** (X, Vimeo, TikTok, direct files, uploads): plain `[mm:ss]` or `[mm:ss-mm:ss]` markers, no hyperlink ... no reliable per-second deep link.
- **Email / article / pasted text**: NO timestamps. Anchor each point with a short (under 15-word) quoted phrase or a section reference so the user can locate it, e.g. ("...outlier score vs the creator's baseline..."). Never fabricate timestamps for text.

**Key points** ... always the last section. The video's main claims and structure. Format each point exactly as:

- **Short bolded heading** (three to six words, sentence case): the specifics ... numbers, named tools, frameworks, people, prices ... not vague gestures at topics. End the point with the anchor (timestamp deep link for YouTube, plain marker for other video, short quoted phrase for text) per Anchors and locators.

The bolded heading comes first, the timestamp comes last and is itself the link (see Anchors and locators) ... there is no separate line beneath. Never lead a point with the timestamp. Scale to content: a 10-minute video gets 4-6 points; a 2-hour podcast gets sectioned points under topic headings.

### 6. Follow-ups

The fetched content (transcript or text) stays in context. Answer deep-dive questions from it directly ... do not re-fetch. If the user asks about a section the summary compressed, quote-level detail is fine (paraphrased, not verbatim blocks).

## Constraints and edge cases

- **Long videos**: for transcripts over roughly 40,000 words, summarise section by section and keep the Key points layer coarser. Warn the user if the transcript appears truncated by the tool.
- **Multiple items in one message**: process each in turn, clearly separated. If more than three, confirm before burning the tool calls.
- **Shorts / very short videos**: compress the whole output to header + 2-3 sentence summary + relevance line. No point structure.
- **Playlists / channel links**: this skill handles single videos. For a playlist or channel link, list the videos via the TranscriptAPI list tools and ask which to process.
- **Style**: direct, no emojis, ellipses instead of dashes, no glazing. The Honest read section carries the worth-watching judgement ... do not soften it elsewhere to compensate.
- **Sandbox availability**: the non-YouTube path needs a code-execution sandbox (this app or Cowork). In a surface without one, say so and stop rather than failing silently.
- **Proxy certificate**: yt-dlp in the sandbox must pass `--no-check-certificates` (the egress proxy is self-signed); without it the download fails on `CERTIFICATE_VERIFY_FAILED`.
- **Ephemeral sandbox**: yt-dlp and faster-whisper reinstall each session (~30-60s); ffmpeg is preinstalled.
- **Engine**: the sandbox path uses local faster-whisper (base/int8), not Deepgram or TranscriptAPI.
- **Short emails / brief articles**: compress to header + 2-3 sentence summary + relevance line, like Shorts. No point structure.
- **Explicit-only for text**: never trigger on an email or article merely present in context ... only when the user makes it the subject of the request. Video sources keep their auto-trigger.
- **Propose-only (all sources)**: still never writes to Linear, Todoist, Obsidian, or Notion. The Adopt this? section proposes; the user actions via the normal scoping flow.

---
name: video-insights
description: Pull a video's transcript, summarise it, and surface themes personally relevant to Michael's ventures and interests. Use this skill EVERY time a video link or uploaded video appears in the conversation, whether or not the user asks for anything explicitly. For YouTube (youtube.com/watch, youtu.be, youtube.com/shorts, youtube.com/live, m.youtube.com) the transcript comes from the TranscriptAPI connector. For any other source (x.com/twitter.com, vimeo.com, tiktok.com, facebook.com, reddit, a direct .mp4/.m3u8/.webm URL, or an uploaded video file) the transcript is produced by a code-execution sandbox pipeline (yt-dlp + Whisper). Also trigger on phrases like "summarise this video", "what's this video about", "watch this for me", "key points from this video", "is this video worth watching", or when the user shares a video link or uploads a video file. Successor to the Snap Insight product workflow.
---

# Video Insights

Turn a YouTube link into an inline summary, a personal-relevance read, and an adoption call. Output is inline only ... never write to Notion, Linear, Todoist, or Obsidian, and never create tasks, issues, or notes. The Adopt this? section may recommend adoption and propose tasks or notes, but it only proposes them ... the user decides and actions them through the normal scoping flow. Surface and recommend; never execute.

## Pipeline

### 0. Route by source

Determine the transcript path from the input before doing anything else:

- **YouTube** (youtube.com/watch, youtu.be, youtube.com/shorts, youtube.com/live, m.youtube.com, or a bare 11-character video ID) -> **TranscriptAPI path**: continue with steps 1-3, then converge at step 4.
- **Any other video source** (x.com / twitter.com, vimeo.com, tiktok.com, facebook.com, reddit, a direct .mp4 / .m3u8 / .webm URL, or a video file the user uploaded) -> **Sandbox path**: skip to step 3b, then converge at step 4.

The Sandbox path requires a code-execution environment (this app or Cowork). If the current surface has no sandbox (e.g. a plain API context with no bash tool), say plainly that the non-YouTube path is unavailable in this surface, give a one-line metadata description if one is available, and stop. Never fail silently.

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

**Non-YouTube sources**: X, Vimeo, TikTok, direct files, and uploaded videos have no reliable per-second deep link, so show timestamps as plain `[mm:ss]` or `[mm:ss-mm:ss]` markers with no hyperlink. Only the YouTube path emits clickable deep links.

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
- **Sandbox availability**: the non-YouTube path needs a code-execution sandbox (this app or Cowork). In a surface without one, say so and stop rather than failing silently.
- **Proxy certificate**: yt-dlp in the sandbox must pass `--no-check-certificates` (the egress proxy is self-signed); without it the download fails on `CERTIFICATE_VERIFY_FAILED`.
- **Ephemeral sandbox**: yt-dlp and faster-whisper reinstall each session (~30-60s); ffmpeg is preinstalled.
- **Engine**: the sandbox path uses local faster-whisper (base/int8), not Deepgram or TranscriptAPI.

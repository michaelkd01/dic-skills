# Entity Buckets & Vendor Map

**Status: NAMES CONFIRMED (Michael, 2026-07-07) ... ALLOCATION SPLIT PENDING ACCOUNTANT.** Entity names below are confirmed. Which spend runs through Social Club Ventures vs The Remida Trust still requires accountant sanity-check before the map is fully canonical. Until then, SOCIALCLUB/TRUST cross-allocations run one confidence level lower; PERSONAL and PROPELL-REIMB allocations run at full confidence.

## Buckets

| Bucket | Legal entity | Return type | Notes |
|---|---|---|---|
| PERSONAL | Michael Davidson (individual) | Individual return | Personal deductions, investment income, memberships tied to director role |
| SOCIALCLUB | Social Club Ventures | Company return | Venture build/run costs: AnytimeInterview, Bespoke tooling, FreshSite, internal infra. Confirm exact ASIC-registered name/ACN in the accountant pack |
| TRUST | Remida Nominees Pty Ltd ATF The Remida Trust | Trust return | Confirm what actually runs through the trust ... may change with Hopgood Ganim redraft |
| PROPELL-REIMB | n/a ... expense claim to Propell | Not a deduction | Spend incurred for Propell duties; claim reimbursement, exclude from SC/personal deductions |

Open question for accountant: which entity carries dev infrastructure vs which distributes ... allocation between SOCIALCLUB and TRUST cannot be inferred from transactions alone.

## Vendor map (seed ... extend every run)

| Vendor / statement string | Bucket | Notes |
|---|---|---|
| Vercel | SOCIALCLUB | Hosting (ANY, BIStack reports, portfolio) |
| Neon | SOCIALCLUB | Postgres (ANY, CarTracker) |
| Cloudflare | SOCIALCLUB | Workers, R2, MCP gateways |
| Anthropic / Claude | SOCIALCLUB | Primary AI tooling; check for any personal-use apportionment flag |
| OpenAI | SOCIALCLUB | Codex rescue path |
| Deepgram | SOCIALCLUB | ANY speech-to-text |
| ElevenLabs | SOCIALCLUB | ANY voice synthesis |
| Stripe | SOCIALCLUB | Fees are expense; payouts are income ... separate |
| GitHub | SOCIALCLUB | |
| Linear | SOCIALCLUB | |
| Notion | SOCIALCLUB | |
| Todoist | SOCIALCLUB | |
| BrowserStack | SOCIALCLUB | |
| 1Password | SOCIALCLUB | |
| Google Workspace / GCP | SOCIALCLUB | GCP projects: anytimeinterview, mcpx, spheric-atom |
| Hetzner | SOCIALCLUB | NotionBackup secondary |
| Tailscale | SOCIALCLUB | |
| Domain registrars (socialclub.ltd etc.) | SOCIALCLUB | List each domain on first run |
| Simpro | REVIEW | Likely Bespoke ... confirm which entity pays |
| Hopgood Ganim | REVIEW | Constitution redraft relates to Propell governance ... likely PROPELL-REIMB or personal director cost; capital vs revenue nature is accountant territory |
| AICD | PERSONAL | Director-role membership; deductibility per accountant |
| OVO Energy | REVIEW | Home electricity ... personal, but home-office % is a deduction candidate |
| Apple | REVIEW | Mixed household/business hardware ... itemise each charge |
| Amazon | REVIEW | Always itemise ... never bulk-allocate |

## Standing rules

- Golf, wine, restaurants, groceries, BYD/vehicle running costs → PERSONAL unless explicit business-purpose evidence exists (then REVIEW, never auto-business)
- Entertainment is generally non-deductible ... flag any candidate as such
- Any vendor not in this table → REVIEW + proposed-additions list
- Income lines (Stripe payouts, dividends, interest, trust distributions) are tracked for completeness but allocated by the accountant

# Repo Paths (Canonical Mapping)

Reference mapping between project names and their local repo paths on the Mac Mini / MacBook Pro. Cyrus knows these from `~/.cyrus/config.json` per workspace; this document is for human reference and is cited by skill files. For each Linear-onboarded project, the canonical `Repo` URL also lives in the `Surface > Repo` line of the Linear project description (see `wiki/decisions/linear-project-description-template.md`).

| Project | Repo Path | Linear team / scope |
|---|---|---|
| AIAssistant | `/Users/michaeldavidson/Developer/ai-assistant` | TBD |
| AIFund | `/Users/michaeldavidson/Developer/aifund-phase3` | TBD |
| AI-BOS | `/Users/michaeldavidson/Developer/ai-bos` | TBD |
| AnytimeInterview2 | `/Users/michaeldavidson/Developer/anytimeinterview2` | AnytimeInterview team, key `ANY`, single-repo workspace |
| Arc | `/Users/michaeldavidson/Developer/lifestyle-design` | TBD |
| Bespoke / Website | `/Users/michaeldavidson/Developer/bespoke-website-main` | Bespoke team, key `BES`, scope label `bespoke-website` |
| Bespoke / Website (predecessor) | `/Users/michaeldavidson/Developer/bespoke-landing-page` | superseded by `bespoke-website-main` |
| Bespoke / Customer Portal | `/Users/michaeldavidson/Developer/bespoke-customer-portal-wireframe` | Bespoke team, key `BES`, scope label `bespoke-portal` |
| Bespoke / Backend | `/Users/michaeldavidson/Developer/bespoke-simpro-api` | Bespoke team, key `BES`, scope label `bespoke-api` ⚠ planned, not yet scaffolded |
| Bespoke / Simpro MCP | `/Users/michaeldavidson/Developer/bespoke-simpro-cloudflare-mcp` | Bespoke team, key `BES` (operational; consumed by Bespoke Simpro Cloudflare MCP connector) |
| BIStack | `/Users/michaeldavidson/Developer/bi-reports` | TBD |
| CaddieAI | `/Users/michaeldavidson/Developer/CaddieAI` | TBD |
| ContextEngine | `/Users/michaeldavidson/Developer/context-engine` | TBD |
| Delegator | `/Users/michaeldavidson/Developer/delegator` | TBD |
| Orchestrator | `/Users/michaeldavidson/Developer/orchestrator` | retired |
| Paperclip | `/Users/michaeldavidson/Developer/paperclip` | retired (soft-decommissioned 2026-05-06) |
| Propell | `/Users/michaeldavidson/Developer/Propell SF` | TBD |
| RightPeople | `/Users/michaeldavidson/Developer/right-people` | TBD |
| SC Internal / Infra | `/Users/michaeldavidson/Developer/infra-config` | SC Internal team, key `SOC`, scope label `infra-config` |
| SC Internal / MCPX | `/Users/michaeldavidson/Developer/mcpx-stack` | SC Internal team, key `SOC`, scope label `mcpx-stack` |
| ScreenTimeMath | `/Users/michaeldavidson/Developer/ScreenTimeMath` | TBD |
| SOABridge | `/Users/michaeldavidson/Developer/soa-bridge` | TBD |

## Active Linear teams (as of 2026-05-09)

- **AnytimeInterview** ... live, prefix `ANY-`. Single-repo workspace at `anytimeinterview2`. Five projects: Platform Portal, Client Portal, Candidate interview, Security, Workspace Docs.
- **Bespoke** ... live, prefix `BES-`. Multi-repo workspace. Four projects: Website, Customer Portal, Backend (planned), Simpro (operational config in the Simpro SaaS itself).
- **SC Internal** ... live, prefix `SOC-`. Multi-repo workspace. Two projects: Infra (Cyrus host, tunnel, connector warmup) and MCPX (Lunar.dev Google Workspace / Slack / Notion gateway).

## Pending Cyrus onboarding

These ventures exist conceptually but have no Linear team and no Cyrus config entry yet:

- GymToGreen
- ScreenTimeMath
- DickBot

## Maintenance

Add a new entry whenever a new project repo is created. Keep the team / scope column accurate as Linear workspaces evolve. Retired projects stay in the table marked `retired` for historical reference. For each Linear-onboarded project, the GitHub URL should match the `Surface > Repo` line in the corresponding Linear project description.

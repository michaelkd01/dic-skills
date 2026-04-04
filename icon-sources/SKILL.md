---
name: icon-sources
description: Standardised icon selection and integration for all frontend builds. Routes icon decisions between Iconify (UI chrome via CDN web component) and Flaticon API (hero/feature icons via SVG download). Covers HTML artifacts, React artifacts, CSS-only usage, and Claude Code execution prompts. Triggers on any frontend build, landing page, dashboard, or UI component work.
license: Private
---

# Icon Sources Skill

## Intent
Standardise icon selection and integration across all frontend builds. Replace default Lucide icons with higher-quality alternatives from Iconify (primary) and Flaticon API (secondary).

## Decision Logic

```
Is this a UI chrome icon? (nav, buttons, form elements, status indicators)
  → YES → Use Iconify
  → NO →
    Is this a hero, feature, or marketing icon? (landing pages, feature grids, onboarding)
      → YES → Use Flaticon API (SVG download, embed inline)
      → NO → Use Iconify
```

Never default to Lucide unless the user explicitly requests it.

---

## Source 1: Iconify (Primary)

200k+ icons across 150+ open-source icon sets. Loads on-demand from CDN. Zero bundling.

### Preferred Icon Sets by Context

| Context | Icon Set | Prefix | Notes |
|---|---|---|---|
| Dashboards, admin UIs | Material Symbols | `material-symbols` | Google's latest, variable weight/fill |
| Marketing pages, landing pages | Phosphor | `ph` | Clean, balanced, works at all sizes |
| Developer tools, technical UIs | Tabler | `tabler` | 4700+ icons, consistent 24px grid |
| Enterprise, data-heavy UIs | Carbon | `carbon` | IBM's design system icons |
| General fallback | Phosphor | `ph` | Best all-rounder |

### HTML Artifacts (claude.ai)

Add CDN script to `<head>`, then use the web component:

```html
<script src="https://code.iconify.design/iconify-icon/3.0.0/iconify-icon.min.js"></script>

<!-- Basic usage -->
<iconify-icon icon="ph:rocket-launch-bold" width="24" height="24"></iconify-icon>

<!-- With colour override (monotone icons only) -->
<iconify-icon icon="material-symbols:dashboard" width="32" style="color: #3B82F6;"></iconify-icon>

<!-- Inline with text -->
<iconify-icon icon="tabler:settings" width="16" inline></iconify-icon> Settings
```

### React Artifacts (claude.ai JSX)

The `<iconify-icon>` web component works in React but uses `class` not `className`. For cleaner React integration, fetch SVGs from the Iconify API and render inline:

```jsx
// Helper: fetch SVG from Iconify API
async function fetchIconSvg(prefix, name, size = 24, color) {
  let url = `https://api.iconify.design/${prefix}/${name}.svg?width=${size}&height=${size}`;
  if (color) url += `&color=${encodeURIComponent(color)}`;
  const res = await fetch(url);
  return await res.text();
}

// React component using dangerouslySetInnerHTML
function IconifySvg({ prefix, name, size = 24, color, className }) {
  const [svg, setSvg] = React.useState('');
  React.useEffect(() => {
    fetchIconSvg(prefix, name, size, color).then(setSvg);
  }, [prefix, name, size, color]);
  return <span className={className} dangerouslySetInnerHTML={{ __html: svg }} />;
}

// Usage
<IconifySvg prefix="ph" name="rocket-launch-bold" size={24} />
<IconifySvg prefix="material-symbols" name="dashboard" size={32} color="#3B82F6" />
```

Alternative: use the web component directly in React (simpler, minor className caveat):

```jsx
// Works in React ... use class= not className=
<iconify-icon icon="ph:rocket-launch-bold" width="24" height="24"></iconify-icon>
```

### CSS-only Usage (backgrounds and masks)

For icons in CSS without any JS:

```css
/* Monotone icon inheriting currentColor via mask */
.icon-home {
  display: inline-block;
  width: 1.5em;
  height: 1.5em;
  background-color: currentColor;
  mask-image: url('https://api.iconify.design/ph/house-bold.svg');
  mask-repeat: no-repeat;
  mask-size: 100% 100%;
  -webkit-mask-image: url('https://api.iconify.design/ph/house-bold.svg');
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-size: 100% 100%;
}

/* Coloured icon as background */
.icon-status {
  display: inline-block;
  width: 1.5em;
  height: 1.5em;
  background-image: url('https://api.iconify.design/fluent-emoji-flat/check-mark-button.svg');
  background-repeat: no-repeat;
  background-size: 100% 100%;
}
```

### Iconify API Direct SVG Endpoint

Useful for downloading SVGs in Claude Code builds:

```
GET https://api.iconify.design/{prefix}/{name}.svg
```

Parameters:
- `width` / `height` ... dimensions (default: viewBox)
- `color` ... replaces currentColor (monotone only). Use %23 for # in hex codes
- `rotate` ... 90deg, 180deg, 270deg
- `flip` ... horizontal, vertical
- `box=1` ... adds bounding rectangle (useful for design tool imports)
- `download=1` ... forces download headers

Examples:
```
https://api.iconify.design/ph/rocket-launch-bold.svg?width=48&height=48
https://api.iconify.design/material-symbols/dashboard.svg?color=%233B82F6
https://api.iconify.design/tabler/settings.svg?width=24&rotate=90deg
```

### Icon Name Format

All Iconify icons follow `{prefix}:{name}` or `{prefix}/{name}` format:
- Web component: `icon="ph:rocket-launch-bold"`
- API URL: `https://api.iconify.design/ph/rocket-launch-bold.svg`

Browse and search: https://icon-sets.iconify.design/

---

## Source 2: Flaticon API (Secondary)

Premium icon library. Use for high-impact, visually distinctive icons in hero sections, feature grids, onboarding flows, and marketing pages.

### Authentication

API key stored in 1Password as **"Flaticon API Key"**.

```bash
# Step 1: Retrieve API key from 1Password
FLATICON_API_KEY=$(op read "op://Private/Flaticon API Key/credential")

# Step 2: Get JWT token (expires in 24h)
TOKEN=$(curl -s -X POST https://api.flaticon.com/v3/app/authentication \
  -F "apikey=$FLATICON_API_KEY" | jq -r '.token')

# Token is now ready for all subsequent requests
```

### Search Icons

```bash
# Search by keyword, ordered by popularity
curl -s "https://api.flaticon.com/v3/search/icons/priority?q=dashboard&limit=10" \
  -H "Authorization: Bearer $TOKEN" | jq '.data[] | {id, description, tags, color, shape}'
```

Query parameters:
- `q` (required) ... search term
- `orderBy` (in URL path) ... `priority` (popular) or `added` (newest)
- `limit` ... 10 to 100 (default 100)
- `page` ... pagination
- `styleColor` ... `black`, `color`, or `gradient`
- `styleShape` ... `outline`, `fill`, `lineal-color`, or `hand-drawn`

### Download Icon as SVG

```bash
# Download SVG by icon ID
curl -s "https://api.flaticon.com/v3/item/icon/download/{id}?format=svg" \
  -H "Authorization: Bearer $TOKEN" -o icon.svg

# Download with custom colour (monocolor icons only)
curl -s "https://api.flaticon.com/v3/item/icon/download/{id}?format=svg&color=3B82F6" \
  -H "Authorization: Bearer $TOKEN" -o icon.svg

# Download PNG at specific size (16, 24, 32, 64, 128, 256, 512)
curl -s "https://api.flaticon.com/v3/item/icon/download/{id}?format=png&size=128" \
  -H "Authorization: Bearer $TOKEN" -o icon.png
```

### Get Icon Details

```bash
curl -s "https://api.flaticon.com/v3/item/icon/{id}" \
  -H "Authorization: Bearer $TOKEN" | jq '.data'
```

Returns: id, description, tags, color, shape, pack info, and image URLs at all sizes.

### Search Packs (for consistent icon sets)

```bash
curl -s "https://api.flaticon.com/v3/search/packs?q=business&limit=10" \
  -H "Authorization: Bearer $TOKEN" | jq '.data[] | {id, description, pack_items}'
```

### Typical Claude Code Workflow

```bash
# 1. Auth
FLATICON_API_KEY=$(op read "op://Private/Flaticon API Key/credential")
TOKEN=$(curl -s -X POST https://api.flaticon.com/v3/app/authentication \
  -F "apikey=$FLATICON_API_KEY" | jq -r '.token')

# 2. Search for icons matching the feature
RESULTS=$(curl -s "https://api.flaticon.com/v3/search/icons/priority?q=analytics&styleColor=color&styleShape=fill&limit=5" \
  -H "Authorization: Bearer $TOKEN")

# 3. Extract top icon ID
ICON_ID=$(echo $RESULTS | jq -r '.data[0].id')

# 4. Download SVG to project assets
curl -s "https://api.flaticon.com/v3/item/icon/download/$ICON_ID?format=svg" \
  -H "Authorization: Bearer $TOKEN" -o ./public/icons/analytics.svg
```

### Attribution

Flaticon Premium plan ... no attribution required for downloaded icons. Free plan requires attribution per Flaticon's terms.

---

## Integration Patterns for Claude Code Prompts

When writing execution prompts that include icon work, use these patterns:

### Pattern A: Iconify in Next.js / HTML builds

```
Install no packages. Use the Iconify web component via CDN script in the
document head:
<script src="https://code.iconify.design/iconify-icon/3.0.0/iconify-icon.min.js"></script>

Use icons from the Phosphor set for UI elements:
<iconify-icon icon="ph:magnifying-glass" width="20"></iconify-icon>

Prefer: ph (Phosphor), material-symbols, tabler, carbon
Never use: Lucide, Font Awesome, Heroicons (unless explicitly requested)
```

### Pattern B: Flaticon SVGs in Next.js builds

```
Authenticate to Flaticon API using 1Password:
FLATICON_API_KEY=$(op read "op://Private/Flaticon API Key/credential")
TOKEN=$(curl -s -X POST https://api.flaticon.com/v3/app/authentication \
  -F "apikey=$FLATICON_API_KEY" | jq -r '.token')

Search for "[keyword]" icons with styleColor=color and styleShape=fill.
Download top result as SVG to ./public/icons/[name].svg.
Reference in components as <img> or inline SVG.
```

### Pattern C: Mixed (typical landing page)

```
UI chrome (nav, buttons, toggles, form elements):
  → Iconify web component, Phosphor set

Hero icons, feature grid icons, CTA illustrations:
  → Flaticon API, search "[relevant terms]", download SVG to ./public/icons/
```

---

## Quick Reference

| Need | Source | Method |
|---|---|---|
| Nav icon | Iconify | `<iconify-icon icon="ph:list-bold">` |
| Button icon | Iconify | `<iconify-icon icon="ph:arrow-right-bold">` |
| Status indicator | Iconify | `<iconify-icon icon="material-symbols:check-circle">` |
| Dashboard widget icon | Iconify | `<iconify-icon icon="carbon:analytics">` |
| Hero section icon | Flaticon | API search → SVG download |
| Feature grid icon | Flaticon | API search → SVG download |
| Onboarding illustration | Flaticon | API search → SVG download |
| CSS-only icon | Iconify | `mask-image: url('https://api.iconify.design/...')` |
| Favicon | Flaticon | API search → PNG 32px download |

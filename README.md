# RydeChain — marketing website

Static marketing site for RydeChain, the Cardano-based ride-sharing platform built for Accra, Ghana.

## Run locally

No build step or dependencies — it's plain HTML, CSS and JS.

```bash
python3 -m http.server 4567
```

Then open <http://localhost:4567>.

## Files

## Site structure

Each section is its own page (clean URLs, no `.html`):

| URL | Page |
|-----|------|
| `/` | Home — hero and highlights |
| `/about` | About us — stats and mission |
| `/features` | Feature list |
| `/how-it-works` | Four-step flow |
| `/screens` | Real app screenshots |
| `/drivers` | Driver CTA |
| `/driver-signup` | Driver registration (live API) |
| `/payments` | Payments + testimonial |
| `/roadmap` | Product roadmap |
| `/download` | Get the app |

Shared header, footer, and nav live in `site-layout.js` (set `data-page` on `<body>` for active link).

## Layout (home page)

## Driver registration

`driver-signup.html` is a working three-step registration flow that talks to the
real RydeChain API — it is not a mock form.

1. **Account** → `POST /auth/register` with `role: "driver"`, then
   `POST /auth/login` to get an access token. Existing drivers can sign in
   instead — registration returns `409` on a duplicate email, and the form
   points them at the sign-in card.
2. **Documents** → on entering this step, `GET /drivers/me/documents` restores
   what's already on file (including rejected ones and their review note), so a
   part-finished application isn't lost. Each file then goes to
   `POST /drivers/me/documents/{type}` (multipart, field name `file`) as soon as
   it's picked.
3. **Submit** → `POST /drivers/me/documents/submit`

### Keeping the two in sync

The page duplicates several server rules client-side (password 8–128, phone ≥ 9
digits, JPG/PNG/WebP, 5 MB) so people are told before a wasted round trip. Those
copies are pinned by `backend/tests/test_web_signup_contract.py` — it asserts
them against the real schemas and services, so changing a limit on the server
fails the test and names this file as the thing to update. Run it with:

```bash
.venv/bin/python -m pytest tests/test_web_signup_contract.py -q
```

All five document types are required, matching `REQUIRED_TYPES` in
`backend/app/services/driver_document_service.py`: `profile`, `license`,
`registration`, `insurance`, `background`. Files must be JPG, PNG or WebP and
under 5 MB — the page enforces both client-side so people aren't left waiting on
an upload the server will reject.

The access token is held in memory only, never `localStorage`.

### Production URL

**https://app.arcaccra.com** — see [DEPLOY.md](./DEPLOY.md) for Vercel/Cloudflare setup and DNS.

### ⚠️ Required before driver signup works in production

The API only accepts requests from an origin allowlist. **`https://app.arcaccra.com`** is in the backend `always_allow` list — redeploy the Railway API after pulling the latest `RYDECHAIN` backend. For local dev, `http://localhost:4567` is also allowed.

To point the page at a different API:

```html
<script>window.RYDECHAIN_API_URL = 'http://localhost:8000/api/v1';</script>
```

| File | Purpose |
|------|---------|
| `index.html` | Home page |
| `about.html`, `features.html`, etc. | Standalone section pages |
| `driver-signup.html` | Driver registration + document upload |
| `site-layout.js` | Shared header, footer, and navigation |
| `driver-signup.js` | Registration flow logic |
| `styles.css` | Brand tokens and all layout/responsive rules |
| `script.js` | Scroll-reveal animations |
| `assets/logo.png` | White "R" mark on brand purple |
| `assets/logo-original.png` | Untouched app icon, dark-indigo R — kept for reference |
| `assets/favicon.png`, `assets/mark.png` | Generated from `logo.png` |
| `assets/screens/*.png` | Real captures of the app's screens (see below) |

## App screens

The phone frames show **real screens from the RydeChain app**, not mockups. They
were captured from the Expo web build (`npx expo start --web`) at a 390×844
viewport, then downscaled to 2x for the web.

| File | Screen |
|------|--------|
| `01-onboarding-share.png` | Onboarding — "Sharing Ride in affordable way" |
| `02-onboarding-price.png` | Onboarding — "Its transparent & priceless" |
| `03-onboarding-choice.png` | Onboarding — "you have a say in the ride" |
| `04-auth.png` | Create account — register as Rider or Driver |

Screens behind authentication aren't included, since capturing them would need a
real account. To refresh these, start the app's web build and re-capture at the
same viewport.

No emoji anywhere in the page — every glyph is an inline SVG icon so rendering is
identical across platforms.

## Brand

Colours mirror `src/constants/colors.js` in the mobile app, so the site and app stay in sync.

| Token | Value | Use |
|-------|-------|-----|
| `--purple` | `#7B00FF` | Primary actions, links, accents |
| `--purple-dark` | `#5A00C7` | Hover states, gradient end |
| `--purple-soft` | `#F1EDFF` | Badge and icon backgrounds |
| `--yellow` | `#F5D84C` | Driver/vehicle highlights |
| `--success` | `#22C55E` | On-chain verification, pickup pin |
| `--bg` / `--panel` | `#F4F6FA` / `#FFFFFF` | Page and card surfaces |
| `--text` / `--muted` | `#0F172A` / `#64748B` | Body copy |

Typeface is **Inter** (loaded from Google Fonts), matching the app's UI weight range.

The logo's white R is produced from the app icon by mapping the dark-indigo glyph
colour to white along the background→glyph axis, which preserves the antialiased
edges and leaves the motion streak reading as a purple slit.

## Content

Copy is drawn from `PITCH.md` and `README.md` in the mobile app repo — driver
autonomy, passenger flexibility, transparent pricing, direct wallet-to-wallet ADA
settlement, cash support, and the roadmap (smart-contract escrow, on-chain
reputation, DID verification, mobile money).

## Still to fill in

- Google Play link on the "Get it on Google Play" button (currently `#`)
- ~~Privacy policy and terms pages~~ — footer links to Railway legal pages

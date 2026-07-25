# RydeChain — marketing website

Static marketing site for RydeChain, the Cardano-based ride-sharing platform built for Accra, Ghana.

## Run locally

No build step or dependencies — it's plain HTML, CSS and JS.

```bash
python3 -m http.server 4567
```

Then open <http://localhost:4567>.

## Files

## Layout

Single page, in section order:

1. **Header** — split nav with the wordmark centred
2. **Hero** — two-tone headline, phone mockup with floating glass cards, avatar stack
3. **Purple slab** — two highlight blocks, overlapping into the section below
4. **Stats** — trip-history card with floating accents, three numbered claims
5. **Features** — two-tone heading, icon list, floating cards
6. **How it works** — four numbered steps
7. **Driver CTA** — tilted phone on a gradient panel
8. **Testimonial** — gradient portrait block with Trustpilot chip
9. **Roadmap** — three cards
10. **Newsletter + footer**

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

### ⚠️ Required before this works in production

The API only accepts requests from an origin allowlist. **The deployed site's
domain must be added to `BACKEND_CORS_ORIGINS` on Railway**, or every request
fails with "Couldn't reach the RydeChain API". `http://localhost:4567` has been
added to the `always_allow` list in `backend/app/main.py` for local development,
but that change still needs deploying.

To point the page at a different API:

```html
<script>window.RYDECHAIN_API_URL = 'http://localhost:8000/api/v1';</script>
```

| File | Purpose |
|------|---------|
| `index.html` | The whole page — all sections above |
| `driver-signup.html` | Driver registration + document upload |
| `driver-signup.js` | Registration flow logic |
| `styles.css` | Brand tokens and all layout/responsive rules |
| `script.js` | Mobile nav toggle and scroll-reveal animations |
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
- Privacy policy and terms pages (footer links are placeholders)
- Contact destination in the footer

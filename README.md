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

| File | Purpose |
|------|---------|
| `index.html` | The whole page — all sections above |
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

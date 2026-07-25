# Deploy RydeChain website → app.arcaccra.com

Static site (HTML/CSS/JS). No build step.

**Production URL:** https://app.arcaccra.com

---

## Option A — Vercel (recommended)

### 1. Import the repo

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import **Sarbah12/RYDECHAIN-WEBSITE** from GitHub
3. Framework preset: **Other** (no build command)
4. Root directory: `.` (repo root)
5. Deploy

### 2. Custom domain

1. Vercel project → **Settings** → **Domains**
2. Add `app.arcaccra.com`
3. Vercel shows the DNS record to create (usually a **CNAME**)

### 3. DNS at your registrar (arcaccra.com)

Wherever `arcaccra.com` DNS is managed (Google Domains, Cloudflare, Namecheap, etc.):

| Type | Name | Value |
|------|------|--------|
| **CNAME** | `app` | `cname.vercel-dns.com` |

If Vercel gives a different target after you add the domain, use that instead.

Wait 5–30 minutes for DNS + TLS. Vercel issues the HTTPS certificate automatically.

### 4. Backend CORS (required for driver signup)

After the site is live, the API must allow browser requests from the new origin.

In the **RYDECHAIN** repo this is already in `backend/app/main.py` (`always_allow` includes `https://app.arcaccra.com`). **Redeploy the Railway backend** so the change takes effect.

Or add to Railway **Variables**:

```
BACKEND_CORS_ORIGINS=https://app.arcaccra.com,https://rydechain.vercel.app
```

### 5. Verify

```bash
curl -sI https://app.arcaccra.com | head -5
curl -sI https://app.arcaccra.com/driver-signup | head -5
```

Open https://app.arcaccra.com/driver-signup and complete step 1 (account) — if CORS is correct, registration succeeds.

---

## Option B — Cloudflare Pages

1. [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → Connect to Git
2. Repo: **RYDECHAIN-WEBSITE**
3. Build settings: **None** (static)
4. Build output directory: `/` (root)
5. **Custom domains** → add `app.arcaccra.com` (DNS is automatic if arcaccra.com is on Cloudflare)

---

## Option C — Manual / any static host

Upload all files (except `.git`, `.DS_Store`) to any static host (S3 + CloudFront, Netlify, GitHub Pages with custom domain, etc.) and point `app.arcaccra.com` at it.

---

## URLs used on the live site

| Link | URL |
|------|-----|
| Marketing home | https://app.arcaccra.com |
| About | https://app.arcaccra.com/about |
| Features | https://app.arcaccra.com/features |
| How it works | https://app.arcaccra.com/how-it-works |
| The app | https://app.arcaccra.com/screens |
| Drivers | https://app.arcaccra.com/drivers |
| Driver signup | https://app.arcaccra.com/driver-signup |
| Payments | https://app.arcaccra.com/payments |
| Roadmap | https://app.arcaccra.com/roadmap |
| Download | https://app.arcaccra.com/download |
| Privacy policy | https://api.arcaccra.com/static/legal/privacy.html |
| Terms | https://api.arcaccra.com/static/legal/policies.html |
| Contact | admin@arcaccra.org |
| API (driver form) | https://api.arcaccra.com/api/v1 |

---

## Redeploy after changes

Push to `main` on **RYDECHAIN-WEBSITE** — Vercel/Cloudflare auto-redeploys.

```bash
git add -A && git commit -m "Update site copy" && git push
```

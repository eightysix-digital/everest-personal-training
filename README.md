# Everest Personal Training

Marketing and sales website for Everest Personal Training (Christchurch, NZ). A premium,
conversion-led static site that doubles as a capability statement for organisational and
health-sector audiences.

Selling is handled by **external Stripe product links** (no in-site checkout). Program cards
deep-link out to Stripe; premium/proposal offers route to the contact page.

## Stack

- Static HTML, CSS and vanilla JS. No build step, no framework.
- Content lives in editable JSON files under `data/` so non-developers can update products,
  prices and impact figures without touching markup.
- Deployed on Vercel from this GitHub repo.

## Project structure

```
index.html             Home page
programs/              Programs catalogue (filters + program finder quiz)
coaching/              Personalised coaching
performance/           Everest Elite performance
empower/               EMPOWER youth development
organisations/         Workforce wellness + preventative human performance (#preventative)
impact/                Impact pillars, evidence framework, case studies
about/                 Origin story and values
team/                  Coach profiles (from data/team.json)
contact/               Segmented enquiry form (?type= preselects)
legal/                 Privacy, terms, health disclaimer, cookies (#anchors)
resources/             Insights hub (placeholder, phase 2)

css/styles.css         Brand styles (palette + shared page components)
js/layout.js           Shared header, footer, sticky CTA, mobile nav (injected on every page)
js/main.js             Home/impact: program deck + impact counters from data/
js/programs.js         Programs page: catalogue rendering, filtering, program finder
js/team.js             Team page: renders coach profiles
js/contact.js          Contact form: type preselect + submit (endpoint or mailto fallback)
data/programs.json     Product catalogue (name, price, Stripe checkout URL, filters, status)
data/impact.json       Impact metrics (kept hidden until display:true + sources recorded)
data/team.json         Coach profiles
assets/img             Images (use WebP/AVIF where possible)
assets/video           Hero/brand video
vercel.json            cleanUrls + trailingSlash + staging noindex header
robots.txt             Staging: blocks crawlers
```

Header and footer are defined once in `js/layout.js` and injected into the
`#site-header` / `#site-footer` placeholders on every page, so navigation and footer
content are edited in a single place.

### Contact form

`js/contact.js` posts to `FORM_ENDPOINT` (set it to a Formspree/Basin/Netlify endpoint).
Until that is set, it falls back to opening a pre-filled email to `hello@everestpt.co.nz`,
so the form is never a dead end. Update the email/endpoint there.

## Brand

Defined as CSS custom properties in `css/styles.css` (`:root`).

**Palette (from the brief)** — Everest Black `#111111`, White `#FFFFFF`, Deep Teal `#0B7C7A`,
Accent Teal `#16B8B3`, Mist `#E8F6F5`, Slate Grey `#5F666B`, Cloud Grey `#F3F5F6`.

**Supporting tints (brand extension)** — functional in-family shades the headline palette omits,
used for legible text/borders on dark and teal surfaces: `--black-deep #0a0a0a`,
`--teal-darkest #04342C` (text on accent-teal, passes WCAG AA), `--mist-line #9fe1de`,
`--ink-on-dark #cfd4d6`, `--teal-on-dark #cdeceb`, `--grey-muted #7d8488`. These can be
retired in favour of low-opacity white if Jared wants strict palette-only adherence.

**Type** — Inter (weights 400/500 only). Sentence case for headings; all-caps reserved for small
labels and navigation. No condensed fonts, italics, gradients or neon, per the brief.

## Local preview

Serve the folder with any static server, for example:

```
npx serve .
# or
python3 -m http.server 8080
```

Then open the printed URL. (Opening `index.html` directly via `file://` will fail the
`fetch()` calls for the JSON data; use a server.)

## Editing content

- **Programs / prices / Stripe links** -> `data/programs.json`. Set each product's
  `checkoutUrl` to its live Stripe payment link. `status` must be `active` to show.
  The `featured` array controls which programs appear in the home page deck and in what order.
- **Impact figures** -> `data/impact.json`. Do **not** publish unverified numbers. Each metric
  must have a `source`, `dateRange` and `method` recorded, then set `display: true`. The whole
  impact section stays hidden until at least one metric is verified.

## Sitemap & llms.txt

`tools/generate.js` scans every page and writes `sitemap.xml` and `llms.txt` (page titles +
descriptions). It runs automatically on every Vercel deploy (via `buildCommand` in
`vercel.json`), so both files always reflect the current site. They are git-ignored because
they are build artefacts. To regenerate locally: `node tools/generate.js`.

Set the `SITE_URL` environment variable in Vercel to the production domain when it goes live
(defaults to the staging `*.vercel.app` URL). Also update the `Sitemap:` line in `robots.txt`.

## Deployment (Vercel)

1. Import this repo into Vercel (no framework preset; it is a static site).
2. Pushes to `main` deploy to the production `*.vercel.app` staging URL.
3. Branches/PRs get automatic preview URLs for client review.

### Going live (when the real domain is ready)

- Add the custom domain in Vercel.
- Remove the staging `noindex`: delete the `<meta name="robots">` line in `index.html`
  and the `X-Robots-Tag` header block in `vercel.json`.
- Replace `robots.txt` with an allow rule + sitemap reference.

## Secrets

No private keys belong in this repo or in front-end code. Any future API keys go in Vercel
environment variables. Stripe links used here are public payment links, which is fine.

## Handover notes

The repo is the source of truth. To hand the site to another owner: transfer this GitHub repo
(keeps history) and either transfer the Vercel project or have the new owner re-import the repo
into their own Vercel account. No lock-in.

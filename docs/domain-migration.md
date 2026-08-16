# Migrating everestpersonaltraining.com

The old WordPress site is the only real ranking history Everest has. Switching
it off without redirects throws that away and the new pages start from zero.
Redirect it properly and the new site inherits it.

## The old site, in full

Read from its Yoast sitemaps on 16 August 2026. Ten pages, no blog posts, and
an empty product sitemap despite WooCommerce being installed.

| Old URL | Redirects to | Why |
|---|---|---|
| `/` | `/personal-training/` | Old site was entirely the PT business |
| `/about-us/` | `/about/` | Direct equivalent |
| `/contact-us/` | `/contact/` | Direct equivalent |
| `/services/` | `/personal-training/` | Closest match to what it sold |
| `/packages/` | `/programs/` | The catalogue |
| `/shop/` | `/programs/` | WooCommerce storefront |
| `/basket/` | `/programs/` | Cart, nothing to preserve |
| `/checkout/` | `/programs/` | Checkout now runs through Trainerize |
| `/my-account/` | `/contact/` | Account holders will have questions; send them to a human |
| `/partners/` | `/organisations/` | Closest match |

Every row except `/` is already live in `vercel.json`. Those paths do not exist
on the new site, so the rules are harmless on this domain and correct on the
old one.

## What still needs doing, and why it is not in this repo

`/` cannot be redirected from a config file here. A rule for `/` would match
the new homepage as well, and Vercel needs an absolute destination to move a
request between hosts. Both are domain-level concerns.

**Steps, in order:**

1. **Decide the production domain.** Everything below depends on it, and the
   `SITE_URL` environment variable needs it too — the blog generator currently
   falls back to the `.vercel.app` preview URL, which means canonicals, RSS
   links and schema `@id`s are all pointing at a preview.

2. **Point `everestpersonaltraining.com` DNS at Vercel** and add it to this
   project.

3. **Set the domain to redirect** in Vercel's domain settings: choose
   "Redirect to" and select the production domain, with "Preserve path"
   enabled. That issues a 308 for every request, and the path rules in
   `vercel.json` then run against the destination.

4. **Keep the old domain registered and pointed for at least twelve months.**
   Redirect equity transfers over months, not days, and any backlink still
   aimed at the old domain dies the moment it stops resolving.

5. **Verify both domains in Google Search Console** and submit a change of
   address from the old property to the new one. This is the signal Google
   actually acts on; the redirects alone are slower.

6. **Re-crawl and check.** Every row in the table above should return a single
   301 or 308 straight to its destination. Redirect chains leak authority, so
   there should be no intermediate hops.

## One thing to check before switching off

WooCommerce was installed on the old site. If anyone holds an account, an
active subscription or store credit there, `/my-account/` disappearing will
strand them. Confirm the store is empty, or contact those customers, before
the DNS moves.

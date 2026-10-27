# Next steps: growing into a rider-contributed media hub

Ordered roughly by when they become worth doing.

## Phase 1: launch (now → first month)

- Fill in `site.json` (Instagram handle, email), add 3–5 real clips with permission, switch `showDemoContent` off.
- Buy a short custom domain (about $10–15/year). It's the single best brand investment.
- Put the site link in the Instagram bio and link the site from every post's caption ("full edit on the site").
- Add a scheduled nightly rebuild (`schedule: - cron: '0 8 * * *'` in the workflow) so the Sessions page stays current.
- Optional privacy-friendly analytics: Cloudflare Web Analytics (free, no cookies) or GoatCounter (free for small sites). Update the privacy paragraph if you add one.

## Phase 2: open submissions (when people start asking how to send clips)

1. Turn on the built-in form: set `submissions.open: true` and either a `contactEmail` (opens a pre-filled email) or a free **Formspree** endpoint (`formEndpoint`). The consent checkboxes are already there.
2. Large files: ask for *links* (Instagram, YouTube unlisted, Google Drive/Dropbox), never uploads. That keeps storage free and leaves the original with the creator.
3. Add a lightweight **review queue**. Have submissions land as GitHub Issues through a form-to-GitHub integration, or in a shared inbox. Approving one means creating the Markdown entry with `rights: creator-submitted` and a `rightsNote` linking to the submission.
4. Write simple **submission terms** (a non-exclusive licence to display with credit, revocable on request) and have a lawyer glance at them once. Link them from the form.
5. Keep **parental consent for minors** as a hard rule. Think about a separate consent form for under-18 riders.

## Phase 3: community hub (dozens of contributors)

- **Rider accounts / self-service profiles.** Move from Git-only to a small backend: Supabase (Postgres + auth + storage, free tier) or Cloudflare D1 + R2 + Workers (very cheap, no egress fees). Riders log in with Instagram or email, claim their profile, and submit clips that land in a moderation queue.
- **Moderation tooling:** approve/reject with a reason, automatic credit, takedown handling, a block list. Even with automation, keep a human approval step before anything publishes.
- **Media at scale:** once photos number in the hundreds, move them out of git to Cloudflare R2 or Cloudinary (free tier with on-the-fly resizing). Astro supports remote images, and content entries would store a URL instead of a file path.
- **Better discovery:** trick and rider tags, "clip of the week" voting (one vote per account), seasonal collections ("2026/27 Season"), and site search (Pagefind: static, free, an Astro integration).
- **Newsletter:** a monthly "best of" email (Buttondown or Substack free tiers) gives you an audience you own, independent of the Instagram algorithm.

## Phase 4: sustainability (optional)

- **Local sponsors** (shops, cafés, tuners) as clearly labelled "Supported by" placements, never implying resort sponsorship.
- **Events:** film premieres, rail jams with proper permissions, insurance, and venue or mountain approval where needed.
- **Merch:** print-on-demand (no inventory) using the orange-oval mark. Do a trademark search first.

## Guardrails to keep as it grows

- No media without recorded permission (keep the `rights` rule in the schema even when a database replaces Markdown).
- Never imply affiliation with Killington Resort or any ski area; get written approval before using resort names in event branding.
- Don't publish riding on closed terrain or without required mountain approval.
- Respond to takedown requests fast, and publicly commit to a timeframe (currently 48 hours).

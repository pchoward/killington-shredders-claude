# Killington Shredders

The website for **Killington Shredders**, a freestyle ski and snowboard crew from Killington, Vermont, with mountain biking all summer and some skate & BMX crossover. It's the public home of the Killington Shredders Facebook group: rider videos, photos, stories, crew profiles, sessions, and a Park Dictionary for newer riders.

*Snow first. Dirt when it melts.*

> **Not affiliated with Killington Resort.** The site says so in the footer of every page, on the About page, and on the Sessions page.

- **Stack:** [Astro 7](https://astro.build), a static site. Content lives as Markdown files in the repo, there's no database, and only a few KB of JavaScript.
- **Hosting:** free (GitHub Pages workflow included; Cloudflare Pages and Netlify also work).
- **Editing:** use [Pages CMS](https://pagescms.org) (free, browser-based, config included) or edit the Markdown files directly on GitHub.

More docs:

| Doc | What's in it |
| --- | --- |
| [docs/V2-BRAND-REFRESH.md](docs/V2-BRAND-REFRESH.md) | What changed in v2 (75/20/5 emphasis, seasons, Facebook group) and how to compare with v1 |
| [docs/CONTENT-GUIDE.md](docs/CONTENT-GUIDE.md) | Day-to-day: adding videos, photos, stories, riders, events; going live with real content |
| [docs/RATIONALE.md](docs/RATIONALE.md) | Creative and technical decisions, and the trade-offs behind them |
| [docs/NEXT-STEPS.md](docs/NEXT-STEPS.md) | A roadmap for growing into a rider-contributed media hub |
| [docs/TESTING.md](docs/TESTING.md) | What was tested, and what couldn't be verified |

---

## Run it locally

You need **Node.js 22.23.4 or newer** (Node 24 LTS recommended; `.nvmrc` pins 24).

```bash
npm install
npm run dev        # http://localhost:4321, auto-reloads while you edit
```

Other commands:

```bash
npm run build      # production build into dist/
npm run preview    # serve dist/ locally to check the production build
npm run new -- video "Opening Day Laps"   # scaffold a new entry (video|photo|story|rider|event)
npm run demo-art   # regenerate the placeholder artwork
```

If a content file is missing something required (alt text on a photo, or a `rights` value on real media), `npm run build` and `npm run dev` stop with a message naming the file and field.

## Publish it (free)

### Option A: GitHub Pages (workflow included)

1. Create a GitHub repository and push this folder to its `main` branch.
2. In the repo, go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
3. Push (or run the workflow manually from the **Actions** tab). `.github/workflows/deploy.yml` builds the site and publishes it.
4. The site appears at `https://<you>.github.io/<repo>/`, with the original v1 at `/v1/` for comparison (see [V2-BRAND-REFRESH](docs/V2-BRAND-REFRESH.md)). The workflow sets the sub-path (`BASE_PATH`) automatically, so links, images and links inside Markdown all keep working.
5. **Custom domain (optional, about $10–15/year for the domain; hosting stays free):** add it under Settings → Pages, then point a DNS `CNAME` record at `<you>.github.io`. HTTPS is automatic.

### Option B: Cloudflare Pages or Netlify

Connect the repository in their dashboard and use these settings:

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Output directory | `dist` |
| Environment variables | `SITE_URL=https://your-domain` and `NODE_VERSION=24` |

Both rebuild automatically on every push and give you preview URLs for branches.

### Free-tier trade-offs (short version)

- **GitHub Pages:** free for public repositories. Soft limits are 1 GB per site and 100 GB of bandwidth per month, far more than this site needs. Pages from a private repo require a paid GitHub plan. There's no server-side code, which is why forms use an email fallback or an external form service.
- **Cloudflare Pages:** generous free tier with unlimited bandwidth and 500 builds a month. The best pick if traffic ever spikes.
- **Netlify:** the free tier has a monthly bandwidth and build-minute allowance; heavy traffic can hit it.
- **Videos are never hosted here.** They embed from YouTube, Vimeo, Instagram or TikTok, which carry the bandwidth for free. Photos are stored in the repo and resized at build time; that's fine for hundreds of photos. See [NEXT-STEPS](docs/NEXT-STEPS.md) for when to move media to a CDN.

Full discussion: [docs/RATIONALE.md](docs/RATIONALE.md#hosting).

## Before launch: checklist

1. Edit `src/data/site.json` (or use **Site settings** in Pages CMS): add the **Facebook group URL** (`social.facebookGroup`), which turns on the "Join the group" buttons, plus the Instagram handle, contact email and other links. Links and buttons stay hidden until they're filled in.
2. Add some real content (see the [content guide](docs/CONTENT-GUIDE.md)).
3. Set `"showDemoContent": false` to hide every demo item and the preview banner in one go. You can also delete the demo files: everything with `demo: true` in `src/content/`, plus `src/assets/demo/`.
4. Review the three starter articles (`welcome-to-killington-shredders.md`, `park-etiquette-101.md`, `your-first-bike-park-day.md`). They're written in the brand voice but use demo cover art; rewrite them in your own words and swap the covers.
5. Turn on submissions when you're ready (`submissions.open: true` plus an email address or a [Formspree](https://formspree.io) endpoint).

## Project layout

```
src/
  content/            ← all site content as Markdown (videos, photos, stories, crew, events)
  content.config.ts   ← content schema, including the demo/rights safety rules
  data/site.json      ← site settings (socials, email, demo switch, submissions)
  data/glossary.json  ← Park Dictionary terms
  assets/media/       ← put real photos/posters here
  assets/demo/        ← generated placeholder art (delete when done)
  components/         ← UI pieces (cards, player, lightbox, filters…)
  layouts/Base.astro  ← page shell: header, footer, SEO tags
  pages/              ← one file per route
  styles/global.css   ← design tokens and base styles
scripts/              ← new-entry scaffolder, demo-art generator
.pages.yml            ← Pages CMS editor configuration
.github/workflows/    ← GitHub Pages deploy
```

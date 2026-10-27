# Rationale: creative and technical decisions

## The brief, as I read it

A new brand with a small Instagram presence needs a **home base**: somewhere clips don't disappear after 24 hours, where a newcomer can find the local scene, and where riders can eventually contribute. The owner is probably not a developer, has no budget for hosting, and must stay clean on two legal fronts: **media permission** and **no implied resort affiliation**.

So the priorities were: (1) look like it belongs in freestyle culture, (2) be very cheap to run (free) and easy to update, (3) build permission and honesty into the system, not just the copy.

## Creative direction: "night session in the park"

- **Terrain-park signage as the visual language.** In-bounds parks mark features with an **orange oval** and a size (S/M/L). That oval is the logo, the size badges on every clip, the event-ticket stubs and the numbered steps. Riders recognise it instantly. It's also generic wayfinding vocabulary, not any resort's trademark.
- **Palette:** near-black "night park" background, sodium-light orange (`#ff5a1f`), ice-blue highlights. It's dark because video and photos pop on dark, and night laps under the lights are a big part of East Coast park culture.
- **Type:** *Anton* (tall, condensed, loud: the edit-title or contest-banner feel), *Inter* for reading, and *Space Mono* for "timecode" labels (dates, durations, tags). All fonts are self-hosted, so there are no Google Fonts requests.
- **Details that give it voice:** a hazard-tape stripe, events styled as **lift tickets**, a 404 page that says "Bailed.", a scrolling marquee, light canvas snowfall in the hero (switched off for reduced-motion users and paused off-screen), and a **Park Dictionary word of the day** on the home page.
- **Copy voice:** stoked but inclusive ("park rats and jib kids"), safety-positive without preaching (the starter Park Etiquette article echoes the industry's *Park Smart* messaging).

## Information architecture

| Section | Why it exists |
| --- | --- |
| **Videos** | The core product. Filterable by discipline (ski/snowboard) and feature type. Filters live in the URL (`?d=ski&f=rail`), so a filtered view can be shared in a DM. |
| **Photos** | A masonry wall with a swipeable lightbox, and a shareable page per photo. |
| **Stories** | Session reports, interviews, how-tos. Long-form content is what search engines index and what builds a brand beyond Instagram. |
| **Crew** | Rider profiles that automatically collect every clip and photo the rider is tagged in, which gives riders a reason to share the site. |
| **Sessions** | Meetups and film nights, styled as lift tickets. Upcoming and past sessions are split automatically. Explicitly framed as informal rider meetups, not resort events. |
| **Park Dictionary** | A searchable glossary. It welcomes newer riders (good for community *and* search traffic) and doesn't depend on media you don't have yet, so the site has real value on day one. |
| **Share a clip** | Explains how sharing works *today* (tag us / DM), sets the ground rules (permission, minors, closed terrain) and previews the submission form with consent checkboxes. |
| **About & policies** | Independence statement, credit policy, demo-content explainer, takedown process, privacy. |

## Honesty by design (demo content, permission, affiliation)

- **Demo content can't pass as real.** Placeholder art is *generated* (`scripts/make-demo-art.mjs`): abstract faceless silhouettes, every image stamped "DEMO · PLACEHOLDER" with hazard tape. Demo riders are named "Demo Rider A–D". Demo videos have **no footage**: the player says "Demo placeholder — no real footage". Every demo item carries a striped DEMO badge, a banner sits on every page while demo content is visible, and RSS titles are prefixed `[DEMO]`. **One switch** (`showDemoContent: false`) hides all of it.
- **I used no real people's media.** I didn't embed any real YouTube/Instagram videos as samples, because that would imply permission I don't have.
- **Permission is enforced by the build.** Real (non-demo) media must have a `rights` value; crew profiles need `profileConsent: true`. Otherwise the build fails with a plain-English message. The Pages CMS form makes `rights` a required dropdown. It's a speed bump that turns "we should always ask" into "we can't forget to ask".
- **Not-affiliated messaging** appears in the footer of every page, on About and on Sessions. The brand never uses resort logos, trail maps or resort photography, and sessions note that you need your own ticket and must follow mountain rules.

## Technical choices

### Astro (static site generator)

- **Static HTML** means free hosting anywhere, nothing to patch or hack on a server, and very fast pages on mountain cell signal.
- **Content collections with schemas** turn Markdown front-matter into typed, validated data. That's what makes the demo/rights rules possible and gives the owner clear errors instead of a silently broken page.
- **Built-in image pipeline:** drop a 12 MB phone photo in `src/assets/media/` and visitors get resized, lazy-loaded responsive images.
- **Very little JavaScript:** a few small vanilla scripts (menu, filters, lightbox, click-to-play, snowfall, dictionary search), no framework runtime. Everything except the snow and the lightbox works with JS disabled.
- **Version:** Astro **7.4** (current). I first tried 6.x for its lower Node requirement, but `npm audit` flagged security advisories that are only fixed in 7.x, so I used 7.x with Node 24 LTS.
- *Alternatives considered:* Next.js (heavier, and pushes you towards server features and paid hosting), Hugo/Eleventy (great, but a weaker image pipeline and schema validation), WordPress/Squarespace (monthly cost or hosting upkeep), a hand-built HTML site (hard for the owner to maintain).

### Video: click-to-load facades, never self-hosted

Video is the heaviest thing on the internet and costs money to serve. Instead, clips live on YouTube/Vimeo/Instagram/TikTok, where creators already post, and the site **embeds** them. A link-parser (`src/lib/embed.ts`) accepts any normal share URL. The player shows a poster and loads the real iframe only on click. That makes pages faster, sets no third-party cookies before the viewer opts in (YouTube uses `youtube-nocookie.com`), and keeps the site's privacy statement truthful.

### Content editing: Git-based, with a free CMS on top

All content is plain Markdown in the repo, which gives version history, easy backups and no vendor lock-in. For a non-technical owner, **Pages CMS** (`.pages.yml`) adds a hosted, free editing UI with forms and image upload, committing straight to GitHub. I picked it over Decap CMS (needs an OAuth server or Netlify Identity, which is deprecated) and over hosted headless CMSs like Sanity or Contentful (another account, API keys, and free-tier limits).

### Hosting

| Host | Cost | Why / trade-offs |
| --- | --- | --- |
| **GitHub Pages** (default; workflow included) | Free for public repos | Same place as the code, zero extra accounts. Soft limits: 1 GB site, ~100 GB/month bandwidth. Private repos need a paid plan. No server functions. |
| **Cloudflare Pages** | Free | Unlimited bandwidth, preview deploys, fast global CDN. Best if a clip goes viral. One extra account. |
| **Netlify** | Free tier | Easy, has form handling, but free bandwidth/build minutes are capped; overages can mean upgrade prompts. |

What "free" gives up: no server code, so submissions need either a `mailto:` fallback (built in) or a free form service (Formspree's free tier is ~50 submissions/month). Photos live in git, which is fine into the hundreds; past that, see NEXT-STEPS. A custom domain costs about $10–15/year and is the only cost worth paying.

### Accessibility and performance

Semantic landmarks, a skip link, visible focus rings, `aria-pressed` filter chips, an Escape-to-close menu, a native `<dialog>` lightbox with keyboard and swipe support, **required alt text** on photos, reduced-motion support (marquee and snow stop), and colour contrast checked with axe-core. Fonts are self-hosted, images are responsive and lazy, and embeds load only on click.

### SEO and sharing

Per-page titles and descriptions, Open Graph/Twitter cards (each video, photo and story uses its own image as the share preview), a canonical URL, `sitemap-index.xml`, a dynamic `robots.txt`, and an RSS feed of all new drops.

## Known trade-offs

- **Upcoming vs past events** is decided at build time. A long gap without pushes leaves a past event in "Upcoming" until the next build. Fix: run the workflow manually, or add a scheduled nightly rebuild (one line in the workflow).
- **Instagram embeds** are heavier and less controllable than YouTube. They work, but YouTube or Vimeo is the better home for full edits; Instagram suits reels.
- **Node 22.23.4+** is required by Astro 7. The `.nvmrc` and CI use Node 24 LTS.

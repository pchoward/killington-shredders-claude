# What was tested, and what wasn't

## v2 (brand refresh), 2026-10-27

| Area | Result |
| --- | --- |
| Build | 39 pages, no errors or warnings; `npm audit` 0 vulnerabilities |
| Combined deploy (v2 at `/killington-shredders-claude/`, v1 at `…/v1/`) | Both built and served under their sub-paths: v2 80 URLs and v1 62 URLs crawled, 0 broken links, 0 JS errors, 0 axe-core violations |
| Season logic | Pinned bike season: summer hero, no snowfall, "Summer laps" second. Pinned snow season: no bike band. Auto (October, stick season): band after photos |
| Interactions (24 checks) | All v1 checks plus: MTB filter shows only bike edits and hides snow-only feature chips; Skate · BMX chip matches both; trail rating labels; homepage lead is always snow; discipline tabs; dictionary Bike category; crew "Off the snow" field. One v1 test needed updating, because v2 hides feature chips with no matches |
| Responsive | Desktop and 390px mobile screenshots reviewed; no horizontal overflow |

**Not verified for v2:** the GitHub Actions `/v1/` step has only been run locally (same commands, via a git worktree), not on GitHub. The Pages CMS field changes are untested in the live editor. The Facebook group link can't be tested until the URL is added.

## v1 (original build)

Tested on 2026-10-27 in a Linux container with Node 24.22.1, Astro 7.4.2 and headless Chromium (Playwright).

## Verified ✅

| Area | How | Result |
| --- | --- | --- |
| Production build | `npm run build` | 31 pages build with no errors or warnings |
| Dependencies | `npm audit` | 0 known vulnerabilities (Astro 6.x had open advisories, which is why 7.x is used) |
| Links | Crawled every internal link, image and stylesheet from `/` | 62 URLs, 0 broken |
| JavaScript errors | Console/page errors captured during the crawl | None |
| Accessibility | axe-core (WCAG 2 A/AA + best practice) on every crawled page | 0 violations after fixing two heading-order issues and one contrast issue it found |
| Responsive layout | Full-page screenshots at 1440×900 and 390×844 of every page type; checked for horizontal overflow | No overflow; layouts reviewed by eye |
| Interactions (15 checks) | Playwright scripts | Video filters (and URL state), no-results state, lightbox (open, arrow keys, demo label, Esc), dictionary search and no-match, mobile menu (open, Esc), disabled submission form, demo player notice: all pass |
| **Rights rule** | Added a non-demo video with no `rights` | Build fails with the plain-English message |
| **Consent rule** | Added a crew profile with no `profileConsent` | Build fails with the plain-English message |
| **Demo switch** | `showDemoContent: false` | Banner and all demo items gone; "coming soon" empty states render; only the two starter stories remain |
| GitHub Pages sub-path | Built with `BASE_PATH=/killington-shredders`, served under that path, re-crawled | 0 broken links; Markdown links rewritten; sitemap URL in `robots.txt` correct |
| Video link parsing | Temporary entry with a real YouTube URL | Privacy-enhanced `youtube-nocookie.com` embed URL and automatic thumbnail generated |
| Event timezones | Event with `start: 2027-01-14T17:30` built on a UTC machine | Displays 5:30 PM (Vermont time) |

## Not verified ⚠️

- **Live deployment.** I had no GitHub repository or hosting account, so the GitHub Actions workflow and Cloudflare/Netlify settings are written to their documented conventions but never ran.
- **Pages CMS.** `.pages.yml` follows Pages CMS's documented config format, but I couldn't sign in to test it. In particular, check the exact date/time format it writes for events, and the image-path rewriting (`media.output`). Editing Markdown on GitHub directly works regardless.
- **Third-party playback.** The container can't reliably load YouTube/Vimeo/Instagram/TikTok players, so I checked that the correct iframe URL is produced and inserted on click, but didn't watch real playback. Instagram and TikTok embed URLs follow their public embed formats, which those platforms change from time to time.
- **Real browsers/devices.** Only headless Chromium was used. Safari (iOS) and Firefox weren't tested; the features used (`<dialog>`, CSS `aspect-ratio`, `dvh`, `backdrop-filter`) are supported in current versions of both.
- **Form submission.** Submissions are off by default. The `mailto:` fallback and a Formspree endpoint weren't exercised end to end.
- **Lighthouse/Core Web Vitals** weren't measured. The site is static with small JS and lazy, responsive images, so scores should be strong, but that's an expectation, not a measurement.
- **Legal review.** The policies, consent wording and disclaimers are sensible starting points written by a non-lawyer. Have someone qualified review the submission terms before opening submissions.
- **Glossary accuracy.** Definitions reflect common usage, but local riders should proofread them. Slang varies.

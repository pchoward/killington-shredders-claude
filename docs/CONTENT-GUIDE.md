# Content guide

There are three ways to add content. Use whichever suits you:

1. **Pages CMS (easiest, no install).** Go to [app.pagescms.org](https://app.pagescms.org), sign in with GitHub and choose this repository. You get a form for each content type, image uploads included. Saving commits to GitHub, and the site rebuilds in about a minute.
2. **GitHub's web editor.** Open a file in `src/content/…`, click the pencil icon, edit and commit. To add a file, use "Add file → Create new file" and copy an existing entry as a template.
3. **Locally.** Run `npm run new -- video "Title"` to scaffold a file, edit it, preview with `npm run dev`, then commit and push.

## Snow first: disciplines and families

Every video, photo and crew profile has `disciplines`: `ski`, `snowboard`, `mtb`, `skate`, `bmx`. The site groups them into **families**: Snow (ski, snowboard), Bike (MTB) and Skate · BMX. Families drive colours (orange, moss, concrete), filters and where things appear on the homepage. Aim for roughly 75% snow, 20% bike and 5% skate/BMX overall. It's a feel, not a rule.

- **Snow clips** use `size` (S, M, L, XL), like park signage.
- **Bike clips** use `trailRating`: `green`, `blue`, `black`, `double-black` or `pro`.
- **Skate & BMX clips** just use feature tags (`bowl`, `street`, `mini-ramp`, `ledge`, `dirt-jumps`).

### Seasons

The homepage follows the Killington calendar: snow season (Dec–Apr), mud season (May), bike season (Jun–Sep) and stick season (Oct–Nov). In bike season the "Summer laps" band moves up and the hero switches to summer art. To override the date-based season, set `"season"` in `src/data/site.json` to `snow`, `mud`, `bike` or `stick`, and back to `auto` when you're done.

## The two safety fields

Every video, photo and story has these:

| Field | Meaning |
| --- | --- |
| `demo: true` | Placeholder content. Gets a striped **DEMO** badge everywhere and can be hidden site-wide. **Never set this on real content.** |
| `rights:` | **Required for anything real.** How you know you can publish it: `own-work`, `creator-permission`, `creator-submitted` or `licensed`. Use `rightsNote` to record where and when permission was given ("OK'd by @handle via DM, Dec 1"). |

Crew profiles use `profileConsent: true` instead: only set it once the rider has said yes.

If either field is missing, **the site will not build**. That's deliberate: nothing goes live without a recorded permission.

## Videos

```yaml
---
title: "Opening Day Laps"
date: 2026-11-20
videoUrl: "https://www.youtube.com/watch?v=XXXXXXXXXXX"
summary: "First laps of the season on the rail line."
disciplines: [snowboard]          # ski, snowboard, mtb, skate, bmx
features: [rail, box]             # snow: jump, rail, box, jib, pipe, natural
                                  # bike: jump-line, drop, berms, tech, pump-track, wallride
                                  # skate/bmx: bowl, street, mini-ramp, ledge, dirt-jumps
size: S                           # snow only: S, M, L, XL — like park signage
# trailRating: blue               # MTB only: green, blue, black, double-black, pro
riders: [jane-doe]                # crew profile file names (optional)
credits:                          # riders without profiles (optional)
  - name: Sam
    handle: samrides
filmer: { name: Alex, handle: alexfilms }
duration: "2:14"
featured: true                    # puts it first on the home page
rights: creator-permission
rightsNote: "Jane OK'd via Instagram DM, 2026-11-21"
---

Optional write-up: the story behind the clip, music credit, shout-outs.
```

- **Supported links:** YouTube (including Shorts), Vimeo, Instagram posts/reels, TikTok, or a direct `.mp4` URL. Reels, Shorts and TikToks get a vertical player.
- **Poster:** optional for YouTube (the thumbnail is used automatically). For other platforms, add `poster: ../../assets/media/your-image.jpg` and `posterAlt: "…"`.
- Nothing from the video platform loads until the viewer presses play. That keeps pages fast and avoids third-party cookies on page load.

## Photos

1. Put the image in `src/assets/media/` (JPG/PNG/WebP; any size, since the site makes smaller copies automatically).
2. Create `src/content/photos/2026-11-20-method-over-the-hip.md`:

```yaml
---
title: "Method Over the Hip"
date: 2026-11-20
image: ../../assets/media/method-hip.jpg
alt: "Snowboarder in a red jacket grabbing a method over a snow hip, trees behind"
caption: "Late-afternoon light, perfect timing."
photographer: { name: Alex, handle: alexfilms }
riders: [jane-doe]
disciplines: [snowboard]
rights: creator-permission
rightsNote: "Alex sent via email 2026-11-20"
---
```

`alt` is required. Describe what's in the photo for people using screen readers.

## Stories

`src/content/stories/my-story.md` takes a `title`, `date`, `excerpt` (max 280 characters), an optional `cover` + `coverAlt`, an `author`, a `kind` (feature, interview, how-to, session-report or news), `tags` and `rights`, followed by the story in Markdown. Links like `[our videos](/videos/)` work on any host.

## Crew (rider profiles)

`src/content/crew/jane-doe.md`. Add `alsoRides: "Summer: bike park laps"` for riders who ride year-round. The file name (`jane-doe`) is how videos and photos refer to the rider in `riders: [...]`. A rider's page automatically lists every video and photo they're tagged in.

## Sessions (events)

`src/content/events/2026-12-10-film-night.md`:

```yaml
---
title: "Season Kickoff Film Night"
start: 2026-12-10T19:00      # Vermont time; leave off the seconds
end: 2026-12-10T21:00
kind: film-night             # session, meetup, film-night, contest, clean-up, group-ride, dig-day, skate-session, other
location: "Venue name, Killington Rd"
link: https://…              # optional, organiser's page
organiser: Killington Shredders
---
Short description.
```

Past events move into "Past sessions" automatically. The site rebuilds on each push; if you go a while without pushing, run the workflow manually from the GitHub **Actions** tab to refresh the upcoming/past split.

## Drafts

Add `draft: true` to keep something off the live site. Drafts still show in `npm run dev` so you can preview them.

## Going live with real content

1. In `src/data/site.json`, set `showDemoContent` to `false`. Every demo item and the orange preview banner disappear.
2. Optionally delete the demo files: `grep -rl "demo: true" src/content | xargs rm`, then `rm -r src/assets/demo`. If you delete the demo art, give the two starter stories new covers first.
3. Empty sections show friendly "coming soon" messages, so the site never looks broken while it fills up.

## Park Dictionary

Terms live in `src/data/glossary.json`. Add an object with `term`, `category` (Snow features, Snow tricks, Culture, Safety, Bike or Skate & BMX; new categories appear automatically) and `definition`. Keep snow terms the clear majority.

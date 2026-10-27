# v2: Brand refresh

What changed between the original build (branch `v1-original`, live at `/v1/`) and v2, and why.

## The brief

Killington Shredders is a **freestyle ski and snowboard crew from Killington, Vermont** first. Mountain biking is a meaningful secondary part of the community, mostly in summer. Skate and BMX are crossover interests. The site is the public companion to the **Killington Shredders Facebook group**.

Target emphasis: about **75 / 20 / 5** (snow / MTB / skate & BMX) in visual weight and editorial voice. That's a creative guideline, not a quota.

## The idea: seasons, not sports

Giving each sport its own section is how a crew site turns into a generic action-sports portal. v2 organises around the Killington calendar instead:

| Season | Months | Homepage |
| --- | --- | --- |
| Snow season | Dec–Apr | Snow edits only; no bike band |
| Mud season | May | Snow edits lead; "Summer laps" band after the photos; stay-off-wet-trails messaging |
| Bike season | Jun–Sep | Summer hero art; "Summer laps" moves up to second place with four edits; snow edits still lead |
| Stick season | Oct–Nov | Snow edits lead; last summer's bike edits after the photos |

The season comes from the build date, or can be pinned in `src/data/site.json` (`"season": "auto" | "snow" | "mud" | "bike" | "stick"`). Outside bike season, the Videos and Photos pages list snow content first.

## Branding

- **Kept:** KS orange oval, wordmark, dark night-park palette, Anton / Inter / Space Mono, navigation (no sport sections), all architecture and safety rules.
- **New colour, moss green** (`--moss`), used only for bike content: chips, the "Summer laps" band, hover states. **Concrete grey** (`--concrete`) marks skate & BMX. Orange stays the brand colour.
- **Tagline:** "Snow first. Dirt when it melts."
- **Bluebird hero** echoes the Facebook group's cover: generated Green Mountain ridgelines (`src/assets/brand/hero-snow.jpg`, `hero-summer.jpg`), bright sky fading into the dark site. The cover image itself isn't reused: it's a resort trail map, which would work against the not-affiliated message, and its rights are unclear.
- **Trail-sign system extended:** snow keeps the S/M/L/XL park oval; MTB uses trail ratings (green circle, blue square, black diamond, double black, plus an orange "pro line" oval); skate & BMX use spot tags only.

## Facebook group integration

- Set `social.facebookGroup` in `site.json` and "Join the group" becomes the main button in the header, hero, sessions page and footer. Until then, the site falls back to "Watch the edits" / "Share a clip".
- Sessions and the Share page point to the group for details and day-to-day posting.
- Policy: posting in the group isn't permission to republish. The site still asks first, and the build still refuses media without a recorded `rights` value. Suggested group rule: *"We may ask to feature your clip on the website. We'll always credit you and never post without a yes."*
- Group posts aren't embedded, to protect members' privacy.

## Content model

| Field | Change |
| --- | --- |
| `disciplines` | + `mtb`, `skate`, `bmx` |
| family (derived) | snow / bike / cross, from the disciplines (`src/lib/taxonomy.ts`). Snow wins ties. |
| `features` | + bike: `jump-line`, `drop`, `berms`, `tech`, `pump-track`, `wallride`; + skate/BMX: `bowl`, `mini-ramp`, `ledge`, `dirt-jumps` (`street` shared) |
| `trailRating` | new, MTB only: `green`, `blue`, `black`, `double-black`, `pro` |
| crew `alsoRides` | new, e.g. "Summer: bike park laps" |
| events `kind` | + `group-ride`, `dig-day`, `skate-session` |
| Dictionary | + 9 bike terms, 3 skate/BMX terms; snow categories renamed "Snow features" / "Snow tricks" |

Existing entries need no changes.

## Homepage changes

1. Bluebird hero with a snow-first eyebrow, a lede that names bikes and every ability level, and a season chip.
2. Discipline tabs (All, Ski, Snowboard, MTB, Skate · BMX) linking to filtered video lists.
3. Latest edits: the lead is always a snow clip; outside snow season one side slot previews the latest bike edit.
4. "Summer laps" band (moss tint), positioned by season.
5. "Off the snow" strip for skate & BMX: one slim row, hidden when empty.
6. Ticker words, word of the day and the CTA band follow the same split and point to the group.

## Demo content

New generated art in the same faceless style: jump line, berm, drop, a portrait tabletop, and a skate bowl. The demo set is about 75 / 20 / 5. A new demo rider (E) rides snowboard and MTB. There are new demo events (dig day, summer group ride) and a new starter how-to, *Your First Bike Park Day*. The welcome post has been rewritten for the group-first, year-round voice.

## Comparing versions

- `v1-original` is the frozen original. The deploy workflow builds it into `/v1/`, so `…/killington-shredders-claude/` (v2) and `…/killington-shredders-claude/v1/` (v1) are live side by side. Delete that workflow step when you're done comparing.
- v2 lives on `v2-brand-refresh` until you merge it into `main`.

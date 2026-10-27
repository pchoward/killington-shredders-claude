// Scaffold a new content file with the right fields.
//   npm run new -- video "Opening Day Laps"
//   npm run new -- photo "Method Over the Hip"
//   npm run new -- story "Interview: The Rail Garden Crew"
//   npm run new -- rider "Jane Doe"
//   npm run new -- event "Thursday Night Laps"
import { existsSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const [type, ...words] = process.argv.slice(2);
const title = words.join(' ').trim();
const today = new Date().toISOString().slice(0, 10);
const slug = title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

const templates = {
  video: {
    dir: 'videos',
    file: `${today}-${slug}.md`,
    body: `---
title: "${title}"
date: ${today}
videoUrl: "" # paste a YouTube / Vimeo / Instagram / TikTok link
summary: ""
# poster: ../../assets/media/your-image.jpg   # optional for YouTube (thumbnail is automatic)
# posterAlt: ""
disciplines: [snowboard] # ski, snowboard, mtb, skate, bmx
features: [rail] # snow: jump, rail, box, jib, pipe, natural | bike: jump-line, drop, berms, tech, pump-track, wallride | skate/bmx: bowl, street, mini-ramp, ledge, dirt-jumps
# size: M # snow park size: S, M, L, XL
# trailRating: blue # MTB only: green, blue, black, double-black, pro
riders: [] # crew profile file names, e.g. [jane-doe]
credits: [] # riders without a profile, e.g. [{ name: "Sam", handle: "samrides" }]
# filmer:
#   name: ""
#   handle: ""
featured: false
rights: # REQUIRED: own-work | creator-permission | creator-submitted | licensed
rightsNote: "" # e.g. "OK'd by @handle via DM, 2026-12-01"
---

The story behind the clip.
`,
  },
  photo: {
    dir: 'photos',
    file: `${today}-${slug}.md`,
    body: `---
title: "${title}"
date: ${today}
image: ../../assets/media/CHANGE-ME.jpg # put the file in src/assets/media/
alt: "" # REQUIRED: describe what's in the photo
caption: ""
photographer:
  name: ""
  handle: ""
riders: []
disciplines: [snowboard] # ski, snowboard, mtb, skate, bmx
rights: # REQUIRED: own-work | creator-permission | creator-submitted | licensed
rightsNote: ""
---
`,
  },
  story: {
    dir: 'stories',
    file: `${slug}.md`,
    body: `---
title: "${title}"
date: ${today}
excerpt: "" # one or two sentences, max 280 characters
# cover: ../../assets/media/CHANGE-ME.jpg
# coverAlt: ""
author: Killington Shredders
kind: feature # feature | interview | how-to | session-report | news
tags: []
rights: own-work
---

Write here. Markdown works: **bold**, [links](/videos/), lists, > quotes.
`,
  },
  rider: {
    dir: 'crew',
    file: `${slug}.md`,
    body: `---
name: "${title}"
handle: "" # Instagram, without @
disciplines: [snowboard] # ski, snowboard, mtb, skate, bmx
stance: regular # regular | goofy | n/a
alsoRides: "" # e.g. "Summer: bike park laps"
favoriteFeature: ""
hometown: ""
# portrait: ../../assets/media/CHANGE-ME.jpg
# portraitAlt: ""
profileConsent: false # set true ONLY once the rider has said yes
---

A short bio, ideally in the rider's own words.
`,
  },
  event: {
    dir: 'events',
    file: `${today}-${slug}.md`,
    body: `---
title: "${title}"
start: ${today}T17:30 # Vermont time
# end: ${today}T19:30
kind: session # session | meetup | film-night | contest | clean-up | group-ride | dig-day | skate-session | other
location: ""
# link: https://...
organiser: Killington Shredders
---

What to expect, who it's for, what to bring.
`,
  },
};

const t = templates[type];
if (!t || !title) {
  console.log('Usage: npm run new -- <video|photo|story|rider|event> "Title"');
  process.exit(1);
}
const path = join(root, 'src', 'content', t.dir, t.file);
if (existsSync(path)) {
  console.error(`Already exists: ${relative(root, path)}`);
  process.exit(1);
}
writeFileSync(path, t.body);
console.log(`Created ${relative(root, path)} — fill in the fields, then run "npm run dev" to preview.`);

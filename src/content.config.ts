import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/*
 * Content model
 * -------------
 * Every piece of media carries two safety fields:
 *
 *   demo:   true for placeholder content that ships with the starter site.
 *           Demo items are badged everywhere and can be hidden in one switch
 *           (src/data/site.json → showDemoContent).
 *
 *   rights: how you know you're allowed to publish it. Required for anything
 *           that isn't demo — the build fails with a readable message if it's
 *           missing, so nothing goes live without a recorded permission.
 */

const disciplines = z.enum(['ski', 'snowboard']);
const featureTypes = z.enum(['jump', 'rail', 'box', 'jib', 'pipe', 'street', 'natural', 'other']);
const parkSize = z.enum(['S', 'M', 'L', 'XL']);

const rights = z.enum([
  'own-work', // shot/filmed by Killington Shredders
  'creator-permission', // creator gave written permission (DM/email) — note where
  'creator-submitted', // creator sent it in and accepted the submission terms
  'licensed', // e.g. Creative Commons, with attribution in rightsNote
]);

const credit = z.object({
  name: z.string(),
  handle: z.string().optional(), // Instagram handle without @
  url: z.url().optional(),
});

const mediaSafety = {
  demo: z.boolean().default(false),
  rights: rights.optional(),
  rightsNote: z.string().optional(),
};

function requireRights<T extends { demo: boolean; rights?: string }>(entry: T, ctx: z.RefinementCtx) {
  if (!entry.demo && !entry.rights) {
    ctx.addIssue({
      code: 'custom',
      path: ['rights'],
      message:
        'Real (non-demo) content needs a "rights" value: own-work, creator-permission, creator-submitted or licensed. Record how you got permission before publishing.',
    });
  }
}

const videos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/videos' }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        date: z.coerce.date(),
        summary: z.string().max(240).optional(),
        // Paste a YouTube, Vimeo, Instagram or TikTok link, or a path to an .mp4.
        // Leave empty for demo placeholders.
        videoUrl: z.string().optional(),
        poster: image().optional(),
        posterAlt: z.string().optional(),
        disciplines: z.array(disciplines).default([]),
        features: z.array(featureTypes).default([]),
        size: parkSize.optional(),
        riders: z.array(reference('crew')).default([]),
        credits: z.array(credit).default([]), // riders/filmers who aren't crew profiles
        filmer: credit.optional(),
        duration: z.string().optional(), // "2:14"
        featured: z.boolean().default(false),
        draft: z.boolean().default(false),
        ...mediaSafety,
      })
      .superRefine(requireRights),
});

const photos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/photos' }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        date: z.coerce.date(),
        image: image(),
        alt: z.string().min(8, 'Describe the photo for screen-reader users (alt text).'),
        caption: z.string().optional(),
        photographer: credit.optional(),
        riders: z.array(reference('crew')).default([]),
        credits: z.array(credit).default([]),
        disciplines: z.array(disciplines).default([]),
        features: z.array(featureTypes).default([]),
        featured: z.boolean().default(false),
        draft: z.boolean().default(false),
        ...mediaSafety,
      })
      .superRefine(requireRights),
});

const stories = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/stories' }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        date: z.coerce.date(),
        excerpt: z.string().max(280),
        cover: image().optional(),
        coverAlt: z.string().optional(),
        author: z.string().default('Killington Shredders'),
        kind: z.enum(['feature', 'interview', 'how-to', 'session-report', 'news']).default('feature'),
        tags: z.array(z.string()).default([]),
        featured: z.boolean().default(false),
        draft: z.boolean().default(false),
        ...mediaSafety,
      })
      .superRefine(requireRights),
});

const crew = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/crew' }),
  schema: ({ image }) =>
    z
      .object({
        name: z.string(),
        handle: z.string().optional(),
        disciplines: z.array(disciplines).default([]),
        stance: z.enum(['regular', 'goofy', 'n/a']).optional(),
        favoriteFeature: z.string().optional(),
        hometown: z.string().optional(),
        portrait: image().optional(),
        portraitAlt: z.string().optional(),
        // Rider profiles need the rider's OK. Non-demo profiles must say so.
        profileConsent: z.boolean().default(false),
        order: z.number().default(100),
        demo: z.boolean().default(false),
      })
      .superRefine((entry, ctx) => {
        if (!entry.demo && !entry.profileConsent) {
          ctx.addIssue({
            code: 'custom',
            path: ['profileConsent'],
            message: 'Set profileConsent: true only once the rider has agreed to have a profile on the site.',
          });
        }
      }),
});

/**
 * Event times without an explicit offset ("2027-01-14T17:30") are read as
 * Vermont local time rather than the build server's timezone (UTC on CI).
 */
function vermontTime(value: unknown) {
  if (typeof value !== 'string' || !/T\d{2}:\d{2}(:\d{2})?$/.test(value.trim())) return value;
  const asUtc = new Date(`${value.trim()}Z`);
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
      .formatToParts(asUtc)
      .map((p) => [p.type, p.value]),
  );
  const shown = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
  return new Date(asUtc.valueOf() + (asUtc.valueOf() - shown));
}
const localDate = z.preprocess(vermontTime, z.coerce.date());

const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: z.object({
    title: z.string(),
    start: localDate,
    end: localDate.optional(),
    allDay: z.boolean().default(false),
    kind: z.enum(['session', 'meetup', 'film-night', 'contest', 'clean-up', 'other']).default('session'),
    location: z.string(),
    // Where details/tickets live (organiser's page). Never link to a page
    // implying the event is run by the resort unless it actually is.
    link: z.url().optional(),
    organiser: z.string().default('Killington Shredders'),
    demo: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

export const collections = { videos, photos, stories, crew, events };

/*
 * How the crew's riding is grouped.
 *
 *   snow  — ski & snowboard. The identity: homepage default, most imagery.
 *   bike  — mountain biking. The summer chapter.
 *   cross — skate & BMX. Crossover, shown in a slim "Off the snow" strip.
 *
 * The intended emphasis is roughly 75 / 20 / 5. That's a creative guideline
 * for the design and the demo content, not a publishing quota.
 */
import site from '../data/site.json';

export type Family = 'snow' | 'bike' | 'cross';

export const familyOf: Record<string, Family> = {
  ski: 'snow',
  snowboard: 'snow',
  mtb: 'bike',
  skate: 'cross',
  bmx: 'cross',
};

export const familyLabels: Record<Family, string> = {
  snow: 'Snow',
  bike: 'MTB',
  cross: 'Skate · BMX',
};

/** Main family of an item: snow wins ties, so a ski + MTB clip stays a snow clip. */
export function primaryFamily(disciplines: string[]): Family {
  const fams = disciplines.map((d) => familyOf[d]);
  if (fams.includes('snow') || fams.length === 0) return 'snow';
  if (fams.includes('bike')) return 'bike';
  return 'cross';
}

/** Filter tokens for an item: its disciplines plus "cross" for skate/BMX, so both match one chip. */
export function filterTokens(disciplines: string[]) {
  const tokens = new Set(disciplines);
  if (disciplines.some((d) => familyOf[d] === 'cross')) tokens.add('cross');
  return [...tokens].join(' ');
}

/** Chip order everywhere: weight first. */
export const disciplineOrder = ['ski', 'snowboard', 'mtb', 'cross'];

export const featureOrder = [
  'jump', 'rail', 'box', 'jib', 'pipe', 'natural',
  'jump-line', 'drop', 'berms', 'tech', 'pump-track', 'wallride',
  'bowl', 'street', 'mini-ramp', 'ledge', 'dirt-jumps',
  'other',
];

export const trailRatings: Record<string, { label: string; short: string; title: string }> = {
  green: { label: 'Easy', short: 'Easy', title: 'Easiest — green circle' },
  blue: { label: 'Intermediate', short: 'Int.', title: 'More difficult — blue square' },
  black: { label: 'Advanced', short: 'Adv.', title: 'Very difficult — black diamond' },
  'double-black': { label: 'Expert', short: 'Expert', title: 'Extremely difficult — double black diamond' },
  pro: { label: 'Pro line', short: 'Pro line', title: 'Pro line — experts only' },
};

/* ---------------- Seasons ---------------- */

export type Season = 'snow' | 'mud' | 'bike' | 'stick';

export const seasons: Record<Season, { name: string; chip: string; line: string }> = {
  snow: {
    name: 'Snow season',
    chip: 'Snow season',
    line: 'Laps all day. Fresh edits below.',
  },
  mud: {
    name: 'Mud season',
    chip: 'Mud season',
    line: 'Spring slush is done and the trails are soft. Stay off wet trails, the bikes are coming.',
  },
  bike: {
    name: 'Bike season',
    chip: 'Bike season',
    line: 'The lifts spin for bikes now. Summer laps below, last winter’s best edits up top.',
  },
  stick: {
    name: 'Stick season',
    chip: 'Stick season',
    line: 'Bare trees, cold mornings. Waxing up and watching last season’s best edits.',
  },
};

/** Killington calendar: Dec–Apr snow, May mud, Jun–Sep bikes, Oct–Nov stick season. */
export function seasonFor(date: Date): Season {
  const m = date.getUTCMonth() + 1;
  if (m === 12 || m <= 4) return 'snow';
  if (m === 5) return 'mud';
  if (m <= 9) return 'bike';
  return 'stick';
}

/** The site's current season: the owner can pin one in site.json ("season"), otherwise it follows the date of the build. */
export function currentSeason(now = new Date()): Season {
  const pinned = (site as { season?: string }).season;
  if (pinned && pinned !== 'auto' && pinned in seasons) return pinned as Season;
  return seasonFor(now);
}

/** Discipline filter chips for a set of items, in weight order, with skate & BMX sharing one chip. */
export function disciplineChoices(lists: string[][]) {
  const present = new Set(lists.flat().map((d) => (familyOf[d] === 'cross' ? 'cross' : d)));
  return disciplineOrder.filter((d) => present.has(d));
}

/** Feature filter chips present in a set of items, grouped snow → bike → skate. */
export function featureChoices(lists: string[][]) {
  const present = new Set(lists.flat());
  return featureOrder.filter((f) => present.has(f));
}

/**
 * Listing order for the Videos and Photos pages: newest first, except outside
 * bike season, when snow content comes first, so October doesn't open on
 * last summer's bike clips.
 */
export function seasonalOrder<T extends { data: { disciplines: string[] } }>(items: T[], season = currentSeason()) {
  if (season === 'bike') return items;
  const rank = (i: T) => (primaryFamily(i.data.disciplines) === 'snow' ? 0 : 1);
  return [...items].sort((a, b) => rank(a) - rank(b)); // stable: keeps date order within each group
}

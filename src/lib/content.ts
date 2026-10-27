import { getCollection, getEntries, type CollectionEntry, type CollectionKey } from 'astro:content';
import site from '../data/site.json';

type Entry<C extends CollectionKey> = CollectionEntry<C>;

/** Is this entry visible on the public site? */
function isVisible(data: { demo?: boolean; draft?: boolean }) {
  if (data.draft && import.meta.env.PROD) return false;
  if (data.demo && !site.showDemoContent) return false;
  return true;
}

export async function getPublished<C extends CollectionKey>(name: C): Promise<Entry<C>[]> {
  const all = (await getCollection(name)) as Entry<C>[];
  return all.filter((e) => isVisible(e.data as { demo?: boolean; draft?: boolean }));
}

const byDateDesc = (a: { data: { date: Date } }, b: { data: { date: Date } }) =>
  b.data.date.valueOf() - a.data.date.valueOf();

export async function getVideos() {
  return (await getPublished('videos')).sort(byDateDesc);
}
export async function getPhotos() {
  return (await getPublished('photos')).sort(byDateDesc);
}
export async function getStories() {
  return (await getPublished('stories')).sort(byDateDesc);
}
export async function getCrew() {
  return (await getPublished('crew')).sort(
    (a, b) => a.data.order - b.data.order || a.data.name.localeCompare(b.data.name),
  );
}
export async function getEvents() {
  return (await getPublished('events')).sort((a, b) => a.data.start.valueOf() - b.data.start.valueOf());
}

/** Featured item first, then everything else by date. */
export function featuredFirst<T extends { data: { featured: boolean; date: Date } }>(items: T[]) {
  return [...items].sort((a, b) => Number(b.data.featured) - Number(a.data.featured) || byDateDesc(a, b));
}

export type FeedItem =
  | { type: 'video'; entry: Entry<'videos'>; date: Date }
  | { type: 'photo'; entry: Entry<'photos'>; date: Date }
  | { type: 'story'; entry: Entry<'stories'>; date: Date };

/** Mixed "latest drops" feed across media types. */
export async function getFeed(limit = 12): Promise<FeedItem[]> {
  const [v, p, s] = await Promise.all([getVideos(), getPhotos(), getStories()]);
  const items: FeedItem[] = [
    ...v.map((entry) => ({ type: 'video' as const, entry, date: entry.data.date })),
    ...p.map((entry) => ({ type: 'photo' as const, entry, date: entry.data.date })),
    ...s.map((entry) => ({ type: 'story' as const, entry, date: entry.data.date })),
  ];
  return items.sort((a, b) => b.date.valueOf() - a.date.valueOf()).slice(0, limit);
}

export async function hasDemoContent() {
  if (!site.showDemoContent) return false;
  const lists = await Promise.all(
    (['videos', 'photos', 'stories', 'crew', 'events'] as const).map((c) => getCollection(c)),
  );
  return lists.some((l) => l.some((e) => (e.data as { demo?: boolean }).demo));
}

type CrewRef = { collection: 'crew'; id: string };
type Credit = { name: string; handle?: string; url?: string };

/** Turn crew references + free-text credits into one list of display names/links. */
export async function resolvePeople(refs: CrewRef[] = [], credits: Credit[] = []) {
  const crew = refs.length ? await getEntries(refs) : [];
  return [
    ...crew
      .filter((c) => c && (site.showDemoContent || !c.data.demo))
      .map((c) => ({ name: c.data.name, link: `/crew/${c.id}/`, external: false, demo: c.data.demo })),
    ...credits.map((c) => ({
      name: c.name,
      link: c.url ?? (c.handle ? `https://www.instagram.com/${c.handle.replace(/^@/, '')}/` : undefined),
      external: true,
      demo: false,
    })),
  ];
}

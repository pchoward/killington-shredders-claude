import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import site from '../data/site.json';
import { getFeed } from '../lib/content';

export async function GET(context: APIContext) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const feed = await getFeed(50);
  return rss({
    title: site.name,
    description: site.description,
    site: context.site!,
    items: feed.map((item) => {
      const d = item.entry.data;
      const path = { video: 'videos', photo: 'photos', story: 'stories' }[item.type];
      const demo = d.demo ? '[DEMO] ' : '';
      const description =
        item.type === 'story'
          ? item.entry.data.excerpt
          : item.type === 'video'
            ? (item.entry.data.summary ?? '')
            : (item.entry.data.caption ?? item.entry.data.alt);
      return {
        title: `${demo}${d.title}`,
        pubDate: item.date,
        description,
        link: `${base}/${path}/${item.entry.id}/`,
        categories: [item.type],
      };
    }),
  });
}

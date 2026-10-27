/**
 * Turns a pasted video link into something we can embed.
 * Supported: YouTube (incl. Shorts), Vimeo, Instagram posts/reels, TikTok, and direct .mp4/.webm files.
 */
export type Embed =
  | { provider: 'youtube'; id: string; src: string; thumb: string; watch: string }
  | { provider: 'vimeo'; id: string; src: string; watch: string }
  | { provider: 'instagram'; id: string; src: string; watch: string }
  | { provider: 'tiktok'; id: string; src: string; watch: string }
  | { provider: 'file'; src: string; watch: string };

export function parseVideoUrl(raw?: string): Embed | undefined {
  if (!raw) return undefined;
  const url = raw.trim();

  if (/\.(mp4|webm|mov)(\?|$)/i.test(url)) return { provider: 'file', src: url, watch: url };

  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return undefined;
  }
  const host = u.hostname.replace(/^www\.|^m\./, '');

  if (host === 'youtu.be' || host.endsWith('youtube.com') || host === 'youtube-nocookie.com') {
    const id =
      host === 'youtu.be'
        ? u.pathname.slice(1)
        : u.searchParams.get('v') ?? u.pathname.match(/\/(?:shorts|embed|live)\/([\w-]{6,})/)?.[1];
    if (!id) return undefined;
    return {
      provider: 'youtube',
      id,
      src: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`,
      thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      watch: `https://www.youtube.com/watch?v=${id}`,
    };
  }

  if (host.endsWith('vimeo.com')) {
    const id = u.pathname.match(/(\d{5,})/)?.[1];
    if (!id) return undefined;
    return { provider: 'vimeo', id, src: `https://player.vimeo.com/video/${id}?autoplay=1&dnt=1`, watch: `https://vimeo.com/${id}` };
  }

  if (host.endsWith('instagram.com')) {
    const m = u.pathname.match(/\/(p|reel|reels|tv)\/([\w-]+)/);
    if (!m) return undefined;
    const kind = m[1] === 'reels' ? 'reel' : m[1];
    return {
      provider: 'instagram',
      id: m[2],
      src: `https://www.instagram.com/${kind}/${m[2]}/embed/`,
      watch: `https://www.instagram.com/${kind}/${m[2]}/`,
    };
  }

  if (host.endsWith('tiktok.com')) {
    const id = u.pathname.match(/\/video\/(\d+)/)?.[1];
    if (!id) return undefined;
    return { provider: 'tiktok', id, src: `https://www.tiktok.com/embed/v2/${id}`, watch: url };
  }

  return undefined;
}

/** Vertical formats (reels, shorts, TikTok) get a 9:16 player. */
export function isVertical(raw?: string) {
  if (!raw) return false;
  return /instagram\.com\/(reel|reels)\/|youtube\.com\/shorts\/|tiktok\.com\//i.test(raw);
}

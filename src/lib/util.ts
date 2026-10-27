/** Prefix an internal path with the configured base (needed for GitHub Pages project sites). */
export function href(path: string) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  if (/^(https?:|mailto:|#)/.test(path)) return path;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

const dateFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
export const formatDate = (d: Date) => dateFmt.format(d);

const stampFmt = new Intl.DateTimeFormat('en-US', { month: '2-digit', day: '2-digit', year: '2-digit', timeZone: 'UTC' });
/** Compact date like 01.18.26 for "timecode" labels. */
export const stamp = (d: Date) => stampFmt.format(d).replaceAll('/', '.');

export const labels: Record<string, string> = {
  ski: 'Ski',
  snowboard: 'Snowboard',
  jump: 'Jumps',
  rail: 'Rails',
  box: 'Boxes',
  jib: 'Jibs',
  pipe: 'Pipe',
  street: 'Street',
  natural: 'Natural',
  other: 'Other',
};

export function instagramUrl(handle?: string) {
  return handle ? `https://www.instagram.com/${handle.replace(/^@/, '')}/` : undefined;
}

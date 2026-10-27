// Generates the stylised placeholder artwork used by DEMO content.
// Every image is stamped "DEMO · PLACEHOLDER" so it can never be mistaken for
// a real rider's photo. Run with:  npm run demo-art
//
// Output: JPEGs in src/assets/demo/, so demo items go through exactly the same
// image pipeline (resizing, srcsets, social previews) as real photos. Delete that folder (and the demo
// entries) once real content has replaced it.
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import sharp from 'sharp'; // ships with Astro

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'assets', 'demo');
mkdirSync(outDir, { recursive: true });

// Small deterministic PRNG so the art is stable between runs.
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const palettes = {
  bluebird: { sky: ['#1b6fd1', '#7cc4ff'], far: '#c9e4ff', near: '#eef6ff', snow: '#ffffff', ink: '#0b1320', glow: null },
  dawn: { sky: ['#2a1b4d', '#ff7a45'], far: '#6b4a8a', near: '#f3d9e6', snow: '#fff4ef', ink: '#1a0f24', glow: '#ffb36b' },
  night: { sky: ['#03060d', '#14284a'], far: '#0f1d33', near: '#d6e6ff', snow: '#eaf2ff', ink: '#02040a', glow: '#ffe7a3' },
  storm: { sky: ['#4b5866', '#a9b7c4'], far: '#7d8b98', near: '#e7edf2', snow: '#ffffff', ink: '#151b22', glow: null },
  dusk: { sky: ['#0d1b3d', '#ff5a1f'], far: '#28305a', near: '#ffd9c7', snow: '#fff1ea', ink: '#0a0d1c', glow: '#ff9a5a' },
  // Summer / off-snow palettes: "snow" is the colour of the feature (dirt, concrete).
  summer: { sky: ['#2f80d8', '#a5d4f6'], far: '#5e8f5a', near: '#4f7d3f', snow: '#8a6240', ink: '#0e1a10', glow: null, flakes: 0 },
  golden: { sky: ['#2a3d6b', '#f3b562'], far: '#4d6b4a', near: '#3f6a35', snow: '#9a6a42', ink: '#0f160c', glow: '#ffd08a', flakes: 0 },
  concrete: { sky: ['#7f99b0', '#d8e2ea'], far: '#6f808e', near: '#9aa3ab', snow: '#c4cbd2', ink: '#14181d', glow: null, flakes: 0 },
};

const W = 1600;
const RIDER_SCALE = 1.7;
// Distance from a rider's origin to the underside of the board/skis.
const FEET = 58 * RIDER_SCALE;

const BIKE_FEET = 66 * RIDER_SCALE;

// A deliberately abstract rider: no faces, no identifiable people.
function rider({ x, y, rot = 0, scale = RIDER_SCALE, kind = 'board', ink }) {
  if (kind === 'bike') {
    return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${scale})">
    <g fill="none" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="-40" cy="40" r="26" stroke="${ink}"/>
      <circle cx="48" cy="40" r="26" stroke="${ink}"/>
      <path d="M-40 40 L-4 14 L36 14 L48 40 M-4 14 L6 40 L36 14 M36 14 L42 -12" stroke="#ff5a1f"/>
    </g>
    <g fill="${ink}">
      <circle cx="8" cy="-60" r="15"/>
      <path d="M-8 -44 Q12 -50 26 -36 L14 -4 L-12 -8 Z"/>
      <path d="M18 -38 L46 -14 L40 -8 L12 -28 Z"/>
      <path d="M-12 -10 L-8 22 L4 22 L4 -8 Z"/>
    </g>
  </g>`;
  }
  const gear =
    kind === 'board'
      ? `<rect x="-62" y="44" width="124" height="14" rx="7" fill="#ff5a1f"/>`
      : kind === 'skate'
      ? `<rect x="-52" y="44" width="104" height="9" rx="4.5" fill="#ff5a1f"/><circle cx="-34" cy="58" r="5"/><circle cx="34" cy="58" r="5"/>`
      : `<rect x="-58" y="44" width="116" height="7" rx="3.5" fill="#ff5a1f" transform="rotate(-8)"/><rect x="-58" y="54" width="116" height="7" rx="3.5" fill="#8fd3ff" transform="rotate(8)"/>`;
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${scale})" fill="${ink}">
    <circle cx="0" cy="-58" r="15"/>
    <path d="M-20 -40 Q0 -48 20 -40 L26 6 Q0 14 -26 6 Z"/>
    <path d="M-20 -32 L-58 -12 L-52 -4 L-14 -18 Z"/>
    <path d="M20 -32 L58 -50 L62 -42 L18 -18 Z"/>
    <path d="M-22 4 L-34 46 L-20 48 L-4 10 Z"/>
    <path d="M22 4 L30 46 L16 48 L4 10 Z"/>
    ${gear}
  </g>`;
}

function snowfall(r, w, h, n, color) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const cx = (r() * w).toFixed(1);
    const cy = (r() * h).toFixed(1);
    const rad = (r() * 2.6 + 0.6).toFixed(1);
    s += `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${color}" opacity="${(r() * 0.6 + 0.25).toFixed(2)}"/>`;
  }
  return s;
}

function mountains(r, w, h, baseY, color, peaks) {
  let d = `M0 ${h} L0 ${baseY}`;
  const step = w / peaks;
  for (let i = 0; i <= peaks; i++) {
    const px = i * step + (r() - 0.5) * step * 0.4;
    const py = baseY - (r() * 0.5 + 0.4) * h * 0.28;
    d += ` L${px.toFixed(0)} ${py.toFixed(0)} L${(px + step / 2).toFixed(0)} ${(baseY - r() * 40).toFixed(0)}`;
  }
  d += ` L${w} ${baseY} L${w} ${h} Z`;
  return `<path d="${d}" fill="${color}"/>`;
}

function trees(r, w, y, n, color) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const x = r() * w;
    const t = r() * 50 + 40;
    s += `<path d="M${x.toFixed(0)} ${(y - t).toFixed(0)} L${(x - t * 0.32).toFixed(0)} ${y} L${(x + t * 0.32).toFixed(0)} ${y} Z" fill="${color}" opacity="0.9"/>`;
  }
  return s;
}

const features = {
  tabletop: (p, h) => ({
    shape: `<path d="M300 ${h * 0.84} Q420 ${h * 0.84} 520 ${h * 0.68} L600 ${h * 0.68} L600 ${h * 0.84} Z" fill="${p.snow}"/>
            <path d="M980 ${h * 0.7} L1080 ${h * 0.7} Q1220 ${h * 0.86} 1400 ${h * 0.86} L980 ${h * 0.86} Z" fill="${p.snow}"/>`,
    riders: [{ x: 790, y: h * 0.36, rot: -8, kind: 'bike' }],
    trail: `<path d="M600 ${h * 0.66} Q780 ${h * 0.24} 980 ${h * 0.6}" fill="none" stroke="${p.ink}" stroke-width="3" stroke-dasharray="4 14" opacity="0.45"/>`,
  }),
  berm: (p, h) => ({
    // A banked left-hander sweeping up and away to the right.
    shape: `<path d="M120 ${h * 0.92} Q800 ${h * 0.9} 1180 ${h * 0.66} Q1300 ${h * 0.56} 1420 ${h * 0.6} Q1380 ${h * 0.72} 1250 ${h * 0.8} Q900 ${h * 0.98} 120 ${h} Z" fill="${p.snow}"/>
            <path d="M1180 ${h * 0.66} Q1300 ${h * 0.56} 1420 ${h * 0.6}" fill="none" stroke="${p.ink}" stroke-width="4" opacity="0.35"/>`,
    riders: [{ x: 1180, y: h * 0.7 - BIKE_FEET, rot: -28, kind: 'bike' }],
    trail: '',
  }),
  drop: (p, h) => ({
    shape: `<rect x="180" y="${h * 0.52}" width="420" height="22" fill="#7a5233"/>
            <line x1="220" y1="${h * 0.52}" x2="220" y2="${h * 0.86}" stroke="#5a3a22" stroke-width="16"/>
            <line x1="560" y1="${h * 0.52}" x2="560" y2="${h * 0.86}" stroke="#5a3a22" stroke-width="16"/>
            <path d="M900 ${h * 0.74} L1500 ${h * 0.9} L900 ${h * 0.9} Z" fill="${p.snow}"/>`,
    riders: [{ x: 790, y: h * 0.42, rot: 12, kind: 'bike' }],
    trail: `<path d="M600 ${h * 0.5} Q720 ${h * 0.36} 860 ${h * 0.56}" fill="none" stroke="${p.ink}" stroke-width="3" stroke-dasharray="4 14" opacity="0.45"/>`,
  }),
  bowl: (p, h) => ({
    shape: `<path d="M0 ${h * 0.55} L260 ${h * 0.55} Q300 ${h * 0.92} 800 ${h * 0.92} Q1300 ${h * 0.92} 1340 ${h * 0.55} L1600 ${h * 0.55} L1600 ${h} L0 ${h} Z" fill="${p.snow}"/>
            <line x1="0" y1="${h * 0.55}" x2="262" y2="${h * 0.55}" stroke="${p.ink}" stroke-width="8"/>
            <line x1="1338" y1="${h * 0.55}" x2="1600" y2="${h * 0.55}" stroke="${p.ink}" stroke-width="8"/>`,
    riders: [{ x: 1330, y: h * 0.4, rot: -20, kind: 'skate' }],
    trail: '',
  }),
  kicker: (p, h) => ({
    shape: `<path d="M520 ${h * 0.8} Q700 ${h * 0.8} 760 ${h * 0.62} L800 ${h * 0.62} L800 ${h * 0.8} Z" fill="${p.snow}"/>
            <path d="M1040 ${h * 0.74} L1500 ${h * 0.86} L1040 ${h * 0.86} Z" fill="${p.snow}" opacity="0.95"/>`,
    riders: [{ x: 960, y: h * 0.32, rot: -24 }],
    trail: `<path d="M800 ${h * 0.6} Q900 ${h * 0.28} 1010 ${h * 0.38}" fill="none" stroke="${p.ink}" stroke-width="3" stroke-dasharray="4 14" opacity="0.45"/>`,
  }),
  rail: (p, h) => ({
    shape: `<line x1="420" y1="${h * 0.6}" x2="1180" y2="${h * 0.72}" stroke="${p.ink}" stroke-width="12" stroke-linecap="round"/>
            <line x1="520" y1="${h * 0.62}" x2="520" y2="${h * 0.82}" stroke="${p.ink}" stroke-width="10"/>
            <line x1="1080" y1="${h * 0.7}" x2="1080" y2="${h * 0.86}" stroke="${p.ink}" stroke-width="10"/>`,
    riders: [{ x: 820, y: h * 0.663 - FEET, rot: 8 }],
    trail: '',
  }),
  box: (p, h) => ({
    shape: `<path d="M380 ${h * 0.66} L1220 ${h * 0.72} L1220 ${h * 0.78} L380 ${h * 0.72} Z" fill="#ff5a1f"/>
            <path d="M380 ${h * 0.72} L1220 ${h * 0.78} L1220 ${h * 0.84} L380 ${h * 0.78} Z" fill="${p.ink}" opacity="0.8"/>`,
    riders: [{ x: 760, y: h * 0.687 - FEET, rot: 4, kind: 'ski' }],
    trail: '',
  }),
  pipe: (p, h) => ({
    shape: `<path d="M0 ${h * 0.45} Q180 ${h * 0.92} 800 ${h * 0.92} Q1420 ${h * 0.92} 1600 ${h * 0.45} L1600 ${h} L0 ${h} Z" fill="${p.snow}"/>`,
    riders: [{ x: 1330, y: h * 0.26, rot: 150 }],
    trail: `<path d="M1460 ${h * 0.5} Q1420 ${h * 0.2} 1300 ${h * 0.2}" fill="none" stroke="${p.ink}" stroke-width="3" stroke-dasharray="4 14" opacity="0.45"/>`,
  }),
  jib: (p, h) => ({
    shape: `<rect x="560" y="${h * 0.66}" width="480" height="${h * 0.14}" rx="${h * 0.07}" fill="${p.ink}" opacity="0.85"/>
            <rect x="590" y="${h * 0.68}" width="420" height="${h * 0.02}" rx="4" fill="#8fd3ff"/>`,
    riders: [{ x: 800, y: h * 0.66 - FEET, rot: 0, kind: 'ski' }],
    trail: '',
  }),
};

function scene({ name, palette, feature, h = 900, seed = 1, kind = 'board', lights = false }) {
  const p = palettes[palette];
  const r = rng(seed);
  const f = features[feature](p, h);
  const glow = p.glow
    ? `<radialGradient id="g" cx="0.75" cy="0.25" r="0.6"><stop offset="0" stop-color="${p.glow}" stop-opacity="0.75"/><stop offset="1" stop-color="${p.glow}" stop-opacity="0"/></radialGradient>`
    : '';
  const lightPoles = lights
    ? [260, 1340]
        .map(
          (x) => `<line x1="${x}" y1="${h * 0.2}" x2="${x}" y2="${h * 0.78}" stroke="${p.ink}" stroke-width="8"/>
             <circle cx="${x}" cy="${h * 0.2}" r="16" fill="${p.glow}"/>
             <path d="M${x} ${h * 0.2} L${x - 280} ${h * 0.9} L${x + 280} ${h * 0.9} Z" fill="${p.glow}" opacity="0.10"/>`,
        )
        .join('')
    : '';
  const riders = f.riders.map((rd) => rider({ kind, ...rd, ink: p.ink })).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${h}" width="${W}" height="${h}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.sky[0]}"/><stop offset="1" stop-color="${p.sky[1]}"/></linearGradient>
    ${glow}
    <pattern id="tape" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="20" height="40" fill="#ff5a1f"/><rect x="20" width="20" height="40" fill="#0b0f14"/></pattern>
  </defs>
  <rect width="${W}" height="${h}" fill="url(#sky)"/>
  ${p.glow ? `<rect width="${W}" height="${h}" fill="url(#g)"/>` : ''}
  ${mountains(r, W, h, h * 0.62, p.far, 6)}
  ${trees(r, W, h * 0.66, 34, p.ink)}
  <path d="M0 ${h * 0.66} Q800 ${h * 0.58} ${W} ${h * 0.7} L${W} ${h} L0 ${h} Z" fill="${p.near}"/>
  ${lightPoles}
  ${f.shape}
  ${f.trail}
  ${riders}
  ${snowfall(r, W, h, p.flakes ?? (palette === 'storm' ? 260 : 90), p.snow)}
  <rect x="0" y="${h - 18}" width="${W}" height="18" fill="url(#tape)"/>
  <g font-family="ui-monospace, Menlo, monospace" font-weight="700">
    <rect x="36" y="36" width="438" height="58" rx="6" fill="#0b0f14" opacity="0.88"/>
    <text x="58" y="75" font-size="28" fill="#ff5a1f" letter-spacing="3">DEMO · PLACEHOLDER</text>
    <text x="${W - 40}" y="${h - 40}" font-size="22" fill="${p.ink}" opacity="0.55" text-anchor="end">${name.toUpperCase()}</text>
  </g>
</svg>`;
  return sharp(Buffer.from(svg)).jpeg({ quality: 84, mozjpeg: true }).toFile(join(outDir, `${name}.jpg`)).then(() => name);
}

const made = await Promise.all([
  scene({ name: 'kicker-dawn', palette: 'dawn', feature: 'kicker', seed: 3 }),
  scene({ name: 'rail-night', palette: 'night', feature: 'rail', seed: 7, lights: true }),
  scene({ name: 'box-bluebird', palette: 'bluebird', feature: 'box', seed: 11, kind: 'ski' }),
  scene({ name: 'pipe-dusk', palette: 'dusk', feature: 'pipe', seed: 19 }),
  scene({ name: 'jib-storm', palette: 'storm', feature: 'jib', seed: 23, kind: 'ski' }),
  scene({ name: 'kicker-bluebird', palette: 'bluebird', feature: 'kicker', seed: 29, kind: 'ski' }),
  scene({ name: 'rail-dusk', palette: 'dusk', feature: 'rail', seed: 31 }),
  scene({ name: 'jib-night', palette: 'night', feature: 'jib', seed: 37, kind: 'ski', lights: true }),
  // Portrait (4:5) frames for the photo wall.
  scene({ name: 'portrait-kicker-night', palette: 'night', feature: 'kicker', seed: 41, h: 2000, lights: true }),
  scene({ name: 'portrait-rail-bluebird', palette: 'bluebird', feature: 'rail', seed: 43, h: 2000 }),
  scene({ name: 'portrait-pipe-dawn', palette: 'dawn', feature: 'pipe', seed: 47, h: 2000, kind: 'ski' }),
  scene({ name: 'portrait-box-storm', palette: 'storm', feature: 'box', seed: 53, h: 2000 }),
  // Summer bike scenes (~20% of the set) and one off-snow crossover frame (~5%).
  scene({ name: 'mtb-tabletop-summer', palette: 'summer', feature: 'tabletop', seed: 61, kind: 'bike' }),
  scene({ name: 'mtb-berm-golden', palette: 'golden', feature: 'berm', seed: 67, kind: 'bike' }),
  scene({ name: 'mtb-drop-summer', palette: 'summer', feature: 'drop', seed: 71, kind: 'bike' }),
  scene({ name: 'portrait-mtb-tabletop-golden', palette: 'golden', feature: 'tabletop', seed: 73, h: 2000, kind: 'bike' }),
  scene({ name: 'skate-bowl', palette: 'concrete', feature: 'bowl', seed: 79, kind: 'skate' }),
]);

console.log(`Wrote ${made.length} placeholder images to ${outDir}`);

// ---------------------------------------------------------------------------
// Brand art: the bluebird ridgeline panoramas behind the homepage hero.
// These are generic Green Mountain ridgelines (no trail map, no resort
// landmarks), so they are brand artwork rather than demo content.
// ---------------------------------------------------------------------------
const brandDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'assets', 'brand');
mkdirSync(brandDir, { recursive: true });

function ridge(r, w, baseY, amp, step = 30) {
  const a = [r() * 6, r() * 6, r() * 6];
  let d = `M0 1000 L0 ${baseY}`;
  for (let x = 0; x <= w; x += step) {
    const y =
      baseY -
      amp * (0.55 * Math.sin(x / 260 + a[0]) + 0.3 * Math.sin(x / 113 + a[1]) + 0.15 * Math.sin(x / 41 + a[2])) -
      r() * amp * 0.08;
    d += ` L${x} ${y.toFixed(1)}`;
  }
  return `${d} L${w} 1000 Z`;
}

function speckle(r, w, y0, y1, n, color, size) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const x = r() * w;
    const y = y0 + r() * (y1 - y0);
    const t = size * (0.6 + r() * 0.8);
    s += `<path d="M${x.toFixed(0)} ${(y - t).toFixed(0)} L${(x - t * 0.35).toFixed(0)} ${y.toFixed(0)} L${(x + t * 0.35).toFixed(0)} ${y.toFixed(0)} Z" fill="${color}"/>`;
  }
  return s;
}

function panorama(name, c, seed) {
  const r = rng(seed);
  const w = 2400;
  const clouds = Array.from({ length: 7 }, () =>
    `<ellipse cx="${(r() * w).toFixed(0)}" cy="${(120 + r() * 260).toFixed(0)}" rx="${(160 + r() * 260).toFixed(0)}" ry="${(18 + r() * 26).toFixed(0)}" fill="#fff" opacity="${(0.25 + r() * 0.35).toFixed(2)}"/>`,
  ).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} 1000" width="${w}" height="1000">
  <defs>
    <linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.sky[0]}"/><stop offset="1" stop-color="${c.sky[1]}"/></linearGradient>
    <radialGradient id="sun" cx="0.78" cy="0.12" r="0.5"><stop offset="0" stop-color="#fff" stop-opacity="0.55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="${w}" height="1000" fill="url(#s)"/>
  <rect width="${w}" height="1000" fill="url(#sun)"/>
  ${clouds}
  <path d="${ridge(r, w, 600, 110, 40)}" fill="${c.ridges[0]}"/>
  <path d="${ridge(r, w, 690, 120)}" fill="${c.ridges[1]}"/>
  ${speckle(r, w, 690, 800, 140, c.trees[0], 12)}
  <path d="${ridge(r, w, 790, 120)}" fill="${c.ridges[2]}"/>
  ${speckle(r, w, 800, 930, 170, c.trees[1], 17)}
  <path d="${ridge(r, w, 900, 80)}" fill="${c.ridges[3]}"/>
  ${speckle(r, w, 910, 1000, 150, c.trees[2], 22)}
</svg>`;
  return sharp(Buffer.from(svg)).jpeg({ quality: 86, mozjpeg: true }).toFile(join(brandDir, `${name}.jpg`));
}

await Promise.all([
  panorama('hero-snow', {
    sky: ['#2b78d0', '#bfe0fa'],
    ridges: ['#dbe9f7', '#eef5fc', '#f6faff', '#ffffff'],
    trees: ['#7d93a6', '#4f6a5d', '#3b5547'],
  }, 7),
  panorama('hero-summer', {
    sky: ['#2f80d8', '#c4e4f8'],
    ridges: ['#9ab9cf', '#7aa27a', '#5b8a55', '#47753f'],
    trees: ['#5d8160', '#3f6a3a', '#2f5a2c'],
  }, 7),
]);
console.log(`Wrote hero panoramas to ${brandDir}`);

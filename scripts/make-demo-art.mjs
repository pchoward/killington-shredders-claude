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
};

const W = 1600;
const RIDER_SCALE = 1.7;
// Distance from a rider's origin to the underside of the board/skis.
const FEET = 58 * RIDER_SCALE;

// A deliberately abstract rider: no faces, no identifiable people.
function rider({ x, y, rot = 0, scale = RIDER_SCALE, kind = 'board', ink }) {
  const gear =
    kind === 'board'
      ? `<rect x="-62" y="44" width="124" height="14" rx="7" fill="#ff5a1f"/>`
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
  ${snowfall(r, W, h, palette === 'storm' ? 260 : 90, p.snow)}
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
]);

console.log(`Wrote ${made.length} placeholder images to ${outDir}`);

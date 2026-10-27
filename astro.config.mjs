// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// SITE_URL and BASE_PATH are set automatically by the GitHub Pages workflow.
// On Cloudflare Pages / Netlify with a custom domain you only need SITE_URL.
const site = process.env.SITE_URL || 'https://example.com';
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  image: {
    // Responsive, lazy-loaded images by default.
    layout: 'constrained',
  },
});

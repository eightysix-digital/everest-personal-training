#!/usr/bin/env node
/* Generates sitemap.xml and llms.txt from the site's pages.
   Runs at build time (see vercel.json buildCommand) so both files always
   reflect the current pages, titles and descriptions. */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE_URL = (process.env.SITE_URL || 'https://everest-personal-training.vercel.app').replace(/\/+$/, '');
const SITE_NAME = 'Everest Personal Training';
const SKIP_DIRS = new Set(['.git', '.claude', 'node_modules', 'assets', 'css', 'js', 'data', 'tools', 'templates', 'blog', '.pydeps']);

function findPages(dir, depth) {
  let pages = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name) || entry.name.startsWith('.')) continue;
      if (depth < 2) pages = pages.concat(findPages(path.join(dir, entry.name), depth + 1));
    } else if (entry.name === 'index.html') {
      pages.push(path.join(dir, entry.name));
    }
  }
  return pages;
}

function meta(file) {
  const html = fs.readFileSync(file, 'utf8');
  const titleM = html.match(/<title>([\s\S]*?)<\/title>/i);
  const descM = html.match(/<meta\s+name="description"\s+content="([\s\S]*?)"/i);
  const decode = s => (s || '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').trim();
  const rel = path.relative(ROOT, file).replace(/index\.html$/, '');
  const urlPath = '/' + rel.replace(/\\/g, '/');
  return {
    file,
    url: SITE_URL + (urlPath === '/' ? '/' : urlPath),
    path: urlPath === '/' ? '/' : urlPath,
    title: decode(titleM ? titleM[1] : SITE_NAME),
    description: decode(descM ? descM[1] : ''),
    lastmod: fs.statSync(file).mtime.toISOString().slice(0, 10)
  };
}

function priority(p) {
  if (p === '/') return '1.0';
  // /personal-training/ is the landing page for the head term, so it ranks
  // alongside the other division pages. /coaching/ 301s here and is gone.
  if (['/personal-training/', '/programs/', '/performance/', '/empower/', '/organisations/'].includes(p)) return '0.9';
  if (['/impact/', '/about/', '/contact/'].includes(p)) return '0.8';
  return '0.6';
}

const order = ['/', '/personal-training/', '/programs/', '/performance/', '/empower/', '/organisations/', '/impact/', '/about/', '/team/', '/contact/', '/resources/', '/legal/'];
const pages = findPages(ROOT, 0)
  .map(meta)
  .sort((a, b) => {
    const ia = order.indexOf(a.path), ib = order.indexOf(b.path);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

/* sitemap.xml */
const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  pages.map(p =>
    '  <url>\n' +
    `    <loc>${p.url}</loc>\n` +
    `    <lastmod>${p.lastmod}</lastmod>\n` +
    `    <priority>${priority(p.path)}</priority>\n` +
    '  </url>'
  ).join('\n') + '\n</urlset>\n';
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap);

/* llms.txt */
const llms = `# ${SITE_NAME}\n\n` +
  `> Personal training, fitness and human performance coaching in Christchurch and across Canterbury, New Zealand. ` +
  `Online, in-person and hybrid coaching for everyday people, athletes, young people and organisations, including app-based programs, ` +
  `personalised coaching, youth development (EMPOWER), performance (Everest Elite) and corporate/workforce wellness.\n\n` +
  `## Pages\n\n` +
  pages.map(p => `- [${p.title}](${p.url})${p.description ? ': ' + p.description : ''}`).join('\n') +
  `\n\n## Contact\n\n- Email: jared@everest-pt.com\n- Location: Christchurch, Canterbury, New Zealand\n`;
fs.writeFileSync(path.join(ROOT, 'llms.txt'), llms);

console.log(`Generated sitemap.xml and llms.txt (${pages.length} pages) for ${SITE_URL}`);

#!/usr/bin/env node
/**
 * Crawls the built site (dist/) and fails if any internal <a href="/..."> or
 * <img src="/..."> points at a route/file that doesn't actually exist in the
 * build output. Run after `astro build`. See issue #59.
 */
import { readdirSync, statSync, existsSync, readFileSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST_DIR = fileURLToPath(new URL('../dist', import.meta.url));

function walkHtmlFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      files.push(...walkHtmlFiles(fullPath));
    } else if (entry.endsWith('.html')) {
      files.push(fullPath);
    }
  }
  return files;
}

function resolvesToFile(pathname) {
  let cleanPath = pathname.split('#')[0].split('?')[0];
  if (cleanPath === '') cleanPath = '/';

  if (cleanPath.endsWith('/')) {
    cleanPath += 'index.html';
  } else if (!extname(cleanPath)) {
    // Astro's default routing serves clean URLs (e.g. /sw.js) either as an
    // exact file or as a directory with index.html.
    if (existsSync(join(DIST_DIR, cleanPath))) return true;
    cleanPath += '/index.html';
  }

  return existsSync(join(DIST_DIR, cleanPath));
}

function main() {
  if (!existsSync(DIST_DIR)) {
    console.error('dist/ not found — run `bun run build` first.');
    process.exit(1);
  }

  const htmlFiles = walkHtmlFiles(DIST_DIR);
  const linkPattern = /(?:href|src)="([^"]+)"/g;
  /** @type {Map<string, Set<string>>} */
  const brokenLinks = new Map();

  for (const file of htmlFiles) {
    const content = readFileSync(file, 'utf-8');
    let match;
    while ((match = linkPattern.exec(content))) {
      const link = match[1];
      // Only same-origin, path-absolute links — not external URLs, mailto:,
      // tel:, anchors-only, or protocol-relative //external.
      if (!link.startsWith('/') || link.startsWith('//')) continue;

      if (!resolvesToFile(link)) {
        const sourceFile = relative(DIST_DIR, file);
        if (!brokenLinks.has(link)) brokenLinks.set(link, new Set());
        brokenLinks.get(link).add(sourceFile);
      }
    }
  }

  if (brokenLinks.size === 0) {
    console.log(`Checked ${htmlFiles.length} pages — no broken internal links found.`);
    return;
  }

  console.error(
    `Found ${brokenLinks.size} broken internal link(s) across ${htmlFiles.length} pages:\n`
  );
  for (const [link, sources] of brokenLinks) {
    console.error(`  ${link}`);
    for (const source of sources) {
      console.error(`    <- ${source}`);
    }
  }
  process.exit(1);
}

main();

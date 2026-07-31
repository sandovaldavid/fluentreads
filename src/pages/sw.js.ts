import type { APIRoute } from 'astro';
import pkg from '../../package.json';

/**
 * Service worker, generated at build time so the cache name is tied to the
 * package version (release-please bumps it on every release) — a new
 * release always gets a fresh cache instead of serving stale HTML/prices
 * indefinitely from an old one. See issue #55.
 *
 * Strategy:
 * - /admin and /checkout: never touched by this worker at all (falls
 *   through to a normal network request), so neither is ever written to
 *   Cache Storage.
 * - HTML navigations: network-first. A reload always gets the latest
 *   catalog/prices when online; the cached copy is only a fallback for
 *   when the network request fails.
 * - Everything else same-origin (hashed /_astro/* build assets, images):
 *   cache-first. Hashed assets are safe to cache indefinitely since their
 *   filename changes when their content does.
 * - Cross-origin requests are never intercepted.
 */
const CACHE_NAME = `fluentreads-cache-v${pkg.version}`;
const NEVER_CACHE_PATHS = ['/admin', '/checkout'];

const SW_SOURCE = `
const CACHE_NAME = ${JSON.stringify(CACHE_NAME)};
const NEVER_CACHE_PATHS = ${JSON.stringify(NEVER_CACHE_PATHS)};

function shouldBypass(pathname) {
  return NEVER_CACHE_PATHS.some((path) => pathname === path || pathname.startsWith(path + '/'));
}

function isNavigationRequest(request) {
  return request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html');
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.mode === 'navigate') {
      const fallback = await caches.match('/');
      if (fallback) return fallback;
    }
    throw err;
  }
}

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (shouldBypass(url.pathname)) return;

  if (isNavigationRequest(request)) {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(cacheFirst(request));
});
`;

export const GET: APIRoute = () => {
  return new Response(SW_SOURCE, {
    headers: { 'Content-Type': 'application/javascript; charset=utf-8' },
  });
};

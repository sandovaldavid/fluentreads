import { test, expect } from '@playwright/test';

/**
 * Characterizes the service worker's caching contract from issue #55:
 * versioned cache name, /admin and /checkout never touched, everything
 * else eligible for caching.
 */
test.describe('Service worker caching', () => {
  test('registers, activates, and never caches /admin or /checkout', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(
      async () => {
        const reg = await navigator.serviceWorker.getRegistration();
        return !!reg?.active;
      },
      { timeout: 15000 }
    );

    await page.goto('/catalogo');
    await page.waitForTimeout(300);
    await page.goto('/admin/');
    await page.waitForTimeout(300);
    await page.goto('/checkout');
    await page.waitForTimeout(300);
    await page.goto('/');
    await page.waitForTimeout(300);

    const cacheNames = await page.evaluate(() => caches.keys());
    expect(cacheNames.length).toBeGreaterThan(0);
    expect(cacheNames.every((name) => name.startsWith('fluentreads-cache-v'))).toBe(true);

    const cachedPathnames = await page.evaluate(async () => {
      const names = await caches.keys();
      const pathnames: string[] = [];
      for (const name of names) {
        const cache = await caches.open(name);
        const requests = await cache.keys();
        pathnames.push(...requests.map((r) => new URL(r.url).pathname));
      }
      return pathnames;
    });

    expect(cachedPathnames).not.toContain('/admin');
    expect(cachedPathnames).not.toContain('/admin/');
    expect(cachedPathnames).not.toContain('/checkout');
    expect(cachedPathnames).not.toContain('/checkout/');
  });
});

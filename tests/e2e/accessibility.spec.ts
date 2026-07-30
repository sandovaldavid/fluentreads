import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Locks in the current accessibility baseline for the two highest-traffic
 * pages. Only fails on "serious"/"critical" violations so unrelated
 * moderate/minor findings (tracked separately) don't block this suite.
 */
test.describe('Accessibility baseline', () => {
  for (const path of ['/', '/catalogo']) {
    test(`${path} has no serious or critical axe violations`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'networkidle' });

      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

      const seriousOrCritical = results.violations.filter((v) =>
        ['serious', 'critical'].includes(v.impact ?? '')
      );

      expect(seriousOrCritical, JSON.stringify(seriousOrCritical, null, 2)).toEqual([]);
    });
  }
});

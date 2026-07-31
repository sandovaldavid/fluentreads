import { test, expect } from '@playwright/test';

test.describe('404 page', () => {
  test('shows a useful message with a CTA back to the catalog and contact', async ({ page }) => {
    const response = await page.goto('/this-route-does-not-exist');
    expect(response?.status()).toBe(404);

    await expect(page.getByRole('heading', { name: /no encontrada/i })).toBeVisible();
    await expect(page.getByRole('main').getByRole('link', { name: 'Ver Catálogo' })).toBeVisible();
    await expect(
      page.getByRole('main').getByRole('link', { name: 'Contactar Soporte' })
    ).toBeVisible();
  });
});

test.describe('Footer category links', () => {
  test('every category link resolves to a real page, not a 404', async ({ page }) => {
    await page.goto('/');

    const categoryLinks = page.locator('footer a[href^="/catalogo/"]');
    const count = await categoryLinks.count();
    expect(count).toBeGreaterThan(0);

    const hrefs = await categoryLinks.evaluateAll((links) =>
      links.map((link) => link.getAttribute('href'))
    );

    for (const href of hrefs) {
      const response = await page.goto(href!);
      expect(response?.status(), `${href} should not 404`).toBe(200);
    }
  });
});

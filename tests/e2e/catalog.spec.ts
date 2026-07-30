import { test, expect } from '@playwright/test';

test.describe('Catalog', () => {
  test('lists products and links each one to a details page', async ({ page }) => {
    await page.goto('/catalogo');

    const productLinks = page.locator('a.book-cover-container');
    await expect(productLinks.first()).toBeVisible();
    expect(await productLinks.count()).toBeGreaterThan(0);
  });

  test('the catalog still renders products when filter query params are present', async ({
    page,
  }) => {
    // Characterization test only: today `type`/`level` query params do not
    // actually scope which products render (see issue #56, "unify catalog
    // filtering/sorting/URL state"). This just guards against the page
    // crashing or rendering an empty grid for a filtered URL.
    await page.goto('/catalogo?type=book&level=intermediate');

    await expect(page.locator('a.book-cover-container').first()).toBeAttached();
    expect(await page.locator('a.book-cover-container').count()).toBeGreaterThan(0);
  });

  test('opening a product card navigates to its details page', async ({ page }) => {
    await page.goto('/catalogo');

    const firstProduct = page.locator('a.book-cover-container').first();
    const href = await firstProduct.getAttribute('href');
    await firstProduct.click();

    await expect(page).toHaveURL(new RegExp(href!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    await expect(page.locator('.add-to-cart-btn').first()).toBeVisible();
  });
});

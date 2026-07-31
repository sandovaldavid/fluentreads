import { test, expect } from '@playwright/test';

test.describe('SEO metadata', () => {
  test('home page uses standard Open Graph property names, not camelCase', async ({ page }) => {
    await page.goto('/');

    // These are the correct standard names; the bug produced
    // og:siteName/og:imageWidth/og:imageHeight instead.
    await expect(page.locator('meta[property="og:site_name"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:image:width"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:image:height"]')).toHaveCount(1);

    await expect(page.locator('meta[property="og:siteName"]')).toHaveCount(0);
    await expect(page.locator('meta[property="og:imageWidth"]')).toHaveCount(0);
    await expect(page.locator('meta[property="og:imageHeight"]')).toHaveCount(0);
  });

  test('a book detail page emits exactly one Book/Product JSON-LD block, with no fabricated claims', async ({
    page,
  }) => {
    await page.goto('/catalogo');
    await page.locator('a.book-cover-container').first().click();

    const jsonLdBlocks = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((scripts) => scripts.map((s) => JSON.parse(s.textContent || '{}')));

    const productBlocks = jsonLdBlocks.filter(
      (block) => block['@type'] === 'Book' || block['@type'] === 'Product'
    );
    expect(productBlocks).toHaveLength(1);

    const product = productBlocks[0];
    expect(product).not.toHaveProperty('isbn');
    expect(product).not.toHaveProperty('aggregateRating');
    expect(product.offers).not.toHaveProperty('priceValidUntil');
  });
});

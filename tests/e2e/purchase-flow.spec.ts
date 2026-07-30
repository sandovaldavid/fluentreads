import { test, expect } from '@playwright/test';

/**
 * Stub `window.open` so the WhatsApp handoff is verified by the URL the app
 * builds, without actually navigating to wa.me (which redirects to
 * api.whatsapp.com over the real network and is slow/flaky in CI).
 */
async function stubWindowOpen(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    (window as unknown as { __openedUrls: string[] }).__openedUrls = [];
    window.open = (url?: string | URL) => {
      (window as unknown as { __openedUrls: string[] }).__openedUrls.push(String(url ?? ''));
      return null;
    };
  });
}

test.describe('Catalog to WhatsApp checkout', () => {
  test('adding a product to the cart carries its price through checkout and the WhatsApp message', async ({
    page,
  }) => {
    await stubWindowOpen(page);

    await page.goto('/catalogo');
    await page.locator('a.book-cover-container').first().click();

    const addToCartBtn = page.locator('.add-to-cart-btn').first();
    await expect(addToCartBtn).toBeVisible();

    const title = await addToCartBtn.getAttribute('data-title');
    const price = Number(await addToCartBtn.getAttribute('data-price'));
    expect(title).toBeTruthy();
    expect(price).toBeGreaterThan(0);

    await addToCartBtn.click();
    await expect(page.locator('.cart-notification')).toBeVisible();

    await page.goto('/checkout');
    await expect(page.locator('#cart-items')).toContainText(title!);

    const formattedTotal = `S/${price.toFixed(2)}`;
    await expect(page.locator('#cart-total')).toHaveText(formattedTotal);

    await page.locator('#whatsapp-checkout-btn').click();

    const openedUrls = await page.evaluate(
      () => (window as unknown as { __openedUrls: string[] }).__openedUrls
    );
    expect(openedUrls).toHaveLength(1);

    const popupUrl = new URL(openedUrls[0]);
    expect(popupUrl.hostname).toBe('wa.me');

    const message = decodeURIComponent(popupUrl.search.replace('?text=', ''));
    expect(message).toContain(title);
    expect(message).toContain(formattedTotal);
  });

  test('removing the only item from the cart shows the empty-cart state', async ({ page }) => {
    await page.goto('/catalogo');
    await page.locator('a.book-cover-container').first().click();
    await page.locator('.add-to-cart-btn').first().click();
    await expect(page.locator('.cart-notification')).toBeVisible();

    await page.goto('/checkout');
    await page.locator('.remove-item').first().click();

    await expect(page.locator('#empty-cart-message')).toBeVisible();
    await expect(page.locator('#cart-container')).toBeHidden();
  });
});

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

  test('tampering with the stored price/title in localStorage has no effect on checkout', async ({
    page,
  }) => {
    await page.goto('/catalogo');
    await page.locator('a.book-cover-container').first().click();

    const addToCartBtn = page.locator('.add-to-cart-btn').first();
    const realTitle = await addToCartBtn.getAttribute('data-title');
    const realPrice = Number(await addToCartBtn.getAttribute('data-price'));

    await addToCartBtn.click();
    await page.waitForFunction(() => {
      const raw = localStorage.getItem('shoppingCart');
      return !!raw && raw !== '[]';
    });

    // Only id/type/quantity should ever be persisted — confirm price/title
    // never made it into localStorage in the first place...
    const storedCart = await page.evaluate(() => JSON.parse(localStorage.getItem('shoppingCart')!));
    expect(storedCart[0]).not.toHaveProperty('price');
    expect(storedCart[0]).not.toHaveProperty('title');

    // ...then simulate a bug or a malicious script editing it directly anyway.
    await page.evaluate(() => {
      const cart = JSON.parse(localStorage.getItem('shoppingCart')!);
      cart[0].price = 0.01;
      cart[0].title = 'TAMPERED FREE PRODUCT';
      localStorage.setItem('shoppingCart', JSON.stringify(cart));
    });

    await page.goto('/checkout');
    await page.waitForSelector('#cart-items h4');

    await expect(page.locator('#cart-items')).toContainText(realTitle!);
    await expect(page.locator('#cart-items')).not.toContainText('TAMPERED FREE PRODUCT');
    await expect(page.locator('#cart-total')).toHaveText(`S/${realPrice.toFixed(2)}`);
  });

  test('a cart item pointing at a product that no longer exists is dropped with a visible notice', async ({
    page,
  }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem(
        'shoppingCart',
        JSON.stringify([{ id: 'this-product-does-not-exist', type: 'book', quantity: 1 }])
      );
    });

    await page.goto('/checkout');

    await expect(page.locator('#empty-cart-message')).toBeVisible();
    await expect(page.locator('#removed-items-notice')).toBeVisible();
    await expect(page.locator('#removed-items-notice')).toContainText('ya no está disponible');

    const storedCart = await page.evaluate(() => localStorage.getItem('shoppingCart'));
    expect(storedCart).toBe('[]');
  });
});

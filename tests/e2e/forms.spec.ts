import { test, expect } from '@playwright/test';

/**
 * Without PUBLIC_PAGECLIP_KEY configured (the default in this environment),
 * the contact form and both newsletter forms must be disabled and must
 * never attempt a request to Pageclip — see issue #61.
 */
test.describe('Forms without Pageclip configured', () => {
  test('footer newsletter form is disabled and makes no request', async ({ page }) => {
    const pageclipRequests: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes('pageclip.co')) pageclipRequests.push(req.url());
    });

    await page.goto('/');

    const input = page.locator('#footer-newsletter-form input[type="email"]');
    const button = page.locator('#footer-newsletter-form button[type="submit"]');
    await expect(input).toBeDisabled();
    await expect(button).toBeDisabled();
    expect(pageclipRequests).toEqual([]);
  });

  test('contact form shows a disabled-configuration notice and disables submission', async ({
    page,
  }) => {
    const pageclipRequests: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes('pageclip.co')) pageclipRequests.push(req.url());
    });

    await page.goto('/contacto');

    await expect(page.getByText('Formulario Desactivado')).toBeVisible();
    await expect(page.locator('#submit-button')).toBeDisabled();
    expect(pageclipRequests).toEqual([]);
  });
});

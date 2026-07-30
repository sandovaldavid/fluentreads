import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('loads with the site title, nav and footer', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/FluentReads/i);
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });

  test('main nav links to the catalog and contact pages', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('nav a[href="/catalogo"]').first()).toBeVisible();
    await expect(page.locator('nav a[href="/contacto"]').first()).toBeVisible();
  });
});

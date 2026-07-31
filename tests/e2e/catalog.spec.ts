import { test, expect, type Page } from '@playwright/test';

// The Filter island hydrates via client:visible — scroll it into view so the
// IntersectionObserver Astro uses to lazy-hydrate it actually fires.
async function scrollFilterIntoView(page: Page) {
  await page.locator('#catalog-filters').scrollIntoViewIfNeeded();
  await expect(page.getByRole('button', { name: 'Aplicar', exact: true })).toBeVisible();
}

test.describe('Catalog', () => {
  test('lists products and links each one to a details page', async ({ page }) => {
    await page.goto('/catalogo');

    const productLinks = page.locator('a.book-cover-container');
    await expect(productLinks.first()).toBeVisible();
    expect(await productLinks.count()).toBeGreaterThan(0);
  });

  test('opening a product card navigates to its details page', async ({ page }) => {
    await page.goto('/catalogo');

    const firstProduct = page.locator('a.book-cover-container').first();
    const href = await firstProduct.getAttribute('href');
    await firstProduct.click();

    await expect(page).toHaveURL(new RegExp(href!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    await expect(page.locator('.add-to-cart-btn').first()).toBeVisible();
  });

  test('deep link with type=book only shows book products', async ({ page }) => {
    await page.goto('/catalogo?type=book');

    const visible = page.locator('.product-grid-item:visible');
    await expect(visible.first()).toBeVisible();

    await expect(page.getByText('Essential Grammar Advanced')).toBeVisible();
    await expect(page.getByText('Everyday Conversations')).toBeVisible();
    // These products still exist in the DOM (SSR renders the full universe
    // so client-side filters can later widen back out) but must be hidden.
    await expect(page.getByText('Complete English Learning Pack')).not.toBeVisible();
    await expect(page.getByText('IELTS Preparation Guide')).not.toBeVisible();
  });

  test('deep link with level=basic normalizes "beginner"-tagged products into the same bucket', async ({
    page,
  }) => {
    // books.json/packs.json use the raw value "beginner" for some entries,
    // which must resolve into the "basic" filter bucket (see normalizeLevel
    // in src/utils/catalogFilters.ts) — this was previously an unhandled gap.
    await page.goto('/catalogo?level=basic');

    await expect(page.getByText('Everyday Conversations')).toBeVisible();
    await expect(page.getByText('Complete English Learning Pack')).toBeVisible();
    await expect(page.getByText('Essential Grammar Advanced')).not.toBeVisible();
  });

  test('deep link with sort=price-low orders the cheapest book first', async ({ page }) => {
    await page.goto('/catalogo/libros?sort=price-low');

    const firstTitle = page.locator('.catalog-product-card:visible h3').first();
    await expect(firstTitle).toHaveText(/Everyday Conversations/);
  });

  test('applying a filter through the UI produces the same result set as deep-linking to it', async ({
    page,
  }) => {
    await page.goto('/catalogo/libros');
    await scrollFilterIntoView(page);

    // Retries the select+click, not just the URL check: on a cold dev-server
    // compile the island's JS bundle can still be arriving when the button
    // first becomes visible, so the very first click can land before React
    // has attached its handlers.
    await expect(async () => {
      await page.getByRole('combobox', { name: 'Filtrar por nivel' }).selectOption('advanced');
      await page.getByRole('button', { name: 'Aplicar', exact: true }).click();
      await expect(page).toHaveURL(/level=advanced/, { timeout: 1000 });
    }).toPass({ timeout: 15000 });

    const uiFilteredTitles = await page
      .locator('.catalog-product-card:visible h3')
      .allTextContents();

    await page.goto('/catalogo/libros?level=advanced');
    const deepLinkedTitles = await page
      .locator('.catalog-product-card:visible h3')
      .allTextContents();

    expect(uiFilteredTitles.map((t) => t.trim())).toEqual(deepLinkedTitles.map((t) => t.trim()));
    expect(deepLinkedTitles.some((t) => t.includes('Essential Grammar Advanced'))).toBe(true);
  });

  test('resetting filters restores the full result set', async ({ page }) => {
    await page.goto('/catalogo/libros?level=advanced');
    await scrollFilterIntoView(page);

    const visibleBeforeReset = await page.locator('.catalog-product-card:visible').count();
    expect(visibleBeforeReset).toBeLessThan(4);

    await expect(async () => {
      await page.getByRole('button', { name: 'Limpiar todos los filtros' }).click();
      await expect(page).not.toHaveURL(/level=advanced/, { timeout: 1000 });
    }).toPass({ timeout: 15000 });
    await expect(page.locator('.catalog-product-card:visible')).toHaveCount(4);
  });
});

test.describe('Exam catalog level/difficulty normalization', () => {
  test('level=intermediate also matches exams whose raw difficulty is upper-intermediate', async ({
    page,
  }) => {
    await page.goto('/catalogo/examenes-internacionales?level=intermediate');

    await expect(page.getByText('IELTS Preparation Guide')).toBeVisible();
    await expect(page.getByText('Cambridge First Certification')).toBeVisible();
    await expect(page.getByText('PTE Exam Prep')).toBeVisible();
    await expect(page.getByText('TOEFL Complete Guide')).not.toBeVisible();
    await expect(page.getByText('CPE Masterclass')).not.toBeVisible();
  });

  test('examType filters to a single exam provider', async ({ page }) => {
    await page.goto('/catalogo/examenes-internacionales?examType=IELTS');

    await expect(page.getByText('IELTS Preparation Guide')).toBeVisible();
    await expect(page.getByText('TOEFL Complete Guide')).not.toBeVisible();
    await expect(page.getByText('Cambridge First Certification')).not.toBeVisible();
  });
});

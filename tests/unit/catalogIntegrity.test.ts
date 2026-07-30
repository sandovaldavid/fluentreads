import { describe, expect, test } from 'bun:test';
import books from '../../src/data/books.json';
import packs from '../../src/data/packs.json';
import exams from '../../src/data/exams.json';
import editorial from '../../src/data/editorial.json';
import offerHeroBanner from '../../src/data/offer-hero-banner.json';

/**
 * Characterization tests for the raw catalog JSON (pre-Content-Collections).
 * CartManager and catalog lookups key products by `id` alone, so a duplicate
 * id — even across different product types — silently merges unrelated
 * products in the cart. These tests lock in the invariants the catalog
 * currently satisfies; see issue #57 for making Content Collections the
 * single source of truth and adding build-time versions of these checks.
 */

function idsOf(collection: { id: string }[]): string[] {
  return collection.map((item) => item.id);
}

describe('catalog id uniqueness', () => {
  test('book ids are unique', () => {
    const ids = idsOf(books);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('pack ids are unique', () => {
    const ids = idsOf(packs);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('exam ids are unique', () => {
    const ids = idsOf(exams);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('no id is reused across different product types', () => {
    const seen = new Map<string, string>();
    const collisions: string[] = [];

    for (const [type, collection] of [
      ['book', books],
      ['pack', packs],
      ['exam', exams],
    ] as const) {
      for (const item of collection) {
        const previousType = seen.get(item.id);
        if (previousType && previousType !== type) {
          collisions.push(`${item.id} (${previousType} vs ${type})`);
        }
        seen.set(item.id, type);
      }
    }

    expect(collisions).toEqual([]);
  });
});

describe('catalog cross-references', () => {
  test('every book references an editorial that exists', () => {
    const editorialIds = new Set(idsOf(editorial));
    const missing = books.filter((book) => !editorialIds.has(book.editorialId)).map((b) => b.id);
    expect(missing).toEqual([]);
  });

  test('the featured offer banner references an existing product of the declared type', () => {
    const idsByType = {
      book: new Set(idsOf(books)),
      pack: new Set(idsOf(packs)),
      exam: new Set(idsOf(exams)),
    } as const;

    const missing = offerHeroBanner
      .filter((entry) => !idsByType[entry.type as keyof typeof idsByType]?.has(entry.id))
      .map((entry) => `${entry.type}:${entry.id}`);

    expect(missing).toEqual([]);
  });
});

/**
 * Applies a filtered+sorted product-id order to an already-rendered grid of
 * cards. This is the one place that touches the DOM for catalog filtering —
 * the filter/sort *decision* always comes from catalogFilters.ts running
 * against real product data, never from re-parsing card markup.
 */
export function applyProductOrder(
  grid: HTMLElement,
  items: Element[],
  orderedIds: string[],
  idAttr: string = 'data-product-id'
): number {
  const itemsById = new Map<string, Element>();
  items.forEach((item) => {
    const id = item.getAttribute(idAttr);
    if (id) itemsById.set(id, item);
  });

  const visibleIds = new Set(orderedIds);

  itemsById.forEach((item, id) => {
    if (!visibleIds.has(id)) {
      item.classList.add('hidden');
    }
  });

  let visibleCount = 0;
  orderedIds.forEach((id) => {
    const item = itemsById.get(id);
    if (!item) return;
    item.classList.remove('hidden');
    grid.appendChild(item);
    visibleCount++;
  });

  return visibleCount;
}

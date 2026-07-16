/**
 * Client-side version of the catalog filter utilities
 * This file provides DOM manipulation utilities for filtering products in the browser
 */

/**
 * Filter product DOM elements based on criteria
 * @param {NodeList} productElements DOM elements to filter
 * @param {string} resourceType Type of resource
 * @param {string} level Level filter
 * @param {string} format Format filter
 * @param {string} searchTerm Search term
 * @returns {Object} Object containing visible elements and counts
 */
export function filterProductElements(
  productElements,
  resourceType = 'any',
  level = 'all',
  format = 'all',
  searchTerm = ''
) {
  if (!productElements || !productElements.length) {
    return {
      visibleElements: [],
      visibleCount: 0,
      visibleBookCount: 0,
      visiblePackCount: 0,
      visibleExamCount: 0,
    };
  }

  // Normalize search term once for better performance
  const normalizedSearchTerm = searchTerm ? searchTerm.toLowerCase() : '';

  let visibleCount = 0;
  let visibleBookCount = 0;
  let visiblePackCount = 0;
  let visibleExamCount = 0;
  const visibleElements = [];

  // Process each product element
  productElements.forEach((element) => {
    // Get all data attributes at once for better performance
    const cardType = element.getAttribute('data-type') || '';
    const cardLevel = element.getAttribute('data-level') || '';
    const cardFormats = element.getAttribute('data-formats') || '';
    const cardTitle = element.getAttribute('data-title') || '';
    const cardEditorial = element.getAttribute('data-editorial') || '';

    // Apply filter criteria
    const typeMatch = resourceType === 'any' || cardType === resourceType;
    const levelMatch = level === 'all' || cardLevel === level;
    const formatMatch = format === 'all' || cardFormats.includes(format);

    // Search match with early return pattern for better performance
    let searchMatch = true;
    if (normalizedSearchTerm) {
      searchMatch =
        cardTitle.toLowerCase().includes(normalizedSearchTerm) ||
        cardEditorial.toLowerCase().includes(normalizedSearchTerm);
    }

    // If all filters match, mark as visible
    const isVisible = typeMatch && levelMatch && formatMatch && searchMatch;

    if (isVisible) {
      visibleElements.push(element);
      visibleCount++;

      // Count by product type
      if (cardType === 'book') visibleBookCount++;
      else if (cardType === 'pack') visiblePackCount++;
      else if (cardType === 'exam') visibleExamCount++;
    }
  });

  return {
    visibleElements,
    visibleCount,
    visibleBookCount,
    visiblePackCount,
    visibleExamCount,
  };
}

/**
 * Sort visible elements based on sort option
 * @param {Array} elements Array of DOM elements to sort
 * @param {string} sortOption Sort option
 * @returns {Array} Sorted array of elements
 */
export function sortElements(elements, sortOption = 'featured') {
  if (!elements || !elements.length) return [];
  if (sortOption === 'featured') return elements;

  // Cache attributes in memory for better sorting performance
  const elementsWithCache = elements.map((el) => {
    return {
      element: el,
      price: parseFloat(el.getAttribute('data-price') || '0'),
      rating: parseFloat(el.getAttribute('data-rating') || '0'),
      bestseller: el.getAttribute('data-bestseller') === 'true',
      title: el.getAttribute('data-title') || '',
    };
  });

  // Sort based on cached values
  elementsWithCache.sort((a, b) => {
    switch (sortOption) {
      case 'price-low':
        return a.price - b.price;

      case 'price-high':
        return b.price - a.price;

      case 'bestseller':
        if (a.bestseller !== b.bestseller) {
          return a.bestseller ? -1 : 1;
        }
        return b.rating - a.rating;

      case 'name-asc':
        return a.title.localeCompare(b.title);

      case 'name-desc':
        return b.title.localeCompare(a.title);

      default:
        return 0;
    }
  });

  // Return just the sorted DOM elements
  return elementsWithCache.map((item) => item.element);
}

/**
 * Update URL parameters for catalog filters without page reload
 * @param {string} resourceType Type of resource
 * @param {string} level Level filter
 * @param {string} format Format filter
 * @param {string} sort Sort option
 * @param {string} search Search term
 */
export function updateURLParams(resourceType, level, format, sort, search = '') {
  const url = new URL(window.location.href);

  // Helper function to set or delete params based on default values
  const updateParam = (name, value, defaultValue) => {
    if (value && value !== defaultValue) {
      url.searchParams.set(name, value);
    } else {
      url.searchParams.delete(name);
    }
  };

  // Set or remove params as needed
  updateParam('type', resourceType, 'any');
  updateParam('level', level, 'all');
  updateParam('format', format, 'all');
  updateParam('sort', sort, 'featured');
  updateParam('q', search, '');

  // Maintain the catalog hash for scrolling
  url.hash = 'catalog';

  // Use replaceState to avoid adding to browser history
  window.history.replaceState({}, '', url.toString());
}

/**
 * Apply animations to product elements with staggered timing
 * @param {Array} elements Array of elements to animate
 */
export function animateProductElements(elements) {
  if (!elements || !elements.length) return;

  elements.forEach((element, index) => {
    // Remove existing animation classes
    element.classList.remove('in-view', 'appear-1', 'appear-2', 'appear-3', 'appear-4');

    // Force reflow to restart animation
    element.style.display = 'none';
    void element.offsetWidth;
    element.style.display = '';

    // Add animation classes with staggered timing
    setTimeout(
      () => {
        element.classList.add('in-view', `appear-${(index % 4) + 1}`);
      },
      50 + (index % 4) * 50
    );
  });
}

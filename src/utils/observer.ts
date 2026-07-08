/**
 * Shared IntersectionObserver for scroll animations to improve page performance
 */
let sharedObserver: IntersectionObserver | null = null;

export const getSharedObserver = (): IntersectionObserver => {
  if (typeof window === 'undefined') {
    // Return mock for SSR environment
    return {
      observe: () => {},
      unobserve: () => {},
      disconnect: () => {},
    } as unknown as IntersectionObserver;
  }

  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated', 'in-view');
            // Scroll animations typically trigger once
            sharedObserver?.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );
  }

  return sharedObserver;
};

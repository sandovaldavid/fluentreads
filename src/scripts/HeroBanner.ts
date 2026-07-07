document.addEventListener('DOMContentLoaded', () => {
  // Carousel functionality
  const carouselTrack = document.querySelector('.carousel-track') as HTMLElement;
  const slides = document.querySelectorAll('.carousel-slide');
  const indicators = document.querySelectorAll('.indicator-dot');
  const prevButton = document.querySelector('.carousel-control.prev') as HTMLButtonElement;
  const nextButton = document.querySelector('.carousel-control.next') as HTMLButtonElement;
  const carousel = document.querySelector('.offers-carousel') as HTMLElement;

  // If no carousel is found or no slides, exit early
  if (!carouselTrack || slides.length === 0) return;

  // Store offer information for analytics or interactions
  interface OfferInfo {
    id: string;
    type: string;
    currentIndex: number;
  }

  // Initialize tracking
  let currentOfferInfo: OfferInfo = {
    id: slides[0]?.getAttribute('data-offer-id') || '',
    type: slides[0]?.getAttribute('data-offer-type') || '',
    currentIndex: 0,
  };

  let currentIndex = 0;
  const slideCount = slides.length;

  // Log the initial offer view for analytics (if needed)
  logOfferView(currentOfferInfo);

  // Initialize carousel state
  updateCarouselState();

  // Handle automatic sliding every 5 seconds with a longer time for reading
  let autoplayInterval = setInterval(nextSlide, 7000);

  // Handle previous slide button click
  prevButton?.addEventListener('click', () => {
    clearInterval(autoplayInterval);
    prevSlide();
    autoplayInterval = setInterval(nextSlide, 7000);
  });

  // Handle next slide button click
  nextButton?.addEventListener('click', () => {
    clearInterval(autoplayInterval);
    nextSlide();
    autoplayInterval = setInterval(nextSlide, 7000);
  });

  // Handle indicator clicks
  indicators.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      clearInterval(autoplayInterval);
      goToSlide(index);
      autoplayInterval = setInterval(nextSlide, 7000);
    });
  });

  // Pause autoplay when hovering over carousel
  carousel?.addEventListener('mouseenter', () => {
    clearInterval(autoplayInterval);
  });

  carousel?.addEventListener('mouseleave', () => {
    autoplayInterval = setInterval(nextSlide, 7000);
  });

  // Functions to control carousel
  function nextSlide() {
    goToSlide((currentIndex + 1) % slideCount);
  }

  function prevSlide() {
    goToSlide((currentIndex - 1 + slideCount) % slideCount);
  }

  function goToSlide(index: number) {
    currentIndex = index;
    updateCarouselState();

    // Update current offer information
    const currentSlide = slides[currentIndex];
    if (currentSlide) {
      currentOfferInfo = {
        id: currentSlide.getAttribute('data-offer-id') || '',
        type: currentSlide.getAttribute('data-offer-type') || '',
        currentIndex: currentIndex,
      };

      // Log the offer view when changed manually
      logOfferView(currentOfferInfo);
    }
  }

  function updateCarouselState() {
    // Update slide position with a smooth transition
    const slideWidth = slides[0].clientWidth;
    carouselTrack.style.transform = `translateX(-${currentIndex * slideWidth}px)`;

    // Update indicators
    indicators.forEach((dot, index) => {
      if (index === currentIndex) {
        dot.classList.add('bg-secondary');
        dot.classList.remove('bg-gray-400');
      } else {
        dot.classList.remove('bg-secondary');
        dot.classList.add('bg-gray-400');
      }
    });
  }

  // Optional: Log offer views (can be connected to analytics)
  function logOfferView(offerInfo: OfferInfo) {
    // Here you could implement actual analytics tracking
  }

  // Handle window resize to adjust carousel
  const resizeObserver = new ResizeObserver(() => {
    updateCarouselState();
  });

  // Observe the carousel container for size changes
  if (carousel) {
    resizeObserver.observe(carousel);
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (!isCarouselInViewport()) return;

    if (e.key === 'ArrowLeft') {
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
    }
  }

  // Add keyboard navigation for accessibility
  document.addEventListener('keydown', handleKeyDown);

  // Check if carousel is in viewport (for keyboard navigation)
  function isCarouselInViewport() {
    if (!carousel) return false;

    const rect = carousel.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  // Add swipe gestures for mobile
  let touchStartX = 0;
  let touchEndX = 0;

  carousel?.addEventListener(
    'touchstart',
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
    },
    false
  );

  carousel?.addEventListener(
    'touchend',
    (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    },
    false
  );

  function handleSwipe() {
    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) {
      // Swipe left, go to next slide
      nextSlide();
    } else if (touchEndX > touchStartX + swipeThreshold) {
      // Swipe right, go to previous slide
      prevSlide();
    }
  }

  // Cleanup function for memory leaks
  function cleanup() {
    clearInterval(autoplayInterval);
    resizeObserver.disconnect();
    document.removeEventListener('keydown', handleKeyDown);
  }

  // Astro page change support
  document.addEventListener('astro:before-swap', cleanup, { once: true });
});

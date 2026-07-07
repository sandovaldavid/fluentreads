import { preloadImages } from './imagePreloader';
import { pauseAllYoutubeVideos, initLiteYoutubeComponents } from '../utils/videoEmbeds';

/**
 * Media Carousel Manager
 * Handles image/video carousel with thumbnails and modal functionality
 */
export class MediaCarouselManager {
  private track: HTMLElement | null;
  private slides: NodeListOf<Element>;
  private prevButton: HTMLElement | null;
  private nextButton: HTMLElement | null;
  private thumbnails: NodeListOf<Element>;
  private currentIndex: number = 0;
  private touchStartX: number = 0;
  private touchEndX: number = 0;
  private mediaImages: NodeListOf<Element>;
  private liteYoutubeElements: NodeListOf<any>;
  private imageModal: HTMLElement | null;
  private modalImage: HTMLImageElement | null;
  private modalSpinner: HTMLElement | null;
  private modalPrevBtn: HTMLElement | null;
  private modalNextBtn: HTMLElement | null;
  private modalCloseBtn: HTMLElement | null;
  private imageUrls: string[] = [];
  private currentModalImageIndex: number = 0;

  private handleKeyDownGlobal = (e: KeyboardEvent) => {
    const carousel = document.getElementById('media-carousel');
    if (carousel && this.isElementInViewport(carousel) && !this.isModalOpen()) {
      if (e.key === 'ArrowLeft') {
        this.moveToSlide(this.currentIndex - 1);
      } else if (e.key === 'ArrowRight') {
        this.moveToSlide(this.currentIndex + 1);
      }
    }
  };

  private handleKeyDownModal = (e: KeyboardEvent) => {
    if (this.isModalOpen()) {
      if (e.key === 'Escape') {
        this.closeModal();
      } else if (e.key === 'ArrowLeft') {
        this.navigateModal('prev');
      } else if (e.key === 'ArrowRight') {
        this.navigateModal('next');
      }
    }
  };

  constructor() {
    // Initialize carousel elements
    this.track = document.querySelector('.carousel-track');
    this.slides = document.querySelectorAll('.carousel-slide');
    this.prevButton = document.querySelector('.carousel-control.prev');
    this.nextButton = document.querySelector('.carousel-control.next');
    this.thumbnails = document.querySelectorAll('.thumbnail-item');
    this.mediaImages = document.querySelectorAll('.media-image-container');
    this.liteYoutubeElements = document.querySelectorAll('lite-youtube');

    // Initialize modal elements
    this.imageModal = document.getElementById('image-modal');
    this.modalImage = document.getElementById('modal-image') as HTMLImageElement;
    this.modalSpinner = document.getElementById('modal-spinner');
    this.modalPrevBtn = document.getElementById('modal-prev-btn');
    this.modalNextBtn = document.getElementById('modal-next-btn');
    this.modalCloseBtn = document.getElementById('modal-close-btn');

    // Setup event handlers
    this.setupEventListeners();
    this.setupTouchEvents();
    this.setupModalEvents();

    // Initialize components
    this.initLiteYoutube();
    this.preloadCarouselImages();

    console.log(`MediaCarousel initialized with ${this.slides.length} slides`);
  }

  /**
   * Initialize YouTube components
   */
  private initLiteYoutube(): void {
    initLiteYoutubeComponents();
  }

  /**
   * Preload all carousel images
   */
  private preloadCarouselImages(): void {
    const carousel = document.getElementById('media-carousel');
    const imageElements = document.querySelectorAll('.media-image');
    const imageUrls = Array.from(imageElements)
      .map((img) => (img as HTMLImageElement).getAttribute('src'))
      .filter(Boolean) as string[];

    this.imageUrls = Array.from(imageElements)
      .map((img) => (img as HTMLImageElement).getAttribute('data-full-img'))
      .filter(Boolean) as string[];

    // Preload these images and mark carousel as loaded when done
    preloadImages(imageUrls).then(() => {
      if (carousel) {
        carousel.classList.add('loaded');
        console.log('All carousel images preloaded');
      }
    });
  }

  /**
   * Setup event listeners for carousel controls and thumbnails
   */
  private setupEventListeners(): void {
    // Previous slide button
    this.prevButton?.addEventListener('click', () => {
      this.moveToSlide(this.currentIndex - 1);
    });

    // Next slide button
    this.nextButton?.addEventListener('click', () => {
      this.moveToSlide(this.currentIndex + 1);
    });

    // Thumbnail navigation
    this.thumbnails.forEach((thumbnail, index) => {
      thumbnail.addEventListener('click', () => {
        this.moveToSlide(index);
      });
    });

    // Handle image click to open modal
    this.mediaImages.forEach((img) => {
      img.addEventListener('click', () => {
        const fullImageUrl = img.querySelector('img')?.getAttribute('data-full-img');
        const slideIndex = parseInt(
          img.closest('.carousel-slide')?.getAttribute('data-index') || '0'
        );

        if (fullImageUrl) {
          // Open modal with the clicked image
          this.openImageModal(fullImageUrl, slideIndex);
        }
      });
    });

    // Track image loading for better display
    document.querySelectorAll('.media-image').forEach((imgElement) => {
      const img = imgElement as HTMLImageElement;

      // Mark image as loaded if it's already complete
      if (img.complete) {
        this.handleImageLoaded(img);
      } else {
        // Set up event handlers for loading and errors
        img.addEventListener('load', () => this.handleImageLoaded(img));
        img.addEventListener('error', () => this.handleImageError(img));
      }
    });

    // Add keyboard navigation
    document.addEventListener('keydown', this.handleKeyDownGlobal);
  }

  /**
   * Set up the image modal event handlers
   */
  private setupModalEvents(): void {
    // Close modal button - fixed event handling
    document.querySelector('#modal-close-btn')?.addEventListener('click', () => {
      this.closeModal();
    });

    // Modal navigation buttons - fixed event handling
    document
      .querySelector('#modal-prev-btn, #image-modal .carousel-control.prev')
      ?.addEventListener('click', () => {
        this.navigateModal('prev');
      });

    document
      .querySelector('#modal-next-btn, #image-modal .carousel-control.next')
      ?.addEventListener('click', () => {
        this.navigateModal('next');
      });

    // Click outside to close - fixed event handling
    document.querySelector('#image-modal')?.addEventListener('click', (e) => {
      if (e.target === document.querySelector('#image-modal')) {
        this.closeModal();
      }
    });

    // Modal keyboard navigation
    document.addEventListener('keydown', this.handleKeyDownModal);
  }

  /**
   * Check if the modal is currently open
   */
  private isModalOpen(): boolean {
    const modal = document.querySelector('#image-modal');
    return modal ? !modal.classList.contains('hidden') : false;
  }

  /**
   * Open the image modal with the specified image
   */
  private openImageModal(imageUrl: string, slideIndex: number): void {
    const modal = document.querySelector('#image-modal');
    const modalImage = document.querySelector('#modal-image') as HTMLImageElement;
    const modalSpinner = document.querySelector('#modal-spinner');

    if (!modal || !modalImage || !modalSpinner) {
      console.error('Modal elements not found');
      return;
    }

    // Show modal
    modal.classList.remove('hidden');

    // Set current image index for navigation
    this.currentModalImageIndex = this.imageUrls.indexOf(imageUrl);

    // Show spinner while loading
    modalSpinner.classList.remove('hidden');

    // Set image source
    modalImage.src = imageUrl;
    modalImage.classList.remove('zoom-in-animation');

    // Handle image load completion
    modalImage.onload = () => {
      modalSpinner.classList.add('hidden');
      modalImage.classList.add('zoom-in-animation');
    };

    // Update navigation buttons visibility
    this.updateModalNavButtons();

    // Prevent page scrolling while modal is open
    document.body.style.overflow = 'hidden';
  }

  /**
   * Close the image modal
   */
  private closeModal(): void {
    const modal = document.querySelector('#image-modal');
    const modalImage = document.querySelector('#modal-image');

    if (!modal) return;

    // Add fade-out classes for animation
    if (modalImage) {
      modalImage.classList.add('modal-image-fadeout');
    }
    modal.classList.add('modal-fadeout');

    // Wait for animation to complete
    setTimeout(() => {
      modal.classList.add('hidden');
      document.body.style.overflow = '';

      // Reset classes for next opening
      modal.classList.remove('modal-fadeout');
      if (modalImage) {
        modalImage.classList.remove('modal-image-fadeout');
      }
    }, 300);
  }

  /**
   * Navigate between images in the modal
   */
  private navigateModal(direction: 'next' | 'prev'): void {
    const modalImage = document.querySelector('#modal-image') as HTMLImageElement;
    const modalSpinner = document.querySelector('#modal-spinner');

    if (!modalImage || !modalSpinner) return;

    let newIndex = this.currentModalImageIndex;

    if (direction === 'next') {
      newIndex = (newIndex + 1) % this.imageUrls.length;
    } else {
      newIndex = (newIndex - 1 + this.imageUrls.length) % this.imageUrls.length;
    }

    // Update current index
    this.currentModalImageIndex = newIndex;

    // Show loading spinner
    modalSpinner.classList.remove('hidden');

    // Apply transition effect
    modalImage.classList.remove('zoom-in-animation');
    modalImage.classList.add('scale-95', 'opacity-80');

    // Set new image
    const newImageUrl = this.imageUrls[newIndex];
    modalImage.src = newImageUrl;

    // Handle image load
    modalImage.onload = () => {
      modalSpinner.classList.add('hidden');
      modalImage.classList.remove('scale-95', 'opacity-80');
      modalImage.classList.add('zoom-in-animation');
    };

    // Update navigation buttons
    this.updateModalNavButtons();
  }

  /**
   * Update visibility of modal navigation buttons
   */
  private updateModalNavButtons(): void {
    // Only show navigation buttons if there are multiple images
    const showNavButtons = this.imageUrls.length > 1;
    const prevBtn = document.querySelector('#modal-prev-btn');
    const nextBtn = document.querySelector('#modal-next-btn');

    if (prevBtn && nextBtn) {
      if (showNavButtons) {
        prevBtn.classList.remove('hidden');
        nextBtn.classList.remove('hidden');
      } else {
        prevBtn.classList.add('hidden');
        nextBtn.classList.add('hidden');
      }
    }
  }

  /**
   * Handle image load event
   */
  private handleImageLoaded(img: HTMLImageElement): void {
    // Add a class to the parent container when image loads successfully
    const slideElement = img.closest('.carousel-slide');
    if (slideElement) {
      slideElement.classList.add('image-loaded');
    }

    // Check if all images are loaded
    this.checkAllImagesLoaded();
  }

  /**
   * Handle image error event
   */
  private handleImageError(img: HTMLImageElement): void {
    // Replace with fallback or add an error indicator
    img.src =
      'https://placehold.co/600x400/EEE/31343C/png?font=montserrat&text=NO%20IMAGE%20AVALIBLE';
    img.alt = 'Error al cargar la imagen';

    const slideElement = img.closest('.carousel-slide');
    if (slideElement) {
      slideElement.classList.add('image-error');
    }

    // Still mark as processed for the loading check
    this.checkAllImagesLoaded();
  }

  /**
   * Check if all images in the carousel have been loaded
   */
  private checkAllImagesLoaded(): void {
    const allImages = document.querySelectorAll('.media-image');
    const allLoaded = Array.from(allImages).every((img) => {
      return (
        (img as HTMLImageElement).complete ||
        img.closest('.carousel-slide')?.classList.contains('image-loaded') ||
        img.closest('.carousel-slide')?.classList.contains('image-error')
      );
    });

    if (allLoaded) {
      const carousel = document.getElementById('media-carousel');
      if (carousel) {
        carousel.classList.add('loaded');
        console.log('All carousel images now loaded');
      }
    }
  }

  /**
   * Set up touch events for mobile swipe functionality
   */
  private setupTouchEvents(): void {
    if (!this.track) return;

    this.track.addEventListener(
      'touchstart',
      (e: TouchEvent) => {
        this.touchStartX = e.changedTouches[0].screenX;
      },
      { passive: true }
    );

    this.track.addEventListener(
      'touchend',
      (e: TouchEvent) => {
        this.touchEndX = e.changedTouches[0].screenX;
        this.handleSwipe();
      },
      { passive: true }
    );
  }

  /**
   * Handle touch swipe gesture
   */
  private handleSwipe(): void {
    const SWIPE_THRESHOLD = 50;
    const touchDiff = this.touchStartX - this.touchEndX;

    if (touchDiff > SWIPE_THRESHOLD) {
      // Swipe left, next slide
      this.moveToSlide(this.currentIndex + 1);
    } else if (touchDiff < -SWIPE_THRESHOLD) {
      // Swipe right, previous slide
      this.moveToSlide(this.currentIndex - 1);
    }
  }

  /**
   * Move the carousel to a specific slide
   */
  private moveToSlide(index: number): void {
    if (!this.track) return;

    // Handle circular navigation
    if (index < 0) {
      index = this.slides.length - 1;
    } else if (index >= this.slides.length) {
      index = 0;
    }

    // Pause any video when changing slides
    pauseAllYoutubeVideos();

    // Change active class instead of manipulating style directly
    this.slides.forEach((slide, idx) => {
      if (idx === index) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    // Update the current index and thumbnails
    this.currentIndex = index;
    this.updateThumbnails();
  }

  /**
   * Update thumbnail highlighting based on current slide
   */
  private updateThumbnails(): void {
    this.thumbnails.forEach((thumbnail, index) => {
      // First ensure all thumbnails have their active classes removed
      thumbnail.classList.remove('border-primary', 'active-thumbnail', 'initial-active');

      if (index === this.currentIndex) {
        thumbnail.classList.remove('border-transparent');
        thumbnail.classList.add('border-primary');
        thumbnail.classList.add('active-thumbnail');
        thumbnail.classList.add('shadow-md');

        // Scroll the thumbnail into view if it's not visible
        const container = document.querySelector('.thumbnails-container');
        if (container) {
          thumbnail.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center',
          });
        }
      } else {
        thumbnail.classList.add('border-transparent');
        thumbnail.classList.remove('shadow-md');
      }
    });
  }

  /**
   * Check if an element is in the viewport
   */
  private isElementInViewport(el: HTMLElement): boolean {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  /**
   * Initialize the carousel
   */
  public init(): void {
    // Ensure all slides have proper styling
    this.slides.forEach((slide, index) => {
      if (index === 0) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    // Set up image loading handlers for initially visible images
    document.querySelectorAll('.active .media-image').forEach((img) => {
      if ((img as HTMLImageElement).complete) {
        this.handleImageLoaded(img as HTMLImageElement);
      }
    });

    // Clear any initial active states and set the proper active thumbnail
    this.thumbnails.forEach((thumbnail, index) => {
      // Remove any pre-existing active classes
      thumbnail.classList.remove('border-primary', 'active-thumbnail', 'initial-active');
      thumbnail.classList.add('border-transparent');

      // Set active state only for the first thumbnail
      if (index === 0) {
        thumbnail.classList.remove('border-transparent');
        thumbnail.classList.add('border-primary', 'active-thumbnail');
      }
    });
  }

  /**
   * Clean up event listeners to prevent memory leaks
   */
  public destroy(): void {
    document.removeEventListener('keydown', this.handleKeyDownGlobal);
    document.removeEventListener('keydown', this.handleKeyDownModal);
  }
}

let carouselInstance: MediaCarouselManager | null = null;

// Initialize the carousel when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  carouselInstance = new MediaCarouselManager();
  carouselInstance.init();
});

// Clean up if Astro view transitions are used
document.addEventListener('astro:before-swap', () => {
  if (carouselInstance) {
    carouselInstance.destroy();
    carouselInstance = null;
  }
});

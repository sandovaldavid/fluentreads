/**
 * Image preloader utility
 * Preloads images in the background to improve carousel user experience
 */
function preloadImages(urls) {
  if (!urls || !urls.length) return Promise.resolve();

  // Filter out video URLs
  const imageUrls = urls.filter((url) => {
    // Simple check for common video URLs or by extension
    return !(
      url.includes('youtube.com') ||
      url.includes('youtu.be') ||
      url.includes('vimeo.com') ||
      url.endsWith('.mp4') ||
      url.endsWith('.webm') ||
      url.endsWith('.ogv')
    );
  });

  // No images to preload
  if (!imageUrls.length) return Promise.resolve();

  // For tracking load status
  let loadedCount = 0;
  const totalImages = imageUrls.length;

  return new Promise((resolve) => {
    function imageLoaded() {
      loadedCount++;
      if (loadedCount === totalImages) {
        resolve();
      }
    }

    imageUrls.forEach((url) => {
      const img = new Image();
      img.onload = imageLoaded;
      img.onerror = imageLoaded; // Count errors as loaded to avoid hanging
      img.src = url;
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Get all carousel slides
  const mediaCarousel = document.getElementById('media-carousel');
  if (!mediaCarousel) return;

  // Find all image URLs in the carousel
  const imageElements = mediaCarousel.querySelectorAll('.media-image');
  const imageUrls = Array.from(imageElements)
    .map((img) => img.getAttribute('src'))
    .filter(Boolean);

  // Preload these images and mark carousel as loaded when done
  preloadImages(imageUrls).then(() => {
    mediaCarousel.classList.add('loaded');
    console.log('All carousel images preloaded');
  });
});

// Export for potential use in other modules
export { preloadImages };

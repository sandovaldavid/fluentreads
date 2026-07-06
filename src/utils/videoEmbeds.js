/**
 * Utility functions for handling video embeds
 */

/**
 * Extract YouTube video ID from various YouTube URL formats
 * @param {string} url - YouTube URL
 * @returns {string} - YouTube video ID or empty string if not found
 */
export function extractYoutubeId(url) {
  if (!url) return '';

  const ytRegex =
    /(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(ytRegex);
  return match ? match[1] : '';
}

/**
 * Initialize lite-youtube components with proper parameters
 */
export function initLiteYoutubeComponents() {
  document.addEventListener('liteYoutubeIframeLoaded', (e) => {
    console.log('YouTube iframe loaded:', e.detail.videoId);

    // Add event listener for messages from YouTube iframe
    window.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        // Handle YouTube iframe API events if needed
        if (data.event === 'onStateChange' && data.info === 0) {
          // Video ended - you could do something here
        }
      } catch (e) {
        // Not a JSON message or not the message we're looking for
      }
    });
  });
}

/**
 * Pause all YouTube videos on the page
 */
export function pauseAllYoutubeVideos() {
  document.querySelectorAll('lite-youtube').forEach((liteYt) => {
    try {
      // If the lite-youtube has been activated and has an iframe
      const iframe = liteYt.querySelector('iframe');
      if (iframe && iframe.contentWindow) {
        // Send a postMessage to pause the video
        iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      }
    } catch (e) {
      console.log('Error pausing lite-youtube:', e);
    }
  });
}

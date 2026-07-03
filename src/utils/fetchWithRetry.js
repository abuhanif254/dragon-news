export const fetchWithRetry = async (url, options = {}, retries = 3, delayMs = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        // If it's a 4xx error (except 408 or 429), retrying won't help much
        if (response.status >= 400 && response.status < 500 && response.status !== 429 && response.status !== 408) {
           return response; // Return early, let the caller handle the 404/403 etc.
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    } catch (error) {
      if (i === retries - 1) {
        throw error;
      }
      // Wait before retrying (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, delayMs * Math.pow(2, i)));
    }
  }
};

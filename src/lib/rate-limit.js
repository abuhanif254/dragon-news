/**
 * Centralized In-Memory Sliding-Window Rate Limiter
 *
 * Provides IP rate limiting across Next.js App Router API endpoints
 * with automatic garbage collection of expired buckets.
 */

/**
 * Extract client IP address from incoming Request headers
 * @param {Request} request
 * @returns {string}
 */
export function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const firstIp = forwarded.split(",")[0].trim();
    if (firstIp) return firstIp;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  return "127.0.0.1";
}

/**
 * Factory for creating a sliding-window rate limiter
 *
 * @param {Object} options
 * @param {number} options.windowMs - Time window in milliseconds (default: 60000 = 1 minute)
 * @param {number} options.max - Maximum requests allowed per window (default: 30)
 * @param {string} [options.name] - Optional identifier for logging
 * @returns {(ip: string) => { isLimited: boolean, remaining: number, resetMs: number }}
 */
export function createRateLimiter({ windowMs = 60 * 1000, max = 30, name = "limiter" } = {}) {
  const store = new Map();

  // Periodic cleanup every 5 minutes to prevent memory leaks
  let lastCleanup = Date.now();
  const CLEANUP_INTERVAL = 5 * 60 * 1000;

  function cleanup() {
    const now = Date.now();
    if (now - lastCleanup < CLEANUP_INTERVAL) return;
    lastCleanup = now;

    for (const [ip, timestamps] of store.entries()) {
      const valid = timestamps.filter((t) => now - t < windowMs);
      if (valid.length === 0) {
        store.delete(ip);
      } else {
        store.set(ip, valid);
      }
    }
  }

  return function checkRateLimit(ip) {
    cleanup();

    const now = Date.now();
    const timestamps = (store.get(ip) || []).filter((time) => now - time < windowMs);

    if (timestamps.length >= max) {
      const oldest = timestamps[0] || now;
      const resetMs = Math.max(0, windowMs - (now - oldest));
      return {
        isLimited: true,
        remaining: 0,
        resetMs,
      };
    }

    timestamps.push(now);
    store.set(ip, timestamps);

    return {
      isLimited: false,
      remaining: Math.max(0, max - timestamps.length),
      resetMs: windowMs,
    };
  };
}

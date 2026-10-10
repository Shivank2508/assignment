/**
 * Chaos Middleware:
 * - Adds random latency (200 ms to 3 s)
 * - Fails roughly 1 in 10 requests (~10% error rate) with HTTP 500
 */
function chaosMiddleware(req, res, next) {
  // Random latency between 200ms and 3000ms
  const latency = Math.floor(200 + Math.random() * 2800);

  setTimeout(() => {
    // 1 in 10 requests fail (~10% error rate)
    if (Math.random() < 0.10) {
      return res.status(500).json({
        error: 'Server Error 500: Temporary database timeout (simulated 1-in-10 failure).'
      });
    }

    next();
  }, latency);
}

module.exports = chaosMiddleware;

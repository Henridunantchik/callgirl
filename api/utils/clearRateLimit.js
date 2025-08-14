import rateLimit from 'express-rate-limit';

// Function to clear rate limit cache
export const clearRateLimitCache = (req, res) => {
  try {
    // Clear the rate limit store
    if (req.app.locals.rateLimitStore) {
      req.app.locals.rateLimitStore.clear();
    }
    
    res.status(200).json({
      success: true,
      message: 'Rate limit cache cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error clearing rate limit cache:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear rate limit cache',
      error: error.message
    });
  }
};

// Development endpoint to clear rate limits
export const setupRateLimitClearEndpoint = (app) => {
  if (process.env.NODE_ENV === 'development') {
    app.get('/api/dev/clear-rate-limit', clearRateLimitCache);
  }
};

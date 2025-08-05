import express from 'express';
import {
  getSubscriptionPricing,
  createSubscription,
  getCurrentSubscription,
  cancelSubscription,
  checkMediaLimit,
  getSubscriptionBenefits
} from '../controllers/Subscription.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { apiRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public route - no authentication required
router.get('/pricing', getSubscriptionPricing);

// Protected routes - require authentication
router.use(authenticate);

// Get current subscription
router.get('/current', getCurrentSubscription);

// Create new subscription
router.post('/create', apiRateLimiter, createSubscription);

// Cancel subscription
router.put('/cancel', apiRateLimiter, cancelSubscription);

// Check media upload limits
router.get('/check-media-limit', checkMediaLimit);

// Get subscription benefits
router.get('/benefits', getSubscriptionBenefits);

export default router; 
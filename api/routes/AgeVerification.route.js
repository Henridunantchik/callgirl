import express from 'express';
import { uploadAgeVerification, getAgeVerificationStatusController, resubmitAgeVerification } from '../controllers/AgeVerification.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { uploadRateLimiter } from '../middleware/rateLimiter.js';
import { validateFileUpload } from '../middleware/validateInput.js';

const router = express.Router();

// Age verification routes (require authentication)
router.use(authenticate);

// Upload age verification document
router.post('/upload', 
  uploadRateLimiter,
  validateFileUpload,
  uploadAgeVerification
);

// Get age verification status
router.get('/status', getAgeVerificationStatusController);

// Resubmit age verification (for failed attempts)
router.post('/resubmit',
  uploadRateLimiter,
  validateFileUpload,
  resubmitAgeVerification
);

export default router; 
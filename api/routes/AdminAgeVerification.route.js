import express from 'express';
import { getPendingAgeVerifications, updateAgeVerificationStatus } from '../controllers/AgeVerification.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { onlyAdmin } from '../middleware/onlyadmin.js';

const router = express.Router();

// Admin age verification routes (require admin authentication)
router.use(authenticate);
router.use(onlyAdmin);

// Get all pending age verifications
router.get('/pending', getPendingAgeVerifications);

// Update age verification status (approve/reject)
router.put('/:userId', updateAgeVerificationStatus);

export default router; 
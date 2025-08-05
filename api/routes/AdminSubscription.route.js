import express from 'express';
import { getAllSubscriptions } from '../controllers/Subscription.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { onlyAdmin } from '../middleware/onlyadmin.js';

const router = express.Router();

// Admin subscription routes (require admin authentication)
router.use(authenticate);
router.use(onlyAdmin);

// Get all subscriptions (admin only)
router.get('/all', getAllSubscriptions);

export default router; 
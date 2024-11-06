import { Router } from 'express';
import { createUser ,changeUserStatus , getDistance, getUserListing } from '../controllers/user.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = Router()

router.post('/create', createUser);
router.post('/change-status', authMiddleware, changeUserStatus);
router.post('/get-distance', authMiddleware, getDistance);
router.get('/get-listing', authMiddleware, getUserListing);

export default router;
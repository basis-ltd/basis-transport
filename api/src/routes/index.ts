import { Router } from 'express';
import authRoutes from './auth.routes';
import transportCardRoutes from './transportCard.routes';
import auditRoutes from './auditLog.routes';
import { auditContextMiddleware } from '../middlewares/auditContext.middleware';
import locationRoutes from './location.routes';
import tripRoutes from './trip.routes';
import userTripRoutes from './userTrip.routes';
import userRoutes from './user.routes';

const router = Router();

/**
 * AUTH ROUTES
 */
router.use('/auth', authRoutes);

// AUDIT CONTEXT MIDDLEWARE
router.use(auditContextMiddleware);

/**
 * ALL ROUTES BELOW HAVE AUDIT CONTEXT AVAILABLE
 */

// USER ROUTES
router.use('/users', userRoutes);

// TRANSPORT CARD ROUTES
router.use('/transport-cards', transportCardRoutes);

// AUDIT ROUTES
router.use('/audit-logs', auditRoutes);

// LOCATION ROUTES
router.use('/locations', locationRoutes);

// TRIP ROUTES
router.use('/trips', tripRoutes);

// USER TRIP ROUTES
router.use('/user-trips', userTripRoutes);

export default router;

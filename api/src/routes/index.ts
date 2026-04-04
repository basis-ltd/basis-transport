import { Router } from 'express';
import authRoutes from './auth.routes';
import transportCardRoutes from './transportCard.routes';
import auditRoutes from './auditLog.routes';
import { requestContextMiddleware } from '../middlewares/requestContext.middleware';
import { httpAuditMiddleware } from '../middlewares/httpAudit.middleware';
import locationRoutes from './location.routes';
import tripRoutes from './trip.routes';
import userTripRoutes from './userTrip.routes';
import userRoutes from './user.routes';
import dashboardRoutes from './dashboard.routes';
import roleRoutes from './role.routes';

const router = Router();

/**
 * Request-scoped AsyncLocalStorage (must run first for /api).
 * HTTP mutation audit (runs for all methods POST/PUT/PATCH/DELETE including /auth).
 */
router.use(requestContextMiddleware);
router.use(httpAuditMiddleware);

/**
 * AUTH ROUTES
 */
router.use('/auth', authRoutes);

// DASHBOARD ROUTES
router.use('/dashboard', dashboardRoutes);

// USER ROUTES
router.use('/users', userRoutes);

// ROLE ROUTES
router.use('/roles', roleRoutes);

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

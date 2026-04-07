import { Router } from 'express';
import { TripController } from '../controllers/trip.controller';
import { UserTripController } from '../controllers/userTrip.controller';
import { authMiddleware, optionalAuthMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { RoleTypes } from '../constants/role.constants';

const router = Router();

const tripController = new TripController();
const userTripController = new UserTripController();

const tripOperatorRoles = [
  RoleTypes.DRIVER,
  RoleTypes.ADMIN,
  RoleTypes.SUPER_ADMIN,
];

// FETCH NEARBY TRIPS (public)
router.get('/nearby', optionalAuthMiddleware, tripController.fetchNearbyTrips);

// QUICK JOIN TRIP (public)
router.post('/:tripId/quick-join', tripController.quickJoinTrip);

// CREATE TRIP
router.post(
  '/',
  authMiddleware,
  requireRole(...tripOperatorRoles),
  tripController.createTrip
);

// FETCH TRIPS
router.get('/', authMiddleware, tripController.fetchTrips);

// GET TRIP BY REFERENCE ID (before generic /:id)
router.get(
  '/reference/:referenceId',
  authMiddleware,
  tripController.getTripByReferenceId
);

// Explicit entrance (passenger); must be before /:id
router.post(
  '/:tripId/entrance',
  authMiddleware,
  userTripController.recordEntranceForTrip
);

// COUNT AVAILABLE CAPACITY
router.get(
  '/:id/capacity',
  authMiddleware,
  tripController.countAvailableCapacity
);

// START TRIP
router.patch(
  '/:id/start',
  authMiddleware,
  requireRole(...tripOperatorRoles),
  tripController.startTrip
);

// COMPLETE TRIP
router.patch(
  '/:id/complete',
  authMiddleware,
  requireRole(...tripOperatorRoles),
  tripController.completeTrip
);

// CANCEL TRIP
router.patch(
  '/:id/cancel',
  authMiddleware,
  requireRole(...tripOperatorRoles),
  tripController.cancelTrip
);

// UPDATE TRIP
router.patch(
  '/:id',
  authMiddleware,
  requireRole(...tripOperatorRoles),
  tripController.updateTrip
);

// DELETE TRIP
router.delete(
  '/:id',
  authMiddleware,
  requireRole(...tripOperatorRoles),
  tripController.deleteTrip
);

// GET TRIP BY ID
router.get('/:id', authMiddleware, tripController.getTripById);

export default router;

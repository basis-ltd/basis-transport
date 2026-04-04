import { Router } from 'express';
import { UserTripController } from '../controllers/userTrip.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const userTripController = new UserTripController();

// Explicit entrance (before /:id routes)
router.post(
  '/entrance',
  authMiddleware,
  userTripController.recordEntranceFromBody
);

// CREATE USER TRIP
router.post('/', authMiddleware, userTripController.createUserTrip);

// Explicit exit (two segments; register before GET /:id)
router.post(
  '/:id/exit',
  authMiddleware,
  userTripController.recordExit
);

// UPDATE USER TRIP
router.patch('/:id', authMiddleware, userTripController.updateUserTrip);

// DELETE USER TRIP
router.delete('/:id', authMiddleware, userTripController.deleteUserTrip);

// LIST (before GET /:id)
router.get('/', authMiddleware, userTripController.fetchUserTrips);

// GET USER TRIP BY ID
router.get('/:id', authMiddleware, userTripController.getUserTripById);

export default router;

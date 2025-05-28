import { Router } from 'express';
import { UserTripController } from '../controllers/userTrip.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const userTripController = new UserTripController();

// CREATE USER TRIP
router.post('/', authMiddleware, userTripController.createUserTrip);

// UPDATE USER TRIP
router.patch('/:id', authMiddleware, userTripController.updateUserTrip);

// DELETE USER TRIP
router.delete('/:id', authMiddleware, userTripController.deleteUserTrip);

// GET USER TRIP BY ID
router.get('/:id', authMiddleware, userTripController.getUserTripById);

// FETCH USER TRIPS
router.get('/', authMiddleware, userTripController.fetchUserTrips);

export default router;

import { Router } from 'express';
import { LocationController } from '../controllers/location.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const locationController = new LocationController();

// CREATE LOCATION
router.post('/', authMiddleware, locationController.createLocation);

// FETCH LOCATIONS
router.get('/', authMiddleware, locationController.fetchLocations);

// GET LOCATION BY ID
router.get('/:id', authMiddleware, locationController.getLocationById);

// DELETE LOCATION
router.delete('/:id', authMiddleware, locationController.deleteLocation);

// UPDATE LOCATION
router.patch('/:id', authMiddleware, locationController.updateLocation);

export default router;

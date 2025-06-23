import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const dashboardController = new DashboardController();

router.use(authMiddleware);

/**
 * DASHBOARD ROUTES
 */

// COUNT TRIPS
router.get('/user-trips/count', dashboardController.countTotalUserTrips);

// COUNT TRANSPORT CARDS
router.get('/transport-cards/count', dashboardController.countTotalTransportCards);

// COUNT USERS
router.get('/users/count', dashboardController.countTotalUsers);

// COUNT TOTAL TIME SPENT ON TRIPS
router.get('/user-trips/time-spent', dashboardController.countTotalTimeSpentOnTrips);

export default router;

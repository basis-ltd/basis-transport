import { Router } from 'express';
import { TransportCardController } from '../controllers/transportCard.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

// INITIALIZE CONTROLLER
const transportCardController = new TransportCardController();

const router = Router();

// CREATE TRANSPORT CARD
router.post('/', authMiddleware, transportCardController.createTransportCard);

// DELETE TRANSPORT CARD
router.delete(
  '/:id',
  authMiddleware,
  transportCardController.deleteTransportCard
);

// UPDATE TRANSPORT CARD
router.patch(
  '/:id',
  authMiddleware,
  transportCardController.updateTransportCard
);

// FETCH TRANSPORT CARDS
router.get('/', authMiddleware, transportCardController.fetchTransportCards);

// GET TRANSPORT CARD BY ID
router.get(
  '/:id',
  authMiddleware,
  transportCardController.getTransportCardById
);

export default router;

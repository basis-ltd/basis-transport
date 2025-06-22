import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const userController = new UserController();

// Apply auth middleware to all routes
router.use(authMiddleware);

// GET ROUTES
router.get('/', userController.fetchUsers);
router.get('/:id', userController.getUserById);

// DELETE ROUTES
router.delete('/:id', userController.deleteUser);

// CREATE ROUTES
router.post('/', userController.createUser);

export default router;

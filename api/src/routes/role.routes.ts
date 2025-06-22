import { Router } from 'express';
import { RoleController } from '../controllers/role.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const roleController = new RoleController();

// Apply auth middleware to all routes
router.use(authMiddleware);

// GET ROUTES
router.get('/', roleController.fetchRoles);
router.get('/:id', roleController.getRoleById);

// DELETE ROUTES
router.delete('/:id', roleController.deleteRole);

// CREATE ROUTES
router.post('/', roleController.createRole);

export default router;

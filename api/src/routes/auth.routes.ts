import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();

const authController = new AuthController();

router.post('/signup', authController.signup.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post(
  '/forgot-password',
  authController.forgotPassword.bind(authController)
);
router.post(
  '/reset-password',
  authController.resetPassword.bind(authController)
);

export default router;

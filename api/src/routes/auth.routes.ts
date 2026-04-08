import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

const authController = new AuthController();

router.post('/signup', authController.signup.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post(
  '/phone/precheck',
  authController.phoneLoginPrecheck.bind(authController)
);
router.post('/phone/send-otp', authController.sendPhoneOtp.bind(authController));
router.post('/phone/verify-otp', authController.verifyPhoneOtp.bind(authController));
router.post(
  '/phone/reset/send-otp',
  authController.sendPhoneResetOtp.bind(authController)
);
router.post(
  '/phone/reset/verify-otp',
  authController.verifyPhoneResetOtp.bind(authController)
);
router.post(
  '/complete-registration',
  authMiddleware,
  authController.completeRegistration.bind(authController)
);
router.post(
  '/forgot-password',
  authController.forgotPassword.bind(authController)
);
router.post(
  '/reset-password',
  authController.resetPassword.bind(authController)
);

export default router;

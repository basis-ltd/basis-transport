import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

// INITIALIZE SERVICES
const authService = new AuthService();

export class AuthController {
  /**
   * SIGNUP
   */
  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, token } = await authService.signup(req.body);
      return res.status(201).json({
        message: `User registered successfully`,
        data: { user, token },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * LOGIN
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, token } = await authService.login(req.body);
      return res.status(200).json({
        message: `User logged in successfully`,
        data: { user, token },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PHONE LOGIN PRECHECK
   */
  async phoneLoginPrecheck(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await authService.phoneLoginPrecheck(req.body);
      return res.status(200).json({
        message: 'Phone login precheck completed',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * SEND PHONE OTP
   */
  async sendPhoneOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await authService.sendPhoneOtp(req.body);
      return res.status(200).json({
        message: 'OTP sent successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * VERIFY PHONE OTP
   */
  async verifyPhoneOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, token, mustCompleteRegistration } =
        await authService.verifyPhoneOtp(req.body);
      return res.status(200).json({
        message: 'OTP verified successfully',
        data: { user, token, mustCompleteRegistration },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * SEND PHONE RESET OTP
   */
  async sendPhoneResetOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await authService.sendPhoneResetOtp(req.body);
      return res.status(200).json({
        message: 'If an account exists for this phone number, a reset code was sent.',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * VERIFY PHONE RESET OTP
   */
  async verifyPhoneResetOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await authService.verifyPhoneResetOtp(req.body);
      return res.status(200).json({
        message: 'Reset code verified successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * COMPLETE REGISTRATION
   */
  async completeRegistration(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, token } = await authService.completeRegistration(req.body, req);
      return res.status(200).json({
        message: 'Registration completed successfully',
        data: { user, token },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * FORGOT PASSWORD
   */
  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.requestPasswordReset(req.body);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * RESET PASSWORD
   */
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.resetPassword(req.body);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

}

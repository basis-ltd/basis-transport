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
}

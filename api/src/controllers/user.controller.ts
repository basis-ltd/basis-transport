import { NextFunction, Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { AuthenticatedRequest } from '../types/auth.types';
import { UUID } from '../types';
import { User } from '../entities/user.entity';
import { FindOptionsWhere } from 'typeorm';

// INITIALIZE SERVICES
const userService = new UserService();

export class UserController {
  /**
   * DELETE USER
   */
  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // LOAD USER
      const { user } = req as AuthenticatedRequest;

      await userService.deleteUser(id as UUID, {
        createdById: user.id,
      });

      return res.status(204).json({
        message: 'User deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * FETCH USERS
   */
  async fetchUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 0, size = 10 } = req.query;

      // INITIALIZE CONDITION
      const condition: FindOptionsWhere<User> | FindOptionsWhere<User>[] = {};

      const users = await userService.fetchUsers({
        page: Number(page),
        size: Number(size),
        condition,
      });

      return res.status(200).json({
        message: 'Users fetched successfully',
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET USER BY ID
   */
  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const user = await userService.getUserById(id as UUID);

      return res.status(200).json({
        message: 'User fetched successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}

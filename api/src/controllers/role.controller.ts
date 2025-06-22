import { NextFunction, Request, Response } from 'express';
import { FindOptionsWhere, ILike } from 'typeorm';
import { RoleService } from '../services/role.service';
import { UUID } from '../types';
import { Role } from '../entities/role.entity';
import { RoleStatus } from '../constants/role.constants';

// INITIALIZE SERVICES
const roleService = new RoleService();

export class RoleController {
  /**
   * CREATE ROLE
   */
  async createRole(req: Request, res: Response, next: NextFunction) {
    try {
      const newRole = await roleService.createRole(req.body);
      return res.status(201).json({
        message: 'Role created successfully',
        data: newRole,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * FETCH ROLES
   */
  async fetchRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 0, size = 10, name, status } = req.query;

      // INITIALIZE CONDITION
      let condition: FindOptionsWhere<Role> | FindOptionsWhere<Role>[] = {};

      if (status) {
        condition.status = status as RoleStatus;
      }

      // CHECK IF NAME IS PROVIDED
      if (name) {
        condition = [
          {
            name: ILike(`%${name as string}%`),
          },
        ];
      }

      const roles = await roleService.fetchRoles({
        page: Number(page),
        size: Number(size),
        condition,
      });

      return res.status(200).json({
        message: 'Roles fetched successfully',
        data: roles,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET ROLE BY ID
   */
  async getRoleById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const role = await roleService.getRoleById(id as UUID);

      return res.status(200).json({
        message: 'Role fetched successfully',
        data: role,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE ROLE
   */
  async deleteRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await roleService.deleteRole(id as UUID);

      return res.status(204).json({
        message: 'Role deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

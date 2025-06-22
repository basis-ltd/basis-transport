import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import jwt from 'jsonwebtoken';
import { User } from '../entities/user.entity';
import {
  formatLocalPhoneNumber,
  validateLogin,
  validateSignUp,
} from '../validations/user.validations';
import { ValidationError } from '../helpers/errors.helper';
import { comparePasswords, hashPassword } from '../helpers/encryptions.helper';
import { RoleTypes } from '../constants/role.constants';
import { UserRoleService } from './userRole.service';
import { RoleService } from './role.service';

// LOAD ENV
const { JWT_SECRET } = process.env;

export class AuthService {
  private readonly userRepository: Repository<User>;
  private readonly userRoleService: UserRoleService;
  private readonly roleService: RoleService;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.userRoleService = new UserRoleService();
    this.roleService = new RoleService();
  }

  /**
   * SIGNUP
   * @param user
   * @returns
   */
  async signup(user: Partial<User>): Promise<{ user: User; token: string }> {
    // VALIDATE USER
    const { error, value } = validateSignUp(user);

    if (error) {
      throw new ValidationError(error?.message);
    }

    // CHECK IF USER EXISTS
    const userExists = await this.userRepository.findOne({
      where: { email: value.email },
      relations: {
        userRoles: {
          role: true,
        },
      },
    });

    // HANDLE USER EXISTENCE
    if (userExists) {
      return {
        user: userExists,
        token: jwt.sign({ id: userExists.id }, String(JWT_SECRET)),
      };
    }

    // HASH PASSWORD
    const hashedPassword = await hashPassword(value.password);

    let phoneNumber = value?.phoneNumber;

    if (phoneNumber) {
      phoneNumber = formatLocalPhoneNumber(phoneNumber);
    }

    // CREATE USER
    const newUser = await this.userRepository.save({
      ...value,
      passwordHash: hashedPassword,
      phoneNumber,
    });

    // GET USER ROLES
    const publicUserRoles = await this.roleService.getRolesByNames([
      RoleTypes.USER,
    ]);

    // ASSIGN DEFAULT ROLE
    if (publicUserRoles?.length <= 0) {
      const userRole = await this.roleService.createRole({
        name: RoleTypes.USER,
      });

      await this.userRoleService.createUserRole({
        userId: newUser?.id,
        roleId: userRole?.id,
      });

    } else {
      await Promise.all(
        publicUserRoles.map((role) =>
          this.userRoleService.createUserRole({
            userId: newUser?.id,
            roleId: role?.id,
          })
        )
      );
    }

    // GENERATE JWT TOKEN
    const jwtToken = jwt.sign({ id: newUser.id }, String(JWT_SECRET));

    const createdUser = await this.userRepository.findOne({
      where: { id: newUser?.id },
      relations: {
        userRoles: {
          role: true,
        },
      },
      order: {
        updatedAt: 'DESC',
      }
    });

    return {
      user: createdUser as User,
      token: jwtToken,
    };
  }

  /**
   * LOGIN
   * @param user
   * @returns
   */
  async login(
    user: Partial<User>
  ): Promise<{ user: Partial<User>; token: string }> {
    // VALIDATE USER
    const { error, value } = validateLogin(user);

    if (error) {
      throw new ValidationError(error?.message);
    }

    const userExists = await this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email: value.email })
      .leftJoinAndSelect('user.userRoles', 'userRoles')
      .leftJoinAndSelect('userRoles.role', 'role')
      .addSelect('user.passwordHash')
      .getOne();

    if (!userExists) {
      throw new ValidationError('Invalid email or password');
    }

    const isPasswordValid = await comparePasswords(
      value.password,
      userExists?.passwordHash || ''
    );

    if (!isPasswordValid) {
      throw new ValidationError('Invalid email or password');
    }

    const jwtToken = jwt.sign({ id: userExists.id }, String(JWT_SECRET));

    return {
      user: {
        ...userExists,
        passwordHash: undefined,
      },
      token: jwtToken,
    };
  }
}

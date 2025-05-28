import { IsEmail, IsNotEmpty } from 'class-validator';
import { AbstractEntity } from './index';
import { Column, Entity, OneToMany } from 'typeorm';
import { COUNTRIES } from '../constants/countries.constants';
import { UserRole } from './userRole.entity';
import { Gender, UserStatus } from '../constants/user.constants';
import { TransportCard } from './transportCard.entity';

@Entity('users')
export class User extends AbstractEntity {
  // NAME
  @Column({ name: 'name', type: 'varchar', length: 255, nullable: true })
  @IsNotEmpty({ message: 'Name is required' })
  name?: string;

  // EMAIL
  @Column({
    name: 'email',
    type: 'varchar',
    length: 255,
    nullable: true,
    unique: true,
  })
  @IsEmail({}, { message: 'Invalid email address' })
  email?: string;

  // PHONE
  @Column({
    name: 'phone_number',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  phoneNumber?: string;

  // GENDER
  @Column({
    name: 'gender',
    type: 'enum',
    nullable: true,
    enum: Gender,
    default: Gender.MALE,
  })
  gender?: Gender;

  // DATE OF BIRTH
  @Column({
    name: 'date_of_birth',
    type: 'date',
    nullable: true,
  })
  dateOfBirth?: Date;

  // STATUS
  @Column({
    name: 'status',
    type: 'enum',
    nullable: true,
    default: UserStatus.ACTIVE,
    enum: UserStatus,
  })
  status: UserStatus;

  // NATIONALITY
  @Column({
    name: 'nationality',
    type: 'enum',
    nullable: true,
    default: 'RW',
    enum: COUNTRIES.map((country) => country.code),
  })
  nationality?: string;

  // PASSWORD HASH
  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 255,
    nullable: false,
    select: false,
  })
  passwordHash?: string;

  /**
   * RELATIONS
   */

  // USER ROLES
  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles: UserRole[];

  // TRANSPORT CARDS
  @OneToMany(() => TransportCard, (transportCard) => transportCard.createdBy)
  transportCards: TransportCard[];
}

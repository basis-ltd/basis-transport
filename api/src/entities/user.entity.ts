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
    unique: true,
  })
  phoneNumber?: string;

  // PROFILE COMPLETION
  @Column({
    name: 'is_profile_complete',
    type: 'boolean',
    nullable: false,
    default: true,
  })
  isProfileComplete: boolean;

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
    nullable: true,
    select: false,
  })
  passwordHash?: string;

  // HAS SET PASSWORD
  @Column({
    name: 'has_set_password',
    type: 'boolean',
    nullable: false,
    default: true,
  })
  hasSetPassword: boolean;

  // PHONE OTP (stored as SHA-256 hash of OTP)
  @Column({
    name: 'phone_otp_hash',
    type: 'varchar',
    length: 64,
    nullable: true,
    select: false,
  })
  phoneOtpHash?: string | null;

  @Column({
    name: 'phone_otp_expires_at',
    type: 'timestamp',
    nullable: true,
  })
  phoneOtpExpiresAt?: Date | null;

  @Column({
    name: 'phone_otp_attempts',
    type: 'int',
    nullable: false,
    default: 0,
  })
  phoneOtpAttempts: number;

  @Column({
    name: 'phone_otp_last_sent_at',
    type: 'timestamp',
    nullable: true,
  })
  phoneOtpLastSentAt?: Date | null;

  @Column({
    name: 'temporary_auth_expires_at',
    type: 'timestamp',
    nullable: true,
  })
  temporaryAuthExpiresAt?: Date | null;

  // TRANSIENT AUTH FLAG (API RESPONSE ONLY)
  mustCompleteRegistration?: boolean;

  // PASSWORD RESET (token stored as SHA-256 hex of raw token)
  @Column({
    name: 'password_reset_token_hash',
    type: 'varchar',
    length: 64,
    nullable: true,
    select: false,
  })
  passwordResetTokenHash?: string;

  @Column({
    name: 'password_reset_expires',
    type: 'timestamp',
    nullable: true,
  })
  passwordResetExpires?: Date;

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

import { Column, Entity, Geometry, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { AbstractEntity } from '.';
import { UUID } from '../types';
import { Trip } from './trip.entity';
import { UserTripStatus } from '../constants/userTrip.constants';

@Entity('user_trips')
export class UserTrip extends AbstractEntity {
  // USER ID
  @Column({ name: 'user_id', type: 'uuid', nullable: false })
  userId: UUID;

  // TRIP ID
  @Column({ name: 'trip_id', type: 'uuid', nullable: false })
  tripId: UUID;

  // STATUS
  @Column({
    name: 'status',
    type: 'enum',
    nullable: false,
    enum: UserTripStatus,
    default: UserTripStatus.IN_PROGRESS,
  })
  status: UserTripStatus;

  // ENTRANCE LOCATION
  @Column({ name: 'entrance_location', type: 'geometry', nullable: false })
  entranceLocation: Geometry;

  // EXIT LOCATION
  @Column({ name: 'exit_location', type: 'geometry', nullable: true })
  exitLocation: Geometry;

  // START TIME
  @Column({ name: 'start_time', type: 'timestamptz', nullable: false })
  startTime: Date;

  // END TIME
  @Column({ name: 'end_time', type: 'timestamptz', nullable: true })
  endTime: Date;

  // CREATED BY ID
  @Column({ name: 'created_by_id', type: 'uuid', nullable: false })
  createdById: UUID;

  /**
   * RELATIONS
   */

  // USER
  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // TRIP
  @ManyToOne(() => Trip, (trip) => trip.id)
  @JoinColumn({ name: 'trip_id' })
  trip: Trip;

  // CREATED BY
  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;
}

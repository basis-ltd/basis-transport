import { Column, Entity, Geometry, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '.';
import { UUID } from '../types';
import { Location } from './location.entity';
import { User } from './user.entity';
import { TripStatus } from '../constants/trip.constants';

@Entity('trips')
export class Trip extends AbstractEntity {
  // REFERENCE ID
  @Column({
    name: 'reference_id',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  referenceId: string;

  // START TIME
  @Column({ name: 'start_time', type: 'timestamptz', nullable: true })
  startTime: Date;

  // END TIME
  @Column({ name: 'end_time', type: 'timestamptz', nullable: true })
  endTime: Date;

  // LOCATION FROM ID
  @Column({ name: 'location_from_id', type: 'uuid', nullable: false })
  locationFromId: UUID;

  // LOCATION TO ID
  @Column({ name: 'location_to_id', type: 'uuid', nullable: true })
  locationToId: UUID;

  // CREATED BY ID
  @Column({ name: 'created_by_id', type: 'uuid', nullable: false })
  createdById: UUID;

  // STATUS
  @Column({
    name: 'status',
    type: 'enum',
    nullable: false,
    enum: TripStatus,
    default: TripStatus.PENDING,
  })
  status: TripStatus;

  // TOTAL CAPACITY
  @Column({
    name: 'total_capacity',
    type: 'integer',
    nullable: true,
    default: 0,
  })
  totalCapacity: number;

  // CURRENT LOCATION
  @Column({ name: 'current_location', type: 'geometry', nullable: true })
  currentLocation: Geometry;

  /**
   * RELATIONS
   */

  // LOCATION FROM
  @ManyToOne(() => Location, (location) => location.id, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'location_from_id' })
  locationFrom: Location;

  // LOCATION TO
  @ManyToOne(() => Location, (location) => location.id, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'location_to_id' })
  locationTo: Location;

  // CREATED BY
  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;
}

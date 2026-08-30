import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { UUID } from '../types';
import { RouteServiceType } from '../constants/network.constants';
import { TransitRoute } from './transitRoute.entity';

/**
 * A headway window for a route (GTFS frequencies.txt). Kigali service is
 * headway based rather than clock-face, apart from the airport shuttle.
 */
@Entity('route_frequencies')
export class RouteFrequency extends AbstractEntity {
  // ROUTE ID
  @Column({ name: 'route_id', type: 'uuid', nullable: false })
  routeId: UUID;

  // START TIME
  @Column({ name: 'start_time', type: 'time', nullable: false })
  startTime: string;

  // END TIME
  @Column({ name: 'end_time', type: 'time', nullable: false })
  endTime: string;

  // HEADWAY SECS
  @Column({ name: 'headway_secs', type: 'integer', nullable: false })
  headwaySecs: number;

  // SERVICE
  @Column({
    name: 'service',
    type: 'enum',
    enum: RouteServiceType,
    nullable: false,
    default: RouteServiceType.DAILY,
  })
  service: RouteServiceType;

  // SOURCE
  @Column({ type: 'varchar', length: 64, nullable: false, name: 'source' })
  source: string;

  // NOTES
  @Column({ type: 'text', nullable: true, name: 'notes' })
  notes?: string;

  /**
   * RELATIONS
   */

  // ROUTE
  @ManyToOne(() => TransitRoute, (route) => route.frequencies, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'route_id' })
  route?: TransitRoute;
}

import { Column, Entity, Geometry, Index, OneToMany } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { StopType } from '../constants/network.constants';
import type { RouteStop } from './routeStop.entity';

/**
 * A network stop or bus park. Deliberately separate from `locations`: a Location
 * is a user-created origin/destination pin for an ad-hoc trip, a Stop is a point
 * on the published network.
 */
@Entity('stops')
export class Stop extends AbstractEntity {
  // CODE
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64, nullable: false, name: 'code' })
  code: string;

  // NAME
  @Column({ type: 'varchar', length: 255, nullable: false, name: 'name' })
  name: string;

  // LOCATION
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
    name: 'location',
  })
  location?: Geometry;

  // STOP TYPE
  @Column({
    type: 'enum',
    enum: StopType,
    nullable: false,
    name: 'stop_type',
    default: StopType.STOP,
  })
  stopType: StopType;

  // SOURCE
  @Column({ type: 'varchar', length: 64, nullable: false, name: 'source' })
  source: string;

  /**
   * RELATIONS
   */

  // ROUTE STOPS
  @OneToMany(
    () => require('./routeStop.entity').RouteStop,
    (routeStop: RouteStop) => routeStop.stop
  )
  routeStops?: RouteStop[];
}

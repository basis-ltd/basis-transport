import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { UUID } from '../types';
import { Agency } from './agency.entity';
import { Corridor } from './corridor.entity';
import { ROUTE_TYPE_BUS } from '../constants/network.constants';
import type { RouteStop } from './routeStop.entity';
import type { RouteFrequency } from './routeFrequency.entity';

/**
 * A published bus line. Named `TransitRoute` (table `transit_routes`) because
 * `Route` collides with Express/Nest routing types; the HTTP surface is still
 * `/api/routes`.
 *
 * Unique on (short_name, source) so the historic 2019 `104` and a future
 * Ecofleet `104F` can live side by side without being merged.
 */
@Entity('transit_routes')
@Unique('UQ_transit_routes_short_name_source', ['shortName', 'source'])
export class TransitRoute extends AbstractEntity {
  // AGENCY ID
  @Column({ name: 'agency_id', type: 'uuid', nullable: false })
  agencyId: UUID;

  // CORRIDOR ID
  @Column({ name: 'corridor_id', type: 'uuid', nullable: true })
  corridorId?: UUID;

  // SHORT NAME
  @Index()
  @Column({ type: 'varchar', length: 64, nullable: false, name: 'short_name' })
  shortName: string;

  // LONG NAME
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'long_name' })
  longName?: string;

  // DESCRIPTION
  @Column({ type: 'text', nullable: true, name: 'description' })
  description?: string;

  // DIRECTION
  @Column({ type: 'varchar', length: 64, nullable: true, name: 'direction' })
  direction?: string;

  // ROUTE TYPE (GTFS route_type, 3 = bus)
  @Column({
    type: 'integer',
    nullable: false,
    name: 'route_type',
    default: ROUTE_TYPE_BUS,
  })
  routeType: number;

  // SOURCE
  @Column({ type: 'varchar', length: 64, nullable: false, name: 'source' })
  source: string;

  // AS OF
  @Column({ type: 'date', nullable: true, name: 'as_of' })
  asOf?: string;

  /**
   * RELATIONS
   */

  // AGENCY
  @ManyToOne(() => Agency, (agency) => agency.routes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'agency_id' })
  agency?: Agency;

  // CORRIDOR
  @ManyToOne(() => Corridor, (corridor) => corridor.routes, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'corridor_id' })
  corridor?: Corridor;

  // ROUTE STOPS
  @OneToMany(
    () => require('./routeStop.entity').RouteStop,
    (routeStop: RouteStop) => routeStop.route
  )
  routeStops?: RouteStop[];

  // FREQUENCIES
  @OneToMany(
    () => require('./routeFrequency.entity').RouteFrequency,
    (frequency: RouteFrequency) => frequency.route
  )
  frequencies?: RouteFrequency[];
}

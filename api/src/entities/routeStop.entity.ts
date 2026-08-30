import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { UUID } from '../types';
import { Stop } from './networkStop.entity';
import { TransitRoute } from './transitRoute.entity';

/**
 * One stop in a route's ordered stop sequence (GTFS stop_times minus the clock
 * times - the 2019 feed is headway based, so times live on RouteFrequency).
 */
@Entity('route_stops')
@Unique('UQ_route_stops_route_sequence', ['routeId', 'sequence'])
export class RouteStop extends AbstractEntity {
  // ROUTE ID
  @Column({ name: 'route_id', type: 'uuid', nullable: false })
  routeId: UUID;

  // STOP ID
  @Column({ name: 'stop_id', type: 'uuid', nullable: false })
  stopId: UUID;

  // SEQUENCE
  @Column({ name: 'sequence', type: 'integer', nullable: false })
  sequence: number;

  /**
   * RELATIONS
   */

  // ROUTE
  @ManyToOne(() => TransitRoute, (route) => route.routeStops, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'route_id' })
  route?: TransitRoute;

  // STOP
  @ManyToOne(() => Stop, (stop) => stop.routeStops, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'stop_id' })
  stop?: Stop;
}

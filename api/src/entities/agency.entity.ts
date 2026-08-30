import { Column, Entity, Index, OneToMany } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import type { TransitRoute } from './transitRoute.entity';

/**
 * A transport operator. Seeded from the 2019 DT4A GTFS (KBS, Royal Express,
 * RFTC) plus Ecofleet, the 2026 city fleet manager.
 */
@Entity('agencies')
export class Agency extends AbstractEntity {
  // NAME
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255, nullable: false, name: 'name' })
  name: string;

  // TIMEZONE
  @Column({
    type: 'varchar',
    length: 64,
    nullable: false,
    name: 'timezone',
    default: 'Africa/Kigali',
  })
  timezone: string;

  // SOURCE
  @Column({ type: 'varchar', length: 64, nullable: false, name: 'source' })
  source: string;

  // AS OF
  @Column({ type: 'date', nullable: true, name: 'as_of' })
  asOf?: string;

  /**
   * RELATIONS
   */

  // ROUTES
  @OneToMany(
    () => require('./transitRoute.entity').TransitRoute,
    (route: TransitRoute) => route.agency
  )
  routes?: TransitRoute[];
}

import { Column, Entity, Index, OneToMany } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import type { TransitRoute } from './transitRoute.entity';

/**
 * A named 2026 corridor (A-G) as published on Ecofleet's network map. Corridors
 * are marketing labels over the operational lines, not surveyed geometry, so the
 * hub chain is stored as published names rather than as surveyed stops.
 */
@Entity('corridors')
export class Corridor extends AbstractEntity {
  // CODE
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 16, nullable: false, name: 'code' })
  code: string;

  // NAME
  @Column({ type: 'varchar', length: 255, nullable: false, name: 'name' })
  name: string;

  // FROM HUB
  @Column({ type: 'varchar', length: 255, nullable: false, name: 'from_hub' })
  fromHub: string;

  // TO HUB
  @Column({ type: 'varchar', length: 255, nullable: false, name: 'to_hub' })
  toHub: string;

  // COLOR
  @Column({ type: 'varchar', length: 16, nullable: true, name: 'color' })
  color?: string;

  // HUB NAMES ALONG THE CORRIDOR, AS PUBLISHED
  @Column({ type: 'text', array: true, nullable: true, name: 'stop_names' })
  stopNames?: string[];

  // SOURCE
  @Column({ type: 'varchar', length: 64, nullable: false, name: 'source' })
  source: string;

  /**
   * RELATIONS
   */

  // ROUTES
  @OneToMany(
    () => require('./transitRoute.entity').TransitRoute,
    (route: TransitRoute) => route.corridor
  )
  routes?: TransitRoute[];
}

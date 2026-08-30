import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type {
  NetworkSnapshot,
  QualityIssue,
  Verification,
} from '../modules/network/network.types';

@Entity('network_datasets')
export class NetworkDataset {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) version: string;
  @Column() source: string;
  @Column({ name: 'source_url' }) sourceUrl: string;
  @Column() checksum: string;
  @Column({ default: 'draft' }) status: 'draft' | 'published' | 'archived';
  @Column({ default: 'historic' }) verification: Verification;
  @Column({ name: 'rights_status', default: 'unclear' }) rightsStatus:
    'unclear' | 'approved';
  @Column({ name: 'rights_evidence', type: 'text', default: '' })
  rightsEvidence: string;
  @Column({ name: 'verification_evidence', type: 'text', default: '' })
  verificationEvidence: string;
  @Column({ name: 'valid_from', type: 'date', nullable: true }) validFrom:
    string | null;
  @Column({ name: 'valid_to', type: 'date', nullable: true }) validTo:
    string | null;
  @CreateDateColumn({ name: 'imported_at', type: 'timestamptz' })
  importedAt: Date;
  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt: Date | null;
  @Column({ type: 'jsonb' }) snapshot: NetworkSnapshot;
  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  issues: QualityIssue[];
}

// Search projections are written in the same transaction as the canonical snapshot.
@Entity('route_patterns')
export class RoutePattern {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'dataset_id', type: 'uuid' }) datasetId: string;
  @Column({ name: 'source_trip_id' }) sourceTripId: string;
  @Column({ name: 'route_id' }) routeId: string;
  @Column() direction: string;
}

@Entity('pattern_stops')
export class PatternStopProjection {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'dataset_id', type: 'uuid' }) datasetId: string;
  @Column({ name: 'pattern_id', type: 'uuid' }) patternId: string;
  @Column({ name: 'stop_id' }) stopId: string;
  @Column({ type: 'integer' }) sequence: number;
  @Column({ type: 'geometry', spatialFeatureType: 'Point', srid: 4326 })
  location: { type: 'Point'; coordinates: number[] };
}

@Entity('saved_items')
export class SavedItem {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'user_id', type: 'uuid' }) userId: string;
  @Column() key: string;
  @Column() label: string;
  @Column() href: string;
  @Column() kind: 'journey' | 'stop' | 'route';
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}

@Entity('passenger_reports')
export class PassengerReport {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() kind: 'contact' | 'stop' | 'route';
  @Column({ name: 'reference_id', nullable: true, type: 'varchar' })
  referenceId: string | null;
  @Column({ type: 'varchar', nullable: true }) email: string | null;
  @Column({ type: 'varchar', nullable: true }) name: string | null;
  @Column({ type: 'text' }) message: string;
  @Column({ default: 'open' }) status: 'open' | 'resolved';
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}

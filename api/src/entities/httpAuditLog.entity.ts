import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from './index';
import { UUID } from '../types';
import { User } from './user.entity';

/**
 * One row per mutating HTTP request (POST, PUT, PATCH, DELETE) for compliance / debugging.
 * Separate from {@link AuditLog} entity-level diffs.
 */
@Entity('http_audit_logs')
export class HttpAuditLog extends AbstractEntity {
  @Column({ name: 'correlation_id', type: 'varchar', length: 128, nullable: true })
  correlationId?: string;

  @Column({ name: 'http_method', type: 'varchar', length: 16, nullable: false })
  httpMethod: string;

  @Column({ name: 'http_path', type: 'varchar', length: 2048, nullable: false })
  httpPath: string;

  @Column({ name: 'http_status', type: 'integer', nullable: false })
  httpStatus: number;

  @Column({ name: 'duration_ms', type: 'integer', nullable: false })
  durationMs: number;

  @Column({ name: 'ip', type: 'varchar', length: 64, nullable: true })
  ip?: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string;

  @Column({ name: 'actor_user_id', type: 'uuid', nullable: true })
  actorUserId?: UUID;

  @Column({ name: 'body_snapshot', type: 'jsonb', nullable: true })
  bodySnapshot?: Record<string, unknown> | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'actor_user_id' })
  actor?: User;
}

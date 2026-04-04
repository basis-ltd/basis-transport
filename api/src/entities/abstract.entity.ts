import { UUID } from "../types";
import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import type { User } from "./user.entity";

export abstract class AbstractEntity {
  // ID
  @PrimaryGeneratedColumn("uuid")
  id!: UUID;

  // CREATED AT
  @CreateDateColumn({
    name: "created_at",
    type: "timestamptz",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt!: Date;

  // UPDATED AT
  @UpdateDateColumn({
    name: "updated_at",
    type: "timestamptz",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt!: Date;

  // CREATED BY ID
  @Column({
    name: "created_by_id",
    type: "uuid",
    nullable: true,
  })
  createdById?: UUID;

  // LAST UPDATED BY ID
  @Column({
    name: "last_updated_by_id",
    type: "uuid",
    nullable: true,
  })
  lastUpdatedById?: UUID;

  /**
   * RELATIONS
   * User is resolved lazily via require() to avoid a circular import with user.entity.ts
   * (which extends AbstractEntity).
   */

  // CREATED BY
  @ManyToOne(
    () => require("./user.entity").User,
    (user: User) => user.id,
    {
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
      nullable: true,
    }
  )
  @JoinColumn({ name: "created_by_id" })
  createdBy?: User;

  // LAST UPDATED BY
  @ManyToOne(
    () => require("./user.entity").User,
    (user: User) => user.id,
    {
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
      nullable: true,
    }
  )
  @JoinColumn({ name: "last_updated_by_id" })
  lastUpdatedBy?: User;
}

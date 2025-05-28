import { UUID } from 'crypto';

export { UUID };

export interface AbstractEntity {
  id: UUID;
  createdAt: Date;
  updatedAt: Date;
}

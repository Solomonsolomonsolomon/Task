import {
  Entity,
  EntityRepositoryType,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/mysql';
import { EntityRepository } from '@mikro-orm/mysql';
import { TaskRepository } from './task.repository';
import { User } from '../user/user.entity';

@Entity({tableName:'tasks'})
export class Task {
  @PrimaryKey()
  id!: number;

  @Property()
  description!: string;

  @Property()
  status: 'active' | 'completed' = 'active';

  @Property({ type: 'Date', defaultRaw: 'CURRENT_TIMESTAMP' })
  createdAt?: Date = new Date();

  @Property({ type: 'Date', onUpdate: () => new Date() })
  updatedAt?: Date = new Date();

  @Property({ type: 'Date', nullable: true })
  dueDate?: Date;

  @Property({ default: false })
  isTimerExpired?: boolean = false;

  @Property({ nullable: true })
  deletedAt?: Date;

  @ManyToOne(() => User)
  user!: User;

  @Property({ default: false })
  reminderEnabled?: boolean;

  @Property({ nullable: true })
  reminderTimeGapMinutes?: number;

  [EntityRepositoryType]?: TaskRepository;
}

import { EntityRepository } from '@mikro-orm/mysql';
import { Task } from './task.entity';

export class TaskRepository extends EntityRepository<Task> {
}

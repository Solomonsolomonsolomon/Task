import { IsEmail } from 'class-validator';
import crypto from 'crypto';
import {
  Collection,
  Entity,
  EntityDTO,
  EntityRepositoryType,
  ManyToMany,
  OneToMany,
  Opt,
  PrimaryKey,
  Property,
  wrap,
} from '@mikro-orm/mysql';

import { Task } from '../task/task.entity';

@Entity({tableName:'users'})
export class User {
  @PrimaryKey()
  id!: number;

  @Property()
  username: string;

  @Property({ hidden: true })
  @IsEmail()
  email: string;

  @Property({ hidden: true })
  password: string;

  @OneToMany(() => Task, (task) => task.user, { hidden: true })
  tasks = new Collection<Task>(this);

  constructor(username: string, email: string, password: string) {
    this.username = username;
    this.email = email;
    this.password = crypto.createHmac('sha256', password).digest('hex');
  }
}

interface UserDTO extends EntityDTO<User> {
  following?: boolean;
}

import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Task } from './task.entity';
import { BullModule } from '@nestjs/bull';
import { UserRepository } from '../user/user.repository';
import { UserModule } from '../user/user.module';
import { User } from '../user/user.entity';
import { RemindersGateway } from './reminder.gateway';
import { RemindersProcessor } from './reminder.processor';

@Module({
  imports: [
    MikroOrmModule.forFeature({ entities: [Task, User] }),
    BullModule.registerQueue(
      {
        name: 'mail',
      },
      {
        name: 'reminders',
      },
    ),
    UserModule,
  ],
  providers: [
    TaskService,
    UserRepository,
    RemindersProcessor,
    RemindersGateway,
  ],
  controllers: [TaskController],
})
export class TaskModule {}

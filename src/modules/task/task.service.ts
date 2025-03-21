// src/tasks/tasks.service.ts
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
  EntityManager,
  EntityRepository,
  FilterQuery,
  QueryOrder,
  wrap,
} from '@mikro-orm/mysql';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { UpdateTaskDto } from './dto/update-task.dto';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { fromUTC, toUTC } from '../../utils/date.utils';

export enum Status {
  Active = 'active',
  Completed = 'completed',
}

@Injectable()
export class TaskService {
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(Task)
    private readonly repo: EntityRepository<Task>,
    @InjectQueue('mail') private readonly mailQueue: Queue,
    @InjectQueue('reminders') private readonly remindersQueue: Queue,
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    private readonly userService: UserService,
  ) {
    console.log('EntityManager:', this.em),
      console.log('TaskRepository:', this.repo);
  }

  async findAll(userId: number): Promise<Task[]> {
    const user = await this.userRepository.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.repo.find({ user: userId, deletedAt: null });
  }
  
  async findOne(id: number, userId: number): Promise<Task> {
    const user = await this.userRepository.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const task = await this.repo.findOne({ id, user: userId, deletedAt: null });
    if (!task) {
      throw new NotFoundException(
        `Task with ID ${id} not found for the current user`,
      );
    }
    return task;
  }

  async findByStatus(
    status: 'active' | 'completed',
    userId: number,
  ): Promise<Task[]> {
    const user = await this.userRepository.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.repo.find({ status, user: userId });
  }

  async create(createTaskDto: CreateTaskDto, userId: number): Promise<Task> {
    let user = await this.userRepository.findOne(userId);
    const user1 = await this.userService.findById(userId);
    let userEmail = user1.user.email;
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const task = this.repo.create({
      ...createTaskDto,
      dueDate: createTaskDto.dueDate
        ? fromUTC(createTaskDto.dueDate)
        : undefined,
      user,
    });
    try {
      await this.em.persistAndFlush(task);
    } catch (error) {
      console.log(error);
      throw new Error('Error creating task');
    }

    if (task.dueDate) {
      await this.scheduleEmail(task, userEmail);
    }

    if (task.reminderEnabled && task.dueDate && task.reminderTimeGapMinutes) {
      await this.scheduleReminder(task);
    }
    return task;
  }

  async update(
    id: number,
    updateTaskDto: UpdateTaskDto,
    userId: number,
  ): Promise<Task> {
    const user = await this.userRepository.findOne(userId);
    const user1 = await this.userService.findById(userId);
    let userEmail = user1.user.email;
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const task = await this.findOne(id, userId);
    const wasReminderEnabled = task.reminderEnabled;
    const wasCompleted = task.status === Status.Completed;
    this.repo.assign(task, updateTaskDto);
    await this.em.persistAndFlush(task);

    if (task.dueDate) {
      if (!wasCompleted && task.status === Status.Completed) {
        await this.cancelScheduledEmail(id);
      } else {
        await this.scheduleEmail(task, userEmail);
      }
    }

    if (task.reminderEnabled && task.dueDate && task.reminderTimeGapMinutes) {
      await this.cancelReminder(id);
      await this.scheduleReminder(task);
    } else if (wasReminderEnabled) {
      await this.cancelReminder(id);
    }
    return task;
  }

  async remove(id: number, userId: number): Promise<void> {
    const user = await this.userRepository.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const task = await this.findOne(id, userId);
    await this.cancelReminder(id);
    await this.cancelScheduledEmail(id);
    task.deletedAt = new Date();
    await this.em.persistAndFlush(task);
  }

  async findExpiredTasks(currentTime: Date): Promise<Task[]> {
    return this.repo.find({
      dueDate: { $lt: currentTime },
      isTimerExpired: false,
      status: 'active',
    });
  }

  async scheduleEmail(task: Task, userEmail: string): Promise<void> {
    const delay = task.dueDate!.getTime() - Date.now();
    
    if (delay <= 0) {
      console.log('Due date has already passed');
      return;
    }

    await this.mailQueue.add(
      'send-timer-expired-email',
      { task, userEmail },
      {
        delay,
        attempts: 3,
      },
    );
  }

  async cancelScheduledEmail(taskId: number): Promise<void> {
    const jobs = await this.mailQueue.getJobs(['delayed']);
    for (const job of jobs) {
      if (job.data.task.id === taskId) {
        await job.remove();
      }
    }
  }

  async scheduleReminder(task: Task): Promise<void> {
    if (!task.dueDate || !task.reminderTimeGapMinutes) return;

    const reminderTime = new Date(
      task.dueDate.getTime() - task.reminderTimeGapMinutes * 60 * 1000,
    );
    const delay = reminderTime.getTime() - Date.now();

    if (delay <= 0) {
      console.log(
        `Reminder time for task ID ${task.id} has already passed. Skipping reminder scheduling.`,
      );
      return;
    }

    await this.remindersQueue.add(
      'send-task-reminder',
      { taskId: task.id, userId: task.user.id },
      {
        delay,
        attempts: 3,
      },
    );
    console.log(`Scheduled reminder for task ID ${task.id} in ${delay}ms.`);
  }

  async cancelReminder(taskId: number): Promise<void> {
    const jobs = await this.remindersQueue.getJobs(['delayed']);
    for (const job of jobs) {
      if (job.data.taskId === taskId) {
        await job.remove();
        console.log(`Cancelled scheduled reminder for task ID ${taskId}.`);
      }
    }
  }
}

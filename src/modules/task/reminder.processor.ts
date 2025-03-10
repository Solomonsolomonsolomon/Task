// src/tasks/reminders.processor.ts
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import { MikroORM } from '@mikro-orm/core';
import { Task } from './task.entity';
import { RemindersGateway } from './reminder.gateway';

@Processor('reminders')
@Injectable()
export class RemindersProcessor {
  private readonly logger = new Logger(RemindersProcessor.name);

  constructor(
    private readonly orm: MikroORM,
    private readonly remindersGateway: RemindersGateway,
  ) {}

  @Process('send-task-reminder')
  async handleSendTaskReminder(job: Job<{ taskId: number }>) {
    const { taskId } = job.data;
    this.logger.log(`Processing reminder for task ID ${taskId}.`);

    try {
      const em = this.orm.em.fork();

      const task = await em.findOne(Task, taskId, { populate: ['user'] });

      if (!task) {
        this.logger.warn(
          `Task with ID ${taskId} not found. Skipping reminder.`,
        );
        return;
      }

      if (!task.reminderEnabled || !task.dueDate) {
        this.logger.warn(
          `Reminders are disabled or dueDate is missing for task ID ${taskId}.`,
        );
        return;
      }

      const userId = task.user.id;

      this.remindersGateway.sendTaskReminder(userId, task);
      this.logger.log(
        `Sent reminder for task ID ${taskId} to user ID ${userId}.`,
      );
    } catch (error) {
      this.logger.error(
        `Error processing reminder for task ID ${taskId}:`,
        error,
      );
      throw error;
    }
  }
}

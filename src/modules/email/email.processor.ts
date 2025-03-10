// src/email/email.processor.ts
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { EmailService } from './email.service';
import { Task } from '../task/task.entity';
import { User } from '../user/user.entity';

@Processor('mail')
export class EmailProcessor {
  constructor(private readonly emailService: EmailService) {}

  @Process('send-timer-expired-email')
  async handleSendTimerExpiredEmail(
    job: Job<{ task: Task; userEmail: String }>,
  ) {
    console.log('Processing send-timer-expired-email job');
    const { task, userEmail } = job.data;
    console.log(job.data);
    await this.emailService.sendTimerExpiredEmail(task, userEmail);
  }
}

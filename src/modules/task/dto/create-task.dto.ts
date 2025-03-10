// src/tasks/dto/create-task.dto.ts
import {
  IsString,
  IsOptional,
  IsEnum,
  IsDate,
  IsBoolean,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Status } from '../task.service';

export class CreateTaskDto {

  @ApiPropertyOptional({
    description: 'Detailed description of the task',
    example: 'Clean the specified area thoroughly.',
  })
  @IsOptional()
  @IsString()
  description!: string;

  @ApiPropertyOptional({
    description: 'Status of the task',
    enum: Status,
    default: Status.Active,
    example: Status.Active,
  })
  @IsOptional()
  @IsEnum(Status)
  status!: Status.Active | Status.Completed;

  @ApiPropertyOptional({
    description: 'Due date of the task',
    example: '2024-10-03T14:22:10.000Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dueDate?: Date;

  @ApiPropertyOptional({
    description: 'Enable reminders for the task',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  reminderEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Time gap in minutes before due date to send a reminder',
    example: 30,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  reminderTimeGapMinutes?: number;
}

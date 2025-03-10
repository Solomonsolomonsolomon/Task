// // src/tasks/dto/update-task.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';
import { IsOptional, IsBoolean, IsString } from 'class-validator';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {}
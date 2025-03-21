import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { Task } from './task.entity';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AuthGuard } from '../auth/auth.guard';
import { User } from '../user/user.decorator';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('tasks')
export class TaskController {
  constructor(private tasksService: TaskService) {
    console.log('TasksService:', this.tasksService);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({
    status: 201,
    description: 'The task has been successfully created.',
    type: Task,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async createTask(
    @Body() createTaskDto: CreateTaskDto,
    @User('id') userId: number,
  ): Promise<Task> {
    console.log(createTaskDto, 'Creating Task');
    return this.tasksService.create(createTaskDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all tasks for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'List of tasks retrieved successfully.',
    type: [Task],
  })
  async findAll(@User('id') userId: number): Promise<Task[]> {
    return this.tasksService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a specific task by ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the task to retrieve',
  })
  @ApiResponse({
    status: 200,
    description: 'Task retrieved successfully.',
    type: Task,
  })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @User('id') userId: number,
  ): Promise<Task> {
    return this.tasksService.findOne(id, userId);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Retrieve tasks filtered by status' })
  @ApiParam({
    name: 'status',
    type: String,
    enum: ['active', 'completed'],
    description: 'Status to filter tasks by',
  })
  @ApiResponse({
    status: 200,
    description: 'Tasks filtered by status.',
    type: [Task],
  })
  findByStatus(
    @Param('status') status: 'active' | 'completed',
    @User('id') userId: number,
  ): Promise<Task[]> {
    return this.tasksService.findByStatus(status, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing task by ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the task to update',
  })
  @ApiResponse({
    status: 200,
    description: 'Task updated successfully.',
    type: Task,
  })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
    @User('id') userId: number,
  ): Promise<Task> {
    return this.tasksService.update(id, updateTaskDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task by ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID of the task to delete',
  })
  @ApiResponse({ status: 204, description: 'Task deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @User('id') userId: number,
  ): Promise<void> {
    return this.tasksService.remove(id, userId);
  }
}

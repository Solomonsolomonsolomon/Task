import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class RemindersGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private logger: Logger = new Logger('RemindersGateway');

  private userSockets: Map<number, Socket> = new Map();

  handleConnection(client: Socket, ...args: any[]) {
    const configService=new ConfigService();
    const SECRET=configService.get('SECRET')
    const token = client.handshake.query.token;
    if (token && typeof token === 'string') {
      try {
        const decoded: any = jwt.verify(token, SECRET);
        const userId = decoded.id;
        if (userId) {
          this.userSockets.set(userId, client);
          this.logger.log(`User ${userId} connected via WebSocket.`);
        } else {
          this.logger.warn('JWT token does not contain user ID.');
          client.disconnect();
        }
      } catch (error) {
        this.logger.warn('Invalid JWT token. Disconnecting client.');
        client.disconnect();
      }
    } else {
      this.logger.warn('No JWT token provided. Disconnecting client.');
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socket] of this.userSockets.entries()) {
      if (socket.id === client.id) {
        this.userSockets.delete(userId);
        this.logger.log(`User ${userId} disconnected from WebSocket.`);
        break;
      }
    }
  }

  sendTaskReminder(userId: number, task: any) {
    const socket = this.userSockets.get(userId);
    if (socket) {
      socket.emit('task-reminder', {
        message: `Reminder: Task "${task.description}" is due at ${new Date(
          task.dueDate,
        ).toLocaleString()}`,
        task,
      });
      this.logger.log(
        `Sent reminder for task ID ${task.id} to user ID ${userId}.`,
      );
    } else {
      this.logger.warn(
        `No active WebSocket connection for user ID ${userId}. Cannot send reminder.`,
      );
    }
  }
}

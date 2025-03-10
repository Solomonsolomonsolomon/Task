import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import jwt from 'jsonwebtoken';

import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly userService: UserService,private configService:ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.split(' ')[1];
      if (token) {
        try {
          const SECRET=this.configService.get('SECRET')
          const decoded: any = jwt.verify(token, SECRET);
          const user = await this.userService.findById(decoded.id);
          if (!user) {
            throw new UnauthorizedException('User not found.');
          }
          req.user = user.user;
          req.user.id = decoded.id;
          return true;
        } catch (error) {
          throw new UnauthorizedException('Invalid token.');
        }
      }
    }
    throw new UnauthorizedException('Not authorized.');
  }
}

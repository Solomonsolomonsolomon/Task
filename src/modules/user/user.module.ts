import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { UserService } from './user.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';

@Module({
  controllers: [UserController],
  exports: [UserService, MikroOrmModule],
  imports: [MikroOrmModule.forFeature({ entities: [User] })],
  providers: [UserService],
})
export class UserModule {}

import {
  MiddlewareConsumer,
  Module,
  NestModule,
  OnModuleInit,
} from '@nestjs/common';
import { MikroORM } from '@mikro-orm/mysql';
import { MikroOrmMiddleware, MikroOrmModule } from '@mikro-orm/nestjs';

import { AppController } from './app.controller';
import { UserModule } from './modules/user/user.module';
import { TaskModule } from './modules/task/task.module';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailModule } from './modules/email/email.module';

@Module({
  controllers: [AppController],
  imports: [

   ConfigModule.forRoot({
    isGlobal:true,
    envFilePath: '.env'
   }),

    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST') || 'localhost',
          port: configService.get<number>('REDIS_PORT') || 6379,
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      {
        name: 'mail',
      },
      {
        name: 'reminders',
      },
    ),

    MikroOrmModule.forRoot(),
    UserModule,
    TaskModule,
    EmailModule,
  ],
  providers: [],
})
export class AppModule implements NestModule, OnModuleInit {
  constructor(private readonly orm: MikroORM) {}

  async onModuleInit(): Promise<void> {
    await this.orm.getMigrator().up();
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MikroOrmMiddleware).forRoutes('*');
  }
}

import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const appOptions = { cors: true };
  const app = await NestFactory.create(AppModule, appOptions);


  const options = new DocumentBuilder()
    .setTitle('Task Management API')
    .setDescription('A simple task management API to demonstrate the usage of authentication and authorization and bull queue')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('/docs', app, document);

  await app.listen(3000);
}
bootstrap()
  .catch((err) => {
    console.log(err);
  });

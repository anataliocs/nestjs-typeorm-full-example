import { NestApplication, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, VersioningType } from '@nestjs/common';
import { NestApplicationOptions } from '@nestjs/common/interfaces/nest-application-options.interface';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: false, // Only disable CORS locally
  } as NestApplicationOptions);

  const config = new DocumentBuilder()
    .setTitle('Reap API example')
    .setDescription('The Reap API description')
    .setVersion('1.0')
    .addTag('stablecoin')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  app.enableVersioning({
    type: VersioningType.URI,
  });
  const DEFAULT_PORT = 3000;
  await app.listen(process.env.PORT ?? DEFAULT_PORT);

  const logger = new Logger(NestApplication.name);

  logger.log(
    `Application is running on: http://${process.env.APP_URL}:${process.env.PORT ?? DEFAULT_PORT}`,
  );
  logger.log(
    `Swagger docs are at: http://${process.env.APP_URL}:${process.env.PORT ?? DEFAULT_PORT}/api`,
  );
}

void bootstrap();

import { NestApplication, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, VersioningType } from '@nestjs/common';
import { NestApplicationOptions } from '@nestjs/common/interfaces/nest-application-options.interface';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

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

  //TODO only enable this is local an dev envs
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:63343',
      'http://localhost:63342',
      'http://localhost:63342/index.html',
    ],
    credentials: true,
    preflightContinue: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    exposedHeaders: ['Access-Control-Allow-Credentials', true],
    allowedHeaders: [
      'Access-Control-Allow-Headers',
      'Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization',
      'Access-Control-Allow-Credentials',
      true,
    ],
  } as CorsOptions);

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
  logger.log(`Reap API docs are at: ${process.env.REAP_DOCS}`);
}

void bootstrap();

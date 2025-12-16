import { NestApplication, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, VersioningType } from '@nestjs/common';
import { NestApplicationOptions } from '@nestjs/common/interfaces/nest-application-options.interface';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { WsAdapter } from '@nestjs/platform-ws';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: false, // Only disable CORS locally
  } as NestApplicationOptions);

  const logger = new Logger(NestApplication.name);

  const config = new DocumentBuilder()
    .setTitle('Web3 SDK/API integration examples')
    .setDescription(
      'Examples of integrating Web3 SDK/APIs into NestJS applications.',
    )
    .setVersion('1.0')
    .addTag('reap, peaq, wormhole, sdk, web3, nestjs')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
  logger.log(`Swagger Open API docs enabled: ${config.info.title}`);

  //TODO only enable this is local an dev envs
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:63343',
      'http://localhost:63342',
      'http://localhost:63342/nestjs-typeorm-full-example/client/src/mock-sse.html',
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
  logger.warn(`WARNING: CORS is enabled for local development only.`);

  app.enableVersioning({
    type: VersioningType.URI,
  });
  logger.log(`API versioning enabled.`);

  app.useWebSocketAdapter(new WsAdapter(app));
  const DEFAULT_PORT = 3000;
  await app.listen(process.env.PORT ?? DEFAULT_PORT);

  logger.log(
    `Application is running on: http://${process.env.APP_URL}:${process.env.PORT ?? DEFAULT_PORT}`,
  );
  logger.log(
    `Swagger docs are at: http://${process.env.APP_URL}:${process.env.PORT ?? DEFAULT_PORT}/api`,
  );
  logger.log(
    `Swagger JSON is at: http://${process.env.APP_URL}:${process.env.PORT ?? DEFAULT_PORT}/api-json`,
  );
}

void bootstrap();

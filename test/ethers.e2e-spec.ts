import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { Wait } from 'testcontainers';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let container: StartedPostgreSqlContainer;

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:13.3-alpine')
      .withWaitStrategy(Wait.forListeningPorts())
      .start();

    process.env.POSTGRES_HOST = container.getHost();
    process.env.POSTGRES_PORT = container.getMappedPort(5432).toString();
    process.env.POSTGRES_USER = container.getUsername();
    process.env.POSTGRES_PW = container.getPassword();
    process.env.POSTGRES_DB = container.getDatabase();
  }, 60000);

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (container) await container.stop();
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/ethers/server-status')
      .expect(200)
      .expect('Connected');
  });
});

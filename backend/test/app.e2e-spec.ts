import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { describe, beforeEach, it, expect, jest, afterEach } from '@jest/globals';



describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        $queryRaw: jest.fn<any>().mockResolvedValue([{ 1: 1 }]),
        $connect: jest.fn<any>().mockResolvedValue(undefined),
        $disconnect: jest.fn<any>().mockResolvedValue(undefined),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('status', 'UP');
        expect(res.body.services.database).toHaveProperty('status', 'UP');
      });
  });

  afterEach(async () => {
    await app.close();
  });
});


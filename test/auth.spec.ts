import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { TestService } from './test.service';
import { TestModule } from './test.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let logger: Logger;
  let testService: TestService;
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    logger = app.get(WINSTON_MODULE_PROVIDER);
    testService = app.get(TestService);
  });

  describe('POST /api/v1/auth/register', () => {
    beforeEach(async () => {
      await testService.deleteUser();
    });

    it('should be rejected if request is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          full_name: '',
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
        });
      logger.info(response.body);
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to register', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          full_name: 'Roihan Sori',
          username: 'roihan20',
          email: 'roihansori20@gmail.com',
          password: '12345678',
          confirmPassword: '12345678',
        });
      logger.info(response.body);
      expect(response.status).toBe(201);
      expect(response.body.data).toBeDefined();
    });
  });

  it('should be rejected if username already exist', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        full_name: 'test',
        username: 'roihan20',
        email: 'test@gmail.com',
        password: '12345678',
        confirmPassword: '12345678',
      });
    logger.info(response.body);
    expect(response.status).toBe(409);
    expect(response.body.errors).toBeDefined();
  });

  it('should be rejected if email already exist', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        full_name: 'test',
        username: 'test',
        email: 'roihansori20@gmail.com',
        password: '12345678',
        confirmPassword: '12345678',
      });
    logger.info(response.body);
    expect(response.status).toBe(409);
    expect(response.body.errors).toBeDefined();
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await testService.deleteUser();
      await testService.createUser();
    });

    it('should be rejected if request is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: '',
          password: '',
        });
      logger.info(response.body);
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to login', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@gmail.com',
          password: '12345678',
        });
      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.access_token).toBeDefined();
    });
  });
});

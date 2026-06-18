import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { describe, beforeEach, it, expect, jest } from '@jest/globals';



describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            getHello: jest.fn<any>().mockResolvedValue({
              status: 'UP',
              timestamp: new Date().toISOString(),
              services: {
                database: { status: 'UP', provider: 'Supabase (US Pooler)' },
                api: { status: 'UP', uptime: 123 },
              },
            }),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('checkHealth', () => {
    it('should return health status data', async () => {
      const result = await appController.checkHealth();
      expect(result).toHaveProperty('status', 'UP');
      expect(appService.getHello).toHaveBeenCalled();
    });
  });
});


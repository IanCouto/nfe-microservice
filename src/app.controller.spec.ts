import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let controller: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();
    controller = module.get<AppController>(AppController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getHello should return API name', () => {
    expect(controller.getHello()).toBe('NF-e Microservice API');
  });

  it('health should return status ok', () => {
    expect(controller.health()).toEqual({ status: 'ok' });
  });
});

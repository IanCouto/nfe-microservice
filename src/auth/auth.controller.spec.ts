import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const mockAuth = {
      login: jest.fn().mockResolvedValue({ access_token: 'token' }),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuth }],
    }).compile();
    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('login should call authService.login and return token', async () => {
    const result = await controller.login({ username: 'admin', password: 'admin' });
    expect(result).toEqual({ access_token: 'token' });
  });
});

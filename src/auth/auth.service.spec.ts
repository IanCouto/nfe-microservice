import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  const originalEnv = process.env;

  beforeEach(async () => {
    jest.resetModules();
    process.env = { ...originalEnv };

    const mockJwt = {
      sign: jest.fn().mockReturnValue('fake-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return access_token for default admin/admin', async () => {
      const result = await service.login('admin', 'admin');
      expect(result).toEqual({ access_token: 'fake-jwt-token' });
      expect(jwtService.sign).toHaveBeenCalledWith({ sub: 'admin' });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      await expect(service.login('wrong', 'admin')).rejects.toThrow(UnauthorizedException);
      await expect(service.login('admin', 'wrong')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUser', () => {
    it('should return user from payload', async () => {
      const result = await service.validateUser({ sub: 'admin' });
      expect(result).toEqual({ username: 'admin' });
    });
  });
});

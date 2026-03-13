import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from './auth.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    const mockAuth = {
      validateUser: jest.fn().mockResolvedValue({ username: 'admin' }),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: AuthService, useValue: mockAuth },
      ],
    }).compile();
    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('validate should return user from AuthService', async () => {
    const result = await strategy.validate({ sub: 'admin' });
    expect(result).toEqual({ username: 'admin' });
  });

  it('validate should throw UnauthorizedException when validateUser returns null', async () => {
    const mod = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: AuthService, useValue: { validateUser: jest.fn().mockResolvedValue(null) } },
      ],
    }).compile();
    const s = mod.get<JwtStrategy>(JwtStrategy);
    await expect(s.validate({ sub: 'x' })).rejects.toThrow(UnauthorizedException);
  });
});

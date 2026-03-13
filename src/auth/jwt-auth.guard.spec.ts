import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from './jwt-auth.guard';
import { IS_PUBLIC_KEY } from './public.decorator';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const mockReflector = {
      getAllAndOverride: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        { provide: Reflector, useValue: mockReflector },
      ],
    }).compile();
    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('canActivate should return true when route is public', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(true);
    const ctx = {
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('canActivate should use reflector with IS_PUBLIC_KEY', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(true);
    const ctx = {
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
    guard.canActivate(ctx);
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
  });
});

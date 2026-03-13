import { Public, IS_PUBLIC_KEY } from './public.decorator';

describe('Public decorator', () => {
  it('should return a decorator function', () => {
    const result = Public();
    expect(result).toBeDefined();
    expect(typeof result).toBe('function');
  });

  it('IS_PUBLIC_KEY should be string isPublic', () => {
    expect(IS_PUBLIC_KEY).toBe('isPublic');
  });
});

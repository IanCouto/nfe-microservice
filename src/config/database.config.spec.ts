import databaseConfig from './database.config';

describe('database.config', () => {
  it('should export a config factory', () => {
    expect(databaseConfig).toBeDefined();
    expect(typeof databaseConfig).toBe('function');
  });

  it('should return default values when env is not set', () => {
    const config = databaseConfig();
    expect(config).toMatchObject({
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'nfe_db',
    });
  });
});

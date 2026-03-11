/**
 * Configuração do banco de dados (PostgreSQL) via variáveis de ambiente.
 * Usado pelo TypeORM no AppModule.
 */
import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'nfe_db',
}));

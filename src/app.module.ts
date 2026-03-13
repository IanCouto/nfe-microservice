/**
 * Módulo raiz da aplicação: configura env, TypeORM (PostgreSQL), Auth, NF-e e Webhook.
 * JWT pode ser exigido globalmente via JWT_REQUIRED=true.
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import databaseConfig from './config/database.config';
import { Cliente, NotaFiscal, NotaFiscalItem, Produto } from './entities';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { NfeModule } from './nfe/nfe.module';
import { WebhookModule } from './webhook/webhook.module';
import { ClientesModule } from './clientes/clientes.module';
import { ProdutosModule } from './produtos/produtos.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_DATABASE || 'nfe_db',
        entities: [Cliente, Produto, NotaFiscal, NotaFiscalItem],
        // DB_SYNC=true no Docker cria as tabelas na primeira subida; em produção real use migrations
        synchronize: process.env.DB_SYNC === 'true' || process.env.NODE_ENV !== 'production',
        logging: process.env.NODE_ENV === 'development',
      }),
    }),
    AuthModule,
    ClientesModule,
    ProdutosModule,
    NfeModule,
    WebhookModule,
    SeedModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ...(process.env.JWT_REQUIRED === 'true'
      ? [{ provide: APP_GUARD, useClass: JwtAuthGuard }]
      : []),
  ],
})
export class AppModule {}

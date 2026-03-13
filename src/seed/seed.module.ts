/**
 * Módulo de seed: popula o banco com dados iniciais quando SEED_DB=true.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cliente, NotaFiscal, NotaFiscalItem, Produto } from '../entities';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cliente, Produto, NotaFiscal, NotaFiscalItem]),
  ],
  providers: [SeedService],
})
export class SeedModule {}

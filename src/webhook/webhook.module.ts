import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotaFiscal } from '../entities';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';

@Module({
  imports: [TypeOrmModule.forFeature([NotaFiscal])],
  controllers: [WebhookController],
  providers: [WebhookService],
})
export class WebhookModule {}

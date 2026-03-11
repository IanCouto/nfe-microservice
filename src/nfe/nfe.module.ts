import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cliente, NotaFiscal, NotaFiscalItem, Produto } from '../entities';
import { NfeController } from './nfe.controller';
import { NfeService } from './nfe.service';
import { NfeRepository } from './nfe.repository';
import { NfeValidationService } from './nfe-validation.service';
import { SefazMockService } from './sefaz/sefaz-mock.service';
import { XmlValidatorService } from './sefaz/xml-validator.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotaFiscal, NotaFiscalItem, Cliente, Produto]),
  ],
  controllers: [NfeController],
  providers: [
    NfeService,
    NfeRepository,
    NfeValidationService,
    SefazMockService,
    XmlValidatorService,
  ],
  exports: [NfeService],
})
export class NfeModule {}

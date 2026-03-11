import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Cliente } from './cliente.entity';
import { NotaFiscalItem } from './nota-fiscal-item.entity';

export type StatusNFe = 'em_processamento' | 'autorizada' | 'rejeitada';

@Entity('notas_fiscais')
export class NotaFiscal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'numero', unique: true })
  numero: string;

  @Column({ name: 'serie', length: 3, default: '1' })
  serie: string;

  @Column({ name: 'emitente_id' })
  emitenteId: string;

  @ManyToOne(() => Cliente, (c) => c.notasFiscais)
  @JoinColumn({ name: 'emitente_id' })
  emitente: Cliente;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 20,
    default: 'em_processamento',
  })
  status: StatusNFe;

  @Column({ name: 'protocolo_autorizacao', length: 50, nullable: true })
  protocoloAutorizacao: string | null;

  @Column({ name: 'xml_autorizado', type: 'text', nullable: true })
  xmlAutorizado: string | null;

  @Column({ name: 'xml_enviado', type: 'text', nullable: true })
  xmlEnviado: string | null;

  @Column({ name: 'motivo_rejeicao', type: 'text', nullable: true })
  motivoRejeicao: string | null;

  @Column({ name: 'destinatario_cnpj', length: 14 })
  destinatarioCnpj: string;

  @Column({ name: 'destinatario_ie', length: 20, nullable: true })
  destinatarioIe: string | null;

  @Column({ name: 'destinatario_razao_social', length: 255 })
  destinatarioRazaoSocial: string;

  @Column({ name: 'valor_total', type: 'decimal', precision: 18, scale: 4, default: 0 })
  valorTotal: number;

  @Column({ name: 'chave_acesso', length: 44, nullable: true })
  chaveAcesso: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => NotaFiscalItem, (item) => item.notaFiscal, { cascade: true })
  itens: NotaFiscalItem[];
}

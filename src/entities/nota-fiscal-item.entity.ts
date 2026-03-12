/**
 * Entidade Item da Nota Fiscal: linha da NF-e (produto, quantidade, valor, CFOP, CST, NCM).
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { NotaFiscal } from './nota-fiscal.entity';
import { Produto } from './produto.entity';

@Entity('nota_fiscal_itens')
export class NotaFiscalItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'nota_fiscal_id', type: 'uuid' })
  notaFiscalId: string;

  @ManyToOne(() => NotaFiscal, (nfe) => nfe.itens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'nota_fiscal_id' })
  notaFiscal: NotaFiscal;

  @Column({ name: 'produto_id', type: 'uuid', nullable: true })
  produtoId: string | null;

  @ManyToOne(() => Produto, { nullable: true })
  @JoinColumn({ name: 'produto_id' })
  produto: Produto | null;

  @Column({ name: 'descricao', type: 'varchar', length: 255 })
  descricao: string;

  @Column({ type: 'decimal', precision: 18, scale: 4 })
  quantidade: number;

  @Column({ name: 'valor_unitario', type: 'decimal', precision: 18, scale: 4 })
  valorUnitario: number;

  @Column({ name: 'valor_total', type: 'decimal', precision: 18, scale: 4 })
  valorTotal: number;

  @Column({ name: 'cfop', type: 'text', nullable: true })
  cfop: string | null;

  @Column({ name: 'cst', type: 'text', nullable: true })
  cst: string | null;

  @Column({ name: 'ncm', type: 'text', nullable: true })
  ncm: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

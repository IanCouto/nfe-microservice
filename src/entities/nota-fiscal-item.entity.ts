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

  @Column({ name: 'nota_fiscal_id' })
  notaFiscalId: string;

  @ManyToOne(() => NotaFiscal, (nfe) => nfe.itens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'nota_fiscal_id' })
  notaFiscal: NotaFiscal;

  @Column({ name: 'produto_id', nullable: true })
  produtoId: string | null;

  @ManyToOne(() => Produto, { nullable: true })
  @JoinColumn({ name: 'produto_id' })
  produto: Produto | null;

  @Column({ length: 255 })
  descricao: string;

  @Column({ type: 'decimal', precision: 18, scale: 4 })
  quantidade: number;

  @Column({ name: 'valor_unitario', type: 'decimal', precision: 18, scale: 4 })
  valorUnitario: number;

  @Column({ name: 'valor_total', type: 'decimal', precision: 18, scale: 4 })
  valorTotal: number;

  @Column({ length: 4, nullable: true })
  cfop: string | null;

  @Column({ length: 3, nullable: true })
  cst: string | null;

  @Column({ name: 'ncm', length: 10, nullable: true })
  ncm: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

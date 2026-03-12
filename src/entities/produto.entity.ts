/**
 * Entidade Produto: cadastro de produtos (descrição, NCM, CST, CFOP, valor).
 * Pode ser referenciado nos itens da nota fiscal.
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('produtos')
export class Produto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'descricao', type: 'varchar', length: 255 })
  descricao: string;

  @Column({ name: 'codigo', type: 'varchar', length: 20, nullable: true })
  codigo: string | null;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  valorUnitario: number;

  @Column({ name: 'unidade', type: 'varchar', length: 10, default: 'UN' })
  unidade: string;

  @Column({ name: 'ncm', type: 'varchar', length: 10, nullable: true })
  ncm: string | null;

  @Column({ name: 'cst', type: 'varchar', length: 3, nullable: true })
  cst: string | null;

  @Column({ name: 'cfop', type: 'varchar', length: 4, nullable: true })
  cfop: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

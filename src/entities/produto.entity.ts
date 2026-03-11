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

  @Column({ length: 255 })
  descricao: string;

  @Column({ length: 20, nullable: true })
  codigo: string;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  valorUnitario: number;

  @Column({ length: 10, default: 'UN' })
  unidade: string;

  @Column({ name: 'ncm', length: 10, nullable: true })
  ncm: string;

  @Column({ name: 'cst', length: 3, nullable: true })
  cst: string;

  @Column({ name: 'cfop', length: 4, nullable: true })
  cfop: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

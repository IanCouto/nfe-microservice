/**
 * Entidade Cliente: emitente ou destinatário de NF-e (razão social, CNPJ, IE, endereço).
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { NotaFiscal } from './nota-fiscal.entity';

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'razao_social', type: 'varchar', length: 255 })
  razaoSocial: string;

  @Column({ name: 'nome_fantasia', type: 'varchar', length: 255, nullable: true })
  nomeFantasia: string | null;

  @Column({ name: 'cnpj', type: 'varchar', length: 14, unique: true })
  cnpj: string;

  @Column({ name: 'inscricao_estadual', type: 'varchar', length: 20, nullable: true })
  inscricaoEstadual: string | null;

  @Column({ name: 'endereco', type: 'varchar', length: 255, nullable: true })
  endereco: string | null;

  @Column({ name: 'municipio', type: 'varchar', length: 255, nullable: true })
  municipio: string | null;

  @Column({ name: 'uf', type: 'varchar', length: 2, nullable: true })
  uf: string | null;

  @Column({ name: 'cep', type: 'varchar', length: 10, nullable: true })
  cep: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => NotaFiscal, (nfe) => nfe.emitente)
  notasFiscais: NotaFiscal[];
}

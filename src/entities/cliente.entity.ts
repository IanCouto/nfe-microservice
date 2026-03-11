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

  @Column({ name: 'razao_social', length: 255 })
  razaoSocial: string;

  @Column({ name: 'nome_fantasia', length: 255, nullable: true })
  nomeFantasia: string;

  @Column({ length: 14, unique: true })
  cnpj: string;

  @Column({ name: 'inscricao_estadual', length: 20, nullable: true })
  inscricaoEstadual: string | null;

  @Column({ length: 255, nullable: true })
  endereco: string;

  @Column({ length: 10, nullable: true })
  municipio: string;

  @Column({ length: 2, nullable: true })
  uf: string;

  @Column({ length: 10, nullable: true })
  cep: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => NotaFiscal, (nfe) => nfe.emitente)
  notasFiscais: NotaFiscal[];
}

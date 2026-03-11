/**
 * Serviço da aplicação raiz: mensagem de identificação da API.
 */
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  /** Retorna o nome da API para a rota GET /. */
  getHello(): string {
    return 'NF-e Microservice API';
  }
}

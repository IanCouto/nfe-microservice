/**
 * Controller raiz da API: rota de boas-vindas e health check.
 */
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /** Retorna mensagem de boas-vindas do microserviço (rota pública). */
  @Get()
  @Public()
  getHello(): string {
    return this.appService.getHello();
  }

  /** Health check para monitoramento e load balancers (rota pública). */
  @Get('health')
  @Public()
  health(): { status: string } {
    return { status: 'ok' };
  }
}

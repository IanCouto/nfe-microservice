/**
 * Ponto de entrada da aplicação NF-e.
 * Inicializa o NestJS, pipe de validação global, Swagger e sobe o servidor HTTP.
 */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

/** Inicializa e sobe a API REST do microserviço de NF-e. */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Validação global: remove campos não declarados e transforma tipos (ex.: string -> number)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Documentação OpenAPI (Swagger) em /api
  const config = new DocumentBuilder()
    .setTitle('NF-e Microservice API')
    .setDescription('API para emissão de Nota Fiscal Eletrônica - Desafio Técnico Backend')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger: http://localhost:${port}/api`);
}
bootstrap();

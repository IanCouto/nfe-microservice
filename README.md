# NF-e Microservice – Desafio Técnico Backend

Microserviço de emissão de **Nota Fiscal Eletrônica (NF-e)** com API RESTful, integração com ambiente de homologação SEFAZ (mock), validação de XML e persistência em PostgreSQL.

## Requisitos

- **Node.js** 18+ (recomendado 20)
- **PostgreSQL** 14+ (ou use Docker)
- **npm** 9+

## Instalação e execução

### 1. Clonar e instalar dependências

```bash
git clone <repo-url>
cd backend
npm install
```

### 2. Variáveis de ambiente

Copie o arquivo de exemplo e ajuste se necessário:

```bash
cp .env.example .env
```

Principais variáveis:

| Variável        | Descrição                    | Padrão     |
|----------------|-----------------------------|------------|
| `PORT`         | Porta da API                | 3000       |
| `DB_HOST`      | Host do PostgreSQL          | localhost  |
| `DB_PORT`      | Porta do PostgreSQL         | 5432       |
| `DB_USERNAME`  | Usuário do banco            | postgres   |
| `DB_PASSWORD`  | Senha do banco              | postgres   |
| `DB_DATABASE`  | Nome do banco               | nfe_db     |
| `JWT_SECRET`   | Chave para tokens JWT       | (ver .env.example) |
| `JWT_REQUIRED` | Exigir JWT nas rotas (true/false) | (opcional, default não exige) |

### 3. Banco de dados

**Opção A – Docker (recomendado)**

Subir apenas o PostgreSQL para desenvolvimento:

```bash
docker-compose -f docker-compose.dev.yml up -d
```

Criar o banco (se não existir):

```bash
# PostgreSQL cria o DB automaticamente com docker-compose.dev.yml
```

**Opção B – App + PostgreSQL com Docker**

```bash
docker-compose up -d
```

A API estará em `http://localhost:3000`.

### 4. Rodar a aplicação

**Desenvolvimento (watch mode):**

```bash
npm run start:dev
```

**Produção:**

```bash
npm run build
npm run start:prod
```

A API estará em **http://localhost:3000**.

## Documentação da API (Swagger)

Com a aplicação rodando:

- **Swagger UI:** http://localhost:3000/api

## Endpoints principais

| Método | Rota              | Descrição                                      |
|--------|-------------------|-------------------------------------------------|
| GET    | `/`               | Mensagem de boas-vindas                         |
| GET    | `/health`         | Health check                                    |
| POST   | `/nfe`            | Enviar NF-e para emissão                        |
| GET    | `/nfe/:id`        | Consultar status da NF-e                        |
| GET    | `/nfe/:id/xml`    | Obter XML da NF-e autorizada                    |
| POST   | `/webhook/retorno-sefaz` | Simular retorno/callback da SEFAZ (homologação) |
| POST   | `/auth/login`     | Login e obter JWT (opcional)                    |

### Exemplo – Emitir NF-e

```bash
curl -X POST http://localhost:3000/nfe \
  -H "Content-Type: application/json" \
  -d '{
    "emitenteCnpj": "11222333000181",
    "emitenteRazaoSocial": "Empresa Emitente LTDA",
    "destinatarioCnpj": "06990590000123",
    "destinatarioRazaoSocial": "Empresa Destino SA",
    "itens": [
      {
        "descricao": "Produto Exemplo",
        "quantidade": 2,
        "valorUnitario": 50.00,
        "cfop": "5102",
        "cst": "00"
      }
    ]
  }'
```

Resposta esperada (exemplo):

```json
{
  "id": "uuid-da-nota",
  "numero": "1",
  "status": "em_processamento",
  "message": "NF-e recebida e em processamento. Consulte GET /nfe/:id para o status."
}
```

Após alguns segundos, o mock SEFAZ autoriza a nota e o status em `GET /nfe/:id` passa a `autorizada`. O XML pode ser obtido em `GET /nfe/:id/xml`.

## Funcionalidades implementadas

O código inclui **comentários em português** em arquivos e funções importantes, explicando a função de cada parte.

### Obrigatórias (checklist do desafio)

- [x] **API RESTful**: `POST /nfe` (recebe dados e inicia emissão), `GET /nfe/:id` (status), `GET /nfe/:id/xml` (XML autorizado)
- [x] **Integração SEFAZ**: mock de homologação — simula envio da nota e recebimento do protocolo de autorização
- [x] **Validação de XML**: via estrutura NFe/infNFe (simulação de validação XSD)
- [x] **PostgreSQL**: entidades clientes, produtos, notas fiscais e itens
- [x] **Validação fiscal**: CNPJ (dígitos verificadores), IE, CFOP (4 dígitos), CST, itens obrigatórios
- [x] **Git + README**: versionamento e instruções para rodar o projeto

### Diferenciais

- **Docker + Docker Compose** com PostgreSQL
- **Testes automatizados**: unitários (ex.: validação NF-e) e e2e
- **Logs**: uso do Logger do NestJS
- **Tratamento de erros**: validação com `class-validator` e respostas HTTP adequadas
- **Autenticação JWT** opcional (`POST /auth/login`, guard aplicável via `JWT_REQUIRED=true`)
- **Pipeline CI**: GitHub Actions (build, lint, testes)
- **Documentação**: Swagger em `/api`
- **Estrutura em camadas**: controller, service, repository, entities, DTOs
- **Webhook** `/webhook/retorno-sefaz` para simular retorno da SEFAZ

## Scripts

| Comando           | Descrição                |
|-------------------|--------------------------|
| `npm run start`   | Inicia a aplicação       |
| `npm run start:dev` | Inicia em modo watch   |
| `npm run build`   | Gera build de produção   |
| `npm run start:prod` | Roda o build de produção |
| `npm run test`    | Testes unitários         |
| `npm run test:e2e`| Testes e2e               |
| `npm run test:cov`| Cobertura de testes      |
| `npm run lint`    | Linter                   |

## Estrutura do projeto

```
src/
├── auth/           # Autenticação JWT (login, guard, strategy)
├── config/         # Configuração (ex.: database)
├── entities/       # Entidades TypeORM (Cliente, Produto, NotaFiscal, NotaFiscalItem)
├── nfe/            # Módulo NF-e (controller, service, repository, validação, SEFAZ mock, XML)
├── webhook/        # Webhook retorno SEFAZ
├── app.module.ts
└── main.ts
```

## Licença

MIT

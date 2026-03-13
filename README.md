# NF-e Microservice – Desafio Técnico Backend

**Repositório:** [github.com/IanCouto/nfe-microservice](https://github.com/IanCouto/nfe-microservice)

Microserviço de emissão de **Nota Fiscal Eletrônica (NF-e)** com API RESTful, integração com ambiente de homologação SEFAZ (mock), validação de XML e persistência em PostgreSQL.

---

## Testar com Docker

**Requisito:** ter o [Docker](https://www.docker.com/get-started) instalado e em execução (Docker Desktop no Windows/Mac ou Docker Engine no Linux).

Quem baixar o projeto e quiser apenas rodar e testar a API com Docker:

```bash
git clone https://github.com/IanCouto/nfe-microservice.git
cd nfe-microservice
docker compose up -d
```

Aguarde alguns segundos (na primeira vez o build da imagem pode levar 1–2 minutos). Depois:

- **API:** http://localhost:3000  
- **Swagger (documentação e testes):** http://localhost:3000/api  
- **Health:** http://localhost:3000/health  

Para parar: `docker compose down`.

---

## Requisitos (execução local sem Docker)

- **Node.js** 18+ (local). **Node 24** no Docker e no CI.
- **PostgreSQL** 14+ (ou use Docker só para o banco)
- **npm** 9+

## Instalação e execução (local)

### 1. Clonar e instalar dependências

```bash
git clone https://github.com/IanCouto/nfe-microservice.git
cd nfe-microservice
npm install
```

### 2. Variáveis de ambiente

Copie o arquivo de exemplo e ajuste se necessário:

```bash
cp .env.example .env
```

Principais variáveis:

| Variável       | Descrição                    | Padrão     |
|----------------|-----------------------------|------------|
| `PORT`         | Porta da API                | 3000       |
| `DB_HOST`      | Host do PostgreSQL          | localhost  |
| `DB_PORT`      | Porta do PostgreSQL         | 5432       |
| `DB_USERNAME`  | Usuário do banco            | postgres   |
| `DB_PASSWORD`  | Senha do banco              | postgres   |
| `DB_DATABASE`  | Nome do banco               | nfe_db     |
| `DB_SYNC`      | Sincronizar schema (true/false) | (Docker: true) |
| `SEED_DB`      | Popular banco com dados de exemplo na subida (true/false) | (Docker: true) |
| `JWT_SECRET`   | Chave para tokens JWT       | (ver .env.example) |
| `JWT_REQUIRED` | Exigir JWT nas rotas (true/false) | (opcional, default não exige) |

### 3. Banco de dados

**Opção A – Docker (recomendado)**

Subir apenas o PostgreSQL para desenvolvimento (no Windows com Docker Desktop use `docker compose` em vez de `docker-compose`):

```bash
docker compose -f docker-compose.dev.yml up -d
# ou: docker-compose -f docker-compose.dev.yml up -d
```

Criar o banco (se não existir):

```bash
# PostgreSQL cria o DB automaticamente com docker-compose.dev.yml
```

**Opção B – App + PostgreSQL com Docker** (igual à seção **Testar com Docker** no início)

```bash
docker compose up -d
# ou: docker-compose up -d
```

A API estará em `http://localhost:3000`. Com `SEED_DB=true` (já configurado no `docker-compose.yml`), na primeira subida o banco é populado com **dados de exemplo**: 3 clientes, 3 produtos e 1 NF-e autorizada com 1 item. Assim você pode testar os CRUDs e a emissão de NF-e usando os IDs retornados em `GET /clientes` e `GET /produtos`.

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

| Método | Rota                         | Descrição                                      |
|--------|------------------------------|-------------------------------------------------|
| GET    | `/`                          | Mensagem de boas-vindas                         |
| GET    | `/health`                    | Health check                                    |
| **Clientes** | | |
| GET    | `/clientes`                  | Listar clientes                                 |
| POST   | `/clientes`                  | Criar cliente                                   |
| GET    | `/clientes/:id`              | Buscar cliente por ID                           |
| PATCH  | `/clientes/:id`              | Atualizar cliente                               |
| DELETE | `/clientes/:id`              | Remover cliente                                 |
| **Produtos** | | |
| GET    | `/produtos`                  | Listar produtos                                 |
| POST   | `/produtos`                  | Criar produto                                   |
| GET    | `/produtos/:id`              | Buscar produto por ID                           |
| PATCH  | `/produtos/:id`              | Atualizar produto                               |
| DELETE | `/produtos/:id`              | Remover produto                                 |
| **NF-e** | | |
| GET    | `/nfe`                       | Listar todas as NF-e                             |
| POST   | `/nfe`                       | Enviar NF-e para emissão                        |
| GET    | `/nfe/:id`                   | Consultar status da NF-e                        |
| GET    | `/nfe/:id/xml`               | Obter XML da NF-e autorizada                    |
| PATCH  | `/nfe/:id`                   | Atualizar NF-e (status, motivoRejeicao)          |
| DELETE | `/nfe/:id`                   | Remover NF-e                                    |
| **Itens da NF-e** | | |
| GET    | `/nfe/:id/itens`             | Listar itens da NF-e                             |
| POST   | `/nfe/:id/itens`             | Adicionar item à NF-e                           |
| GET    | `/nfe/:id/itens/:itemId`     | Buscar item                                     |
| PATCH  | `/nfe/:id/itens/:itemId`     | Atualizar item                                  |
| DELETE | `/nfe/:id/itens/:itemId`     | Remover item                                    |
| **Outros** | | |
| POST   | `/webhook/retorno-sefaz`     | Simular retorno/callback da SEFAZ (homologação) |
| POST   | `/auth/login`                | Login e obter JWT (opcional)                    |

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

## Segurança e dependências

- `npm audit` pode reportar vulnerabilidades; várias vêm de **devDependencies** (NestJS CLI, Angular DevKit, etc.). Use `npm audit fix` para correções seguras; `npm audit fix --force` pode exigir atualizações major — teste o projeto após.

## Scripts

| Comando              | Descrição                |
|----------------------|--------------------------|
| `npm run start`      | Inicia a aplicação       |
| `npm run start:dev`  | Inicia em modo watch   |
| `npm run build`      | Gera build de produção   |
| `npm run start:prod` | Roda o build de produção |
| `npm run test`       | Testes unitários         |
| `npm run test:e2e`   | Testes e2e               |
| `npm run test:cov`   | Cobertura de testes      |
| `npm run lint`       | Linter                   |

## Estrutura do projeto

A organização segue o **padrão modular do NestJS** (feature modules) com entidades e configuração compartilhadas na raiz de `src/`.

```
src/
├── app.module.ts       # Módulo raiz (importa todos os feature modules)
├── app.controller.ts
├── app.service.ts
├── main.ts             # Bootstrap da aplicação
│
├── config/             # Configuração global (database, env)
│   └── database.config.ts
│
├── entities/           # Entidades TypeORM compartilhadas entre módulos
│   ├── index.ts
│   ├── cliente.entity.ts
│   ├── produto.entity.ts
│   ├── nota-fiscal.entity.ts
│   └── nota-fiscal-item.entity.ts
│
├── auth/               # Autenticação JWT (login, guard, strategy, decorator)
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── jwt.strategy.ts
│   ├── jwt-auth.guard.ts
│   └── public.decorator.ts
│
├── clientes/           # CRUD de clientes (emitentes/destinatários)
│   ├── clientes.module.ts
│   ├── clientes.controller.ts
│   ├── clientes.service.ts
│   └── dto/
│       ├── create-cliente.dto.ts
│       └── update-cliente.dto.ts
│
├── produtos/            # CRUD de produtos
│   ├── produtos.module.ts
│   ├── produtos.controller.ts
│   ├── produtos.service.ts
│   └── dto/
│       ├── create-produto.dto.ts
│       └── update-produto.dto.ts
│
├── nfe/                 # Módulo NF-e (emissão, listagem, itens, integração SEFAZ)
│   ├── nfe.module.ts
│   ├── nfe.controller.ts
│   ├── nfe.service.ts
│   ├── nfe.repository.ts
│   ├── nfe-validation.service.ts
│   ├── dto/
│   │   ├── create-nfe.dto.ts
│   │   ├── update-nfe.dto.ts
│   │   ├── create-nfe-item.dto.ts
│   │   └── update-nfe-item.dto.ts
│   └── sefaz/           # Subdomínio SEFAZ (mock, validação XML)
│       ├── sefaz-mock.service.ts
│       └── xml-validator.service.ts
│
├── webhook/             # Webhook para retorno/callback SEFAZ
│   ├── webhook.module.ts
│   ├── webhook.controller.ts
│   └── webhook.service.ts
│
└── seed/                # Seed do banco (dados iniciais quando SEED_DB=true)
    ├── seed.module.ts
    └── seed.service.ts
```

### Padrão seguido

| Prática | Descrição |
|--------|-----------|
| **Feature modules** | Cada domínio (auth, clientes, produtos, nfe, webhook) é um módulo NestJS com seu próprio `*.module.ts`, controller e service. Tudo que pertence ao domínio fica na mesma pasta. |
| **Entidades compartilhadas** | As entidades TypeORM ficam em `entities/` na raiz porque são usadas por mais de um módulo (ex.: `Cliente` e `Produto` por Nfe e por seus CRUDs). |
| **DTOs por módulo** | Cada módulo tem sua pasta `dto/` com DTOs de criação (`create-*.dto.ts`) e atualização (`update-*.dto.ts`), usando `class-validator` e `@nestjs/swagger`. |
| **Configuração centralizada** | `config/` concentra configurações (banco, env). O TypeORM é configurado no `AppModule` com `TypeOrmModule.forRootAsync()`. |
| **Subpastas para subdomínios** | Dentro de um módulo, lógica coesa pode ir em subpasta (ex.: `nfe/sefaz/` para serviços de integração SEFAZ e XML). |
| **Repository no módulo** | O acesso a dados complexos (ex.: NF-e com itens e emitente) fica em um repositório injetável (`nfe.repository.ts`) em vez de espalhar queries no service. |
| **Testes ao lado do código** | Arquivos `*.spec.ts` ficam na mesma pasta do arquivo testado (ex.: `nfe-validation.service.spec.ts` em `nfe/`). |

Referência: [NestJS – Modules (Feature modules)](https://docs.nestjs.com/modules) e estrutura recomendada por feature.

## Repositório e primeiro push

O repositório remoto está configurado como **https://github.com/IanCouto/nfe-microservice**. Se o repositório ainda não existir no GitHub:

1. Acesse [github.com/new](https://github.com/new).
2. Nome do repositório: **nfe-microservice**.
3. Crie **sem** README, .gitignore ou licença (o projeto já tem).
4. Depois, na pasta do projeto:
   ```bash
   git push -u origin master
   ```

(O frontend ficará em um repositório separado: **IanCouto/nfe-microservice-frontend** ou similar.)

## Licença

MIT

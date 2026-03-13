# Roteiro – Vídeo de 3 minutos (Desafio Técnico Backend)

Vídeo mostrando **todas as funcionalidades** do sistema conforme o desafio: API RESTful, integração SEFAZ (mock), validação de XML, PostgreSQL, validações fiscais, Git/README e diferenciais.

---

## Pré-requisitos antes de gravar

- [ ] API rodando: `docker compose up -d` (ou `npm run start:dev` com banco no ar)
- [ ] Abas abertas: **Swagger** (http://localhost:3000/api), **Health** (http://localhost:3000/health), terminal (opcional)
- [ ] Ter anotado um **ID de cliente** e um **ID de produto** do seed (ex.: `GET /clientes` e `GET /produtos` no Swagger antes de gravar)

---

## Roteiro com tempo (total ~3 min)

### 0:00 – 0:20 | Abertura e contexto (20 s)

**Fala sugerida:**  
*“Este é o backend do desafio técnico: um microserviço de emissão de NF-e em NestJS, com API REST, integração com ambiente de homologação SEFAZ em mock, validação de XML e persistência em PostgreSQL.”*

**Tela:**  
- README do repositório ou título do projeto.  
- Opcional: mostrar rapidamente a estrutura de pastas (`src/` com módulos auth, clientes, produtos, nfe, webhook, seed).

---

### 0:20 – 0:45 | Como rodar e health (25 s)

**Fala sugerida:**  
*“Para rodar, basta usar Docker Compose: clone o repositório, entre na pasta e execute docker compose up -d. Em poucos segundos a API sobe com PostgreSQL; o banco pode ser populado com dados de exemplo se SEED_DB estiver ativo.”*

**Tela:**  
1. Mostrar o `docker compose up -d` (ou o trecho do README com os 3 comandos).  
2. Abrir **http://localhost:3000/health** e mostrar a resposta (status ok).  
3. Mostrar **http://localhost:3000** (mensagem de boas-vindas).

---

### 0:45 – 1:25 | Swagger e endpoints (40 s)

**Fala sugerida:**  
*“Toda a API está documentada no Swagger em /api. Temos CRUD de clientes e de produtos, emissão e gestão de NF-e, itens da nota, e um webhook para simular o retorno da SEFAZ. Autenticação JWT é opcional.”*

**Tela:**  
1. Abrir **http://localhost:3000/api**.  
2. Rolar e mostrar os grupos: **clientes**, **produtos**, **nfe**, **webhook**, **auth**.  
3. Abrir um endpoint (ex.: `GET /clientes`) e mostrar a resposta com a lista (dados do seed).  
4. Mostrar rapidamente `GET /produtos` (também com dados do seed).

---

### 1:25 – 2:25 | Emissão de NF-e (fluxo completo) (60 s)

**Fala sugerida:**  
*“O fluxo principal é a emissão da NF-e. No POST /nfe envio emitente, destinatário e itens — com CNPJ, CFOP, CST e demais campos validados. A API retorna o ID da nota em processamento. O mock da SEFAZ processa em background; em seguida consulto o status em GET /nfe/:id e, quando autorizada, o XML em GET /nfe/:id/xml.”*

**Tela:**  
1. **POST /nfe** no Swagger: preencher body com emitente (CNPJ válido), destinatário, e itens usando um **produtoId** e **clienteId** que existam no banco (ex.: IDs obtidos do seed).  
2. Executar e mostrar resposta **201** com `id`, `numero`, `status: "em_processamento"`.  
3. Copiar o `id` da nota e abrir **GET /nfe/:id** — mostrar status (pode ainda ser `em_processamento` ou já `autorizada`).  
4. Abrir **GET /nfe/:id/xml** e mostrar o XML retornado (ou mensagem se ainda não autorizada).  
5. (Opcional) Mostrar **GET /nfe** com a lista de notas.

---

### 2:25 – 2:50 | Validações, CRUD e webhook (25 s)

**Fala sugerida:**  
*“As validações fiscais estão ativas: CNPJ com dígitos verificadores, IE, CFOP de 4 dígitos, CST. O CRUD de clientes e produtos está completo; e o endpoint de webhook permite simular o retorno da SEFAZ para testes.”*

**Tela:**  
1. Mostrar um **POST /nfe** com body **inválido** (ex.: CNPJ errado ou item sem produtoId válido) e a resposta **400** com mensagem de validação.  
2. Mostrar rapidamente **PATCH /clientes/:id** ou **POST /clientes** (criar um cliente) para evidenciar CRUD.  
3. Mostrar **POST /webhook/retorno-sefaz**: body com `notaFiscalId`, `status: "autorizada"` ou `"rejeitada"` e executar (retorno 200).

---

### 2:50 – 3:00 | Testes e encerramento (10 s)

**Fala sugerida:**  
*“O projeto inclui testes unitários e e2e, documentação no README, uso de Git com commits convencionais, e está pronto para avaliação. Obrigado.”*

**Tela:**  
- Terminal: `npm run test` (rodar só alguns segundos) ou mostrar a seção **Testes** do README.  
- Ou tela final com repositório / README.

---

## Checklist do desafio (para não esquecer de citar ou mostrar)

| Item do desafio              | Onde mostrar no vídeo                          |
|-----------------------------|-------------------------------------------------|
| API RESTful                 | Swagger + POST/GET /nfe, GET /nfe/:id, GET /nfe/:id/xml |
| Integração SEFAZ (mock)     | Explicar no fluxo de emissão; status mudando para autorizada |
| Validação de XML            | GET /nfe/:id/xml exibindo o XML; comentar validação NFe/infNFe |
| PostgreSQL                  | Dados persistidos (clientes, produtos, NF-e); opcional: mencionar Docker |
| Validação fiscal            | POST /nfe inválido retornando 400               |
| Git + README                | Abertura ou encerramento com repositório/README |

---

## Dicas rápidas

- **Duração:** Foque em 2:50–3:00; se passar, corte a parte de estrutura de pastas ou encurte a fala de abertura.
- **IDs para o POST /nfe:** Antes de gravar, anote um `id` de **GET /clientes** e um `id` de **GET /produtos** para usar no body do POST /nfe.
- **CNPJ de exemplo:** Use os do seed ou ex.: emitente `11222333000181`, destinatário `06990590000123`.
- **Sem atraso no mock:** Se quiser o status “autorizada” na hora, chame o **webhook** com `status: "autorizada"` logo após criar a nota.

---

## Exemplo de body para POST /nfe (copiar e colar)

Substitua `SEU_CLIENTE_ID` e `SEU_PRODUTO_ID` pelos IDs reais do seed (GET /clientes e GET /produtos).

```json
{
  "emitenteCnpj": "11222333000181",
  "emitenteIe": "123456789",
  "emitenteRazaoSocial": "Empresa Emitente LTDA",
  "destinatarioCnpj": "06990590000123",
  "destinatarioIe": "987654321",
  "destinatarioRazaoSocial": "Empresa Destino SA",
  "itens": [
    {
      "descricao": "Produto Exemplo",
      "quantidade": 2,
      "valorUnitario": 50.00,
      "cfop": "5102",
      "cst": "00",
      "ncm": "12345678",
      "produtoId": "SEU_PRODUTO_ID"
    }
  ]
}
```

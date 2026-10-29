# Lighthouse

Aplicação fullstack para gerenciamento de produtos de um catálogo. Ela é composta por uma API REST em Node.js com PostgreSQL e por um painel em React para listar, cadastrar, editar e excluir produtos.

## Funcionalidades

- Listagem paginada com busca por nome e filtro por categoria.
- Formulário único para criação e edição, com validação no navegador e no servidor.
- Exclusão com modal de confirmação.
- Indicação de carregamento, erro, lista vazia e sucesso em todas as operações.
- Filtros e página salvos na URL, preservados ao recarregar ou compartilhar o link.

## Sumário

- [Stack](#stack)
- [Como executar](#como-executar)
- [Testes](#testes)
- [Scripts disponíveis](#scripts-disponíveis)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Documentação da API](#documentação-da-api)
- [Decisões técnicas](#decisões-técnicas)

---

## Stack

| Camada             | Tecnologias                                                                                               |
| :----------------- | :-------------------------------------------------------------------------------------------------------- |
| **Backend**        | Node.js, TypeScript, Fastify, Zod, Prisma, PostgreSQL                                                     |
| **Frontend**       | React, TypeScript, Vite, TanStack Query, React Router, React Hook Form, Zod, Tailwind CSS, Lucide, Sonner |
| **Testes**         | Vitest, com testes unitários e de integração                                                              |
| **Infraestrutura** | Docker Compose                                                                                            |
| **Qualidade**      | ESLint, Prettier, EditorConfig                                                                            |

---

## Como executar

### Pré-requisitos

- [Node.js](https://nodejs.org/) 22 ou superior, com npm
- [Docker](https://www.docker.com/) com Docker Compose

### 1. Subir o banco de dados

Execute o comando abaixo na raiz do projeto.

```bash
docker compose up -d --wait
```

O container cria dois bancos, o `lighthouse`, usado em desenvolvimento, e o `lighthouse_test`, usado pelos testes. Se a porta `5432` já estiver em uso, defina outra com `POSTGRES_PORT=5433 docker compose up -d --wait` e ajuste a `DATABASE_URL` do backend.

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

A API fica disponível em **http://localhost:3333**. O seed cadastra 12 produtos de exemplo.

### 3. Frontend

Em outro terminal, a partir da raiz do projeto, execute os comandos abaixo.

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

O painel fica disponível em **http://localhost:5173**.

---

## Testes

Com o banco de dados em execução, rode os testes no backend.

```bash
cd backend
npm test
```

São **65 testes**, divididos em dois grupos.

- Os **testes unitários** (`tests/unit`) verificam as regras do service com um repositório em memória, sem acesso ao banco de dados.
- Os **testes de integração** (`tests/integration`) fazem requisições HTTP reais contra o banco `lighthouse_test`. Eles cobrem os cinco endpoints, todas as regras de negócio, os valores-limite (nome com 3 e 120 caracteres, preço de 0,01 e estoque 0), a paginação, a busca, os filtros, os erros 400 e 404 e o health check.

As migrations são aplicadas automaticamente no banco de teste antes da execução, e a tabela é limpa antes de cada teste. Por segurança, os testes se recusam a rodar se a `DATABASE_URL` não apontar para um banco cujo nome termine em `_test`.

> O banco `lighthouse_test` é criado na primeira vez que o volume do Docker é iniciado. Caso ele não exista, crie com o comando `docker exec lighthouse-postgres psql -U lighthouse -c "CREATE DATABASE lighthouse_test"`.

---

## Scripts disponíveis

### Backend (`/backend`)

| Script                | Descrição                                                              |
| :-------------------- | :--------------------------------------------------------------------- |
| `npm run dev`         | Inicia a API em modo de desenvolvimento, com recarregamento automático |
| `npm run build`       | Compila o TypeScript para a pasta `dist/`                              |
| `npm start`           | Executa a versão compilada                                             |
| `npm test`            | Executa todos os testes                                                |
| `npm run test:watch`  | Executa os testes em modo de observação                                |
| `npm run db:generate` | Gera o cliente do Prisma                                               |
| `npm run db:migrate`  | Aplica as migrations pendentes                                         |
| `npm run db:seed`     | Recria os produtos de exemplo                                          |
| `npm run db:reset`    | Apaga o banco, reaplica as migrations e executa o seed                 |
| `npm run typecheck`   | Verifica os tipos                                                      |
| `npm run lint`        | Executa o ESLint                                                       |
| `npm run format`      | Formata o código com o Prettier                                        |

### Frontend (`/frontend`)

| Script              | Descrição                                    |
| :------------------ | :------------------------------------------- |
| `npm run dev`       | Inicia o painel em modo de desenvolvimento   |
| `npm run build`     | Verifica os tipos e gera o build de produção |
| `npm run preview`   | Serve o build de produção localmente         |
| `npm run typecheck` | Verifica os tipos                            |
| `npm run lint`      | Executa o ESLint                             |
| `npm run format`    | Formata o código com o Prettier              |

---

## Variáveis de ambiente

Cada aplicação tem um arquivo `.env.example` com todas as chaves necessárias. Basta copiá-lo para `.env`.

### Backend (`backend/.env.example`)

| Variável            | Descrição                                                   | Padrão                  |
| :------------------ | :---------------------------------------------------------- | :---------------------- |
| `NODE_ENV`          | Ambiente de execução, `development`, `test` ou `production` | `development`           |
| `HOST`              | Endereço em que a API escuta                                | `0.0.0.0`               |
| `PORT`              | Porta da API                                                | `3333`                  |
| `CORS_ORIGIN`       | Origens permitidas, separadas por vírgula                   | `http://localhost:5173` |
| `DATABASE_URL`      | URL de conexão com o PostgreSQL                             | Obrigatória             |
| `DATABASE_POOL_MAX` | Número máximo de conexões simultâneas com o banco           | `10`                    |

As variáveis são validadas na inicialização. Se alguma estiver ausente ou inválida, a API não sobe e informa qual é o problema.

O arquivo `backend/.env.test`, que é versionado, contém a configuração usada pelos testes.

### Frontend (`frontend/.env.example`)

| Variável       | Descrição       | Padrão                  |
| :------------- | :-------------- | :---------------------- |
| `VITE_API_URL` | URL base da API | `http://localhost:3333` |

---

## Documentação da API

A URL base da API é `http://localhost:3333`. As requisições e respostas usam JSON.

| Método   | Rota                                  | Descrição                                     |
| :------- | :------------------------------------ | :-------------------------------------------- |
| `GET`    | [`/products`](#get-products)          | Lista os produtos de forma paginada           |
| `GET`    | [`/products/:id`](#get-productsid)    | Retorna um produto pelo ID                    |
| `POST`   | [`/products`](#post-products)         | Cria um produto                               |
| `PUT`    | [`/products/:id`](#put-productsid)    | Atualiza um produto por completo              |
| `DELETE` | [`/products/:id`](#delete-productsid) | Remove um produto                             |
| `GET`    | [`/health`](#get-health)              | Verifica se a API e o banco estão disponíveis |

### Modelo `Product`

| Campo         | Tipo              | Descrição                                 |
| :------------ | :---------------- | :---------------------------------------- |
| `id`          | string (UUID)     | Identificador do produto, gerado pela API |
| `name`        | string            | Nome do produto                           |
| `description` | string ou `null`  | Descrição do produto                      |
| `price`       | number            | Preço em reais, com até 2 casas decimais  |
| `stock`       | number            | Quantidade em estoque                     |
| `category`    | string            | Categoria do produto                      |
| `createdAt`   | string (ISO 8601) | Data de criação                           |
| `updatedAt`   | string (ISO 8601) | Data da última atualização                |

### Formato dos erros

Todas as respostas de erro seguem o mesmo formato. Os erros de validação trazem também a lista `errors`, com um item para cada campo inválido.

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Dados inválidos",
  "errors": [
    { "field": "name", "message": "O nome deve ter entre 3 e 120 caracteres" }
  ]
}
```

Qualquer rota pode responder `500 Internal Server Error` em caso de falha inesperada. O detalhe do erro é registrado no log do servidor e nunca é exposto na resposta.

```json
{
  "statusCode": 500,
  "error": "Internal Server Error",
  "message": "Erro interno do servidor"
}
```

---

### `GET /products`

Lista os produtos de forma paginada, do mais recente para o mais antigo.

**Parâmetros de query**

| Parâmetro  | Tipo   | Obrigatório | Descrição                                                     | Padrão |
| :--------- | :----- | :---------- | :------------------------------------------------------------ | :----- |
| `page`     | number | Não         | Página, a partir de 1                                         | `1`    |
| `limit`    | number | Não         | Itens por página, de 1 a 100                                  | `10`   |
| `search`   | string | Não         | Busca por parte do nome, ignorando acentos e maiúsculas       |        |
| `category` | string | Não         | Filtro por parte da categoria, ignorando acentos e maiúsculas |        |

**Exemplo de requisição**

```http
GET /products?page=1&limit=1&category=informatica
```

**Respostas**

`200 OK` com a lista de produtos e os dados da paginação.

```json
{
  "data": [
    {
      "id": "babf7c65-798e-4bdb-be47-625e361074e0",
      "name": "Teclado Mecânico",
      "description": "Teclado mecânico ABNT2 com switches marrons e iluminação RGB.",
      "price": 429,
      "stock": 12,
      "category": "Informática",
      "createdAt": "2026-10-28T17:57:17.626Z",
      "updatedAt": "2026-10-28T17:57:17.626Z"
    }
  ],
  "meta": { "page": 1, "limit": 1, "total": 3, "totalPages": 3 }
}
```

`400 Bad Request` quando os parâmetros de query são inválidos.

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Dados inválidos",
  "errors": [
    { "field": "page", "message": "A página deve ser maior ou igual a 1" },
    { "field": "limit", "message": "O limite deve estar entre 1 e 100" }
  ]
}
```

---

### `GET /products/:id`

Retorna um produto pelo ID.

**Parâmetros de rota**

| Parâmetro | Tipo          | Descrição     |
| :-------- | :------------ | :------------ |
| `id`      | string (UUID) | ID do produto |

**Exemplo de requisição**

```http
GET /products/b756959d-707a-4e04-91bc-9f732b3c3d46
```

**Respostas**

`200 OK` com o produto.

```json
{
  "id": "b756959d-707a-4e04-91bc-9f732b3c3d46",
  "name": "Mouse Sem Fio",
  "description": "Mouse ergonômico com sensor de 16000 DPI.",
  "price": 199.99,
  "stock": 40,
  "category": "Informática",
  "createdAt": "2026-10-28T17:57:17.626Z",
  "updatedAt": "2026-10-28T17:57:17.626Z"
}
```

`400 Bad Request` quando o ID não é um UUID válido.

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Dados inválidos",
  "errors": [{ "field": "id", "message": "ID inválido" }]
}
```

`404 Not Found` quando o produto não existe.

```json
{ "statusCode": 404, "error": "Not Found", "message": "Produto não encontrado" }
```

---

### `POST /products`

Cria um produto.

**Corpo da requisição**

| Campo         | Tipo             | Obrigatório | Regras                                                          |
| :------------ | :--------------- | :---------- | :-------------------------------------------------------------- |
| `name`        | string           | Sim         | Entre 3 e 120 caracteres                                        |
| `description` | string ou `null` | Não         | Um texto vazio é salvo como `null`                              |
| `price`       | number           | Sim         | Maior que 0, com no máximo 2 casas decimais e até 99.999.999,99 |
| `stock`       | number           | Sim         | Inteiro e maior ou igual a 0                                    |
| `category`    | string           | Sim         | Não pode ser vazia                                              |

Os espaços no início e no fim de `name`, `description` e `category` são removidos antes da validação. Campos desconhecidos são ignorados.

**Exemplo de requisição**

```http
POST /products
Content-Type: application/json

{
  "name": "Teclado Sem Fio",
  "description": "Teclado compacto com conexão Bluetooth.",
  "price": 249.9,
  "stock": 20,
  "category": "Informática"
}
```

**Respostas**

`201 Created` com o produto criado.

```json
{
  "id": "606514be-6fde-45d5-a31b-3420e10bc71c",
  "name": "Teclado Sem Fio",
  "description": "Teclado compacto com conexão Bluetooth.",
  "price": 249.9,
  "stock": 20,
  "category": "Informática",
  "createdAt": "2026-10-29T02:07:55.303Z",
  "updatedAt": "2026-10-29T02:07:55.303Z"
}
```

`400 Bad Request` quando os dados são inválidos.

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Dados inválidos",
  "errors": [
    { "field": "name", "message": "O nome deve ter entre 3 e 120 caracteres" },
    { "field": "price", "message": "O preço deve ser maior que 0" },
    { "field": "stock", "message": "O estoque não pode ser negativo" },
    { "field": "category", "message": "A categoria é obrigatória" }
  ]
}
```

`400 Bad Request` quando o corpo não é um JSON válido.

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Corpo da requisição inválido"
}
```

---

### `PUT /products/:id`

Atualiza um produto por completo. Todos os campos obrigatórios devem ser enviados, porque o `PUT` substitui o produto inteiro.

**Parâmetros de rota**

| Parâmetro | Tipo          | Descrição     |
| :-------- | :------------ | :------------ |
| `id`      | string (UUID) | ID do produto |

**Corpo da requisição**

Os mesmos campos e regras do [`POST /products`](#post-products).

**Exemplo de requisição**

```http
PUT /products/606514be-6fde-45d5-a31b-3420e10bc71c
Content-Type: application/json

{
  "name": "Teclado Sem Fio",
  "description": "Teclado compacto com conexão Bluetooth.",
  "price": 229.9,
  "stock": 15,
  "category": "Informática"
}
```

**Respostas**

`200 OK` com o produto atualizado.

```json
{
  "id": "606514be-6fde-45d5-a31b-3420e10bc71c",
  "name": "Teclado Sem Fio",
  "description": "Teclado compacto com conexão Bluetooth.",
  "price": 229.9,
  "stock": 15,
  "category": "Informática",
  "createdAt": "2026-10-29T02:07:55.303Z",
  "updatedAt": "2026-10-29T02:07:55.352Z"
}
```

`400 Bad Request` quando o ID não é um UUID válido ou os dados são inválidos. O formato é o mesmo dos erros do [`POST /products`](#post-products).

`404 Not Found` quando o produto não existe.

```json
{ "statusCode": 404, "error": "Not Found", "message": "Produto não encontrado" }
```

---

### `DELETE /products/:id`

Remove um produto.

**Parâmetros de rota**

| Parâmetro | Tipo          | Descrição     |
| :-------- | :------------ | :------------ |
| `id`      | string (UUID) | ID do produto |

**Exemplo de requisição**

```http
DELETE /products/606514be-6fde-45d5-a31b-3420e10bc71c
```

**Respostas**

`204 No Content` quando o produto é removido. A resposta não tem corpo.

`400 Bad Request` quando o ID não é um UUID válido.

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Dados inválidos",
  "errors": [{ "field": "id", "message": "ID inválido" }]
}
```

`404 Not Found` quando o produto não existe.

```json
{ "statusCode": 404, "error": "Not Found", "message": "Produto não encontrado" }
```

---

### `GET /health`

Verifica se a API está no ar e se consegue acessar o banco de dados.

**Exemplo de requisição**

```http
GET /health
```

**Respostas**

`200 OK` quando a API e o banco estão disponíveis.

```json
{ "status": "ok" }
```

`503 Service Unavailable` quando o banco de dados não está acessível.

```json
{ "status": "unavailable" }
```

---

## Decisões técnicas

### Estrutura do repositório

O backend e o frontend são aplicações independentes, cada uma com as suas dependências, dentro do mesmo repositório. A configuração compartilhada fica na raiz, incluindo o Docker Compose, o `.gitignore`, o EditorConfig e as configurações do VS Code.

```
lighthouse/
├── backend/
│   ├── prisma/            # schema, migrations e seed
│   ├── src/
│   │   ├── config/        # validação das variáveis de ambiente
│   │   ├── routes/        # mapeamento de URLs e schemas de cada rota
│   │   ├── controllers/   # tradução entre HTTP e domínio (status codes)
│   │   ├── services/      # regras de negócio
│   │   ├── repositories/  # contrato (interface) e implementação com Prisma
│   │   ├── schemas/       # validação com Zod
│   │   ├── errors/        # erros de domínio (AppError, NotFoundError)
│   │   ├── http/          # handler global de erros e parser de JSON
│   │   ├── app.ts         # montagem da aplicação (usada pelos testes)
│   │   └── server.ts      # inicialização do servidor
│   └── tests/             # testes unitários, de integração e helpers
├── frontend/
│   └── src/
│       ├── app/           # rotas e configuração do TanStack Query
│       ├── components/    # layout e componentes de UI reutilizáveis
│       ├── features/
│       │   └── products/  # api, hooks, componentes, páginas, schemas e tipos
│       ├── hooks/         # hooks genéricos
│       ├── lib/           # cliente HTTP, formatação e máscaras
│       └── pages/         # páginas globais (404 e erro)
└── docker-compose.yml
```

### Arquitetura

**Backend.** A API é organizada em camadas, e cada uma tem uma única responsabilidade. As rotas definem as URLs e os schemas de validação, os controllers traduzem a requisição HTTP e escolhem o status da resposta, os services concentram as regras de negócio e os repositories acessam o banco. O service depende de uma interface de repositório, e não do Prisma diretamente, o que permite testá-lo com um repositório em memória e trocar o ORM sem afetar as outras camadas. Os erros são tratados em um único handler global, que devolve sempre o mesmo formato de resposta.

**Frontend.** O código é organizado por funcionalidade. Tudo o que pertence a produtos fica em `features/products`, e os componentes genéricos ficam em `components/ui`, prontos para serem reutilizados. Todas as chamadas à API passam por um único cliente HTTP, que padroniza o tratamento de erros, e o mesmo formulário é usado para criar e para editar produtos.

### Ferramentas

| Ferramenta            | Por que foi escolhida                                                                                                                                                                                            |
| :-------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **TypeScript**        | Tipagem estática no backend e no frontend, o que reduz erros e facilita a manutenção                                                                                                                             |
| **Fastify**           | Suporte nativo a TypeScript e a validação por schema, além de capturar erros assíncronos sem código extra. Foi preferido ao NestJS, que impõe a própria estrutura, e ao Express, que exigiria mais código manual |
| **Zod**               | Valida os dados e gera os tipos TypeScript a partir do mesmo schema. É usado no backend e no frontend, com as mesmas regras e mensagens                                                                          |
| **PostgreSQL**        | Banco relacional adequado a um produto com estrutura fixa e bem definida                                                                                                                                         |
| **Prisma**            | Migrations versionadas e acesso ao banco com tipos gerados automaticamente a partir do schema                                                                                                                    |
| **Vitest**            | Testes rápidos com suporte nativo a TypeScript, usados tanto nos testes unitários quanto nos de integração                                                                                                       |
| **Docker Compose**    | Sobe o PostgreSQL com um único comando, sem instalação local                                                                                                                                                     |
| **React com Vite**    | Ambiente de desenvolvimento rápido e build de produção otimizado                                                                                                                                                 |
| **TanStack Query**    | Gerencia os dados vindos da API, com estados de carregamento e erro, cache e atualização da tela após cada alteração                                                                                             |
| **React Router**      | Rotas com URLs próprias para listagem, criação e edição                                                                                                                                                          |
| **React Hook Form**   | Formulários com bom desempenho e integração direta com o Zod                                                                                                                                                     |
| **Tailwind CSS**      | Estilização rápida e consistente, com as cores e fontes definidas em um único lugar                                                                                                                              |
| **Lucide**            | Biblioteca de ícones leve e com estilo uniforme                                                                                                                                                                  |
| **Sonner**            | Notificações de sucesso e de erro                                                                                                                                                                                |
| **ESLint e Prettier** | Padronizam o código e a formatação nas duas aplicações                                                                                                                                                           |

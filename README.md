## Nestjs Typeorm Full Example

Example of a NestJS application with PostgreSQL.

**Tech Stack:**

- [Nest](https://github.com/nestjs/nest)
- [TypeORM](https://docs.nestjs.com/techniques/database#typeorm-integration)
- PostgreSQL
- Swagger
- Typescript
- [Endor CLI](https://docs.endor.dev/cli/)

**Examples:**  https://github.com/nestjs/nest/tree/master/sample
**External API:**  https://reap.readme.io/reference/test-environment
----

## API Docs

http://localhost:3000/api

**Add Swagger OpenAPI Docs:**

```bash
pnpm add @nestjs/swagger
```

**Add Swagger Docs to `main.ts`**

```typescript
  const config = new DocumentBuilder()
  .setTitle('Treasury example')
  .setDescription('The Treasury API description')
  .setVersion('1.0')
  .addTag('stablecoin')
  .build();
const documentFactory = () => SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api', app, documentFactory);
```

## Project setup

```bash
$ pnpm install
```

## Run local PostgreSQL

https://docs.endor.dev/cli/services/postgres/

**Endor CLI:**
A lightweight developer tool to run local cloud services (like PostgreSQL) with one command
using reproducible containers. See docs: https://docs.endor.dev/cli/

```bash
npm install -g @endorhq/cli
```

**Endor PostgreSQL**

```bash
endor run postgres
```

**Connect to PostgreSQL**

```bash
psql -h localhost -U postgres -d postgres
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

----

## NestJS CLI

https://docs.nestjs.com/cli/overview

**Create a new resource:**

```bash
nest g resource new-resource
```

**Create a new project:**

Optional:
`-c custom-schematic`

```bash 
nest n project-name -p pnpm -l TS --strict
```

----

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

----

## API URL Best Practices

**Examples:**
Format `/[version]/[domain]/[resource]/[resource_id]/[hiearchical_resource]/[hiearchical_resource_id]`

- `[GET] /v1/treasury/customers/{customer_id}/orders`
- `[POST] /v1/treasury/customers/{customer_id}/orders`
- `[GET] /v1/treasury/customers/{customer_id}/orders/{order_id}`
- `[PUT] /v1/treasury/customers/{customer_id}/orders/{order_id}`
- `[DELETE] /v1/treasury/customers/{customer_id}/orders/{order_id}`
- `[PATCH] /v1/treasury/customers/{customer_id}/orders/{order_id}`

1. **Versioning** (`/v1/`)
    - Allows backward compatibility when introducing breaking changes
2. **Domain** (`/treasury/`)
    - Organizes APIs by business domain or bounded context
3. **Resource** (`/customers/`)
    - Everything is a resource
    - collection → item → subcollection → subitem
4. **Hierarchical Resource** (`/orders/`)
    - Parent-child relationships: `customers ONEtoMANY orders`
    - Child access in parent scope (Mirror database schema)

**GOOD**
```bash
// Clear hierarchy and context
GET /v1/treasury/customers/123/orders/456
```

**BAD**
```bash
// vs ambiguous flat structure
GET /v1/orders/456  // Which customer? No context.
```

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

----

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>



<p align="center">
  <a href="https://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="60" alt="Nest Logo" /></a>
</p>

----

<div style="text-align: center;" align="center"> 

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![WebStorm](https://img.shields.io/badge/WebStorm-000?logo=webstorm&logoColor=fff)](https://www.jetbrains.com/webstorm)
[![Polkadot](https://img.shields.io/badge/Polkadot-E6007A?logo=polkadot&logoColor=white)](https://wiki.polkadot.com/)
[![Ethereum](https://img.shields.io/badge/Ethereum-3C3C3D?logo=ethereum&logoColor=white)](https://ethereum.org/)

<a href="https://github.com/anataliocs/nestjs-typeorm-full-example/actions/workflows/pnpm-check.yml">
    <img alt="Build Status" src="https://github.com/anataliocs/nestjs-typeorm-full-example/actions/workflows/pnpm-check.yml/badge.svg">
</a>
</div>

----

<div style="text-align: center;" align="center"> 
    <a href="https://codespaces.new/anataliocs/nestjs-typeorm-full-example">
        <img alt="Build Status" src="https://github.com/codespaces/badge.svg">
    </a>
</div>

# Nestjs TypeORM Full Example

Example of a NestJS application with PostgreSQL and Axios integrating into multiple Web3 SDKs.
- [Reap](https://reap.readme.io/reference/test-environment)
- [Wormhole](https://wormhole.com/docs/tools/typescript-sdk/sdk-reference/)
- [Peaq](https://docs.peaq.xyz/build/getting-started/install-peaq-sdk)

#### Tech Stack:

- [Nest](https://github.com/nestjs/nest)
- [TypeORM](https://docs.nestjs.com/techniques/database#typeorm-integration)
- [PostgreSQL](https://www.postgresql.org/)
- [Swagger](https://swagger.io/)
- [Typescript](https://www.typescriptlang.org/)
- [Endor CLI](https://docs.endor.dev/cli/)

**Docs**
- **Examples:**  https://github.com/nestjs/nest/tree/master/sample
- **Reap API:**  https://reap.readme.io/reference/test-environment
- **Wormhole SDK:** https://github.com/wormholenetwork/wormhole-sdk
- **Peaq SDK:** https://docs.peaq.xyz/build/getting-started/install-peaq-sdk

----

## Quick Start

**Build/install and add Endor cli.**
```bash
pnpm install
npm install -g @endorhq/cli
```

**Start PostgreSQL:**

**ℹ️ NOTE:** _Start each in a separate terminal tab_

```bash
pnpm db
```

**Start service:**

```bash
pnpm dev
```

### Setup Config

**Setup `.env` file:**
Login to [Reap](https://dashboard.reap.global/login) to provision an API key.

```dotenv
REAP_BASE_URL=https://sandbox.api.caas.reap.global/
REAP_API_KEY=
REAP_DOCS=https://reap.readme.io/reference/test-environment
APP_URL=127.0.0.1
PEAQ_RPC_SERVER_URL=https://quicknode1.peaq.xyz
PEAQ_WSS_SERVER_URL=wss://quicknode1.peaq.xyz
ETH_DEV_SEED=
```

**Install Foundry CLI:**
[Foundry](https://getfoundry.sh/introduction/installation) is a CLI too suite for working with Ethereum/Solidity smart contracts.
We will use `cast` to create a new wallet.

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

**Create a new EVM wallet:**
Set this as your `ETH_DEV_SEED`.  Only use this for dev.
https://getfoundry.sh/cast/reference/wallet
```bash
cast wallet new
```
- Fund wallet with peaq: https://docs.peaq.xyz/build/getting-started/fund-your-wallet

**Open browser:**
After starting the service, open the following:
* Swagger API Docs:  http://127.0.0.1:3000/api
* http://127.0.0.1:3000/

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

**Connect to PostgreSQL via CLI**

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

This project is licensed under the MIT License—see the [LICENSE](./LICENSE) file for details.

----

<p align="center">
  <a href="https://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

----

[🥚](%F0%9F%A5%9A)



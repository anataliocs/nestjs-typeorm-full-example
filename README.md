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
    <img alt="Build+Test Status" src="https://github.com/anataliocs/nestjs-typeorm-full-example/actions/workflows/pnpm-check.yml/badge.svg">
</a>
<a href="https://github.com/anataliocs/nestjs-typeorm-full-example/actions/workflows/github-code-scanning/codeql">
    <img alt="Code QL Status" src="https://github.com/anataliocs/nestjs-typeorm-full-example/actions/workflows/github-code-scanning/codeql/badge.svg">
</a>

</div>

----

<div style="text-align: center;" align="center"> 
    <a href="https://codespaces.new/anataliocs/nestjs-typeorm-full-example">
        <img alt="Build Status" src="https://github.com/codespaces/badge.svg">
    </a>
</div>

# Nestjs TypeORM Full Example for Web3 SDKs

Example of a **NestJS** application with **PostgreSQL** and **Axios** integrating into multiple Web3 SDKs.

This project modularizes popular Web3 SDKs, handles the lifecycle management, abstracts away complexity, adds
configuration mgmt and exposes simplified interfaces in **REST API**, **GraphQL**, **Websocket** and **SSE(Server-Sent
Events)** endpoint formats.

These endpoints are consumed by ultra-lightweight, nano-clients including: 
- raw html+vanilla.js(Single-file)
- [htmx(single-file)](https://htmx.org/)
- Swagger Web UI
- GraphQL Playground

The resulting **NestJS** app will be a Dockerized, stateless, cloud-native, horizontal-scalable,
microservice-oriented backend for a decentralized application.

Reactive, async, non-blocking, event-driven back-ends are very powerful for on-chain, blockchain-powered dApps.

**Endpoints**

Endpoints and ultra light-weight clients for consuming data.

- **REST API**
    - Swagger: http://127.0.0.1:3000/api
    - Script: [scripts/get.http](scripts/get.http)
    - OpenAPI JSON(Import into Postman): http://127.0.0.1:3000/api-json
    - Vanilla.js:  [client/src/restapi/ethers/rest-finalized-block.html](client/src/restapi/ethers/rest-finalized-block.html)
- **GraphQL**
    - GraphQL Playground: http://localhost:3000/graphql
    - cURL Shell Script: [scripts/ethers/graphql-curl.sh](scripts/ethers/graphql-curl.sh)
    - Script: [scripts/graphql.http](scripts/graphql.http)
- **Websockets**
    - Vanilla.js: [client/src/ws/ethers/ws-block-number.html](client/src/ws/ethers/ws-block-number.html)
    - Vanilla.js: [client/src/ws/ethers/ws-finalized-blocks.html](client/src/ws/ethers/ws-finalized-blocks.html)
    - [scripts/ws.http](scripts/ws.http)
- **SSE**
    - Vanilla.js: [client/src/sse/ethers/block-number.html](client/src/sse/ethers/block-number.html)
    - Vanilla.js: [client/src/sse/ethers/finalized-blocks.html](client/src/sse/ethers/finalized-blocks.html)
    - HTMX: [client/src/sse/ethers/htmx-block-number.html](client/src/sse/ethers/htmx-block-number.html)

#### Tech Stack:

- [Nest](https://github.com/nestjs/nest)
- [TypeORM](https://docs.nestjs.com/techniques/database#typeorm-integration)
- [PostgreSQL](https://www.postgresql.org/)
- [Swagger](https://swagger.io/)
- [Typescript](https://www.typescriptlang.org/)
- [Endor CLI](https://docs.endor.dev/cli/)

**The SDKs used in this example:**
- Stablecoin cards: [Reap](https://reap.readme.io/reference/test-environment)
- Interoperability: [Wormhole](https://wormhole.com/docs/tools/typescript-sdk/sdk-reference/)
- On-chain IoT: [Peaq](https://docs.peaq.xyz/build/getting-started/install-peaq-sdk)
- EVM: [Ethers](https://docs.ethers.org/v6/)

----

## Quick Start

**Build/install and add Endor cli.**

CLI used for running local PostgreSQL and other cloud services.

```bash
pnpm install
npm install -g @endorhq/cli
```

**Start PostgreSQL:**

**ℹ️ NOTE:** _Start each in a separate terminal tab_

This will start a local PostgreSQL instance using Endor CLI.

```bash
pnpm db
```

**Start service:**

Lint test and run dev.

```bash
pnpm dev
```

### Set up Config

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
[Foundry](https://getfoundry.sh/introduction/installation) is a CLI too suite for working with Ethereum/Solidity smart
contracts.
We will use `cast` to create a new wallet.

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

**Create a new EVM wallet:**
Set this as your `ETH_DEV_SEED`. Only use this for dev.
https://getfoundry.sh/cast/reference/wallet

```
cast wallet new
```

**Run local eth node**

```bash
anvil --fork-url https://reth-ethereum.ithaca.xyz/rpc
```

- Fund wallet with peaq: https://docs.peaq.xyz/build/getting-started/fund-your-wallet

**Open browser:**
After starting the service, open the following:

* Swagger API Docs:  http://127.0.0.1:3000/api
* Home page: http://127.0.0.1:3000/

----

## Run local PostgreSQL

The command pnpm db abstracts away the complexity of running a local PostgreSQL node.  
Here are more details on how it's used.

https://docs.endor.dev/cli/services/postgres/

**Endor CLI:**
A lightweight developer tool to run local cloud services (like PostgreSQL) with one command
using reproducible containers. See docs: https://docs.endor.dev/cli/

**Endor PostgreSQL**

```bash
endor run postgres
```

**Connect to PostgreSQL via CLI**

```bash
psql -h localhost -U postgres -d postgres
```

## Run the Project in Different Environments

```bash
# lint test and run dev
pnpm dev

# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

----

## NestJS CLI Usage

https://docs.nestjs.com/cli/overview

**Create a new resource:**

- Generate a module
- Generate a controller
- Generate a service
- OPTIONAL: Generate an entity class/interface
- OPTIONAL: Generate Data Transfer Objects

```bash
nest g resource new-resource
```

**Create a new project:**

Create a new project using

- pnpm
- Typescript
- `--strict` flag

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

## Server Sent Events

In this example, we use `ethers.js` to check for new blocks
and use an `Observable` to emit to blocks to a `html` file and display them with just a couple lines of vanilla JS.

We used the `nest.js` Server Sent Event controller functionality to create
a SSE endpoint `/ethers/sse/block-number/`.

- https://docs.nestjs.com/techniques/server-sent-events

### With html and vanilla.js

**Minimal client using a SINGLE `.html` file: `client/src/sse/ethers/block-number.html`**

- Raw HTML with vanilla.js
- Uses `EventSource` API - https://developer.mozilla.org/en-US/docs/Web/API/EventSource
- Uses `picocss` delivered via public CDN for styling

**Setting up a EventSource with a NestJS SSE Endpoint**

```typescript
const eventSource = new EventSource('http://127.0.0.1:3000/ethers/sse/block-number/', {
  withCredentials: false,
});
```

### With HTMX

HTMX further abstracts away logic, using custom HTML tags to replace even the Javascript
from the previous example with vanilla.js.

**Minimal client using `.htmx`: `client/src/sse/ethers/htmx-block-number.html`**

- Raw HTML with [htmx](https://htmx.org/)
- Uses `picocss` delivered via public CDN for styling

**Setting up SSE with htmx**

```html

<article id="messages" hx-ext="sse" sse-connect="http://127.0.0.1:3000/ethers/sse/block-number/"
         sse-swap="message"></article>
```

----

## WebSocket

We use, `ethers.js` to poll for new blocks and use an rxjs `Observable` to emit blocks
via a `nest.js` Websocket gateway, with the `ws` adapter and display the results using the `vanilla.js` Websocket API
on the client side..

### With html and vanilla.js

**Example minimal client using `.html` file: `client/src/ws/ethers/ws-block-number.html`**

- Raw HTML with vanilla.js
- Uses `WebSocket` API - https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API
- Uses `picocss` delivered via public CDN for styling
- [Nest.js Websocket Gateway](https://docs.nestjs.com/websockets/gateways)
- [ws Adapter](https://github.com/websockets/ws)

**Setting up a Websocket with a NestJS WS Gateway**

```typescript
const socket = new WebSocket('ws://localhost:81');
```

----

## GraphQL

We use, `ethers.js` to get a block by block number and use an rxjs `Observable` to emit the block
via a `nest.js` GraphQL Resolver with an Apollo Server.

----

## Misc

Related info and links.

### API URL Best Practices

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

### Block Explorers

- https://wormholescan.io/
- https://peaqscan.xyz/
- https://etherscan.io/

----

## License

This project is licensed under the MIT License—see the [LICENSE](./LICENSE) file for details.

----

<p align="center">
  <a href="https://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

----

[🥚](%F0%9F%A5%9A)



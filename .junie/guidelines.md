# NestJS + TypeScript Best Practices

This document defines project-wide conventions for writing consistent, safe, and maintainable NestJS + TypeScript code in this repository.

These rules are additive to `eslint`, `tsconfig`, and existing docs, and should be followed for all new and modified code.

## Core Principles

- Prefer a reactive paradigm using RxJS and `Observable` where practical, particularly for I/O-bound workflows, streams, WebSockets, and GraphQL subscriptions.
- Keep framework-facing layers (HTTP controllers, GraphQL resolvers, WebSocket gateways) thin. Push business logic into injectable services and domain modules.
- Use the strictest types possible. Avoid implicit `any`; never use `any` explicitly. Prefer generics and precise union/intersection types to model domain data.
- Always define an explicit, fully-typed return type for functions that return a value (including generics where appropriate). Do not rely on inference for public APIs.
- Fully document functions and classes with JSDoc including appropriate tags (`@param`, `@returns`, `@throws`, `@template`, `@remarks`, `@example`).
- Prefer composition over inheritance unless a base type is required by a framework contract.
- Single Responsibility: each provider/class should own one clear responsibility.

## Reactive Programming (RxJS)

- Prefer `Observable` over `Promise` when dealing with:
  - Streams (WebSockets, Server-Sent Events, blockchain event feeds, file streams)
  - Repeated polling and backoff strategies
  - Concurrency control across multiple async sources
  - Cancelling work based on lifecycle or request scope
- Interop: boundary APIs may return `Promise` to external callers (e.g., Nest auto-await in HTTP controllers). Internally, favor `Observable` composition, converting at the boundary only when necessary using `lastValueFrom`/`firstValueFrom` or `from(Promise)`.
- Use pipeable operators (`map`, `mergeMap`, `switchMap`, `catchError`, `shareReplay`, `retry`, `retryWhen`, `takeUntil`, etc.) and avoid manual subscription in services. Let Nest handle subscription lifecycle in controllers/gateways, or expose cold Observables and subscribe in orchestrators with teardown.
- Never call `.subscribe()` inside controllers/resolvers; instead, return the `Observable` directly so Nest/transport can handle it when supported.
- For WebSocket gateways and long-lived streams, ensure cleanup via `OnModuleDestroy`/`OnApplicationShutdown`, and use `takeUntil(destroy$)` patterns to prevent leaks.

## Layering and Boundaries

- Controllers/Resolvers/Gateways:
  - Only orchestrate: validate inputs (via DTOs), call service methods, map outputs, and choose HTTP codes.
  - No business rules, external SDK calls, or DB queries directly.
  - Return DTOs or typed results; do not return raw ORM entities unless intentionally exposed.
- Services:
  - Hold business logic and integrations (ORM/DB, SDKs like Ethers, HTTP clients).
  - Expose typed methods; prefer reactive return types for evented/streaming data.
  - Encapsulate retries/backoff/circuit breaking.
- Modules:
  - Group providers by bounded context; keep module public APIs small via `exports`.

## TypeScript Strictness

- Enable and keep `strict` options in `tsconfig` (no implicit any, strict null checks, etc.).
- Never use `any`. If a type is unknown, use `unknown` and narrow it, or define a structural interface/type.
- Prefer `readonly` for fields and arrays that must not change.
- Use `as const` for literal data where immutability and exact types are desired.
- Model domain data with precise types and generics. Example: `Result<T, E>` for domain outcomes instead of throwing exceptions for expected control flow.
- Always annotate exported/public functions and class methods with explicit return types including generics.

## JSDoc Documentation

- Each public class, interface, function, and method must include JSDoc with:
  - Summary line describing purpose
  - `@param` for every parameter including type/meaning
  - `@returns` describing the return type and meaning
  - `@throws` for expected error cases
  - `@example` for non-trivial functions
  - `@template` for generic type parameters when helpful

Example:

```text
/**
 * Get a block by hash or tag.
 * @template TTag extends ethers.BlockTag
 * @param blockHashOrBlockTag - The hash or tag (e.g., 'latest', number).
 * @returns Observable<Block | null>
 * @throws {ProviderError} When the RPC provider fails.
 */
getBlock$<TTag extends ethers.BlockTag>(blockHashOrBlockTag: TTag): Observable<Block | null> { /* ... */ }
```

## Error Handling

- Fail fast with typed errors. Create domain-specific error classes rather than throwing strings.
- In RxJS flows, use `throwError(() => new DomainError(...))` and handle with `catchError` at appropriate boundaries.
- Do not swallow errors; log with context and either map to a safe DTO or rethrow.
- Use Nest `HttpException` (and subclasses) only in the transport layer (controllers/guards/interceptors), not deep in domain services.

## Logging & Observability

- Use Nest `Logger` per class (`new Logger(ClassName)`) or injected logger abstraction.
- Log at appropriate levels (`debug`, `log`, `warn`, `error`) with contextual metadata but no PII.
- For long-lived connections (e.g., RPC providers), log lifecycle events in `onModuleInit` and `onApplicationShutdown`.
- Consider interceptors for request-scoped logging and metrics.

## Validation & DTOs

- Use DTO classes with `class-validator` and `class-transformer` in controllers/resolvers.
- Keep DTOs separate from persistence entities; map explicitly in services.
- Validate all external inputs (HTTP body/params/query, WS payloads, GraphQL args).

## Configuration & Secrets

- Use `@nestjs/config` `ConfigService` to read environment variables; never read from `process.env` directly in business logic.
- Validate configuration at startup (e.g., with Joi or zod) and fail fast.
- Never log secrets. Keep API keys in env or secret manager and inject via config.

## Concurrency & Resource Management

- For SDKs like Ethers:
  - Keep a single provider instance per module/context.
  - Ensure cleanup with `onApplicationShutdown` and remove listeners.
  - Prefer typed wrappers around SDKs for consistent error handling and typing.
- Use `AbortController`/cancellation or RxJS `takeUntil` to avoid leaks.

## Testing

- Unit test services with deterministic inputs; use test doubles for SDK/DB.
- For reactive code, test Observables with marble tests or explicit assertions via `firstValueFrom`.
- E2E tests for controllers/resolvers/gateways covering validation, auth, and error mapping.

## Security

- Validate and sanitize all inputs; apply Nest `ValidationPipe` globally.
- Use guards for authZ/authN and keep them thin.
- Avoid leaking stack traces to clients; map errors to safe responses.

## Performance

- Use caching where appropriate (e.g., `CacheModule`, `shareReplay` for cold Observables) with explicit TTLs and invalidation strategies.
- Avoid N+1 queries in resolvers; use DataLoader patterns for GraphQL.

## Code Style & Structure

- Follow existing import order and file layout. Group domain modules by feature.
- Name files by their Nest role (`*.controller.ts`, `*.service.ts`, `*.resolver.ts`, `*.gateway.ts`).
- Keep functions short and focused; extract private helpers in the same class when only used locally.
- Prefer `private readonly` for dependencies injected via constructor.
- Avoid static utility functions in favor of injectable helpers when they have dependencies or state.

## Promises vs Observables

- Use `Promise` for one-shot async operations in imperative contexts (e.g., boot-time `onModuleInit`).
- Use `Observable` for streams, retries, cancellation, and composition-heavy flows. Convert at boundaries as needed.

## Example Patterns

- Thin controller, reactive service:

```text
// controller
@Get('blocks/:tag')
getBlock(@Param('tag') tag: string): Observable<Block | null> {
  return this.blocksService.getBlock$(tag as ethers.BlockTag);
}

// service
getBlock$(tag: ethers.BlockTag): Observable<Block | null> {
  return defer(() => from(this.provider.getBlock(tag))).pipe(
    retry({ count: 2, delay: 250 }),
    catchError(err => {
      this.logger.error('getBlock failed', err);
      return throwError(() => new ProviderError('Failed to fetch block', { cause: err }));
    }),
  );
}
```

## Commit & PR Hygiene

- Small, focused commits with descriptive messages.
- PRs must include rationale, screenshots/logs for behavior changes, and tests where applicable.

---

Checklist for new code:

- [ ] Controller/Resolver/Gateway is thin; business logic in service
- [ ] DTOs with validation used at boundaries
- [ ] No `any`; strict, explicit return types used (with generics as appropriate)
- [ ] JSDoc added to public APIs with tags
- [ ] Reactive approach considered; Observables returned when beneficial
- [ ] Errors typed and handled; logs with context without PII
- [ ] Resources cleaned up on shutdown; subscriptions cancellable

---
apply: always
---

# Baseline Engineering Rules — NestJS + TypeScript

These rules apply to all new and existing code in this repository. They codify TypeScript/NestJS best practices with emphasis on strict typing, reactive patterns (RxJS), layered architecture, and maintainability.

## TypeScript Strictness
- Always enable and honor the strictest compiler options. Code must compile cleanly with `"strict": true` and without `any` leaks.
- Never use the `any` type. Prefer:
  - Precise interfaces and type aliases
  - Generics with constraints (e.g., `<T extends Record<string, unknown>>`)
  - Discriminated unions and enums where appropriate
- Explicitly declare the strictest, fully-typed return types on all exported/public functions and methods, including generics where appropriate. Do not rely on inference for public APIs.
- Prefer `readonly` where possible (class properties, arrays, tuples) to communicate immutability.
- Avoid type assertions (`as Type`) unless absolutely necessary; instead, refine types through guards, predicates, and proper DTOs. If an assertion is unavoidable, narrowly scope it and document the rationale.
- Prefer `unknown` over `any` when a top-level unknown value is unavoidable; narrow it before use.
- Use `never` to make exhaustiveness checks explicit in `switch`/union handling.

## Reactive Paradigm (RxJS First)
- Favor a reactive paradigm using RxJS and `Observable` where streaming, evented, or async composition is present.
  - Wrap Promise-based SDK calls with `from()` and compose with RxJS operators (`map`, `mergeMap`, `switchMap`, `catchError`, `retry`, `shareReplay`, etc.).
  - Prefer `Observable` for controllers/resolvers/gateways when responses can be streamed, are long-lived (SSE/WebSockets), or benefit from operator composition.
  - Keep side-effects confined to operators designed for them (`tap`) and avoid mixing imperative async logic with reactive chains.
- Do not convert `Observable` back to `Promise` in presentation layers unless a framework adapter requires it.
- When bridging between Promise APIs and Observables, centralize the bridge in services to maintain consistency and testability.

## Layered Architecture & Separation of Concerns
- Keep controllers, GraphQL resolvers, and WebSocket gateways thin. They should:
  - Perform request/parameter validation and delegation only
  - Contain no (or minimal) business logic
  - Delegate to services for domain logic and data access
- Encapsulate third-party SDKs (e.g., ethers) behind adapter services. Do not leak SDK types across module boundaries. Map to internal domain models/DTOs.
- DTOs are transport shapes only; domain logic lives in services.
- Expose stable, typed interfaces from services. Keep service methods cohesive and side-effect aware.
- For GraphQL, map external/service outputs to GraphQL models explicitly; do not expose raw SDK responses.

## Documentation & JSDoc
- Fully document all functions, methods, classes, and public fields using JSDoc.
  - Include `@param`, `@returns`, `@throws`, `@template` (for generics), and other relevant tags (`@deprecated`, `@example`).
  - Document units, expected ranges, and invariants. Keep examples executable where feasible.
- Document any non-trivial RxJS pipelines: the intent, key operators, and backpressure/retry behavior.
- For type guards and helpers, document the narrowing behavior and guarantees.

## API Design & Return Types
- Explicit, strict return types are mandatory for exported/public functions, including generics where appropriate.
- Prefer narrow, intention-revealing types over broad structural types.
- For nullable or optional results, encode explicitly using `T | null` or `T | undefined` and handle at call sites. Avoid undocumented sentinel values.
- For streaming endpoints (SSE/WS), return `Observable<WsResponse<T>>` / `Observable<MessageEvent<T>>` as applicable. Keep mapping from domain to transport types in services.

## Validation, Serialization, and Errors
- Enable global validation with `class-validator` and `class-transformer` via Nest’s `ValidationPipe` with `whitelist: true`, `forbidNonWhitelisted: true`, and `transform: true` unless a specific endpoint needs different behavior.
- Keep DTOs annotated for validation and proper serialization. Avoid exposing internal fields.
- Throw Nest HTTP exceptions (e.g., `BadRequestException`, `NotFoundException`) from services/controllers with precise, user-safe messages. Do not leak internal errors.
- For RxJS flows, use `catchError` to map low-level errors to domain-specific errors and to avoid stream termination where appropriate.

## Configuration & Environment
- Centralize configuration via `@nestjs/config`. Validate environment variables at startup with a schema (e.g., `zod` or `Joi`).
- Do not access `process.env` directly in application code; read from typed configuration providers.

## Logging & Observability
- Use Nest’s `Logger` for structured logs. Prefer contextual loggers per class (`new Logger(ClassName)`).
- Log at appropriate levels; avoid logging sensitive data. Correlate multi-step operations with request IDs or similar correlation metadata where available.
- Consider interceptors for timing/metrics and filters for standard error shaping.

## Concurrency, Resource Use, and Backpressure
- For polling/streaming with RxJS, apply operators like `throttleTime`, `debounceTime`, `bufferTime`, and `distinctUntilChanged` as needed to prevent overload.
- Guard external calls with `retry`, `retryWhen`, and circuit-breaker patterns where appropriate; always include bounded retries and jittered delays.
- Use `takeUntil`/`finalize` to release resources when clients disconnect.

## Ethers/External SDK Integration
- Wrap SDK calls in adapter services (e.g., `EthersSdkService`). Do not return SDK types from public service APIs; map to internal models/DTOs.
- Normalize optional/missing fields once at the adapter/service boundary (avoid repeated `?? ''` throughout the app).
- Prefer pure transformation functions for mapping SDK -> DTO/GraphQL model. Unit test these mappings.

## Module, Provider, and File Organization
- One logical concern per file. Keep files short and focused.
- Use Nest modules to enforce clear boundaries. Export the minimum set of providers needed.
- Prefer constructor injection. Avoid property injection or service locators.
- Keep provider scopes explicit (`@Injectable({ scope: Scope.REQUEST })` etc.) where lifecycle matters.

## Naming, Style, and Linting
- Follow established naming: `PascalCase` for classes, `camelCase` for functions/variables, `CONSTANT_CASE` for constants, kebab-case for file names unless framework conventions differ (e.g., `.resolver.ts`).
- Use ESLint with TypeScript and RxJS plugins. Address all warnings; treat new warnings as errors.
- Keep imports ordered and minimal. Prefer type-only imports (`import type { T } from ...`) where supported to reduce runtime overhead.

## Testing
- Unit-test services and pure functions. Mock external SDKs at the adapter boundary.
- For RxJS, test streams deterministically with marbles or by asserting sequences over time.
- Provide e2e tests for major routes/resolvers. Avoid hitting real external services in CI.

## Performance & Reliability
- Cache hot lookups with explicit TTL where useful; invalidate carefully.
- Avoid N+1 patterns in data access and external SDK calls. Batch or parallelize with `forkJoin`/`combineLatest` when appropriate.

## Security
- Validate and sanitize all inputs. For GraphQL, enforce depth/complexity limits.
- Avoid leaking stack traces. Ensure errors returned to clients are sanitized.
- Keep dependencies updated and audited (see `security/dependency-audit.js`).

## Migration & Deprecation
- Mark deprecated APIs with `@deprecated` and provide migration paths. Remove deprecated code on schedule.

---

Checklist for new/changed code:
- No `any`; strict explicit return types declared (with generics where appropriate)
- Controllers/resolvers/gateways are thin; logic resides in services
- Reactive approach used where streaming/composition benefits exist
- Full JSDoc with tags on all functions/classes
- DTOs validated and correctly mapped; no SDK types leaked
- Errors/logging/observability handled consistently
- Tests updated/added as needed


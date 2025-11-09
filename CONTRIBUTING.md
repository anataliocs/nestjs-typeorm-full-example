# Contributing Guidelines

Thank you for your interest in contributing! This project is a NestJS + TypeORM example app using pnpm. The goal of these guidelines is to make it easy to propose improvements and keep the repo healthy.

## Table of Contents
- Code of Conduct
- Getting Started
- Development Workflow
- Commit Message Convention
- Pull Request Guidelines
- Testing
- Linting & Formatting
- Project Scripts Reference
- Security

## Code of Conduct
By participating, you agree to uphold the standards of respectful, inclusive, and constructive collaboration. Be kind and considerate in all interactions.

## Getting Started
1. Fork the repository and clone your fork.
2. Ensure you have the following installed:
   - Node.js 18+ (LTS recommended)
   - pnpm 9+
   - Optional: Endor CLI if you want to run local PostgreSQL: `npm i -g @endorhq/cli`
3. Install dependencies:
   - `pnpm install`

## Development Workflow
- Run PostgreSQL locally (optional if your change doesn’t require DB access):
  - `endor run postgres`
- Start the app in watch mode:
  - `pnpm start:dev`
- Open Swagger at http://127.0.0.1:3000/api

Before opening a PR, make sure to:
- Build: `pnpm build`
- Lint and fix: `pnpm lint`
- Run tests: `pnpm test` (or `pnpm test:ci` in CI-like conditions)

## Commit Message Convention
Use Conventional Commits to keep history readable and enable tooling:
- Format: `type(scope): short description`
- Common types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `build`, `ci`.
- Examples:
  - `feat(stablecoins): add endpoint to create card`
  - `fix(user): validate email format in DTO`
  - `docs: explain local DB workflow in README`

## Pull Request Guidelines
- Keep PRs focused and small when possible.
- Link related issues (e.g., “Closes #123”).
- Include a clear description of what and why.
- Update or add tests for changed functionality.
- Update docs (README or comments) when behavior changes.
- Ensure the checklist below is satisfied:
  - [ ] Code compiles (pnpm build)
  - [ ] Lint passes (pnpm lint)
  - [ ] All tests pass locally (pnpm test)
  - [ ] API changes documented (Swagger/README where applicable)

## Testing
- Unit tests: `pnpm test`
- E2E tests: `pnpm test:e2e`
- Coverage: `pnpm test:cov`

Add tests alongside your changes. For NestJS controllers/services, prefer fast unit tests with mocks. Use e2e tests only for flows that require the full app.

## Linting & Formatting
- ESLint: `pnpm lint`
- Prettier is applied via the lint setup; format on save in your editor is recommended.

## Project Scripts Reference
- `pnpm dev` → lint then start in watch mode
- `pnpm start` → start once
- `pnpm start:dev` → start with watch
- `pnpm start:prod` → run compiled app
- `pnpm build` → compile with SWC and type-check
- `pnpm lint` → run ESLint with autofix
- `pnpm test` / `pnpm test:e2e` / `pnpm test:cov` → run tests
- `pnpm test:ci` → build + lint + jest in CI
- `pnpm db` → run local PostgreSQL via Endor CLI

## Security
If you discover a security issue, please do not open a public issue. Instead, email the maintainer or repository owner directly. Provide steps to reproduce and any relevant logs. We will work to triage and address the problem as soon as possible.

---

Thanks again for contributing! Your time and effort are appreciated.
# Yuniko - Architecture & Phase 1 Plan

This document describes the production-ready architecture and the changes introduced in Phase 1 (audit & architecture rebuild). It is intentional, conservative, and non-breaking: it prepares the repository for feature implementation later.

Principles
- Keep the codebase modular and package-oriented (pnpm workspace).
- Use clear responsibilities and single-responsibility modules.
- No feature work is added in Phase 1. Only refactors, cleanup, and scaffolding.
- Security-first: document and require environment secrets and safe defaults.

High-level architecture (prepared for scale)

- Frontend: single-page React app or multiple platform-specific apps (web, mobile). Use Vite or Expo in later phases. UI components live in lib/ui for reuse.
- API: artifacts/api-server contains a small Express-based artifact. Move to a stateless API (serverless or containerized) supporting horizontal scaling. Use JWT/OAuth and an auth gateway.
- Database: choose a scalable managed DB (Postgres) with connection pooling (PgBouncer) and read replicas. Use a typed ORM (Drizzle or Prisma) and migrations for schema evolution.
- Storage: use S3-compatible object storage for media. Serve via CDN and signed URLs for access control.
- Caching: use Redis for session tokens, rate-limiting, and ephemeral caches. Use CDN + caching headers for static assets.
- Observability: structured logs (pino), distributed tracing (OpenTelemetry), metrics + health checks.
- Security: secret management (vault / provider secrets), minimum-release-age for packages (already in pnpm-workspace), input validation (Zod), output sanitization.

Phase 1 changes performed
- Docs: this ARCHITECTURE.md and README.md added.
- UI: lib/ui small design system and common components.
- Tooling: ESLint + Prettier configuration.
- Workspace: pnpm-workspace adjusted to include lib/ui.

Next steps (Phase 2+)
- Add or wire a concrete frontend app using lib/ui and lib/api-client-react.
- Harden API authentication and session handling.
- Implement storage, migrations, and CI/CD pipelines.


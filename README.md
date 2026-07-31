# Yuniko.app

This repository is a pnpm monorepo containing generated API client packages and server artifacts for the Yuniko application.

This commit reorganizes and hardens the project foundation (Phase 1). It does NOT add social features or replace the existing project. Instead it:

- Adds architecture documentation and a clear roadmap for production readiness.
- Adds a small, shared UI library with design tokens and common components (Button, Input, Loading, ErrorBoundary, EmptyState) to normalize UI across screens.
- Adds linting / formatting configuration (.eslintrc, .prettierrc).
- Registers the new lib/ui package in the pnpm workspace.
- Provides developer instructions and run scripts in README.

Goal: provide a clean, maintainable, production-ready foundation for the next phases.

Quick start

1. Install with pnpm (pnpm is required):

   pnpm install

2. Typecheck the workspace:

   pnpm run typecheck

3. Build packages (if any provide a build script):

   pnpm run build

Notes
- This change intentionally avoids implementing high-level features (auth, feeds, messaging). Those are planned for later phases.
- The new UI library is intentionally small and dependency-free so it can be used in both React web and native targets as a baseline design system.

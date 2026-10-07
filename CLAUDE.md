# CLAUDE.md - Storefront Application V2 Boilerplate

## Overview

The Storefront Application V2 boilerplate is a Nuxt 4-based e-commerce application built on the SCAYLE Storefront SDK. External developers fork this to build storefronts on the SCAYLE Commerce Engine.

ALWAYS import from `@scayle/storefront-nuxt`. NEVER import from `@scayle/storefront-core` or `@scayle/storefront-api` directly. The `storefront-nuxt` package re-exports everything needed.

This boilerplate is a **separate sub-workspace** with its own `pnpm-lock.yaml`. ALWAYS run `pnpm install` here separately (not from the V2 workspace root or the repo root).

ALWAYS use `pnpm` / `pnpm exec` for running scripts and packages. NEVER use `npm`, `npx`, `pnpx`, or `yarn`.

## Architecture

### Import rules

ALWAYS use explicit imports. Nuxt auto-imports are **disabled** (`imports.autoImports: false` in `nuxt.config.ts`).

**Nuxt-specific aliases (MUST use):**

- `#vue-router` instead of `vue-router`
- `#i18n` instead of `@nuxtjs/i18n`
- `#storefront/composables` for storefront composables
- `#app/composables/{name}` for Nuxt composables (NEVER use `#imports` in client code)
- `#imports` ONLY in pure server context

### Directory structure

- `app/`: Pages (file-based routing), components (feature-organized), composables, layouts, middleware, plugins
  - `middleware/`: Use `.global.ts` suffix for global middleware (runs every route), `.ts` for route-specific
- `modules/`: Custom Nuxt modules: `cms/` (Storyblok, Contentful, Contentstack), `subscription/`, `tracking/` (GTM), `ui/`
- `rpcMethods/`: Custom RPC method handlers
- `config/`: Shop and UI configuration
- `i18n/locales/`: Translation files
- `server/`: Server-side plugins and utilities

### Feature packages (`v2/packages/_features/`)

Domain-specific Nuxt modules (basket, navigation, search, product-listing, etc.) published as separate `@scayle/*` npm packages. Each feature package:

- Defines a Nuxt module via `defineNuxtModule` in `src/module.ts`
- Registers RPC methods via the `storefront:custom-rpc:extend` hook
- Exports composables and utilities via subpath exports (e.g., `@scayle/storefront-basket/composables`)
- Provides test data factories using fishery
- Uses alias convention `#<package-name>/composables` for internal imports

### RPC methods

Custom server methods use `defineRpcHandler` from `@scayle/storefront-nuxt`. Place in `rpcMethods/`, export from `rpcMethods/index.ts`. They receive `RpcContext` with access to shop config, SAPI client, and cache.

Implement the `RpcHandler` interface with proper TypeScript typing. Use camelCase naming (e.g., `getProductById`). Add JSDoc for each method: purpose, params, return value, and any external calls or side effects.

### Rendering

Hybrid rendering with ISR configured via route rules in `nuxt.config.ts`. Page caching and SWR strategies are set per-route.

## Testing

- **Unit/Integration**: Vitest with happy-dom and `@nuxt/test-utils`
- **E2E**: Playwright with page object pattern in `testing/playwright/`
- **Load testing**: Artillery configs in `testing/artillery/`
- **Accessibility**: ARIA snapshot testing with `expect(element).toMatchAriaSnapshot()`, mobile/desktop separation via `isMobile(page)`, keyboard nav via `press('Tab'/'Enter'/'Space')` and `expect(element).toBeFocused()`, ARIA attribute assertions like `toHaveAttribute('aria-current', 'page')`

## Quality Workflow

- **Format** (after edits): `pnpm exec prettier --write <changed files>`
- **Lint** (after edits): `pnpm exec eslint --fix <changed files>`
- **Typecheck** (after completing a set of changes): `pnpm typecheck`
- **Test** (after modifying logic): `pnpm exec vitest run <test file>` for a single test, `pnpm test` for the full suite
- **Build** (before committing): `pnpm build`

## i18n

Translations in `i18n/locales/` as JSON files per locale (e.g., `en_GB.json`, `de_DE.json`). When adding new translation keys, ONLY add them to `en_GB.json`. NEVER modify other locale files. Uses `@nuxtjs/i18n` with `useI18n()` (import from `#i18n`).

**Key structure:** Use snake_case following `section.element.action` pattern (e.g., `product_details.add_to_cart`, `basket.checkout.confirm`). Group related translations under logical namespaces. Pluralization via `|` separator: `no items | one item | {count} items`. Dynamic content uses camelCase placeholders: `$t('order.confirmation', { orderNumber: '12345' })`.

## Key Conventions

- ALWAYS use `<script setup lang="ts">` for Vue components
- ALWAYS favor `ref()` over `reactive()` for reactive state
- Composables use camelCase with `use` prefix (e.g., `useAuthentication`, `useTracking`), live in `app/composables/`
- Tailwind CSS 3 for styling
- Storybook stories alongside components as `*.stories.ts`
- Shop/locale config in `config/shops.ts`
- CMS provider configurable via env var (default: SCAYLE CMS)
- Multi-shop, multi-locale support with path or domain-based routing

## Base Components

Base/UI components live in `modules/ui/runtime/components/`, grouped into subdirectories by related component. Design them to be highly reusable and configurable via props (never hardcode values). Provide sensible defaults with full customization allowed, and use slots for flexible content insertion.

# Unified Implementation Plan

This plan consolidates the requirements and technical decisions into a single execution guide.

## Executive summary

Build an OpenAPI-driven admin console that renders navigation, lists, detail views, and schema-driven forms from a small config file and a validated OAS document. The system ingests and normalizes OAS 3.0/3.1, builds an operation registry, and uses it to drive CRUD UI behavior. Dynamic forms are implemented with RJSF + AJV and support overrides, multi-step layout, and inline validation. The app uses React + MUI + Vite with TanStack Query and Zustand for data and client state, and ships as static assets to a CDN.

## 1) Configuration and validation

- Define `config.schema.ts` with Zod.
- Provide JSON/YAML examples.
- Validate navigation rules (leaf must have `path`, group must have `children`).
- Support list/form overrides and multi-step layout config.

References:
- `schemas/config.schema.ts`
- `docs/config-schema.md`
- `examples/config.json`
- `examples/config.yaml`

## 2) OAS ingestion and normalization

- Load OAS from local path or URL.
- Validate and dereference with `@apidevtools/swagger-parser`.
- Normalize schemas to JSON Schema Draft 2020-12.
- Build an operation registry:
  - Collection: GET/POST
  - Resource: GET/PUT/DELETE
- Extract request/response schemas and parameters.

References:
- `docs/oas-normalization.md`

## 3) API client and auth

- Base URL resolution via config or OAS server.
- Tenant scoping handled via base URL or path prefix.
- Path parameter substitution and query param serialization.
- Timeouts and retries.
- OAuth2 and bearer/JWT support with token refresh.

References:
- `docs/data-layer.md`

## 4) UI framework and navigation

- Build layout: header, left nav, main content.
- Render navigation tree from config with active state.
- Route to collection view per nav item.

References:
- `docs/ui-contracts.md`

## 5) Collection view

- Fetch list from collection GET.
- Render table headers from schema + `display_fields`.
- Search/filter via query params defined in OAS.
- Pagination using standard params when present.
- Show create button if POST exists.
- Row action menu based on resource operations.

References:
- `docs/ui-contracts.md`

## 6) Detail view

- Fetch resource via resource GET.
- Show edit pencil if PUT exists.
- Show delete with confirmation if DELETE exists.

References:
- `docs/ui-contracts.md`

## 7) Dynamic forms (RJSF + AJV)

- Generate forms from POST/PUT request body schemas.
- Map schema types to widgets.
- Apply UI schema overrides from config.
- Support multi-step layout.
- Prefill update forms via resource GET.
- Validate with AJV, show inline errors.

References:
- `docs/forms.md`

## 8) Extensibility

- Theme overrides.
- Custom widgets and field templates.
- Custom row actions with pre/post hooks.

References:
- `docs/extensibility.md`

## 9) Build and test

- Vite dev/build workflow.
- Unit tests for parsing and registry.
- Integration tests for list/detail/form flows.
- E2E CRUD tests with auth.

References:
- `docs/build-and-test.md`

# Build and Test

## Local development

- `npm install`
- `npm run dev` to start Vite dev server.

## Production build

- `npm run build` to produce static assets for CDN deployment.

## Environment configuration

- Config and OAS paths are read from the project root at runtime.
- Base URL can be overridden in config for target environments.

## Testing strategy

- Unit tests:
  - OAS normalization and operation registry
  - config schema validation
- Integration tests:
  - list/detail/form flows using mocked API responses
- E2E tests:
  - CRUD flows with auth token handling

## Linting and type checks

- `npm run lint`
- `npm run typecheck`

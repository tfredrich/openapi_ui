# OAS Normalization and Operation Registry

This document defines how the OpenAPI document is ingested, normalized, and mapped to UI actions.

## Inputs

- OAS v3.0.x and v3.1.x documents.
- Source can be local file path or remote URL (configurable).

## Ingestion pipeline

1. Load OAS via `oas_source`.
2. Validate and dereference `$ref` using `@apidevtools/swagger-parser`.
3. Normalize schemas to JSON Schema (Draft 2020-12) for form rendering.
4. Build an operation registry keyed by collection path and resource path.

## Path matching rules

- Collection path: `/resource` (no path params), must support GET.
- Resource path: `/resource/{id}` (path param), may support GET/PUT/DELETE.
- Pairing rule: the resource path is the collection path plus a single path param.
- If multiple resource paths match, prefer the one with `{id}`-like parameter names.

## Operation registry

Each registry entry includes:
- `collection_path`
- `resource_path`
- Methods:
  - Collection: GET (list), POST (create)
  - Resource: GET (read), PUT (update), DELETE (delete)
- Schemas:
  - `list_response_schema`
  - `detail_response_schema`
  - `create_request_schema`
  - `update_request_schema`
- Parameters:
  - `path_params`, `query_params`, `header_params`, `cookie_params`

## Schema extraction

- Prefer `application/json` for request and response bodies.
- If response is array-wrapped, treat the item schema as the list row schema.
- Capture validation keywords for client-side validation (required, minLength, format, enum, pattern, etc.).

## Error handling

- Invalid OAS results in a user-visible diagnostic with:
  - file/URL
  - parse error detail
  - missing required operations
- Missing collection GET for a nav item is a hard error.

## Caching strategy (future)

- Cache OAS content by `oas_source` + ETag/Last-Modified.
- Invalidate on config change or explicit refresh.

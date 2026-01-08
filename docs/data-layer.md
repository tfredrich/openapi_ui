# Data Layer

This document defines API interaction, authentication, caching, and request behavior.

## API client

- Base URL resolution
  - Prefer `api_base_url` from config when provided.
  - Otherwise, use the first `servers` entry from the OAS.
  - Tenant scoping is handled by base URL or path prefix (no tenant headers).
- Path parameter substitution for resource routes (e.g., `/v1/users/{id}`).
- Query parameter serialization for search and pagination.
- JSON request/response handling with `application/json` preference.
- Timeouts and retry policy for transient errors.

## Authentication

- OAuth2 (auth code + client credentials) and HTTP bearer/JWT.
- Token storage in client state.
- Automatic token refresh when refresh token is available.
- Attach `Authorization: Bearer <token>` to all API calls when configured.

## Caching and pagination

- Cache list and detail responses keyed by route + params.
- Invalidate list cache on create/update/delete.
- Support server-side pagination via `limit/offset/page` when present.

## Error handling

- Normalize errors into:
  - Field-level validation errors (form binding).
  - Global errors (toast/banner).
- Display OAS mismatches or missing operations as configuration errors.

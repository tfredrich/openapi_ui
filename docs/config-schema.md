# Console Configuration Schema

This document defines the configuration file used to drive navigation, list rendering, and form behavior.

## Top-level fields

- `name` (string, optional)
  - Application name shown in the header.
- `oas_source` (string, required)
  - Local file path or URL to the OpenAPI document.
- `api_base_url` (string, optional)
  - Overrides the OAS `servers` base URL.
- `security_config` (object, optional)
  - Supports `oauth2`, `bearer`, or `none`.
- `navigation` (array, required)
  - Navigation tree used to build the left-hand menu.

## Navigation items

Each navigation node supports either a `path` (leaf item) or `children` (group item).

- `label` (string, required): Menu label.
- `path` (string, optional): OAS collection path (must support GET).
- `children` (array, optional): Nested navigation items.
- `display_fields` (array of strings, optional): Table columns for collection view.
  - Use `"*"` to include all remaining fields not explicitly listed.
- `list_overrides` (object, optional): Column overrides for list view.
- `form_overrides` (object, optional): Field overrides and layout for forms.

## Overrides

### `list_overrides`
- `hidden` (array): Fields hidden from the list view.
- `labels` (object): Field label overrides.
- `widgets` (object): Optional widget hints.
- `order` (array): Explicit field ordering.

### `form_overrides`
- `layout` ("single" | "multi-step")
- `steps` (array): Multi-step configuration with `{ id, title, fields }`.
- `field_overrides`: Same structure as `list_overrides`.

## Security config

### OAuth2
- `type`: `"oauth2"`
- `client_id`: required
- `authority`: required (OIDC discovery base URL)
- `client_secret`: optional
- `scopes`, `audience`: optional

### Bearer/JWT
- `type`: `"bearer"`

### None
- `type`: `"none"`

## Validation rules

- A navigation item must have either `path` or `children` (not both).
- `display_fields` entries must be non-empty strings.
- If `security_config.type` is `oauth2`, `client_id` and `authority` are required.

## Examples

See `examples/config.json` and `examples/config.yaml`.

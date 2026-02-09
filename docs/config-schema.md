# Console Configuration Schema

This document defines the configuration file used to drive navigation, list rendering, and form behavior.

## Top-level fields

- `title` (string, optional)
  - Application title shown in the top-left sidebar card.
- `sub_title` (string, optional)
  - Subtitle shown under the title in the top-left sidebar card.
- `name` (string, optional, legacy)
  - Backward-compatible alias for title.
- `oas_source` (string, required)
  - Local file path or URL to the OpenAPI document.
- `api_base_url` (string, optional)
  - Overrides the OAS `servers` base URL.
- `security_config` (object, optional)
  - Supports `oauth2`, `bearer`, or `none`.
- `navigation` (array, required)
  - Navigation tree used to build the left-hand menu.

## Navigation items

Each navigation node supports either a `collection` object (leaf item) or `children` (group item).

- `label` (string, required): Menu label.
- `collection` (object, optional): Collection-level config for list/create behavior.
  - `path` (string, required when `collection` exists): OAS collection path (must support GET).
  - `display_fields` (array of strings, optional): Table columns for collection view.
  - `list_overrides` (object, optional): Column overrides for list/detail view.
  - `form_overrides` (object, optional): Field overrides and layout for forms.
- `item` (object, optional): Element-level metadata.
  - `label` (string, optional): Singular resource label.
  - `path` (string, required when `item` exists): Element path template (example: `/users/{id}`).
- `icon` (string, optional): Generic MUI icon name for the nav item.
  - This is optional and not tied to any specific menu label.
  - Supported keys: `HomeOutlined`, `FolderOutlined`, `DashboardOutlined`, `TableRowsOutlined`, `DescriptionOutlined`, `SchemaOutlined`, `StorageOutlined`, `PeopleOutlined`, `KeyOutlined`, `PublicOutlined`, `BuildOutlined`, `ExtensionOutlined`, `SettingsOutlined`, `HelpOutlineOutlined`, `FeedbackOutlined`.
- `children` (array, optional): Nested navigation items.

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
- `as_base_url`: required (Authorization Server base URL; discovery at `/.well-known/openid-configuration`)
- `client_secret`: optional
- `scopes`, `audience`: optional
- `dev_bypass` (object, optional, development-only)
  - `access_token`: token used only when `VITE_DEV_AUTH_BYPASS=true`
  - `token_type`: optional, defaults to `Bearer`

### Bearer/JWT
- `type`: `"bearer"`

### None
- `type`: `"none"`

## Validation rules

- A navigation item must have either `collection.path` or `children` (not both).
- `display_fields` entries must be non-empty strings.
- If `security_config.type` is `oauth2`, `client_id` and `as_base_url` are required.
- `security_config.dev_bypass` is rejected outside development builds.

## Examples

See `examples/config.json` and `examples/config.yaml`.

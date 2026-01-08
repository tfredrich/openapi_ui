# Extensibility

This document defines extension points for custom UI behavior without modifying core logic.

## UI theming

- Theme tokens defined in a single theme module (colors, typography, spacing).
- Allow theme overrides via configuration or a theme export file.

## Custom widgets

- Register RJSF custom widgets by field path or schema type.
- Support custom field templates and object/array field templates.

## Actions and hooks

- Resource action registry with pre/post hooks for:
  - list fetch
  - detail fetch
  - create/update/delete
- Allow custom actions in the row action menu (e.g., "Reset password").

## Overrides

- Per-resource overrides:
  - list columns
  - labels
  - field visibility
  - widget selection
- Form layout overrides for multi-step forms.

## Extension API (future)

- Plugin interface for:
  - custom panels
  - field-level validations
  - external data lookups

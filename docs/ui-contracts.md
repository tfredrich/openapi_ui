# UI Contracts

This document defines UI behavior for navigation, collection list, detail view, and forms.

## Layout

- Header: app title and user actions.
- Left nav: hierarchical menu based on config.
- Main content: list, detail, and form views.

## Navigation

- Source of truth is config `navigation`.
- Active item is highlighted.
- Nested groups are collapsible.
- Selecting a nav item routes to its collection path view.

## Collection view (list)

- Loads via collection GET operation.
- Table headers are derived from schema and `display_fields`.
- Search/filter binds to query params defined in OAS.
- Pagination uses `limit/offset/page` params if present.
- Create button shown if collection POST exists.
- Row action menu uses resource path methods (GET/PUT/DELETE).

## Detail view

- Read-only display from resource GET.
- Edit pencil shown if PUT exists.
- Delete action triggers confirmation modal.

## Dynamic forms

- Forms generated from POST/PUT schemas using RJSF + AJV.
- Mapping rules:
  - string -> text input
  - integer/number -> number input
  - boolean -> checkbox
  - enum -> select
  - format: date -> date input
  - array -> multi-select or repeatable list
- Read-only fields are displayed but not editable.
- Update forms pre-populated from GET response.
- Validation based on schema constraints.
- Errors displayed inline by field.
- Cancel returns to previous view without API calls.

## Overrides

- `list_overrides` can hide columns, relabel, or order.
- `form_overrides` supports multi-step layout and field overrides.
- Widget hints passed to RJSF via UI schema.

## Accessibility

- All inputs labeled.
- Keyboard navigation and focus management in modals.
- Responsive layout for tablet and mobile.

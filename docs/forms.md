# Dynamic Forms (RJSF + AJV)

This document defines how OpenAPI schemas are translated into dynamic create/update forms.

## Schema source

- Create forms use the POST request body schema.
- Update forms use the PUT request body schema.
- Read-only fields use `readOnly: true` from schema.

## JSON Schema normalization

- OAS 3.1 schemas map directly to JSON Schema.
- OAS 3.0 schemas are normalized to Draft 2020-12.
- `required`, `enum`, `minLength`, `maxLength`, `pattern`, `format` are preserved.

## Field mapping

- `string` -> text input
- `integer`/`number` -> number input
- `boolean` -> checkbox
- `enum` -> select
- `format: date` -> date input
- `array` -> multi-select or repeatable list
- `object` -> nested fieldset

## UI schema overrides

- `form_overrides.field_overrides.labels` -> `ui:label`
- `form_overrides.field_overrides.hidden` -> `ui:widget: hidden`
- `form_overrides.field_overrides.widgets` -> `ui:widget` mapping
- `form_overrides.field_overrides.order` -> `ui:order`

## Multi-step layout

- `form_overrides.layout = "multi-step"`
- `form_overrides.steps[]` defines ordered steps and field grouping.
- Step navigation validates current step before proceeding.
- Final submission validates full schema.

## Validation

- AJV validates client-side using JSON Schema.
- API validation errors are merged into field errors when possible.

## Pre-population

- Update form uses resource GET data to prefill fields.

## Submission

- Submit POST/PUT with `application/json` body.
- Success returns to list or detail view.
- Cancel returns to previous view without API calls.

## Accessibility

- All fields labeled with accessible names.
- Multi-step navigation supports keyboard access.

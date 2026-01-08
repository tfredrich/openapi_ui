export function extractPropertyKeys(schema: any): string[] {
  if (!schema) return [];
  if (schema.type === "array" && schema.items?.properties) {
    return Object.keys(schema.items.properties);
  }
  if (schema.properties) {
    return Object.keys(schema.properties);
  }
  return [];
}

export function applyDisplayFields(displayFields: string[] | undefined, allFields: string[]) {
  if (!displayFields || displayFields.length === 0) {
    return allFields;
  }

  const fields = displayFields.filter((field) => field !== "*");
  if (displayFields.includes("*")) {
    const remaining = allFields.filter((field) => !fields.includes(field));
    return [...fields, ...remaining];
  }
  return fields;
}

export function applyListOverrides(
  fields: string[],
  overrides?: {
    hidden?: string[];
    order?: string[];
  }
) {
  let next = [...fields];
  if (overrides?.hidden?.length) {
    const hiddenSet = new Set(overrides.hidden);
    next = next.filter((field) => !hiddenSet.has(field));
  }
  if (overrides?.order?.length) {
    const ordered = overrides.order.filter((field) => field !== "*");
    const remaining = next.filter((field) => !ordered.includes(field));
    if (overrides.order.includes("*")) {
      const result: string[] = [];
      overrides.order.forEach((field) => {
        if (field === "*") {
          result.push(...remaining);
        } else if (next.includes(field)) {
          result.push(field);
        }
      });
      next = result;
    } else {
      next = [...ordered.filter((field) => next.includes(field)), ...remaining];
    }
  }
  return next;
}

export function getSchemaPropertyTitle(schema: any, field: string) {
  if (!schema) return undefined;
  const properties = schema.type === "array" ? schema.items?.properties : schema.properties;
  const property = properties?.[field];
  return property?.title;
}

export function formatCellValue(value: unknown) {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

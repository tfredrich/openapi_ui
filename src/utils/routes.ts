export function encodeCollectionPath(path: string) {
  const trimmed = path.startsWith("/") ? path.slice(1) : path;
  return encodeURIComponent(trimmed);
}

export function decodeCollectionPath(param?: string) {
  if (!param) return null;
  const decoded = decodeURIComponent(param);
  return decoded.startsWith("/") ? decoded : `/${decoded}`;
}

export function buildResourcePath(template: string, id: string | number) {
  return template.replace(/\{[^/]+\}/, encodeURIComponent(String(id)));
}

type OperationParam = {
  name: string;
  location: "path" | "query" | "header" | "cookie";
  schema?: unknown;
};

type Operation = {
  method: string;
  requestSchema?: unknown;
  responseSchema?: unknown;
  queryParams: OperationParam[];
};

type CollectionEntry = {
  path: string;
  get?: Operation;
  post?: Operation;
  resourcePath?: string;
};

type ResourceEntry = {
  path: string;
  get?: Operation;
  put?: Operation;
  delete?: Operation;
  resourceIdParamName?: string;
};

export type OperationRegistry = {
  collections: Record<string, CollectionEntry>;
  resources: Record<string, ResourceEntry>;
  resourceByCollection: Record<string, string>;
};

type OasMedia = {
  schema?: unknown;
};

type OasContent = Record<string, OasMedia>;

const jsonContentTypes = ["application/json", "application/*+json"];

function pickJsonSchema(content?: OasContent) {
  if (!content) return undefined;
  for (const type of jsonContentTypes) {
    if (content[type]?.schema) return content[type]?.schema;
  }
  const first = Object.values(content)[0];
  return first?.schema;
}

function extractParams(pathItem: any, operation: any): OperationParam[] {
  const params = [...(pathItem?.parameters ?? []), ...(operation?.parameters ?? [])];
  return params.map((param: any) => ({
    name: param.name,
    location: param.in,
    schema: param.schema,
  }));
}

function buildOperation(method: string, operation: any, pathItem: any): Operation | undefined {
  if (!operation) return undefined;
  const requestSchema = pickJsonSchema(operation.requestBody?.content);
  const responseSchema = pickJsonSchema(operation.responses?.["200"]?.content);
  const params = extractParams(pathItem, operation);
  const queryParams = params.filter((param) => param.location === "query");
  return { method, requestSchema, responseSchema, queryParams };
}

function isResourcePath(path: string, collectionPath: string) {
  if (!path.startsWith(`${collectionPath}/`)) return false;
  const suffix = path.slice(collectionPath.length + 1);
  return /^\{[^/]+\}$/.test(suffix);
}

function extractResourceParamName(path: string) {
  const match = path.match(/\{([^/]+)\}$/);
  return match?.[1];
}

export function buildOperationRegistry(oas: any): OperationRegistry {
  const paths = oas?.paths ?? {};
  const collections: Record<string, CollectionEntry> = {};
  const resources: Record<string, ResourceEntry> = {};

  Object.entries(paths).forEach(([path, item]: [string, any]) => {
    const hasParam = path.includes("{");
    if (!hasParam) {
      const entry: CollectionEntry = {
        path,
        get: buildOperation("get", item.get, item),
        post: buildOperation("post", item.post, item),
      };
      if (entry.get || entry.post) {
        collections[path] = entry;
      }
      return;
    }

    const entry: ResourceEntry = {
      path,
      get: buildOperation("get", item.get, item),
      put: buildOperation("put", item.put, item),
      delete: buildOperation("delete", item.delete, item),
      resourceIdParamName: extractResourceParamName(path),
    };
    if (entry.get || entry.put || entry.delete) {
      resources[path] = entry;
    }
  });

  const resourceByCollection: Record<string, string> = {};
  Object.keys(collections).forEach((collectionPath) => {
    const match = Object.keys(resources).find((path) => isResourcePath(path, collectionPath));
    if (match) {
      collections[collectionPath].resourcePath = match;
      resourceByCollection[collectionPath] = match;
    }
  });

  return {
    collections,
    resources,
    resourceByCollection,
  };
}

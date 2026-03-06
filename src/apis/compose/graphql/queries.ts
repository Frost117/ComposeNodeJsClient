import config from "../../../config.js";

export async function executeQuery<T>(url: string, query: string): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.COMPOSE_API_KEY}`,
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `GraphQL request failed: ${response.status} ${response.statusText}\n${errorBody}`
    );
  }

  return response.json() as T;
}

export const SCHEMA_FIELDS_QUERY = `{
  __schema {
    queryType {
      fields { name args { name type { name } } }
    }
  }
}`;

export function buildItemTypenameQuery(collection: string): string {
  return `{ ${collection} { items { __typename } } }`;
}

export function buildTypeDetailQuery(typeName: string, whereTypeName?: string | null): string {
  const parts = [
    `returnType: __type(name: "${typeName}") {
      fields { name type { name kind ofType { name kind } } }
    }`,
  ];
  if (whereTypeName) {
    parts.push(`filterType: __type(name: "${whereTypeName}") {
      inputFields { name type { name kind ofType { name kind } } }
    }`);
  }
  return `{ ${parts.join("\n")} }`;
}

export function buildNestedFilterQuery(typeName: string): string {
  return `{
    filterType: __type(name: "${typeName}") {
      inputFields { name type { name kind ofType { name kind } } }
    }
  }`;
}

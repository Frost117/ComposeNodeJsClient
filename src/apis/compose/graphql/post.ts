import config from "../../../config.js";
import { buildGraphqlUrl } from "../helpers/urls.js";
import { selection } from "../../../state.js";
import { getEnvironments } from "../environment/get.js";
import { getCollections } from "../collection/get.js";
import {
  askSelectEnvironment,
  askSelectCollection,
  askGraphqlFilter,
  confirmRunAnotherQuery,
  log,
  note,
} from "../../../prompts.js";
import {
  CollectionSchema,
  FilterField,
  GraphqlQueryTypeResponse,
  GraphqlTypeDetailResponse,
} from "../../../schema/types.js";

function exampleValue(type: string): string {
  switch (type) {
    case "Int":
    case "Float":
      return "10";
    case "Boolean":
      return "true";
    default:
      return '"value"';
  }
}

function formatFilterExamples(fields: FilterField[]): string {
  return fields.map((f) => `${f.name}: ${exampleValue(f.type)}`).join("\n");
}

async function executeQuery<T>(url: string, query: string): Promise<T> {
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

async function introspectCollection(
  url: string,
  collection: string
): Promise<CollectionSchema> {
  // Step 1: Find the where arg type name from the Query type
  const queryType = await executeQuery<GraphqlQueryTypeResponse>(url, `{
    __schema {
      queryType {
        fields { name args { name type { name } } }
      }
    }
  }`);

  const fields = queryType.data.__schema.queryType.fields;
  const collField = fields.find((f) => f.name === collection);
  if (!collField) {
    const available = fields.map((f) => f.name).join(", ");
    throw new Error(`Collection "${collection}" not found in schema. Available: ${available}`);
  }

  const whereArg = collField.args.find((a) => a.name === "where");
  const whereTypeName = whereArg?.type.name ?? null;

  // Step 2: Get the concrete type name from actual data
  const sample = await executeQuery<{ data: Record<string, { items: Array<{ __typename: string }> }> }>(
    url,
    `{ ${collection} { items { __typename } } }`
  );

  const items = sample.data[collection]?.items;
  if (!items || items.length === 0) {
    throw new Error(`Collection "${collection}" is empty — cannot determine type.`);
  }

  const typeName = items[0].__typename;

  // Step 3: Get filter fields and return fields
  const detailParts = [
    `returnType: __type(name: "${typeName}") {
      fields { name type { name kind ofType { name kind } } }
    }`,
  ];
  if (whereTypeName) {
    detailParts.push(`filterType: __type(name: "${whereTypeName}") {
      inputFields { name type { name kind ofType { name kind } } }
    }`);
  }

  const details = await executeQuery<GraphqlTypeDetailResponse>(
    url,
    `{ ${detailParts.join("\n")} }`
  );

  const filterFields = details.data.filterType?.inputFields.map((f) => {
    const typeName = f.type.name ?? f.type.ofType?.name ?? "String";
    return { name: f.name, type: typeName };
  }) ?? [];

  const returnFields = details.data.returnType?.fields
    .filter((f) => {
      const kind = f.type.kind ?? f.type.ofType?.kind;
      return kind === "SCALAR" || kind === "ENUM";
    })
    .map((f) => f.name) ?? [];

  return { filterFields, typeName, returnFields };
}

function buildQuery(
  collection: string,
  schema: CollectionSchema,
  filter: string
): string {
  const whereClause = filter ? `(where: { ${filter} })` : "";
  return `{
    ${collection}${whereClause} {
      items {
        ... on ${schema.typeName} {
          ${schema.returnFields.join(" ")}
        }
      }
    }
  }`;
}

export async function queryCollection(): Promise<void> {
  let envAlias = selection.environment;
  if (!envAlias) {
    const envs = await getEnvironments();
    if (envs.length === 0) {
      log.error("No environments available.");
      return;
    }
    envAlias = await askSelectEnvironment(envs);
  }

  let collAlias = selection.collection;
  if (!collAlias) {
    const colls = await getCollections(envAlias);
    if (colls.length === 0) {
      log.error("No collections available.");
      return;
    }
    collAlias = await askSelectCollection(colls);
  }

  const url = buildGraphqlUrl(envAlias);

  log.info("Introspecting collection schema...");
  let schema: CollectionSchema;
  try {
    schema = await introspectCollection(url, collAlias);
  } catch (error) {
    log.error(`${error}`);
    return;
  }

  note(formatFilterExamples(schema.filterFields), "Available filters");

  let querying = true;
  while (querying) {
    const filter = await askGraphqlFilter();
    const query = buildQuery(collAlias, schema, filter);

    try {
      const data = await executeQuery<unknown>(url, query);
      console.log(JSON.stringify(data, null, 2));
    } catch (error) {
      log.error(`${error}`);
    }

    querying = await confirmRunAnotherQuery();
  }
}

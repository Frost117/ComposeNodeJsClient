import {
  executeQuery,
  SCHEMA_FIELDS_QUERY,
  buildItemTypenameQuery,
  buildTypeDetailQuery,
  buildNestedFilterQuery,
} from "./queries.js";
import {
  CollectionSchema,
  FilterField,
  GraphqlQueryTypeResponse,
  GraphqlTypeDetailResponse,
} from "../../../schema/types.js";

function resolveFieldType(type: {
  name: string | null;
  kind: string;
  ofType?: { name: string | null; kind: string };
}): { name: string; kind: string } {
  const kind = type.kind === "NON_NULL" ? (type.ofType?.kind ?? type.kind) : type.kind;
  const name = type.name ?? type.ofType?.name ?? "String";
  return { name, kind };
}

async function getWhereTypeName(url: string, collection: string): Promise<string | null> {
  const result = await executeQuery<GraphqlQueryTypeResponse>(url, SCHEMA_FIELDS_QUERY);

  const fields = result.data.__schema.queryType.fields;
  const collField = fields.find((f) => f.name === collection);
  if (!collField) {
    const available = fields.map((f) => f.name).join(", ");
    throw new Error(`Collection "${collection}" not found in schema. Available: ${available}`);
  }

  const whereArg = collField.args.find((a) => a.name === "where");
  return whereArg?.type.name ?? null;
}

async function getCollectionTypeName(url: string, collection: string): Promise<string> {
  const result = await executeQuery<{ data: Record<string, { items: Array<{ __typename: string }> }> }>(
    url,
    buildItemTypenameQuery(collection)
  );

  const items = result.data[collection]?.items;
  if (!items || items.length === 0) {
    throw new Error(`Collection "${collection}" is empty — cannot determine type.`);
  }

  return items[0].__typename;
}

async function getSchemaDetails(
  url: string,
  typeName: string,
  whereTypeName: string | null
): Promise<{ filterFields: FilterField[]; nestedFilterFields: Record<string, FilterField[]>; returnFields: string[] }> {
  const details = await executeQuery<GraphqlTypeDetailResponse>(
    url,
    buildTypeDetailQuery(typeName, whereTypeName)
  );

  const filterFields = details.data.filterType?.inputFields.map((f) => {
    const resolved = resolveFieldType(f.type);
    return { name: f.name, type: resolved.name, kind: resolved.kind };
  }) ?? [];

  const nestedFilterFields: Record<string, FilterField[]> = {};
  for (const f of filterFields) {
    if (f.kind === "INPUT_OBJECT") {
      const nested = await executeQuery<GraphqlTypeDetailResponse>(
        url,
        buildNestedFilterQuery(f.type)
      );
      nestedFilterFields[f.name] = nested.data.filterType?.inputFields.map((nf) => {
        const resolved = resolveFieldType(nf.type);
        return { name: nf.name, type: resolved.name };
      }) ?? [];
    }
  }

  const returnFields = details.data.returnType?.fields
    .filter((f) => {
      const kind = f.type.kind ?? f.type.ofType?.kind;
      return kind === "SCALAR" || kind === "ENUM";
    })
    .map((f) => f.name) ?? [];

  return { filterFields, nestedFilterFields, returnFields };
}

export async function introspectCollection(url: string, collection: string): Promise<CollectionSchema> {
  const whereTypeName = await getWhereTypeName(url, collection);
  const typeName = await getCollectionTypeName(url, collection);
  const { filterFields, nestedFilterFields, returnFields } = await getSchemaDetails(url, typeName, whereTypeName);

  return { filterFields, nestedFilterFields, typeName, returnFields };
}

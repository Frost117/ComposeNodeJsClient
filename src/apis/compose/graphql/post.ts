import { buildGraphqlUrl } from "../helpers/urls.js";
import { selection } from "../../../state.js";
import { getEnvironments } from "../environment/get.js";
import { getCollections } from "../collection/get.js";
import {
  askSelectEnvironment,
  askSelectCollection,
  askSelectGenres,
  confirmRunAnotherQuery,
  log,
} from "../../../prompts.js";
import { CollectionSchema } from "../../../schema/types.js";
import { executeQuery } from "./queries.js";
import { introspectCollection } from "./introspect.js";

function findGenreFilterField(schema: CollectionSchema): { parent?: string; field: string } | null {
  const topLevel = schema.filterFields.find((f) => f.name.startsWith("genres"));
  if (topLevel) return { field: topLevel.name };
  for (const [parent, fields] of Object.entries(schema.nestedFilterFields)) {
    const match = fields.find((f) => f.name.startsWith("genres"));
    if (match) return { parent, field: match.name };
  }
  return null;
}

function buildQuery(
  collection: string,
  schema: CollectionSchema,
  genres?: string[],
  genreFilter?: { parent?: string; field: string }
): string {
  const parts: string[] = [];
  if (genreFilter && genres && genres.length > 0) {
    const genreList = genres.map((g) => `"${g}"`).join(", ");
    if (genreFilter.parent) {
      parts.push(`${genreFilter.parent}: { ${genreFilter.field}: [${genreList}] }`);
    } else {
      parts.push(`${genreFilter.field}: [${genreList}]`);
    }
  }
  const whereClause = parts.length > 0 ? `(where: { ${parts.join(", ")} })` : "";
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

  const genreFilter = findGenreFilterField(schema);
  if (!genreFilter) {
    log.info("No genre filter field found in schema — genre prompt will be skipped.");
  }

  let querying = true;
  while (querying) {
    const genres = genreFilter ? await askSelectGenres() : undefined;
    const query = buildQuery(collAlias, schema, genres, genreFilter ?? undefined);

    try {
      const data = await executeQuery<unknown>(url, query);
      console.log(JSON.stringify(data, null, 2));
    } catch (error) {
      log.error(`${error}`);
    }
    querying = await confirmRunAnotherQuery();
  }
}

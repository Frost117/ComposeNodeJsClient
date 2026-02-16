import { getAccessToken } from "../auth.js";
import { getEnvironments } from "../environment/get.js";
import { buildCollectionsUrl } from "../helpers/urls.js";
import { Collection } from "../../../schema/types.js";
import { askSelectEnvironment } from "../../../prompts.js";

export async function getCollections(envAlias?: string): Promise<Collection[]> {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    console.error('Failed to obtain access token');
    return [];
  }

  const url = buildCollectionsUrl(envAlias);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Failed to fetch collections: ${response.status} ${response.statusText}`);
      console.error(`Response body: ${errorBody}`);
      return [];
    }

    const data = await response.json();
    return data.edges.map((edge: { node: { collectionAlias: string; description: string | null } }): Collection => ({
      collectionAlias: edge.node.collectionAlias,
      description: edge.node.description,
    }));
  } catch (error) {
    console.error(`Error fetching collections: ${error}`);
    return [];
  }
}

export async function listCollections(): Promise<void> {
  const environments = await getEnvironments();
  if (environments.length === 0) {
    console.error('No environments available.');
    return;
  }

  const selectedEnv = await askSelectEnvironment(environments);
  const collections = await getCollections(selectedEnv);
  printCollections(collections);
}

export function printCollections(collections: Collection[]): void {
  if (collections.length === 0) {
    console.log('No collections found.');
    return;
  }

  console.log(`\nFound ${collections.length} collection(s):\n`);
  for (const collection of collections) {
    console.log(`  - ${collection.collectionAlias}`);
    if (collection.description) {
      console.log(`    ${collection.description}`);
    }
  }
  console.log();
}

import { getAccessToken } from '../auth.js';

const MANAGEMENT_URL = process.env.COMPOSE_MANAGEMENT_URL;
const COMPOSE_PROJECT_ALIAS = process.env.COMPOSE_PROJECT_ALIAS;
const COMPOSE_ENVIRONMENT_ALIAS = process.env.COMPOSE_ENVIRONMENT_ALIAS;

interface CreateCollectionPayload {
  collectionAlias: string;
  description?: string;
}

function buildCollectionsUrl(): string {
  return `${MANAGEMENT_URL}/v1/projects/${COMPOSE_PROJECT_ALIAS}/environments/${COMPOSE_ENVIRONMENT_ALIAS}/collections`;
}

export async function createCollection(alias: string, description?: string): Promise<boolean> {
  if (!COMPOSE_PROJECT_ALIAS || !COMPOSE_ENVIRONMENT_ALIAS) {
    console.error('Missing required Compose environment variables');
    return false;
  }

  const accessToken = await getAccessToken();
  if (!accessToken) {
    console.error('Failed to obtain access token');
    return false;
  }

  const url = buildCollectionsUrl();
  const payload: CreateCollectionPayload = {
    collectionAlias: alias,
    description: description,
  };

  console.log(`Creating collection "${alias}"...`);
  console.log(`URL: ${url}`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Failed to create collection: ${response.status} ${response.statusText}`);
      console.error(`Response body: ${errorBody}`);
      return false;
    }

    const responseBody = await response.text();
    console.log(`Successfully created collection "${alias}"`);
    if (responseBody) {
      console.log(`Response: ${responseBody}`);
    }
    return true;
  } catch (error) {
    console.error(`Error creating collection: ${error}`);
    return false;
  }
}

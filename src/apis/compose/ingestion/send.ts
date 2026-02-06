import { Show, ComposeUpsertEntry, ComposePayload } from '../../../schema/types.js';
import { fetchedData } from '../../tvmaze/fetchShows.js';
import { getAccessToken } from '../auth.js';

const IMPORT_ENDPOINT_URL = process.env.IMPORT_ENDPOINT_URL;
const COMPOSE_PROJECT_ALIAS = process.env.COMPOSE_PROJECT_ALIAS;
const COMPOSE_ENVIRONMENT_ALIAS = process.env.COMPOSE_ENVIRONMENT_ALIAS;
const COMPOSE_COLLECTION_ALIAS = process.env.COMPOSE_COLLECTION_ALIAS;

function buildImportUrl(): string {
  return `${IMPORT_ENDPOINT_URL}/v1/${COMPOSE_PROJECT_ALIAS}/${COMPOSE_ENVIRONMENT_ALIAS}/${COMPOSE_COLLECTION_ALIAS}`;
}

function transformToComposePayload(shows: Show[]): ComposePayload<Show> {
  return shows.map((show): ComposeUpsertEntry<Show> => ({
    id: String(show.id),
    type: 'Show',
    data: show,
    action: 'upsert',
  }));
}

export async function sendToCompose(): Promise<void> {
  if (!fetchedData || fetchedData.length === 0) {
    console.error('No data to import. Please fetch data first.');
    return;
  }

  if (!IMPORT_ENDPOINT_URL || !COMPOSE_PROJECT_ALIAS || !COMPOSE_ENVIRONMENT_ALIAS || !COMPOSE_COLLECTION_ALIAS) {
    console.error('Missing required Compose environment variables');
    return;
  }

  const accessToken = await getAccessToken();
  if (!accessToken) {
    console.error('Failed to obtain access token');
    return;
  }

  const url = buildImportUrl();
  const payload = transformToComposePayload(fetchedData);

  console.log(`Importing ${payload.length} shows to Compose...`);
  console.log(`URL: ${url}`);

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Failed to import data: ${response.status} ${response.statusText}`);
      console.error(`Response body: ${errorBody}`);
      return;
    }

    const responseBody = await response.text();
    console.log(`Successfully imported ${payload.length} shows`);
    console.log(`Response: ${responseBody}`);
  } catch (error) {
    console.error(`Error importing data: ${error}`);
  }
}

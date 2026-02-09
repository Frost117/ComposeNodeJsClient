import { Show, ComposeUpsertEntry, ComposePayload } from '../../../schema/types.js';
import { fetchedData } from '../../tvmaze/fetchShows.js';
import { getAccessToken } from '../auth.js';
import config from '../../../config.js';

function buildImportUrl(): string {
  return `${config.COMPOSE_INGESTION_URL}/v1/${config.COMPOSE_PROJECT_ALIAS}/${config.COMPOSE_ENVIRONMENT_ALIAS}/${config.COMPOSE_COLLECTION_ALIAS}`;
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

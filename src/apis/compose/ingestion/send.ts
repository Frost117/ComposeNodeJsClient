import { Show, ComposeUpsertEntry, ComposePayload } from '../../../schema/types.js';
import { fetchedData } from '../../tvmaze/fetchShows.js';
import { buildImportUrl } from '../helpers/urls.js';
import { getEnvironments } from '../environment/get.js';
import { getCollections } from '../collection/get.js';
import { askSelectEnvironment, askSelectCollection } from '../../../prompts.js';
import config from '../../../config.js';

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

  const environments = await getEnvironments();
  if (environments.length === 0) {
    console.error('No environments available.');
    return;
  }

  const collections = await getCollections();
  if (collections.length === 0) {
    console.error('No collections available.');
    return;
  }

  const selectedEnv = await askSelectEnvironment(environments);
  const selectedColl = await askSelectCollection(collections)

  const url = buildImportUrl(selectedEnv, selectedColl);
  const payload = transformToComposePayload(fetchedData);

  console.log(`Importing ${payload.length} shows to "${selectedEnv}"...`);
  console.log(`URL: ${url}`);

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.COMPOSE_API_KEY}`
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
    console.log(`Successfully imported ${payload.length} shows to "${selectedEnv}"`);
    console.log(`Response: ${responseBody}`);
  } catch (error) {
    console.error(`Error importing data: ${error}`);
  }
}

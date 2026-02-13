import { getAccessToken } from '../auth.js';
import { buildCollectionsUrl } from '../helpers/urls.js';
import { getEnvironments } from '../environment/get.js';
import { getCollections } from './get.js';
import { askSelectEnvironment, askSelectCollection, confirmDelete } from '../../../prompts.js';

export async function deleteCollection(): Promise<boolean> {

  const accessToken = await getAccessToken();
  if (!accessToken) {
    console.error('Failed to obtain access token');
    return false;
  }

  
  const environments = await getEnvironments();
  if (environments.length === 0) {
    console.error('No environments available.');
    return false;
  }
  const selectedEnv = await askSelectEnvironment(environments);

  const collections = await getCollections(selectedEnv);
  if (collections.length === 0) {
    console.error(`No collections found in "${selectedEnv}".`);
    return false;
  }
  const selectedColl = await askSelectCollection(collections);


  const confirmed = await confirmDelete('collection', selectedColl, selectedEnv);
  if (!confirmed) {
    console.log('Deletion cancelled.');
    return false;
  }

  const url = `${buildCollectionsUrl(selectedEnv)}/${selectedColl}`;

  console.log(`Deleting collection "${selectedColl}" from "${selectedEnv}"...`);

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Failed to delete collection: ${response.status} ${response.statusText}`);
      console.error(`Response body: ${errorBody}`);
      return false;
    }

    console.log(`Successfully deleted collection "${selectedColl}" from "${selectedEnv}"`);
    return true;
  } catch (error) {
    console.error(`Error deleting collection: ${error}`);
    return false;
  }
}

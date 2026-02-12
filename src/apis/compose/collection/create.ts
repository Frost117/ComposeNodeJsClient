import { getAccessToken } from '../auth.js';
import { buildCollectionsUrl } from '../helpers/urls.js';
import { Collection } from '../../../schema/types.js';

export async function createCollection(collectionAlias: string, description?: string): Promise<boolean> {

  const accessToken = await getAccessToken();
  if (!accessToken) {
    console.error('Failed to obtain access token');
    return false;
  }

  const url = buildCollectionsUrl();
  const payload: Collection = {
    collectionAlias: collectionAlias,
    description: description ?? null,
  };

  console.log(`Creating collection "${collectionAlias}"...`);
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
    console.log(`Successfully created collection "${collectionAlias}"`);
    if (responseBody) {
      console.log(`Response: ${responseBody}`);
    }
    return true;
  } catch (error) {
    console.error(`Error creating collection: ${error}`);
    return false;
  }
}

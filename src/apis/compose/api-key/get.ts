import { getAccessToken } from "../auth.js";
import { buildApiKeyUrl } from "../helpers/urls.js";
import config from "../../../config.js";

interface ApiKeyDetails {
  apiKeyAlias: string;
  description: string | null;
  projectAlias: string;
  validUntil: string;
  environmentAliases: string[];
  scopes: string[];
}

export async function getApiKeyDetails(): Promise<void> {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    console.error('Failed to obtain access token');
    return;
  }

  const url = buildApiKeyUrl(config.COMPOSE_API_KEY_ALIAS);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Failed to fetch API key details: ${response.status} ${response.statusText}`);
      console.error(`Response body: ${errorBody}`);
      return;
    }

    const data: ApiKeyDetails = await response.json();

    console.log(`\nAPI Key: ${data.apiKeyAlias}`);
    if (data.description) {
      console.log(`Description: ${data.description}`);
    }
    console.log(`Project: ${data.projectAlias}`);
    console.log(`Valid until: ${data.validUntil}`);
    console.log(`Scopes: ${data.scopes.join(', ')}`);
    console.log(`Environments: ${data.environmentAliases.length > 0 ? data.environmentAliases.join(', ') : 'all'}`);
    console.log();
  } catch (error) {
    console.error(`Error fetching API key details: ${error}`);
  }
}

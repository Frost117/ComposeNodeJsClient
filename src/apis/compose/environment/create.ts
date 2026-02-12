import { getAccessToken } from "../auth.js";
import { buildEnvironmentsUrl } from "../helpers/urls.js";
import { Environment } from "../../../schema/types.js";

export async function createEnvironment(alias: string, description?: string): Promise<boolean> {

  const accessToken = await getAccessToken();
  if (!accessToken) {
    console.error('Failed to obtain access token');
    return false;
  }

  const url = buildEnvironmentsUrl();
  const payload: Environment = {
    environmentAlias: alias,
    description: description ?? null,
  };

  console.log(`Creating environment "${alias}"...`);
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
      console.error(`Failed to create environment: ${response.status} ${response.statusText}`);
      console.error(`Response body: ${errorBody}`);
      return false;
    }

    const responseBody = await response.text();
    console.log(`Successfully created environment "${alias}"`);
    if (responseBody) {
      console.log(`Response: ${responseBody}`);
    }
    return true;
  } catch (error) {
    console.error(`Error creating environment: ${error}`);
    return false;
  }
}
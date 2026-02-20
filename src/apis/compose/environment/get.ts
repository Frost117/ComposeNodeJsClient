import { getAccessToken } from "../auth.js";
import { buildEnvironmentsUrl } from "../helpers/urls.js";
import { Environment } from "../../../schema/types.js";

export async function getEnvironments(): Promise<Environment[]> {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    console.error('Failed to obtain access token');
    return [];
  }

  const url = buildEnvironmentsUrl();

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Failed to fetch environments: ${response.status} ${response.statusText}`);
      console.error(`Response body: ${errorBody}`);
      return [];
    }

    const data = await response.json();
    return data.edges.map((edge: { node: { environmentAlias: string; description: string | null } }): Environment => ({
      environmentAlias: edge.node.environmentAlias,
      description: edge.node.description,
    }));
  } catch (error) {
    console.error(`Error fetching environments: ${error}`);
    return [];
  }
}

export async function listEnvironments(): Promise<void> {
  const environments = await getEnvironments();

  if (environments.length === 0) {
    console.log('No environments found.');
    return;
  }

  console.log(`\nFound ${environments.length} environment(s):\n`);
  for (const env of environments) {
    console.log(`  - ${env.environmentAlias}`);
    if (env.description) {
      console.log(`    ${env.description}`);
    }
  }
  console.log();
}

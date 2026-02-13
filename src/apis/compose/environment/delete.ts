import { getAccessToken } from '../auth.js';
import { getEnvironments } from '../index.js';
import { buildEnvironmentsUrl } from '../helpers/urls.js';
import { askSelectEnvironment, confirmDelete } from '../../../prompts.js';

export async function deleteEnvironment(): Promise<boolean> {
    
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

    const confirmed = await confirmDelete('environment', selectedEnv);
    if (!confirmed) {
        console.log('Deletion cancelled.');
        return false;
    }

    const url = `${buildEnvironmentsUrl()}/${selectedEnv}`;

    console.log(`Deleting environment "${selectedEnv}"...`);

    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`Failed to delete environment: ${response.status} ${response.statusText}`);
            console.error(`Response body: ${errorBody}`);
            return false;
        }

        console.log(`Successfully deleted environment "${selectedEnv}"`);
        return true;
    } catch (error) {
        console.error(`Error deleting environment: ${error}`);
        return false;
    }
}
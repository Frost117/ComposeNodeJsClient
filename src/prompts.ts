import { select, confirm, number, input } from '@inquirer/prompts';
import { Collection, Environment } from './schema/types.js';

export type MenuAction = 'fetch' | 'send' | 'fetch_and_send' | 'create_collection' | 'get_collections' | 'delete_collection' | 'create_environment' | 'get_environments' | 'delete_environment' | 'create_type_schema' | 'exit';

export async function showMainMenu(): Promise<MenuAction> {
  console.clear();
  return select({
    message: 'What would you like to do?',
    choices: [
      { name: 'Fetch shows', value: 'fetch' as const },
      { name: 'Send to Compose', value: 'send' as const },
      { name: 'Fetch and send (with delay)', value: 'fetch_and_send' as const },
      { name: 'Create environment', value: 'create_environment' as const },
      { name: 'Get all environments', value: 'get_environments' as const },
      { name: 'Delete an environment', value: 'delete_environment' as const },
      { name: 'Create a collection', value: 'create_collection' as const },
      { name: 'Get all collections', value: 'get_collections' as const },
      { name: 'Delete a collection', value: 'delete_collection' as const },
      { name: 'Create type schema', value: 'create_type_schema' as const },
      { name: 'Exit', value: 'exit' as const },
    ],
  });
}

export async function askPageCount(): Promise<number> {
  const pages = await number({
    message: `How many pages to fetch? (240 shows per page). Default is 1`,
    default: 1,
    min: 1,
  });
  return pages ?? 1;
}

export async function askImportDelay(): Promise<number> {
  const delay = await number({
    message: 'Delay between fetch and send (seconds). Default is 5',
    default: 5,
    min: 0,
  });
  return delay ?? 5;
}

export async function askCollectionAlias(): Promise<string> {
  return input({
    message: 'Collection alias:',
    validate: (value) => value.length > 0 || 'Collection alias is required',
  });
}

export async function askCollectionDescription(): Promise<string> {
  return input({
    message: 'Collection description (optional):',
  });
}

export async function askEnvironmentAlias(): Promise<string> {
  return input({
    message: 'Environment alias:',
    validate: (value) => value.length > 0 || 'Environment alias is required',
  });
}

export async function askEnvironmentDescription(): Promise<string> {
  return input({
    message: 'Environment description (optional):',
  });
}

export async function askSelectEnvironment(environments: Environment[]): Promise<string> {
  return select({
    message: 'Which environment?',
    choices: environments.map(env => ({
      name: env.description ? `${env.environmentAlias} — ${env.description}` : env.environmentAlias,
      value: env.environmentAlias,
    })),
  });
}

export async function askSelectCollection(collections: Collection[]): Promise<string> {
  return select({
message: 'Which collection?', choices: collections.map(coll => ({ 
  name: coll.description ? `${coll.collectionAlias} — ${coll.description}` : coll.collectionAlias, 
  value: coll.collectionAlias, 
    })), 
  }); 
}
export async function confirmContinue(): Promise<boolean> {
  return confirm({
    message: 'Return to main menu?',
    default: true,
  });
}

export async function confirmDelete(resourceType: string, resourceName: string, environmentAlias?: string): Promise<boolean> {
  const location = environmentAlias ? ` from "${environmentAlias}"` : '';
  return confirm({
    message: `Are you sure you want to delete ${resourceType} "${resourceName}"${location}? This cannot be undone.`,
    default: false,
  });
}

export async function confirmFetch(showCount: number): Promise<boolean> {
  return confirm({
    message: `This will fetch up to ${showCount} shows. Continue?`,
    default: true,
  });
}

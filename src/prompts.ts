import { select, confirm, text, isCancel, intro, outro, log, note } from '@clack/prompts';
import pc from 'picocolors';
import { Collection, Environment } from './schema/types.js';

export type MenuAction = 'fetch' | 'send' | 'fetch_and_send' | 'create_collection' | 'get_collections' | 'select_collection' | 'delete_collection' | 'create_environment' | 'get_environments' | 'select_environment' | 'delete_environment' | 'create_type_schema' | 'exit';

export const selection = {
  environment: null as string | null,
  collection: null as string | null,
  pages: null as number | null,
};

function handleCancel(value: unknown): never {
  if (isCancel(value)) {
    outro('Goodbye!');
    process.exit(0);
  }
  throw new Error('Unexpected cancel');
}

function ensureValue<T>(value: T | symbol): T {
  if (isCancel(value)) handleCancel(value);
  return value as T;
}

function formatSelection(): string {
  const env = selection.environment
    ? pc.green(selection.environment)
    : pc.dim('none');
  const coll = selection.collection
    ? pc.green(selection.collection)
    : pc.dim('none');
  const pages = selection.pages 
    ? pc.green(selection.pages)
    : pc.dim('none');
  return `${pc.bold('Environment')}: ${env}  ${pc.dim('│')}  ${pc.bold('Collection')}: ${coll}  ${pc.dim('│')}  ${pc.bold('Pages')}: ${pages}`;
}

export async function showMainMenu(): Promise<MenuAction> {
  console.clear();
  intro('Data Import Tool');
  note(formatSelection(), 'Current Selection');

  const result = await select({
    message: 'What would you like to do?',
    options: [
      { value: '_data' as MenuAction, label: pc.bold(pc.cyan('── Data ──')), disabled: true },
      { value: 'fetch' as const, label: 'Fetch shows' },
      { value: 'send' as const, label: 'Send to Compose' },
      { value: 'fetch_and_send' as const, label: 'Fetch and send (with delay)' },

      { value: '_env' as MenuAction, label: pc.bold(pc.cyan('── Environments ──')), disabled: true },
      { value: 'select_environment' as const, label: 'Select environment' },
      { value: 'create_environment' as const, label: 'Create environment' },
      { value: 'get_environments' as const, label: 'Get all environments' },
      { value: 'delete_environment' as const, label: 'Delete an environment' },

      { value: '_coll' as MenuAction, label: pc.bold(pc.cyan('── Collections ──')), disabled: true },
      { value: 'select_collection' as const, label: 'Select collection' },
      { value: 'create_collection' as const, label: 'Create a collection' },
      { value: 'get_collections' as const, label: 'Get all collections' },
      { value: 'delete_collection' as const, label: 'Delete a collection' },

      { value: '_schema' as MenuAction, label: pc.bold(pc.cyan('── Schema ──')), disabled: true },
      { value: 'create_type_schema' as const, label: 'Create type schema' },

      { value: '_exit' as MenuAction, label: pc.dim('─────────'), disabled: true },
      { value: 'exit' as const, label: pc.red('Exit') },
    ],
  });

  return ensureValue(result);
}

export async function askPageCount(): Promise<number> {
  const result = await text({
    message: 'How many pages to fetch? (240 shows per page)',
    defaultValue: '1',
    validate: (value) => {
      const num = Number(value);
      if (isNaN(num) || num < 1 || !Number.isInteger(num)) {
        return 'Please enter a positive whole number';
      }
    },
  });

  return Number(ensureValue(result)) || 1;
}

export async function askImportDelay(): Promise<number> {
  const result = await text({
    message: 'Delay between fetch and send (seconds)',
    defaultValue: '5',
    validate: (value) => {
      const num = Number(value);
      if (isNaN(num) || num < 0) {
        return 'Please enter a number (0 or greater)';
      }
    },
  });

  return Number(ensureValue(result)) || 5;
}

export async function askCollectionAlias(): Promise<string> {
  const result = await text({
    message: 'Collection alias:',
    validate: (value) => {
      if (!value || value.length === 0) return 'Collection alias is required';
    },
  });

  return ensureValue(result);
}

export async function askCollectionDescription(): Promise<string> {
  const result = await text({
    message: 'Collection description (optional):',
  });

  return ensureValue(result);
}

export async function askEnvironmentAlias(): Promise<string> {
  const result = await text({
    message: 'Environment alias:',
    validate: (value) => {
      if (!value || value.length === 0) return 'Environment alias is required';
    },
  });

  return ensureValue(result);
}

export async function askEnvironmentDescription(): Promise<string> {
  const result = await text({
    message: 'Environment description (optional):',
  });

  return ensureValue(result);
}

export async function askSelectEnvironment(environments: Environment[]): Promise<string> {
  const result = await select({
    message: 'Which environment?',
    options: environments.map(env => ({
      value: env.environmentAlias,
      label: env.description ? `${env.environmentAlias} — ${env.description}` : env.environmentAlias,
    })),
  });

  const value = ensureValue(result);
  selection.environment = value;
  return value;
}

export async function askSelectCollection(collections: Collection[]): Promise<string> {
  const result = await select({
    message: 'Which collection?',
    options: collections.map(coll => ({
      value: coll.collectionAlias,
      label: coll.description ? `${coll.collectionAlias} — ${coll.description}` : coll.collectionAlias,
    })),
  });

  const value = ensureValue(result);
  selection.collection = value;
  return value;
}

export async function confirmContinue(): Promise<boolean> {
  const result = await confirm({
    message: 'Return to main menu?',
    initialValue: true,
  });

  return ensureValue(result);
}

export async function confirmDelete(resourceType: string, resourceName: string, environmentAlias?: string): Promise<boolean> {
  const location = environmentAlias ? ` from "${environmentAlias}"` : '';
  const result = await confirm({
    message: `Are you sure you want to delete ${resourceType} "${resourceName}"${location}? This cannot be undone.`,
    initialValue: false,
  });

  return ensureValue(result);
}

export async function confirmFetch(showCount: number): Promise<boolean> {
  const result = await confirm({
    message: `This will fetch up to ${showCount} shows. Continue?`,
    initialValue: true,
  });

  return ensureValue(result);
}

export { intro, outro, log };

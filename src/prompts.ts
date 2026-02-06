import { select, confirm, number, input } from '@inquirer/prompts';

export type MenuAction = 'fetch' | 'send' | 'fetch_and_send' | 'create_collection' | 'exit';

export async function showMainMenu(): Promise<MenuAction> {
  console.clear();
  return select({
    message: 'What would you like to do?',
    choices: [
      { name: 'Fetch shows', value: 'fetch' as const },
      { name: 'Send to Compose', value: 'send' as const },
      { name: 'Fetch and send (with delay)', value: 'fetch_and_send' as const },
      { name: 'Create collection', value: 'create_collection' as const },
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

export async function confirmContinue(): Promise<boolean> {
  return confirm({
    message: 'Return to main menu?',
    default: true,
  });
}

export async function confirmFetch(showCount: number): Promise<boolean> {
  return confirm({
    message: `This will fetch up to ${showCount} shows. Continue?`,
    default: true,
  });
}

import { select, confirm, number } from '@inquirer/prompts';

export type MenuAction = 'fetch' | 'import' | 'fetch_and_import' | 'exit';

export async function showMainMenu(): Promise<MenuAction> {
  console.clear();
  return select({
    message: 'What would you like to do?',
    choices: [
      { name: 'Fetch data', value: 'fetch' as const },
      { name: 'Import data', value: 'import' as const },
      { name: 'Fetch and import (with delay)', value: 'fetch_and_import' as const },
      { name: 'Exit', value: 'exit' as const },
    ],
  });
}

export async function askPageCount(): Promise<number> {
  const pages = await number({
    message: 'How many pages to fetch? (240 shows per page). Default is 1',
    default: 1,
    min: 1,
  });
  return pages ?? 1;
}

export async function askImportDelay(): Promise<number> {
  const delay = await number({
    message: 'Delay between fetch and import (seconds). Default is 5',
    default: 5,
    min: 0,
  });
  return delay ?? 5;
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

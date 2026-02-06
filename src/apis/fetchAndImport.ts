import { askImportDelay } from '../prompts.js';
import { fetchData } from './fetch.js';
import { importData } from './import.js';

export async function fetchAndImport(): Promise<void> {
  const delay = await askImportDelay();

  await fetchData();

  if (delay > 0) {
    console.log(`Waiting ${delay} seconds before import...`);
    await new Promise(resolve => setTimeout(resolve, delay * 1000));
  }

  await importData();
}

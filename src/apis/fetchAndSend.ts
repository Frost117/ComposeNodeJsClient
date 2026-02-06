import { askImportDelay } from '../prompts.js';
import { fetchShows } from './fetchShows.js';
import { sendToCompose } from './sendToCompose.js';

export async function fetchAndSend(): Promise<void> {
  const delay = await askImportDelay();

  await fetchShows();

  if (delay > 0) {
    console.log(`Waiting ${delay} seconds before sending...`);
    await new Promise(resolve => setTimeout(resolve, delay * 1000));
  }

  await sendToCompose();
}

import 'dotenv/config';
import {
  MenuAction,
  showMainMenu,
  confirmContinue,
} from './prompts.js';
import { fetchData } from './apis/fetch.js';
import { importData } from './apis/import.js';
import { fetchAndImport } from './apis/fetchAndImport.js';

const FETCH_ENDPOINT_URL = process.env.FETCH_ENDPOINT_URL;
const IMPORT_ENDPOINT_URL = process.env.IMPORT_ENDPOINT_URL;
const COMPOSE_PROJECT_ALIAS = process.env.COMPOSE_PROJECT_ALIAS;
const COMPOSE_ENVIRONMENT_ALIAS = process.env.COMPOSE_ENVIRONMENT_ALIAS;
const COMPOSE_COLLECTION_ALIAS = process.env.COMPOSE_COLLECTION_ALIAS;
const COMPOSE_CLIENT_ID = process.env.COMPOSE_CLIENT_ID;
const COMPOSE_CLIENT_SECRET = process.env.COMPOSE_CLIENT_SECRET;

async function main(): Promise<void> {
  if (!FETCH_ENDPOINT_URL || !IMPORT_ENDPOINT_URL || !COMPOSE_PROJECT_ALIAS || !COMPOSE_ENVIRONMENT_ALIAS || !COMPOSE_COLLECTION_ALIAS || !COMPOSE_CLIENT_ID || !COMPOSE_CLIENT_SECRET) {
    console.error('Missing required environment variables. Check your .env file.');
    process.exit(1);
  }

  console.log('Data Import Tool\n');

  let running = true;
  while (running) {
    const action: MenuAction = await showMainMenu();

    switch (action) {
      case 'fetch':
        await fetchData();
        break;
      case 'import':
        await importData();
        break;
      case 'fetch_and_import':
        await fetchAndImport();
        break;
      case 'exit':
        running = false;
        break;
    }

    if (running) {
      running = await confirmContinue();
    }
  }

  console.log('Goodbye!');
}

main();

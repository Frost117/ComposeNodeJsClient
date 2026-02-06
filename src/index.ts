import 'dotenv/config';
import {
  MenuAction,
  showMainMenu,
  confirmContinue,
  askCollectionAlias,
  askCollectionDescription,
} from './prompts.js';
import { fetchShows } from './apis/tvmaze/fetchShows.js';
import { sendToCompose } from './apis/compose/ingestion/send.js';
import { fetchAndSend } from './apis/fetchAndSend.js';
import { createCollection } from './apis/compose/collection/create.js';

const FETCH_ENDPOINT_URL = process.env.FETCH_ENDPOINT_URL;
const COMPOSE_INGESTION_URL = process.env.COMPOSE_INGESTION_URL;
const COMPOSE_PROJECT_ALIAS = process.env.COMPOSE_PROJECT_ALIAS;
const COMPOSE_ENVIRONMENT_ALIAS = process.env.COMPOSE_ENVIRONMENT_ALIAS;
const COMPOSE_COLLECTION_ALIAS = process.env.COMPOSE_COLLECTION_ALIAS;
const COMPOSE_CLIENT_ID = process.env.COMPOSE_CLIENT_ID;
const COMPOSE_CLIENT_SECRET = process.env.COMPOSE_CLIENT_SECRET;

async function handleCreateCollection(): Promise<void> {
  const alias = await askCollectionAlias();
  const description = await askCollectionDescription();
  await createCollection(alias, description || undefined);
}

async function main(): Promise<void> {
  if (!FETCH_ENDPOINT_URL || !COMPOSE_INGESTION_URL || !COMPOSE_PROJECT_ALIAS || !COMPOSE_ENVIRONMENT_ALIAS || !COMPOSE_COLLECTION_ALIAS || !COMPOSE_CLIENT_ID || !COMPOSE_CLIENT_SECRET) {
    console.error('Missing required environment variables. Check your .env file.');
    process.exit(1);
  }

  console.log('Data Import Tool\n');

  let running = true;
  while (running) {
    const action: MenuAction = await showMainMenu();

    switch (action) {
      case 'fetch':
        await fetchShows();
        break;
      case 'send':
        await sendToCompose();
        break;
      case 'fetch_and_send':
        await fetchAndSend();
        break;
      case 'create_collection':
        await handleCreateCollection();
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

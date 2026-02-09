import config from './config.js';
import {
  MenuAction,
  showMainMenu,
  confirmContinue,
  askEnvironmentAlias,
  askEnvironmentDescription,
  askCollectionAlias,
  askCollectionDescription,
} from './prompts.js';
import { fetchShows } from './apis/tvmaze/fetchShows.js';
import { sendToCompose } from './apis/compose/ingestion/send.js';
import { fetchAndSend } from './apis/fetchAndSend.js';
import { createCollection } from './apis/compose/collection/create.js';
import { createEnvironment } from './apis/compose/environment/create.js';
  

async function handleCreateCollection(): Promise<void> {
  const collectionAlias = await askCollectionAlias();
  const description = await askCollectionDescription();
  await createCollection(collectionAlias, description || undefined);
}
async function handleCreateEnvironment(): Promise<void> {
  const environmentAlias = await askEnvironmentAlias();
  const description = await askEnvironmentDescription();
  await createEnvironment(environmentAlias, description || undefined);
}


async function main(): Promise<void> {
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
      case 'create_environment':
        await handleCreateEnvironment();
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

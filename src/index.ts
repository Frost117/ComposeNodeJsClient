import { MenuAction, showMainMenu, confirmContinue } from './prompts.js';
import { fetchShows } from './apis/tvmaze/fetchShows.js';
import { fetchAndSend } from './apis/fetchAndSend.js';
import {
  createCollection,
  listCollections,
  deleteCollection,
  createEnvironment,
  getEnvironments,
  deleteEnvironment,
  printEnvironments,
  sendToCompose,
  createTypeSchema,
} from './apis/compose/index.js';

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
        await createCollection();
        break;
      case 'get_collections':
        await listCollections();
        break;
      case 'delete_collection':
        await deleteCollection();
        break;
      case 'create_environment':
        await createEnvironment();
        break;
      case 'get_environments': {
        const environments = await getEnvironments();
        printEnvironments(environments);
        break;
      }
      case 'delete_environment':
        await deleteEnvironment();
        break;
      case 'create_type_schema':
        await createTypeSchema();
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

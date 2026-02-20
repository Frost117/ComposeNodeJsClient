import { Show } from '../../schema/types.js';
import { askPageCount, selection } from '../../prompts.js';
import config from '../../config.js';

export let fetchedData: Show[] | null = null;

export async function fetchShows(): Promise<Show[] | null> {
  const pages = await askPageCount();
  const allShows: Show[] = [];

  for (let page = 0; page < pages; page++) {
    try {
      const response = await fetch(`${config.FETCH_ENDPOINT_URL}?page=${page}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log(`No more pages available (stopped at page ${page})`);
          break;
        }
        console.error(`Failed to fetch page ${page}: ${response.statusText}`);
        return null;
      }

      const data: Show[] = await response.json();
      allShows.push(...data);
      console.log(`Page ${page}: fetched ${data.length} shows`);
    } catch (error) {
      console.error(`Error fetching page ${page}: ${error}`);
      return null;
    }
  }

  fetchedData = allShows;
  selection.pages = pages;
  console.log(`Total: ${allShows.length} shows from ${pages} page(s)`);
  return allShows;
}

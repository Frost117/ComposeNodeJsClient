import { Show } from '../schema/types.js';
import { askPageCount } from '../prompts.js';

const FETCH_ENDPOINT_URL = process.env.FETCH_ENDPOINT_URL;

export let fetchedData: Show[] | null = null;

export async function fetchData(): Promise<Show[] | null> {
  const pages = await askPageCount();
  // TODO: Implement multi-page fetching using ?page=N parameter

  try {
    const response = await fetch(`${FETCH_ENDPOINT_URL!}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch data: ${response.statusText}`);
      return null;
    }

    const data: Show[] = await response.json();
    fetchedData = data;
    console.log(`Fetched ${data.length} shows`);
    return data;
  } catch (error) {
    console.error(`Error fetching data: ${error}`);
    return null;
  }
}

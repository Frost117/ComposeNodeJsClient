import { Show } from './schema/types.js';

export const selection = {
  environment: null as string | null,
  collection: null as string | null,
  pages: null as number | null,
};

export let fetchedData: Show[] = [];

export function setFetchedData(data: Show[]): void {
  fetchedData = data;
}

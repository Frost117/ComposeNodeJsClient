export interface Show {
  id: number;
  url: string;
  name: string;
  type: string;
  language: string | null;
  genres: string[];
  status: string;
  runtime: number | null;
  averageRuntime: number | null;
  premiered: string | null;
  ended: string | null;
  officialSite: string | null;
  schedule: Schedule;
  rating: Rating;
  weight: number;
  network: Network | null;
  webChannel: WebChannel | null;
  dvdCountry: Country | null;
  externals: Externals;
  image: Image | null;
  summary: string | null;
  updated: number;
  _links: Links;
}

export interface Schedule {
  time: string;
  days: string[];
}

export interface Rating {
  average: number | null;
}

export interface Network {
  id: number;
  name: string;
  country: Country | null;
  officialSite: string | null;
}

export interface WebChannel {
  id: number;
  name: string;
  country: Country | null;
  officialSite: string | null;
}

export interface Country {
  name: string;
  code: string;
  timezone: string;
}

export interface Externals {
  tvrage: number | null;
  thetvdb: number | null;
  imdb: string | null;
}

export interface Image {
  medium: string;
  original: string;
}

export interface Links {
  self: Link;
  previousepisode?: Link;
  nextepisode?: Link;
}

export interface Link {
  href: string;
  name?: string;
}


// Umbraco Compose Token types
export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

// Umbraco Compose Ingestion API types
export interface ComposeUpsertEntry<T = Record<string, unknown>> {
  id: string;
  type: string;
  variant?: string;  // optional, for localization (e.g., "en-GB")
  data: T;
  action: 'upsert';
}

export interface ComposeDeleteEntry {
  id: string;
  action: 'delete';
}

export type ComposeEntry<T = Record<string, unknown>> = ComposeUpsertEntry<T> | ComposeDeleteEntry;

export type ComposePayload<T = Record<string, unknown>> = ComposeEntry<T>[];

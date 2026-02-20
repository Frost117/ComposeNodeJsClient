# Compose Node.js

CLI tool that fetches TV show data from the [TV Maze API](https://api.tvmaze.com/shows) and imports it into [Umbraco Compose](https://umbraco.gitbook.io/umbraco-orchestration/Itgh9j25JnFvMoVr3Muq/apis/ingestion) via its ingestion API.

## Prerequisites

- Node.js 20+
- An Umbraco Compose project with API credentials

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

3. Fill in your Compose credentials in `.env`.

## Usage

Build and run:
```bash
npm run build:start
```

Or build and run separately:
```bash
npm run build
npm run start
```

For development with watch mode:
```bash
npm run dev
```

The CLI presents an interactive menu with the following operations:

**Data**
- Fetch shows from TV Maze (with configurable page count, 240 shows per page)
- Send fetched data to Compose
- Fetch and send with a configurable delay

**Environments**
- Select, create, list, and delete environments

**Collections**
- Select, create, list, and delete collections

**Schema**
- Create type schemas

## Environment Variables

| Variable | Description |
|---|---|
| `FETCH_ENDPOINT_URL` | TV Maze API URL (`https://api.tvmaze.com/shows`) |
| `COMPOSE_INGESTION_URL` | Compose ingestion endpoint base URL |
| `COMPOSE_MANAGEMENT_URL` | Compose management API URL |
| `COMPOSE_PROJECT_ALIAS` | Your Compose project alias |
| `COMPOSE_ENVIRONMENT_ALIAS` | Default environment alias |
| `COMPOSE_COLLECTION_ALIAS` | Default collection alias |
| `COMPOSE_CLIENT_ID` | OAuth2 client ID |
| `COMPOSE_CLIENT_SECRET` | OAuth2 client secret |
| `COMPOSE_API_KEY_ALIAS` | API key alias |
| `COMPOSE_API_KEY` | API key for ingestion |

## Project Structure

```
src/
├── index.ts                  # Entry point and main menu loop
├── config.ts                 # Environment variable configuration, will tell you whats missing in your env file if it is not booting.
├── prompts.ts                # CLI prompts and selection state
├── schema/
│   └── types.ts              # TypeScript interfaces
└── apis/
    ├── fetchAndSend.ts       # Not yet done. 
    ├── tvmaze/
    │   └── fetchShows.ts     # Api to fetch our shows. Its stored in pages which contains 240ish shows.
    └── compose/
        ├── index.ts          # Barrel exports
        ├── auth.ts           # OAuth2 token management
        ├── helpers/
        │   └── urls.ts       # URLs so we don't need to rewrite urls again and again.
        ├── environment/
        │   ├── create.ts
        │   ├── delete.ts
        │   └── get.ts
        ├── collection/
        │   ├── create.ts
        │   ├── delete.ts
        │   └── get.ts
        ├── ingestion/
        │   └── send.ts
        └── type-schema/
            └── create.ts
```

# Project Overview
Node.js application with TypeScript that:
- Fetches TV show data from TV Maze API (https://api.tvmaze.com/shows)
- Imports data to Umbraco Compose via its ingestion API
- Provides user control over import timing to avoid throttling

# External Services
## TV Maze API (Data Source)
- Endpoint: https://api.tvmaze.com/shows
- Pagination: ?page=N (240 shows per page)

## Umbraco Compose (Import Destination)
- Ingestion API: Used for importing/pushing data
- GraphQL API: Available for querying data
- Endpoint format: https://ingest.{region}.umbracocompose.com/v1/{project-alias}/{environment-alias}/{collection-alias}
- HTTP Method: PUT
- Headers:
  - Content-Type: application/json
  - Authorization: Bearer {access_token}
- Authentication: OAuth2 client credentials flow
  - Token endpoint: POST https://management.umbracocompose.com/v1/auth/token
  - Body: grant_type=client_credentials&client_id={client_id}&client_secret={client_secret}
  - Content-Type: application/x-www-form-urlencoded
  - Returns access_token with expiry
- Docs: https://umbraco.gitbook.io/umbraco-orchestration/Itgh9j25JnFvMoVr3Muq/apis/ingestion
- Payload format: JSON array of entries
  ```json
  [
    {
      "id": "1",
      "type": "Show",
      "variant": "en-GB",  // optional, for localization
      "data": { ... },
      "action": "upsert"
    }
  ]
  ```
- Actions: "upsert" (create/update) or "delete"
- Supports batch operations in single request

# Tech Stack
- Node.js with TypeScript
- ES modules (import/export), not CommonJS
- Native fetch for HTTP requests
- @inquirer/prompts for CLI interface

# Configuration
- Use environment variables for:
  - Endpoint URLs
  - Secrets/API keys
  - Other configuration
- Use a .env file for local development (never commit to git)

# Code Style
- Prefer async/await over .then() chains
- Use try/catch for error handling
- Use explicit types, avoid `any`
- Maximum 2 levels of nested conditionals (use early returns or extract functions to flatten)

# Commands
- npm run build - compile TypeScript
- npm run start - run the application
- npm test - run tests

# Structure
- src/index.ts - Entry point and main loop
- src/prompts.ts - All inquirer CLI prompts
- src/apis/ - API functions (fetch, import, fetchAndImport, auth)
- src/schema/ - TypeScript types

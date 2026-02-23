import config from "../../../config.js";

const baseManagementUrl = config.COMPOSE_MANAGEMENT_URL;
const baseComposeUrl = config.COMPOSE_INGESTION_URL;
const projectAlias = config.COMPOSE_PROJECT_ALIAS;
const environmentAlias = config.COMPOSE_ENVIRONMENT_ALIAS;
const collectionAlias = config.COMPOSE_COLLECTION_ALIAS;

// Ingestion API: PUT /v1/{projectAlias}/{environmentAlias}/{collectionAlias}
export function buildImportUrl(envAlias?: string, collAlias?: string): string {
  const env = envAlias ?? environmentAlias;
  return `${baseComposeUrl}/v1/${projectAlias}/${env}/${collAlias ?? collectionAlias}`;
}

// Ingestion API via function: PUT|POST /v1/{projectAlias}/{environmentAlias}/{collectionAlias}/{ingestionFunctionAlias}
export function buildIngestionFunctionUrl(functionAlias: string, envAlias?: string, collAlias?: string): string {
  const env = envAlias ?? environmentAlias;
  return `${baseComposeUrl}/v1/${projectAlias}/${env}/${collAlias ?? collectionAlias}/${functionAlias}`;
}

// Management API
export function buildAuthUrl(): string {
  return `${baseManagementUrl}/v1/auth/token`;
}

export function buildCollectionsUrl(envAlias?: string): string {
  const env = envAlias ?? environmentAlias;
  return `${baseManagementUrl}/v1/projects/${projectAlias}/environments/${env}/collections`;
}

export function buildCollectionUrl(collAlias: string, envAlias?: string): string {
  return `${buildCollectionsUrl(envAlias)}/${collAlias}`;
}

export function buildEnvironmentsUrl(): string {
  return `${baseManagementUrl}/v1/projects/${projectAlias}/environments`;
}

export function buildEnvironmentUrl(envAlias: string): string {
  return `${buildEnvironmentsUrl()}/${envAlias}`;
}

export function buildTypeSchemasUrl(): string {
  return `${baseManagementUrl}/v1/projects/${projectAlias}/environments/${environmentAlias}/type-schemas`;
}

export function buildApiKeyUrl(apiKeyAlias: string): string {
  return `${baseManagementUrl}/v1/me/api-keys/${apiKeyAlias}`;
}

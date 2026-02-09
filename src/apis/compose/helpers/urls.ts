import config from "../../../config.js";

export function buildIngestionUrl(): string {
  return `${config.COMPOSE_INGESTION_URL}/v1/projects/${config.COMPOSE_PROJECT_ALIAS}/environments/${config.COMPOSE_ENVIRONMENT_ALIAS}/collections/${config.COMPOSE_COLLECTION_ALIAS}/ingest`;
}

export function buildCollectionsUrl(): string {
  return `${config.COMPOSE_MANAGEMENT_URL}/v1/projects/${config.COMPOSE_PROJECT_ALIAS}/environments/${config.COMPOSE_ENVIRONMENT_ALIAS}/collections`;
}

export function buildEnvironmentsUrl(): string {
  return `${config.COMPOSE_MANAGEMENT_URL}/v1/projects/${config.COMPOSE_PROJECT_ALIAS}/environments`;
}
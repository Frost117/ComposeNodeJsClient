function requireEnv(variable: string): string {
    const value = process.env[variable];
    if (!value) {
        throw new Error(`Missing required environment variable: ${variable}`);
    }
    return value;
}

const config = {

    FETCH_ENDPOINT_URL: requireEnv('FETCH_ENDPOINT_URL'),
    COMPOSE_INGESTION_URL: requireEnv('COMPOSE_INGESTION_URL'),
    COMPOSE_PROJECT_ALIAS: requireEnv('COMPOSE_PROJECT_ALIAS'),
    COMPOSE_ENVIRONMENT_ALIAS: requireEnv('COMPOSE_ENVIRONMENT_ALIAS'),
    COMPOSE_COLLECTION_ALIAS: requireEnv('COMPOSE_COLLECTION_ALIAS'),
    COMPOSE_CLIENT_ID: requireEnv('COMPOSE_CLIENT_ID'),
    COMPOSE_CLIENT_SECRET: requireEnv('COMPOSE_CLIENT_SECRET'),
    COMPOSE_MANAGEMENT_URL: requireEnv('COMPOSE_MANAGEMENT_URL'),

}

export default config;
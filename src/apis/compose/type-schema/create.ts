import { getAccessToken } from '../auth.js';
import { buildTypeSchemasUrl } from '../helpers/urls.js';

const showTypeSchema = {
  typeSchemaAlias: 'Show',
  schema: {
    $schema: 'https://umbracocompose.com/v1/schema',
    allOf: [{ $ref: 'https://umbracocompose.com/v1/node' }],
    properties: {
      id: { type: 'integer' },
      url: { type: 'string' },
      name: { type: 'string' },
      type: { type: 'string' },
      language: { type: ['string', 'null'] },
      genres: {
        type: 'array',
        items: { type: 'string' },
      },
      status: { type: 'string' },
      runtime: { type: ['integer', 'null'] },
      averageRuntime: { type: ['integer', 'null'] },
      premiered: { type: ['string', 'null'] },
      ended: { type: ['string', 'null'] },
      officialSite: { type: ['string', 'null'] },
      schedule: {
        type: 'object',
        properties: {
          time: { type: 'string' },
          days: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
      rating: {
        type: 'object',
        properties: {
          average: { type: ['number', 'null'] },
        },
      },
      weight: { type: 'integer' },
      network: {
        type: ['object', 'null'],
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          country: {
            type: ['object', 'null'],
            properties: {
              name: { type: 'string' },
              code: { type: 'string' },
              timezone: { type: 'string' },
            },
          },
          officialSite: { type: ['string', 'null'] },
        },
      },
      webChannel: {
        type: ['object', 'null'],
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          country: {
            type: ['object', 'null'],
            properties: {
              name: { type: 'string' },
              code: { type: 'string' },
              timezone: { type: 'string' },
            },
          },
          officialSite: { type: ['string', 'null'] },
        },
      },
      dvdCountry: {
        type: ['object', 'null'],
        properties: {
          name: { type: 'string' },
          code: { type: 'string' },
          timezone: { type: 'string' },
        },
      },
      externals: {
        type: 'object',
        properties: {
          tvrage: { type: ['integer', 'null'] },
          thetvdb: { type: ['integer', 'null'] },
          imdb: { type: ['string', 'null'] },
        },
      },
      image: {
        type: ['object', 'null'],
        properties: {
          medium: { type: 'string' },
          original: { type: 'string' },
        },
      },
      summary: { type: ['string', 'null'] },
      updated: { type: 'integer' },
      _links: {
        type: 'object',
        properties: {
          self: {
            type: 'object',
            properties: {
              href: { type: 'string' },
              name: { type: 'string' },
            },
          },
          previousepisode: {
            type: 'object',
            properties: {
              href: { type: 'string' },
              name: { type: 'string' },
            },
          },
          nextepisode: {
            type: 'object',
            properties: {
              href: { type: 'string' },
              name: { type: 'string' },
            },
          },
        },
      },
    },
  },
};

export async function createTypeSchema(): Promise<boolean> {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    console.error('Failed to obtain access token');
    return false;
  }

  const url = buildTypeSchemasUrl();

  console.log('Creating Show type schema...');
  console.log(`URL: ${url}`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(showTypeSchema),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Failed to create type schema: ${response.status} ${response.statusText}`);
      console.error(`Response body: ${errorBody}`);
      return false;
    }

    const responseBody = await response.text();
    console.log('Successfully created Show type schema');
    if (responseBody) {
      console.log(`Response: ${responseBody}`);
    }
    return true;
  } catch (error) {
    console.error(`Error creating type schema: ${error}`);
    return false;
  }
}

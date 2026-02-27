import config from "../../../config.js";
import { buildGraphqlUrl } from "../helpers/urls.js";

export async function queryCollection(collection: string): Promise<void> {
    const url = buildGraphqlUrl();
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.COMPOSE_API_KEY}`,
        },
        body: JSON.stringify({
            query: `{
                ${collection} {
                    items { id }
                }
            }`
        }),
    });

    const data = await response.json();
    console.log(data);
}
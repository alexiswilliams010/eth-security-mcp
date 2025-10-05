import * as types from "./types.js";

// To avoid rate limiting, we sleep for 200ms between requests
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// API Handlers
const echoTxBaseURL = "https://api.dune.com/api/echo/v1/transactions/evm/";

export async function getTransactionsByAddress(
    address: string,
    apiKey: string,
    chain_ids: string,
    method_id: string,
    log_address: string,
    topic0: string,
    min_block_number: string,
    is_sender: boolean,
    is_receiver: boolean
) {
    const params = types.GetTransactionsEchoRequest.parse({
        chain_ids,
        method_id,
        log_address,
        topic0,
        min_block_number
    });
    const results = await fetchAndPaginate(address, apiKey, params);

    // Filter results based on is_sender and is_receiver
    const filteredResults = results.filter((result) => {
        if (is_sender && is_receiver) {
            return true;
        }

        return is_sender ? result.from.toLowerCase() === address.toLowerCase() : result.to.toLowerCase() === address.toLowerCase();
    });

    return filteredResults;
}

// Helper functions
function constructQueryParameters(params: object): string {
    // For each key in params, if the value is not undefined or an empty string, add it to the query parameters
    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== "") {
            queryParams.set(key, value);
        }
    }

    return queryParams.toString();
}

async function parseResponseBody(response: Response): Promise<unknown> {
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
        return response.json();
    }
    return response.text();
}

async function fetchAndPaginate(address: string, apiKey: string, params: any): Promise<any[]> {
    const results = [];
    let offset = "initial_offset";

    while (offset !== "" && offset !== undefined) {
        await sleep(200); // intentionally slow down to avoid rate limiting

        const queryParams = constructQueryParameters({
            ...params,
            offset: offset === "initial_offset" ? "" : offset
        });
        const nextResponse = await fetch(`${echoTxBaseURL}${address}?${queryParams}`, {
            method: "GET",
            headers: {
                "X-Dune-API-Key": apiKey,
            }
        });
        const nextResponseBody = await parseResponseBody(nextResponse);
        const parsedResponse = types.GetTransactionsEchoResponse.parse(nextResponseBody);
        results.push(...parsedResponse.transactions);
        offset = parsedResponse.next_offset;
    }

    return results;
}

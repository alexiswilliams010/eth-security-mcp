import * as types from "./types.js";

// To avoid rate limiting, we sleep for 200ms between requests
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Type definition for logging function
type LoggingFunction = (message: { level: string, data: any }) => void;

type FilterParams = {
    is_sender: boolean,
    is_receiver: boolean,
    address: string,
    limit: number,
}

// API Handlers
const echoTxBaseURL = "https://api.dune.com/api/echo/v1/transactions/evm/";

export async function getTransactionsByAddress(
    logger: LoggingFunction,
    address: string,
    apiKey: string,
    chain_ids: string,
    method_id: string,
    log_address: string,
    topic0: string,
    min_block_number: string,
    limit: string,
    is_sender: boolean,
    is_receiver: boolean
) {
    const params = types.GetTransactionsEchoRequest.parse({
        chain_ids,
        method_id,
        log_address,
        topic0,
        min_block_number,
        limit
    });

    const filterParams: FilterParams = {
        is_sender,
        is_receiver,
        address,
        limit: parseInt(limit)
    }
    const results = await fetchAndPaginate(logger, address, apiKey, params, filterParams);
    return results
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

function filterTransactionResults(
    results: any[],
    is_sender: boolean,
    is_receiver: boolean,
    address: string,
    remainingSlots: number
): any[] {
    // Filter based on sender/receiver criteria
    const filteredResults = results.filter((result) => {
        if (is_sender && is_receiver) {
            return true;
        }

        return is_sender ? result.from.toLowerCase() === address.toLowerCase() : result.to.toLowerCase() === address.toLowerCase();
    });

    // Limit the results to not exceed the provided remaining number of transactions that can be returned
    return filteredResults.slice(0, remainingSlots);
}

async function fetchAndPaginate(logger: LoggingFunction, address: string, apiKey: string, params: any, filterParams: FilterParams): Promise<any[]> {
    const results = [];
    const maxLimit = filterParams.limit;
    let offset = "initial_offset";
    let currentLimit = 0;

    while ((offset !== "" && offset !== undefined) && currentLimit < maxLimit) {
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

        // Filter the results based on the filterParams
        const filteredResults = filterTransactionResults(
            parsedResponse.transactions,
            filterParams.is_sender,
            filterParams.is_receiver,
            filterParams.address,
            maxLimit - currentLimit,
        );
        results.push(...filteredResults);
        currentLimit += filteredResults.length;
        offset = parsedResponse.next_offset;
    }

    return results;
}

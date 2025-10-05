import { z } from "zod";

import * as types from "./types.js";

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
) {
    const params = types.GetTransactionsEchoRequest.parse({
        chain_ids,
        method_id,
        log_address,
        topic0,
        min_block_number
    });
    const queryParams = constructQueryParameters(params);
    const response = await fetch(`${echoTxBaseURL}${address}?${queryParams}`, {
        method: "GET",
        headers: {
            "X-Dune-API-Key": apiKey,
        }
    });

    const responseBody = await parseResponseBody(response);
    const parsedResponse = types.GetTransactionsEchoResponse.parse(responseBody);
    return parsedResponse;
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

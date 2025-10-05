import * as types from "./types.js";
import { constructQueryParameters, parseResponseBody } from "../utils.js";

// To avoid rate limiting, we sleep for 200ms between requests
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Type definition for logging function
type LoggingFunction = (message: { level: string, data: any }) => void;

const simActivityBaseURL = "https://api.sim.dune.com/v1/evm/activity/";

type FilterParams = {
  block_number: number,
};

export async function getActivityByAddress(
  logger: LoggingFunction,
  address: string,
  apiKey: string,
  chain_ids: string,
  block_number: number,
) {
  // Make sure types match zod schema
  types.GetActivityByAddressSimSchema.parse({
    address,
    chain_ids,
    block_number,
  });

  const filterParams: FilterParams = {
    block_number,
  }
  const results = await fetchAndPaginate(logger, address, apiKey, {chain_ids}, filterParams);
  return results
}

function filterActivityResults(
  results: any[],
  blockLimit: number,
): { reachedLimit: boolean, results: any[] } {
  // Filter based on sender/receiver criteria and block number
  let reachedLimit = false;
  const filteredResults = results.filter((result) => {
    // If the transaction's block number is less than the provided block number, return false
    if (result.block_number < blockLimit) {
      reachedLimit = true;
      return false;
    }

    // Filter out call activities that do not result in token movements
    if (result.type == "call" && result.asset_type == "" && result.token_address == "") {
      return false;
    }

    // Filter out erc1155 and erc721 activities
    if (result.asset_type == "erc1155" || result.asset_type == "erc721") {
      return false;
    }

    // Filter out approve activities since these are not themselves token "movements"
    if (result.type == "approve") {
      return false;
    }

    return true;
  });

  return { reachedLimit, results: filteredResults };
}

async function fetchAndPaginate(logger: LoggingFunction, address: string, apiKey: string, params: any, filterParams: FilterParams): Promise<any[]> {
  const results = [];
  let offset = "initial_offset";
  let blockLimit = filterParams.block_number;

  while (offset !== "" && offset !== undefined) {
    await sleep(100); // intentionally slow down to avoid rate limiting

    const queryParams = constructQueryParameters({
      ...params,
      limit: 100, // hardcode the response to return max 100 results at a time
      offset: offset === "initial_offset" ? "" : offset
    });
    const nextResponse = await fetch(`${simActivityBaseURL}${address}?${queryParams}`, {
      method: "GET",
      headers: {
          "X-Sim-Api-Key": apiKey,
      }
    });
    const nextResponseBody = await parseResponseBody(nextResponse);

    const parsedResponse = types.ActivitiesSimResponseSchema.parse(nextResponseBody);

    // Filter the results based on the filterParams
    const { reachedLimit, results: filteredResults } = filterActivityResults(
      parsedResponse.activity,
      blockLimit,
    );
    results.push(...filteredResults);

    // If we have reached the limit, break out of the loop
    if (reachedLimit) {
      break;
    }

    offset = parsedResponse.next_offset;
  }

  return results;
}
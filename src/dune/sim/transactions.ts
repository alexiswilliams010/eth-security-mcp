import * as types from "./types.js";
import { constructQueryParameters, parseResponseBody } from "../utils.js";

// To avoid rate limiting, we sleep for 200ms between requests
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Type definition for logging function
type LoggingFunction = (message: { level: string, data: any }) => void;

const simTxBaseURL = "https://api.sim.dune.com/v1/evm/transactions/";

type FilterParams = {
  is_sender: boolean,
  is_receiver: boolean,
  address: string,
  block_number: number,
}

export async function getTransactionsByAddress(
    logger: LoggingFunction,
    address: string,
    apiKey: string,
    chain_ids: string,
    block_number: number,
    is_sender: boolean,
    is_receiver: boolean
) {
  // Make sure types match zod schema
  types.GetTransactionsByAddressSimSchema.parse({
      address,
      chain_ids,
      block_number,
      is_sender,
      is_receiver
  });

  const filterParams: FilterParams = {
    is_sender,
    is_receiver,
    address,
    block_number,
  }
  const results = await fetchAndPaginate(logger, address, apiKey, {chain_ids}, filterParams);
  return results
}

function filterTransactionResults(
  results: any[],
  is_sender: boolean,
  is_receiver: boolean,
  address: string,
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

    if (is_sender && is_receiver) {
      return true;
    }

    return is_sender ? result.from.toLowerCase() === address.toLowerCase() : result.to.toLowerCase() === address.toLowerCase();
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
      offset: offset === "initial_offset" ? "" : offset
    });
    const nextResponse = await fetch(`${simTxBaseURL}${address}?${queryParams}`, {
      method: "GET",
      headers: {
          "X-Sim-Api-Key": apiKey,
      }
    });
    const nextResponseBody = await parseResponseBody(nextResponse);
    logger({ level: "info", data: nextResponseBody });

    const parsedResponse = types.GetTransactionsByAddressSimResponse.parse(nextResponseBody);

    // Filter the results based on the filterParams
    const { reachedLimit, results: filteredResults } = filterTransactionResults(
      parsedResponse.transactions,
      filterParams.is_sender,
      filterParams.is_receiver,
      filterParams.address,
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

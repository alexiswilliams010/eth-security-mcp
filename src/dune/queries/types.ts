import { z } from "zod";

export const GetTransactionsByAddressEchoSchema = z.object({
    address: z.string().describe("The address to get transactions for"),
    chain_ids: z.string().optional().default("").describe("Comma separated list of chain ids to get transactions for"),
    method_id: z.string().optional().default("").describe("Return only transactions with this method id"),
    log_address: z.string().optional().default("").describe("Return only transactions with this address in the logs"),
    topic0: z.string().optional().default("").describe("Return only transactions with this event topic0 in the logs"),
    min_block_number: z.string().optional().default("").describe("Return only transactions from this block number onwards"),
    limit: z.string().optional().default("").describe("Limit the number of transactions returned"),
    is_sender: z.boolean().optional().default(false).describe("Return transactions where the provided address is the sender"),
    is_receiver: z.boolean().optional().default(false).describe("Return transactions where the provided address is the receiver"),
});

// All fields for the /echo/v1/transactions/evm/{address} request endpoint in the Dune Echo API
// For more information, see https://docs.dune.com/echo/evm/transactions
export const GetTransactionsEchoRequest = z.object({
    // Note: not all these fields are actually strings, but because they are query options, they are effectively strings
    offset: z.string().optional().default(""),
    limit: z.string().optional().default(""),
    block_time: z.string().optional().default(""),
    chain_ids: z.string().optional().default(""),
    to: z.string().optional().default(""),
    method_id: z.string().optional().default(""),
    decode: z.boolean().optional().default(true),
    log_address: z.string().optional().default(""),
    topic0: z.string().optional().default(""),
    min_block_number: z.string().optional().default(""),
});

export const TransactionEchoLogsSchema = z.object({
    address: z.string().optional().default(""),
    data: z.string().optional().default(""),
    topics: z.array(z.string()).optional().default([]),
});

export const TransactionEchoSchema = z.object({
    address: z.string(),
    block_hash: z.string(),
    block_number: z.number(),
    block_time: z.string(),
    chain: z.string(),
    chain_id: z.number(),
    data: z.string(),
    from: z.string(),
    gas_price: z.string(),
    effective_gas_price: z.string(),
    gas_used: z.string(),
    hash: z.string(),
    index: z.number(),
    nonce: z.string(),
    to: z.string().nullable().default(""), // to can be null if the transaction is a contract creation
    transaction_type: z.string(),
    value: z.string().optional().nullable().default(""),
    logs: z.array(TransactionEchoLogsSchema),
    decoded: z.any().optional().nullable().default({}),
});

// All response fields for /echo/v1/transactions/evm/{address}
export const GetTransactionsEchoResponse = z.object({
    next_offset: z.string().optional().default(""),
    transactions: z.array(TransactionEchoSchema).optional().default([]),
});

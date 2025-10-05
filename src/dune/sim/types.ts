import { z } from "zod";

export const GetTransactionsByAddressSimSchema = z.object({
  address: z.string().describe("The address to get transactions for"),
  chain_ids: z.string().optional().default("").describe("Comma separated list of chain ids to get transactions for"),
  block_number: z.number().describe("Return transactions up to this block number"),
  is_sender: z.boolean().optional().default(true).describe("Return transactions where the provided address is the sender"),
  is_receiver: z.boolean().optional().default(true).describe("Return transactions where the provided address is the receiver"),
});

export const TransactionSimLogsSchema = z.object({
  address: z.string().optional().default(""),
  data: z.string().optional().default(""),
  topics: z.array(z.string()).optional().default([]),
});

export const TransactionSimSchema = z.object({
  address: z.string(),
  block_hash: z.string(),
  block_number: z.number(),
  block_time: z.string(),
  chain: z.string(),
  chain_id: z.number().optional(),
  from: z.string(),
  hash: z.string(),
  success: z.boolean().optional(),
  data: z.string().optional().default(""),
  gas_price: z.string().optional().default(""),
  index: z.number().optional(),
  nonce: z.string().optional().default(""),
  to: z.string().nullable().default(""), // to can be null if the transaction is a contract creation
  transaction_type: z.string().optional().default(""),
  value: z.string().optional().nullable().default(""),
  logs: z.array(TransactionSimLogsSchema).optional().default([]),
  decoded: z.any().optional().nullable().default({}),
});

// All response fields for /v1/evm/transactions/{address}
export const GetTransactionsByAddressSimResponse = z.object({
  next_offset: z.string().optional().default(""),
  transactions: z.array(TransactionSimSchema).optional().default([]),
});

export const GetActivityByAddressSimSchema = z.object({
  address: z.string().describe("The address to get activities for"),
  chain_ids: z.string().optional().default("").describe("Comma separated list of chain ids to get activities for"),
  block_number: z.number().describe("Return activities up to this block number"),
});

export const TokenMetadataSimSchema = z.object({
  symbol: z.string().optional().default(""),
  decimals: z.number().optional(),
  name: z.string().optional().default(""),
  price_usd: z.number().optional(),
  pool_size: z.number().optional(),
  standard: z.string().optional().default(""),
});

export const FunctionCallSimSchema = z.object({
  signature: z.string().optional().default(""),
  name: z.string().optional().default(""),
  inputs: z.object({
    name: z.string().optional().default(""),
    type: z.string().optional().default(""),
    value: z.string().optional().default(""),
  }).optional().default({}),
});

export const ActivitySimSchema = z.object({
  chain_id: z.number(),
  block_number: z.number(),
  block_time: z.string(),
  tx_hash: z.string(),
  type: z.string().optional().default(""),
  asset_type: z.string().optional().default(""),
  token_address: z.string().optional().default(""),
  from: z.string().optional().default(""),
  to: z.string().optional().default(""),
  spender: z.string().optional().default(""),
  value: z.string().optional(),
  value_usd: z.number().optional(),
  token_metadata: TokenMetadataSimSchema.optional(),
  function: FunctionCallSimSchema.optional(),
  contract_metadata: z.object({
    name: z.string().optional(),
  }).optional(),
  from_token_address: z.string().optional(),
  from_token_value: z.string().optional(),
  to_token_address: z.string().optional(),
  to_token_value: z.string().optional(),
});

export const ActivitiesSimResponseSchema = z.object({
  next_offset: z.string().optional().default(""),
  activity: z.array(ActivitySimSchema).optional().default([]),
});

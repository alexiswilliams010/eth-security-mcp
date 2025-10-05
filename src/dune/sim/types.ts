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

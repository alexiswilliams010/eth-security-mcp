import { z } from "zod";

export const RunTransactionSchema = z.object({
    transactionHash: z.string().describe("The transaction hash to re-run"),
    chain: z.string().describe("The blockchain to re-run the transaction from"),
    network: z.string().describe("The network type to re-run the transaction from"),
    quick: z.boolean().optional().default(false).describe("Whether to run only the first transaction or all transactions in the block"),
});

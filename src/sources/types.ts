import { z } from "zod";

export const RetrieveFunctionSignatureSchema = z.object({
    selector: z.string().describe("The hexadecimal function selector to retrieve the function signature(s) for"),
});

export const FunctionSignatureResultSchema = z.object({
    id: z.number(),
    text_signature: z.string(),
    bytes_signature: z.string(),
    hex_signature: z.string(),
    created_at: z.string(),
});

export const RetrieveFunctionSignatureResponse = z.object({
    count: z.number(),
    next: z.string().nullable().optional().default(null),
    previous: z.string().nullable().optional().default(null),
    results: z.array(FunctionSignatureResultSchema),
});

export const RetrieveSourceCodeSchema = z.object({
    address: z.string().describe("The address of the contract to retrieve the source code for"),
    chain_id: z.string().describe("The chain ID where the contract is deployed"),
});

export const SourceCodeResultSchema = z.object({
    sources: z.record(z.object({
        content: z.string(),
    })).optional().nullable().default({}),
}).passthrough();


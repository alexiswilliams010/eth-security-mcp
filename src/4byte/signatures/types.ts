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

#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import * as dotenv from "dotenv";

import * as queries from "./queries/queries.js";
import * as types from "./queries/types.js";
const server = new Server(
    {
        name: "server-dune",
        version: "0.0.1",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "get_transactions_by_address",
                description: "Retrieve all transactions from the provided address using the Echo API",
                inputSchema: zodToJsonSchema(types.GetTransactionsByAddressEchoSchema),
            },
        ],
    }
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        const apiKey = process.env.DUNE_API_KEY;

        // Handle the tool call
        if (!request.params.arguments) {
            throw new Error("Arguments are required");
        }

        switch(request.params.name) {
            case "get_transactions_by_address": {
                // Retrieve API key and parse arguments
                const key: string = checkApiKey(apiKey);
                const args = types.GetTransactionsByAddressEchoSchema.parse(request.params.arguments);

                // Get transactions from Dune Echo API
                const transactions = await queries.getTransactionsByAddress(
                    args.address,
                    key,
                    args.chain_ids,
                    args.method_id,
                    args.log_address,
                    args.topic0,
                    args.min_block_number
                );

                return {
                    content: [{ type: "text", text: JSON.stringify(transactions, null, 2) }],
                };
            }
            default: {
                throw new Error(`Unknown tool: ${request.params.name}`);
            }
        }
    } catch(error) {
        if (error instanceof Error) {
            throw new Error(`Invalid input: ${error.message}`);
        }
        throw error;
    }
});

function checkApiKey(apiKey: string | undefined): string {
    if (!apiKey) {
        throw new Error("DUNE_API_KEY is not set");
    }
    return apiKey;
}

async function runServer() {
    dotenv.config();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Dune MCP Server running on stdio");
}

runServer().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});

#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import * as dotenv from "dotenv";

import * as runTypes from "./run/types.js";
import * as run from "./run/run.js";
import { createAlchemyRpcUrl } from "./utils.js";

const server = new Server(
    {
        name: "server-cast",
        version: "0.0.1",
    },
    {
        capabilities: {
            tools: {},
            logging: {},
        },
    },
);

const logger = (message: { level: string, data: any }) => {
    server.sendLoggingMessage({
        level: message.level as "error" | "info" | "debug" | "notice" | "warning" | "critical" | "alert" | "emergency",
        data: message.data,
    });
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "run_transaction",
                description: "Re-run a transaction given its hash, returns a decoded trace",
                inputSchema: zodToJsonSchema(runTypes.RunTransactionSchema),
            },
        ],
    }
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        const apiKey = process.env.ALCHEMY_API_KEY;

        // Handle the tool call
        if (!request.params.arguments) {
            throw new Error("Arguments are required");
        }

        switch(request.params.name) {
            case "run_transaction": {
                // Retrieve API key and parse arguments
                const key: string = checkApiKey(apiKey);
                const args = runTypes.RunTransactionSchema.parse(request.params.arguments);

                // Ensure the provided transaction hash is valid
                validateTransactionHash(args.transactionHash);

                // Create the RPC URL and re-run the transaction using cast run
                const rpcUrl = createAlchemyRpcUrl(args.network, args.chain, key);
                const result = await run.runTransaction(logger, args.transactionHash, rpcUrl, args.quick);

                return {
                    content: [{ type: "text", text: result }],
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
        throw new Error("ALCHEMY_API_KEY is not set");
    }
    return apiKey;
}

function validateTransactionHash(hash: string): void {
    if (!hash.startsWith("0x")) {
        throw new Error("Transaction hash must start with '0x'");
    }
    if (hash.length !== 66) {
        throw new Error("Transaction hash must be 66 characters long");
    }
    if (!/^0x[0-9a-fA-F]+$/.test(hash)) {
        throw new Error("Transaction hash must only contain hexadecimal characters");
    }
}

async function runServer() {
    dotenv.config();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Cast MCP Server running on stdio");
}

runServer().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});

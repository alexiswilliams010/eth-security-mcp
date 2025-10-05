#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import * as dotenv from "dotenv";

import * as transactions from "./sim/transactions.js";
import * as activity from "./sim/activity.js";
import * as types from "./sim/types.js";
const server = new Server(
    {
        name: "server-dune",
        version: "0.0.3",
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
                name: "get_transactions_by_address",
                description: "Retrieve all transactions from the provided address using the Sim API",
                inputSchema: zodToJsonSchema(types.GetTransactionsByAddressSimSchema),
            },
            {
                name: "get_activity_by_address",
                description: "Retrieve all token activity from the provided address using the Sim API",
                inputSchema: zodToJsonSchema(types.GetActivityByAddressSimSchema),
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
                const args = types.GetTransactionsByAddressSimSchema.parse(request.params.arguments);

                // Get transactions from Dune Sim API
                const txs = await transactions.getTransactionsByAddress(
                    logger,
                    args.address,
                    key,
                    args.chain_ids,
                    args.block_number,
                    args.is_sender,
                    args.is_receiver
                );

                return {
                    content: [{ type: "text", text: JSON.stringify(txs, null, 2) }],
                };
            }
            case "get_activity_by_address": {
                // Retrieve API key and parse arguments
                const key: string = checkApiKey(apiKey);
                const args = types.GetActivityByAddressSimSchema.parse(request.params.arguments);

                // Get token activity from Dune Sim API
                const tokenActivity = await activity.getActivityByAddress(
                  logger,
                  args.address,
                  key,
                  args.chain_ids,
                  args.block_number
                );

                return {
                    content: [{ type: "text", text: JSON.stringify(tokenActivity, null, 2) }],
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

#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { zodToJsonSchema } from "zod-to-json-schema";

import * as signatures from "./signatures/signatures.js";
import * as types from "./signatures/types.js";

const server = new Server(
    {
        name: "server-4byte",
        version: "0.0.1",
    },
    {
        capabilities: {
            tools: {},
            logging: {}, // enables logging to the server via server.sendLoggingMessage()
        },
    }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "retrieve_function_signature",
                description: "Retrieve function signature(s) for a given selector from 4byte",
                inputSchema: zodToJsonSchema(types.RetrieveFunctionSignatureSchema),
            },
        ],
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        // Handle the tool call
        if (!request.params.arguments) {
            throw new Error("Arguments are required");
        }

        switch(request.params.name) {
            case "retrieve_function_signature": {
                // Parse arguments and call the 4byte API
                const args = types.RetrieveFunctionSignatureSchema.parse(request.params.arguments);
                const functionSignatures = await signatures.retrieveFunctionSignature(args.selector);

                return {
                    content: [{ type: "text", text: JSON.stringify(functionSignatures, null, 2) }],
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

async function runServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("4byte MCP Server running on stdio");
}

runServer().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});

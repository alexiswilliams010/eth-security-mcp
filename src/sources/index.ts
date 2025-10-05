#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { zodToJsonSchema } from "zod-to-json-schema";

import * as sources from "./sources.js";
import * as types from "./types.js";

const server = new Server(
    {
        name: "server-sources",
        version: "0.0.1",
    },
    {
        capabilities: {
            tools: {},
            logging: {}, // enables logging to the server via server.sendLoggingMessage()
        },
    }
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
                name: "retrieve_function_signature",
                description: "Retrieve function signature(s) for a given selector from 4byte",
                inputSchema: zodToJsonSchema(types.RetrieveFunctionSignatureSchema),
            },
            {
                name: "retrieve_source_code",
                description: "Retrieve source code for a given contract address",
                inputSchema: zodToJsonSchema(types.RetrieveSourceCodeSchema),
            }
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
                const functionSignatures = await sources.retrieveFunctionSignature(args.selector);

                return {
                    content: [{ type: "text", text: JSON.stringify(functionSignatures, null, 2) }],
                };
            }
            case "retrieve_source_code": {
                // Parse arguments and call the Sourcify API
                const args = types.RetrieveSourceCodeSchema.parse(request.params.arguments);
                const sourceCode = await sources.retrieveSourceCode(logger, args.address, args.chain_id);
                return {
                    content: [{ type: "text", text: JSON.stringify(sourceCode, null, 2) }],
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
    console.error("Sources MCP Server running on stdio");
}

runServer().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});

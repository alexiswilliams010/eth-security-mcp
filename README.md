# ETH Security MCP

A collection of MCP servers for security analysts, auditors, and incident response.

# Setup

### Dependencies

`eth-security-mcp` requires the following dependencies to be installed:

- [node and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [just](https://github.com/casey/just)

### Environment Variables Setup

MCP servers within `eth-security-mcp` may make use of environment variables in order to pass information such as API keys. The `.env.example` lists the relevant values that will be necessary in order to run all MCP severs. To setup your `.env` file, run `cp .env.example .env` and fill in the relevant information.

### Workspaces

This repository uses npm workspaces to separate each action. To interact with a specific workspace use `npm <action> -w src/<directory-name>`.

### Build And Debug

This repo uses a [justfile](https://github.com/casey/just) to automate building and debugging using the [MCP Inspector](https://github.com/modelcontextprotocol/inspector). For example, to build and debug the `dune` MCP server, you can run the following:

```bash
$ just -l
Available recipes:
    build workspace
    debug workspace

$ just debug dune
```

### Installing MCP Servers Into Claude Desktop

To install MCP servers from this repo into Claude Desktop:

1. Run `just setup-<machine> <mcp-server>` where `machine` is either `linux` or `macos`, and `mcp-server` is the name of the directory that contains the MCP server you want to install.
2. The just command will produce a file in the directory of the MCP server called `claude.config.tmp.json`, which can be copy-pasted into the following file  under `mcpServers`:

    - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
    - linux: `~/.config/Claude/claude_desktop_config.json`

3. Once the config info has been added, restart Claude Desktop for the changes to take effect.

# MCP Servers

## Dune

The Dune MCP server provides access to Dune API endpoints, returning structured results about transactions.

### Available Tools

#### get_transactions_by_address

**Overview:** Use Dune's Echo API to retrieve transactions for a provided address.

**Parameters**

- `address` (required): The address to get transactions for.
- `chain_ids` (optional): Comma separated list of chain ids to get transactions for.
- `method_id` (optional): Filter transactions to return ones with the proivded method id (function selector).
- `log_address` (optional): Filter transactions to return ones where this address is present in the logs of the transaction.
- `topic0` (optional): Filter transactions to return ones with the provided primary event topic.
- `min_block_number` (optional): Filter transactions to return ones that are included in this block number and onwards.
- `is_sender` (optional): Return transactions where the provided address is the sender.
- `is_receiver` (optional): Return transactions where the provided address is the receiver.

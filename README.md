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
- `limit` (optional): Limit the number of transactions returned
- `is_sender` (optional): Return transactions where the provided address is the sender.
- `is_receiver` (optional): Return transactions where the provided address is the receiver.

**Returns**

Returns an array of transaction objects, where each transaction contains a list of pertinent information including:

- `address`: The address of the contract or account involved
- `block_number`: Number of the block containing the transaction
- `data`: Raw transaction data
- `from`: Address of the transaction sender
- `gas_used`: Amount of gas used
- `to`: Address of the transaction recipient (null for contract creation)
- `value`: Amount of ETH transferred in wei
- `logs`: Array of event logs emitted during transaction execution
  - `address`: Address of the contract emitting the event
  - `data`: Raw event data
  - `topics`: Array of event topics
- `decoded`: Decoded transaction data (if available)

## Sources

The Sources MCP server provides access to both function signature data and contract source code.

### Available Tools

#### retrieve_function_signature

**Overview:** Retrieve function signature(s) for a given function selector from the 4byte API.

**Parameters**

- `selector` (required): The hexadecimal function selector to retrieve the function signature(s) for.

**Returns**

Returns an object containing:
- `best_match`: The most likely matching function signature (determined by lowest ID).
- `all_matches`: Array of all potential matching function signatures found.

#### retrieve_source_code

**Overview:** Retrieve source code for a given contract address from Sourcify.

**Parameters**

- `address` (required): The address of the contract to retrieve the source code for.
- `chain_id` (required): The chain ID where the contract is deployed.

**Returns**

Returns an object containing:
- `sources`: A record of source files where each key is the file path and the value contains the file content.

## Cast

The Cast MCP server provides access to Foundry's cast command-line tool, allowing for interaction with Ethereum nodes and smart contracts.

### Available Tools

#### run_transaction

**Overview:** Simulate a transaction using Foundry's cast run command.

**Parameters**

- `transactionHash` (required): The hash of the transaction to simulate.
- `rpcUrl` (required): The RPC URL of the Ethereum node to use for simulation.
- `quick` (optional): Whether to use quick mode for faster simulation (default: false).

**Returns**

Returns the simulation result as a string, including:
- Transaction execution details
- State changes
- Gas usage
- Revert reasons (if any)

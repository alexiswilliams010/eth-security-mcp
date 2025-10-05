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

This collection includes three specialized MCP servers for Ethereum security analysis:

| Server | Purpose | Tools |
|--------|---------|-------|
| **Dune** | Transaction analysis and blockchain data | `get_transactions_by_address`, `get_activity_by_address` |
| **Sources** | Function signatures and contract source code | `retrieve_function_signature`, `retrieve_source_code` |
| **Cast** | Transaction simulation and debugging | `run_transaction` |

## 🔍 Dune

**Purpose:** Access Dune API endpoints for structured transaction analysis and blockchain data retrieval.

### Tools

### `get_transactions_by_address`

**Description:** Retrieve transactions for a specific address using Dune's Sim API.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `address` | string | ✅ | The address to get transactions for |
| `block_number` | number | ❌ | Filter transactions from this block number onwards |
| `chain_ids` | string | ❌ | Comma-separated list of chain IDs |
| `is_sender` | boolean | ❌ | Return transactions where address is the sender |
| `is_receiver` | boolean | ❌ | Return transactions where address is the receiver |

#### Returns

Returns an array of transaction objects with the following structure:

```typescript
{
  address: string;          // Contract or account address
  block_number: number;     // Block containing the transaction
  data: string;             // Raw transaction data
  from: string;             // Transaction sender address
  to: string | null;        // Transaction recipient (null for contract creation)
  value: string;            // ETH amount transferred in wei
  logs: Array<{             // Event logs emitted during execution
    address: string;        // Contract emitting the event
    data: string;           // Raw event data
    topics: string[];       // Event topics
  }>;
}[]
```

### `get_activity_by_address`

**Description:** Retrieve token activity for a specific address using Dune's Sim API.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `address` | string | ✅ | The address to get token activity for |
| `block_number` | number | ✅ | Return activities up to this block number |
| `chain_ids` | string | ❌ | Comma-separated list of chain IDs |

#### Returns

Returns an array of activity objects with the following structure:

```typescript
{
  chain_id: number;         // Chain ID where activity occurred
  block_number: number;     // Block containing the activity
  block_time: string;       // Timestamp of the block
  tx_hash: string;          // Transaction hash
  type: string;             // Type of activity (transfer, swap, etc.)
  asset_type: string;       // Type of asset (erc20, native, etc.)
  token_address: string;    // Address of the token contract
  from: string;             // Sender address
  to: string;               // Receiver address
  spender: string;          // Spender address (for approvals)
  value: string;            // Amount transferred
  value_usd: number;        // USD value of the transfer
  token_metadata: {         // Token information
    symbol: string;         // Token symbol
    decimals: number;       // Token decimals
    name: string;           // Token name
    price_usd: number;      // Token price in USD
    standard: string;       // Token standard (erc20, etc.)
  };
  function: {               // Function call details
    signature: string;      // Function signature
    name: string;           // Function name
    inputs: {               // Function inputs
      name: string;         // Parameter name
      type: string;         // Parameter type
      value: string;        // Parameter value
    };
  };
  contract_metadata: {      // Contract information
    name: string;           // Contract name
  };
  from_token_address: string;    // Source token address (for swaps)
  from_token_value: string;      // Source token amount (for swaps)
  to_token_address: string;      // Destination token address (for swaps)
  to_token_value: string;        // Destination token amount (for swaps)
}[]
```

## 📚 Sources

**Purpose:** Access function signature data and contract source code for security analysis.

### Tools

### `retrieve_function_signature`

**Description:** Retrieve function signature(s) for a given function selector from the 4byte API.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `selector` | string | ✅ | Hexadecimal function selector (e.g., "0x70a08231") |

#### Returns

```typescript
{
  best_match: string;      // Most likely function signature (lowest ID)
  all_matches: string[];   // All potential matching signatures
}
```

### `retrieve_source_code`

**Description:** Retrieve source code for a contract address from Sourcify.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `address` | string | ✅ | Contract address to retrieve source for |
| `chain_id` | number | ✅ | Chain ID where contract is deployed |

#### Returns

```typescript
{
  sources: Record<string, {      // Source files
    [filePath: string]: string;  // File path → file content
  }>;
}
```

## ⚡ Cast

**Purpose:** Access Foundry's cast command-line tool for transaction simulation and smart contract interaction.

### Tools

### `run_transaction`

**Description:** Simulate a transaction using Foundry's cast run command for debugging and analysis.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `transactionHash` | string | ✅ | Hash of the transaction to simulate |
| `rpcUrl` | string | ✅ | RPC URL of the Ethereum node |
| `quick` | boolean | ❌ | Use quick mode for faster simulation (default: false) |

#### Returns

Returns a string containing:
- Transaction execution details
- State changes
- Gas usage information
- Revert reasons (if transaction fails)

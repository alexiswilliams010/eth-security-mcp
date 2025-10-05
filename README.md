# ETH Security MCP

A collection of MCP servers for security analysts, auditors, and incident response.

### Workspaces

This repository uses npm workspaces to separate each action. To interact with a specific workspace use `npm <action> -w src/<directory-name>`.

### Build and Debug

This repo uses a [justfile](https://github.com/casey/just) to automate building and debugging using the [MCP Inspector](https://github.com/modelcontextprotocol/inspector). For example, to build and debug the `dune` MCP server, you can run the following:

```bash
$ just -l
Available recipes:
    build workspace
    debug workspace

$ just debug dune # name of the workspace is dune
```


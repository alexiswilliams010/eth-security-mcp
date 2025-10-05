# load environment variables from an available .env file
set dotenv-load

build workspace:
    @echo 'Building {{workspace}}'
    cd src/{{workspace}} && npm run prepare

debug workspace: (build workspace)
    #!/usr/bin/env bash
    set -euxo pipefail

    echo 'Setting up MCP debug server for {{workspace}}'
    x=$(cat .env | tr '\n' ' ' | sed 's/^/-e /')
    cd src/{{workspace}} && npx @modelcontextprotocol/inspector $x build/index.js
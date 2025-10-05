# load environment variables from an available .env file
set dotenv-load

build workspace:
    @echo 'Building {{workspace}}'
    cd src/{{workspace}} && npm run prepare

debug workspace *args: (build workspace)
    #!/usr/bin/env bash
    set -euxo pipefail

    echo 'Setting up MCP debug server for {{workspace}}'
    x=$(cat .env | tr '\n' ' ' | sed 's/^/-e /')
    cd src/{{workspace}} && npx -y @modelcontextprotocol/inspector $x dist/index.js {{args}}

setup-linux workspace:
    #!/usr/bin/env bash
    set -euxo pipefail

    echo 'Installing {{workspace}} MCP server into Claude Desktop for Linux'

    # Create claude_desktop_config.json if it doesn't exist
    if [ ! -f ~/.config/Claude/claude_desktop_config.json ]; then
        jq -n '{"mcpServers": {}}' > ~/.config/Claude/claude_desktop_config.json
    fi

    workdir='{{justfile_directory()}}/src/{{workspace}}'

    jq --arg work_dir "$workdir" '."server-dune".args = [$work_dir]' "$workdir/claude.config.json" > "$workdir/claude.config.tmp.json"

    result=""
    # Read .env file and update env section in claude.config.json
    while IFS='=' read -r key value; do
        if [[ -n "$key" && ! "$key" =~ ^# ]]; then
            result=$(jq --arg k "$key" --arg v "$value" '."server-dune".env += {($k): $v}' "$workdir/claude.config.tmp.json")
        fi
    done < .env

    # Save the result to the claude.config.tmp.json file where it can be copied by the user into the claude_desktop_config.json file
    echo "$result" > "$workdir/claude.config.tmp.json"

setup-macos workspace:
    @echo 'Installing {{workspace}} MCP server into Claude Desktop for MacOS'

    # Create claude_desktop_config.json if it doesn't exist
    if [ ! -f ~/Library/Application\ Support/Claude/claude_desktop_config.json ]; then
        jq -n '{"mcpServers": {}}' > ~/Library/Application\ Support/Claude/claude_desktop_config.json
    fi

    workdir='{{justfile_directory()}}/src/{{workspace}}'

    jq --arg work_dir "$workdir" '."server-dune".args = [$work_dir]' "$workdir/claude.config.json" > "$workdir/claude.config.tmp.json"

    result=""
    # Read .env file and update env section in claude.config.json
    while IFS='=' read -r key value; do
        if [[ -n "$key" && ! "$key" =~ ^# ]]; then
            result=$(jq --arg k "$key" --arg v "$value" '."server-dune".env += {($k): $v}' "$workdir/claude.config.tmp.json")
        fi
    done < .env

    # Save the result to the claude.config.tmp.json file where it can be copied by the user into the claude_desktop_config.json file
    echo "$result" > "$workdir/claude.config.tmp.json"

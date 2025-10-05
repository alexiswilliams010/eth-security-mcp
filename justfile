# load environment variables from an available .env file
set dotenv-load

build workspace:
    @echo 'Building {{workspace}}'
    cd src/{{workspace}} && npm run prepare

debug workspace *args: (build workspace)
    #!/usr/bin/env bash
    set -euxo pipefail

    echo 'Setting up MCP debug server for {{workspace}}'
    x=$(cat .env | grep -v '^$' | grep -v '^#' | sed 's/^/-e /' | tr '\n' ' ')
    cd src/{{workspace}} && npx -y @modelcontextprotocol/inspector $x dist/index.js {{args}}

docker-setup workspace:
    docker build -t mcp/{{workspace}} -f src/{{workspace}}/Dockerfile .

docker-run workspace: (docker-setup workspace)
    docker run -i --rm --env-file .env mcp/{{workspace}}

setup-linux workspace: (build workspace)
    #!/usr/bin/env bash
    set -euxo pipefail

    echo 'Setting up {{workspace}} MCP server into Claude Desktop for Linux'

    # Create claude_desktop_config.json if it doesn't exist
    if [ ! -f ~/.config/Claude/claude_desktop_config.json ]; then
        jq -n '{"mcpServers": {}}' > ~/.config/Claude/claude_desktop_config.json
    fi

    workdir='{{justfile_directory()}}/src/{{workspace}}'

    jq --arg work_dir "$workdir" '."server-{{workspace}}".args = [$work_dir]' "$workdir/claude.config.json" > "$workdir/claude.config.tmp.json"

    result=""
    # Read .env file and update env section in claude.config.json
    while IFS='=' read -r key value; do
        if [[ -n "$key" && ! "$key" =~ ^# ]]; then
            result=$(jq --arg k "$key" --arg v "$value" '."server-{{workspace}}".env += {($k): $v}' "$workdir/claude.config.tmp.json")
        fi
    done < .env

    # Save the result to the claude.config.tmp.json file where it can be copied by the user into the claude_desktop_config.json file
    echo "$result" > "$workdir/claude.config.tmp.json"

setup-macos workspace: (build workspace)
    #!/usr/bin/env bash
    set -euxo pipefail
    echo 'Setting up {{workspace}} MCP server into Claude Desktop for MacOS'

    # Create claude_desktop_config.json if it doesn't exist
    if [ ! -f ~/Library/Application\ Support/Claude/claude_desktop_config.json ]; then
        jq -n '{"mcpServers": {}}' > ~/Library/Application\ Support/Claude/claude_desktop_config.json
    fi

    workdir='{{justfile_directory()}}/src/{{workspace}}'

    jq --arg work_dir "$workdir" '."server-{{workspace}}".args = [$work_dir]' "$workdir/claude.config.json" > "$workdir/claude.config.tmp.json"

    result=""
    # Read .env file and update env section in claude.config.json
    while IFS='=' read -r key value; do
        if [[ -n "$key" && ! "$key" =~ ^# ]]; then
            result=$(jq --arg k "$key" --arg v "$value" '."server-{{workspace}}".env += {($k): $v}' "$workdir/claude.config.tmp.json")
        fi
    done < .env

    # Save the result to the claude.config.tmp.json file where it can be copied by the user into the claude_desktop_config.json file
    echo "$result" > "$workdir/claude.config.tmp.json"

docker-mcp-setup workspace: (docker-setup workspace)
    #!/usr/bin/env bash
    set -euxo pipefail
    echo 'Setting up {{workspace}} MCP server into Claude Desktop for MacOS'

    workdir='{{justfile_directory()}}/src/{{workspace}}'

    cp "$workdir/claude.docker.config.json" "$workdir/claude.docker.config.tmp.json"

    result=""
    # Read .env file and update env section in claude.config.json
    while IFS='=' read -r key value; do
        if [[ -n "$key" && ! "$key" =~ ^# ]]; then
            result=$(jq --arg k "$key" --arg v "$value" '."server-{{workspace}}".env += {($k): $v}' "$workdir/claude.docker.config.tmp.json")
        fi
    done < .env

    # Save the result to the claude.docker.config.tmp.json file where it can be copied by the user into the claude_desktop_config.json file
    echo "$result" > "$workdir/claude.docker.config.tmp.json"

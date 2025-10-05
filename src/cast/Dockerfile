FROM node:22.12 AS mcp-builder

# Copy the MCP server code into the image
COPY src/cast /app
COPY tsconfig.json /tsconfig.json

WORKDIR /app

RUN --mount=type=cache,target=/root/.npm npm install

FROM node:22.12 AS release

# Install necessary packages for foundry installation
RUN apt-get install bash curl git

# Install Foundry
ENV SHELL=/bin/bash
RUN curl -L https://foundry.paradigm.xyz | bash
ENV PATH="/root/.foundry/bin:${PATH}"
RUN foundryup

# Copy MCP server code from mcp-builder stage
COPY --from=mcp-builder /app/dist /app/dist
COPY --from=mcp-builder /app/package.json /app/package.json
COPY --from=mcp-builder /app/package-lock.json /app/package-lock.json

ENV NODE_ENV=production

WORKDIR /app

RUN npm ci --ignore-scripts --omit-dev

ENTRYPOINT ["node", "dist/index.js"]

const ALCHEMY_DOMAIN: string = "g.alchemy.com";

const VALID_NETWORKS = ["mainnet", "sepolia", "holesky", "hoodi"] as const;
type ValidNetwork = typeof VALID_NETWORKS[number];

const VALID_CHAINS = ["eth", "opt", "polygon", "arb", "arbnova", "zksync", "base", "zora", "avax", "unichain", "ink"] as const;
type ValidChain = typeof VALID_CHAINS[number];

export function createAlchemyRpcUrl(network: string, chain: string, apiKey: string): string {
    if (!VALID_NETWORKS.includes(network as ValidNetwork)) {
        throw new Error(`Invalid network: ${network}`);
    }
    if (!VALID_CHAINS.includes(chain as ValidChain)) {
        throw new Error(`Invalid chain: ${chain}`);
    }
    return `https://${chain}-${network}.${ALCHEMY_DOMAIN}/v2/${apiKey}`;
}

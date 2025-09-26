// Configuración de contratos para diferentes redes
export const CONTRACTS = {
  // Base Sepolia (testnet)
  84532: {
    PERLA_VERDE_PROXY: process.env.NEXT_PUBLIC_PPV_PROXY_BASE_SEPOLIA || '',
    RPC_URL: 'https://sepolia.base.org',
    EXPLORER_URL: 'https://sepolia.basescan.org',
    CHAIN_NAME: 'Base Sepolia',
  },
  // OP Sepolia (testnet)
  11155420: {
    PERLA_VERDE_PROXY: process.env.NEXT_PUBLIC_PPV_PROXY_OP_SEPOLIA || '',
    RPC_URL: 'https://sepolia.optimism.io',
    EXPLORER_URL: 'https://sepolia-optimism.etherscan.io',
    CHAIN_NAME: 'OP Sepolia',
  },
  // Base Mainnet
  8453: {
    PERLA_VERDE_PROXY: process.env.NEXT_PUBLIC_PPV_PROXY_BASE || '',
    RPC_URL: 'https://mainnet.base.org',
    EXPLORER_URL: 'https://basescan.org',
    CHAIN_NAME: 'Base',
  },
  // OP Mainnet
  10: {
    PERLA_VERDE_PROXY: process.env.NEXT_PUBLIC_PPV_PROXY_OP || '',
    RPC_URL: 'https://mainnet.optimism.io',
    EXPLORER_URL: 'https://optimistic.etherscan.io',
    CHAIN_NAME: 'Optimism',
  },
} as const;

export type SupportedChainId = keyof typeof CONTRACTS;

export const DEFAULT_CHAIN_ID: SupportedChainId = 84532; // Base Sepolia por defecto

export function getContractConfig(chainId: number) {
  return CONTRACTS[chainId as SupportedChainId] || CONTRACTS[DEFAULT_CHAIN_ID];
}

export function getSupportedChains() {
  return Object.keys(CONTRACTS).map(Number) as SupportedChainId[];
}

// Example configuration for Metabricks Wallet
// Copy this file to config.ts and update with your values

export const WALLET_CONFIG = {
  // OASIS API Configuration
  OASIS_API: {
    BASE_URL: 'http://api.oasisplatform.world',
    API_KEY: 'your-oasis-api-key-here',
    TIMEOUT: 30000, // 30 seconds
  },
  
  // Supported Blockchains
  BLOCKCHAINS: {
    ETHEREUM: {
      name: 'Ethereum',
      symbol: 'ETH',
      chainId: 1,
      rpcUrl: 'https://mainnet.infura.io/v3/your-project-id',
      explorer: 'https://etherscan.io',
      nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18
      }
    },
    SOLANA: {
      name: 'Solana',
      symbol: 'SOL',
      chainId: 101,
      rpcUrl: 'https://api.mainnet-beta.solana.com',
      explorer: 'https://explorer.solana.com',
      nativeCurrency: {
        name: 'Solana',
        symbol: 'SOL',
        decimals: 9
      }
    },
    POLYGON: {
      name: 'Polygon',
      symbol: 'MATIC',
      chainId: 137,
      rpcUrl: 'https://polygon-rpc.com',
      explorer: 'https://polygonscan.com',
      nativeCurrency: {
        name: 'Matic',
        symbol: 'MATIC',
        decimals: 18
      }
    },
    ARBITRUM: {
      name: 'Arbitrum',
      symbol: 'ETH',
      chainId: 42161,
      rpcUrl: 'https://arb1.arbitrum.io/rpc',
      explorer: 'https://arbiscan.io',
      nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18
      }
    }
  },
  
  // Wallet Security Settings
  SECURITY: {
    PASSWORD_MIN_LENGTH: 8,
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  },
  
  // UI Configuration
  UI: {
    THEME: 'metabricks', // 'metabricks' | 'dark' | 'light'
    CURRENCY: 'USD',
    LANGUAGE: 'en',
    DECIMALS: 6,
    REFRESH_INTERVAL: 30000, // 30 seconds
  },
  
  // NFT Configuration
  NFT: {
    SUPPORTED_FORMATS: ['png', 'jpg', 'jpeg', 'gif', 'webp'],
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    IPFS_GATEWAY: 'https://ipfs.io/ipfs/',
    METADATA_SCHEMA: {
      name: 'string',
      description: 'string',
      image: 'string',
      attributes: 'array'
    }
  },
  
  // Transaction Settings
  TRANSACTIONS: {
    DEFAULT_GAS_LIMIT: 21000,
    MAX_GAS_LIMIT: 1000000,
    GAS_PRICE_MULTIPLIER: 1.1,
    CONFIRMATION_BLOCKS: 12,
    MAX_PENDING: 5
  }
};

// Environment-specific overrides
export const getConfig = () => {
  const env = process.env['NODE_ENV'] || 'development';
  
  if (env === 'development') {
    return {
      ...WALLET_CONFIG,
      OASIS_API: {
        ...WALLET_CONFIG.OASIS_API,
        BASE_URL: 'http://localhost:5000', // Local development
      }
    };
  }
  
  if (env === 'test') {
    return {
      ...WALLET_CONFIG,
      OASIS_API: {
        ...WALLET_CONFIG.OASIS_API,
        BASE_URL: 'http://test-api.oasisplatform.world',
      }
    };
  }
  
  return WALLET_CONFIG;
};

export default getConfig();

// Configuration for the isolated Metabricks Wallet
export const WALLET_CONFIG = {
  // OASIS API Configuration
  OASIS_API: {
    BASE_URL: 'http://api.oasisplatform.world',
    API_KEY: '', // Add your OASIS API key here
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
    },
    SOLANA: {
      name: 'Solana',
      symbol: 'SOL',
      chainId: 101,
      rpcUrl: 'https://api.mainnet-beta.solana.com',
      explorer: 'https://explorer.solana.com',
    },
    POLYGON: {
      name: 'Polygon',
      symbol: 'MATIC',
      chainId: 137,
      rpcUrl: 'https://polygon-rpc.com',
      explorer: 'https://polygonscan.com',
    },
    ARBITRUM: {
      name: 'Arbitrum',
      symbol: 'ETH',
      chainId: 42161,
      rpcUrl: 'https://arb1.arbitrum.io/rpc',
      explorer: 'https://arbiscan.io',
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
    THEME: 'metabricks',
    CURRENCY: 'USD',
    LANGUAGE: 'en',
    DECIMALS: 6,
    REFRESH_INTERVAL: 30000, // 30 seconds
  }
};

export default WALLET_CONFIG;



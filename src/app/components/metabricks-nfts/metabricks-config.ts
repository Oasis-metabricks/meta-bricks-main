// MetaBricks Configuration
export const METABRICKS_CONFIG = {
  // IPFS Configuration
  IPFS: {
    // New randomized MetaBricks folder CID
    METADATA_CID: 'bafybeihkspp2kxsz4moylkgjpkdwm4sbafqluqmtzh3hy7x42jhvx6n5ym',
    // Pinata gateway URL
    GATEWAY_URL: 'https://gateway.pinata.cloud/ipfs',
    // Total number of MetaBricks
    TOTAL_BRICKS: 432
  },
  
  // Wall Configuration
  WALL: {
    ROWS: 24,
    COLS: 18,
    TOTAL_POSITIONS: 24 * 18 // 432 positions
  },
  
  // Brick Types and Distribution
  BRICK_TYPES: {
    REGULAR: {
      count: 361,
      percentage: 83.6,
      perks: 1
    },
    INDUSTRIAL: {
      count: 60,
      percentage: 13.9,
      perks: 2
    },
    LEGENDARY: {
      count: 11,
      percentage: 2.5,
      perks: 2
    }
  },
  
  // Perk Reveal Thresholds
  PERK_REVEALS: {
    THRESHOLD_10: {
      percentage: 10,
      bricksRequired: 43,
      perks: ['FREE hApp Creation', 'FREE OLAND Airdrop', 'FREE Statue in Our World']
    },
    THRESHOLD_25: {
      percentage: 25,
      bricksRequired: 108,
      perks: ['Bronze API Access', 'Silver API Access']
    },
    THRESHOLD_50: {
      percentage: 50,
      bricksRequired: 216,
      perks: ['Gold API Access', 'Free OAPP', 'Billboard in Our World', 'Landmark in Our World']
    },
    THRESHOLD_75: {
      percentage: 75,
      bricksRequired: 324,
      perks: ['Token Integration', 'Custom AR Experience', 'Custom Building']
    },
    THRESHOLD_100: {
      percentage: 100,
      bricksRequired: 432,
      perks: ['OASIS Integration', 'Early Access to New Features']
    }
  },
  
  // Pricing
  PRICING: {
    BRICK_PRICE: '0.4 SOL',
    STRIPE_PRICE: 50, // $50 USD
    CURRENCY: 'USD'
  },
  
  // Backend API
  BACKEND: {
    BASE_URL: 'https://metabricks-backend-api-66e7d2abb038.herokuapp.com',
    ENDPOINTS: {
      MINTED_BRICKS: '/minted-bricks',
      RESET_MINTED: '/reset-minted-bricks',
      CREATE_CHECKOUT: '/create-checkout-session'
    }
  }
};

// Helper functions
export const getMetadataUri = (brickNumber: number): string | null => {
  if (brickNumber < 1 || brickNumber > METABRICKS_CONFIG.IPFS.TOTAL_BRICKS) {
    return null;
  }
  
  return `${METABRICKS_CONFIG.IPFS.GATEWAY_URL}/${METABRICKS_CONFIG.IPFS.METADATA_CID}/${brickNumber}.json`;
};

export const getBrickTypeFromNumber = (brickNumber: number): string => {
  // This would need to be updated based on your upload mapping
  // For now, return a placeholder
  return 'mystery'; // Will be revealed upon minting
};

export const getPerkRevealThreshold = (bricksSold: number): any => {
  const thresholds = Object.values(METABRICKS_CONFIG.PERK_REVEALS);
  
  for (const threshold of thresholds) {
    if (bricksSold >= threshold.bricksRequired) {
      return threshold;
    }
  }
  
  return null;
};

import { Injectable } from '@angular/core';

export interface BrickPerk {
  category: string;
  name: string;
  description: string;
  rarity: string;
  value: string;
}

export interface BrickType {
  count: number;
  percentage: number;
  perks: number;
}

export interface CoreBenefits {
  tokenAirdrop: number;
  tgeDiscount: number;
}

@Injectable({
  providedIn: 'root'
})
export class BrickPerkService {

  // Brick Types and Distribution (from your generation scripts)
  private readonly BRICK_TYPES = {
    regular: { count: 361, percentage: 83.6, perks: 1 },
    industrial: { count: 60, percentage: 13.9, perks: 2 },
    legendary: { count: 11, percentage: 2.5, perks: 2 }
  };

  // Perk System Configuration (from your generation scripts)
  private readonly PERK_SYSTEM = {
    // Core benefits for all bricks
    core: {
      tokenAirdrop: {
        regular: 100,      // Base airdrop amount
        industrial: 250,   // Medium airdrop amount
        legendary: 500     // Higher airdrop amount
      },
      tgeDiscount: {
        regular: 10,       // Base discount percentage
        industrial: 15,    // Medium discount percentage
        legendary: 20      // Higher discount percentage
      }
    },
    
    // Product-specific perks
    products: {
      oasis: {
        name: "OASIS Platform",
        description: "Decentralized API and integration platform",
        perks: [
          { name: "Bronze Tier API Access", description: "Free 1-year access to OASIS Bronze Tier API", rarity: "Common", value: "Bronze" },
          { name: "Silver Tier API Access", description: "Free 1-year access to OASIS Silver Tier API", rarity: "Rare", value: "Silver" },
          { name: "Gold Tier API Access", description: "Free 1-year access to OASIS Gold Tier API", rarity: "Rare", value: "Gold" },
          { name: "Free OAPP Development", description: "Free OASIS App development and deployment", rarity: "Legendary", value: "OAPP" }
        ]
      },
      ourWorld: {
        name: "Our World",
        description: "Virtual world and metaverse platform",
        perks: [
          { name: "Oland Airdrop", description: "Free Oland virtual land tokens", rarity: "Common", value: "Oland" },
          { name: "Billboard Placement", description: "Free advertising space in Our World", rarity: "Rare", value: "Billboard" },
          { name: "Personal Statue", description: "Personal statue/monument in Our World", rarity: "Legendary", value: "Statue" },
          { name: "Landmark Naming", description: "Name a landmark or location in Our World", rarity: "Rare", value: "Landmark" }
        ]
      },
      arWorld: {
        name: "AR World",
        description: "Augmented reality and token integration platform",
        perks: [
          { name: "Token Integration", description: "Integrate your own token into AR World", rarity: "Rare", value: "Integration" },
          { name: "Custom AR Experience", description: "Customized AR brick experience", rarity: "Rare", value: "AR Experience" },
          { name: "Custom Building", description: "Design and build your own structure in AR World", rarity: "Legendary", value: "Custom Building" }
        ]
      },
      holoNet: {
        name: "HoloNET",
        description: "Decentralized hosting and application platform",
        perks: [
          { name: "Free hApp Creation", description: "Free decentralized application hosting on HoloNET", rarity: "Rare", value: "hApp" }
        ]
      },
      special: {
        name: "Special Benefits",
        description: "Exclusive and mystery perks",
        perks: [
          { name: "OASIS Integration Request", description: "Priority consideration for OASIS integration", rarity: "Rare", value: "Integration Request" },
          { name: "Mystery Perk", description: "Undisclosed special benefit to be revealed", rarity: "Legendary", value: "Mystery" },
          { name: "Early Access", description: "Priority access to new features and updates", rarity: "Rare", value: "Early Access" }
        ]
      }
    }
  };

  constructor() { }

  /**
   * Generate random perks for a brick with rarity-based distribution
   */
  generateBrickPerks(brickType: 'regular' | 'industrial' | 'legendary'): BrickPerk[] {
    const perks: BrickPerk[] = [];
    const productKeys = Object.keys(this.PERK_SYSTEM.products);
    
    // Determine base perk count based on brick type
    let perkCount = 2; // Regular bricks
    if (brickType === 'industrial') perkCount = 3;
    if (brickType === 'legendary') perkCount = 4;
    
    // Always include at least one special perk
    const specialPerk = this.PERK_SYSTEM.products.special.perks[Math.floor(Math.random() * this.PERK_SYSTEM.products.special.perks.length)];
    perks.push({
      category: "Special Benefits",
      name: specialPerk.name,
      description: specialPerk.description,
      rarity: specialPerk.rarity,
      value: specialPerk.value
    });
    
    // Add product-specific perks
    const availableProducts = productKeys.filter(key => key !== 'special');
    const selectedProducts: string[] = [];
    
    // Select products based on perk count
    if (perkCount === 2) {
      // Regular brick: 1 product + 1 special
      const product = availableProducts[Math.floor(Math.random() * availableProducts.length)];
      selectedProducts.push(product);
    } else if (perkCount === 3) {
      // Industrial brick: 2 products + 1 special
      const shuffled = availableProducts.sort(() => 0.5 - Math.random());
      selectedProducts.push(shuffled[0], shuffled[1]);
    } else if (perkCount === 4) {
      // Legendary brick: 3 products + 1 special
      const shuffled = availableProducts.sort(() => 0.5 - Math.random());
      selectedProducts.push(shuffled[0], shuffled[1], shuffled[2]);
    }
    
    // Add perks from selected products with rarity-based weighting
    selectedProducts.forEach(productKey => {
      const product = this.PERK_SYSTEM.products[productKey as keyof typeof this.PERK_SYSTEM.products];
      let availablePerks = product.perks;
      
      // Apply rarity-based filtering with some randomness
      if (brickType === 'regular') {
        // Regular bricks: 70% Common, 25% Rare, 5% Legendary (lucky!)
        availablePerks = availablePerks.filter(perk => {
          if (perk.rarity === 'Common') return Math.random() < 0.70;
          if (perk.rarity === 'Rare') return Math.random() < 0.25;
          if (perk.rarity === 'Legendary') return Math.random() < 0.05; // 5% chance for legendary!
          return true;
        });
      } else if (brickType === 'industrial') {
        // Industrial bricks: 40% Common, 45% Rare, 15% Legendary
        availablePerks = availablePerks.filter(perk => {
          if (perk.rarity === 'Common') return Math.random() < 0.40;
          if (perk.rarity === 'Rare') return Math.random() < 0.45;
          if (perk.rarity === 'Legendary') return Math.random() < 0.15;
          return true;
        });
      } else if (brickType === 'legendary') {
        // Legendary bricks: 20% Common, 30% Rare, 50% Legendary
        availablePerks = availablePerks.filter(perk => {
          if (perk.rarity === 'Common') return Math.random() < 0.20;
          if (perk.rarity === 'Rare') return Math.random() < 0.30;
          if (perk.rarity === 'Legendary') return Math.random() < 0.50;
          return true;
        });
      }
      
      if (availablePerks.length > 0) {
        const selectedPerk = availablePerks[Math.floor(Math.random() * availablePerks.length)];
        perks.push({
          category: product.name,
          name: selectedPerk.name,
          description: selectedPerk.description,
          rarity: selectedPerk.rarity,
          value: selectedPerk.value
        });
      }
    });
    
    return perks;
  }

  /**
   * Get core benefits for a brick type
   */
  getCoreBenefits(brickType: 'regular' | 'industrial' | 'legendary'): CoreBenefits {
    return {
      tokenAirdrop: this.PERK_SYSTEM.core.tokenAirdrop[brickType],
      tgeDiscount: this.PERK_SYSTEM.core.tgeDiscount[brickType]
    };
  }

  /**
   * Get brick type based on brick ID (using your distribution logic)
   */
  getBrickType(brickId: number): 'regular' | 'industrial' | 'legendary' {
    // This implements your brick distribution logic
    // Regular: 1-361, Industrial: 362-421, Legendary: 422-432
    
    if (brickId >= 1 && brickId <= 361) {
      return 'regular';
    } else if (brickId >= 362 && brickId <= 421) {
      return 'industrial';
    } else if (brickId >= 422 && brickId <= 432) {
      return 'legendary';
    } else {
      // Fallback to regular for invalid IDs
      return 'regular';
    }
  }

  /**
   * Generate complete brick metadata with perks
   */
  generateBrickMetadata(brickId: number): any {
    const brickType = this.getBrickType(brickId);
    const perks = this.generateBrickPerks(brickType);
    const coreBenefits = this.getCoreBenefits(brickType);
    
    // Generate description based on brick type
    const descriptions = {
      regular: `You have successfully removed a 'REGULAR' brick from the Metabricks wall. Upon full destruction of the Metabricks wall, this will unlock the following perks and benefits across the OASIS ecosystem:`,
      industrial: `Congratulations! You have got your hands on an 'INDUSTRIAL' grade Metabrick from the Metabrick wall. This brick comes with the following enhanced perks and benefits, which activate upon full destruction of the wall.`,
      legendary: `CONGRATULATIONS!! You have found a Legendary grade Metabrick, the rarest brick type in Metabricks. Legendary bricks command the following high-tier perks, which activate upon destruction of the wall.`
    };

    const supportingMessage = `\n\nBy holding this Metabrick you are supporting construction of Metaverse systems via OASISWEB4 - thank you for your service.`;
    const finalDescription = descriptions[brickType] + supportingMessage;

    // Create perk attributes for NFT metadata
    const perkAttributes = perks.map(perk => ({
      trait_type: perk.category,
      value: perk.name,
      description: perk.description,
      rarity: perk.rarity
    }));

    // Add core benefit attributes
    const coreAttributes = [
      {
        trait_type: "Token Airdrop",
        value: "Guaranteed",
        description: `Token airdrop on TGE: ${coreBenefits.tokenAirdrop} tokens`
      },
      {
        trait_type: "TGE Discount",
        value: `${coreBenefits.tgeDiscount}%`,
        description: "Token Generation Event discount"
      }
    ];

    return {
      name: `MetaBrick #${brickId}`,
      symbol: "MBRICK",
      description: finalDescription,
      image: this.getBrickImageUrl(brickType),
      attributes: [...coreAttributes, ...perkAttributes],
      perks: perks,
      coreBenefits: coreBenefits,
      hiddenMetadata: {
        type: brickType,
        rarity: this.getRarityFromType(brickType)
      }
    };
  }

  /**
   * Get brick image URL based on type
   */
  private getBrickImageUrl(brickType: 'regular' | 'industrial' | 'legendary'): string {
    const imageUrls = {
      regular: 'https://tomato-calm-flamingo-61.mypinata.cloud/ipfs/bafkreigqsyyi6qumiq544of4kzwfgffohvnvq36usivstvrfyw52u5qxf4?filename=regular_brick.png',
      industrial: 'https://tomato-calm-flamingo-61.mypinata.cloud/ipfs/bafybeia7dnclsgkjh6ugyzdzb3uivkydgozpmnbtpnnu4an3t2fta45ktm/industrial_brick.png',
      legendary: 'https://tomato-calm-flamingo-61.mypinata.cloud/ipfs/bafybeia7dnclsgkjh6ugyzdzb3uivkydgozpmnbtpnnu4an3t2fta45ktm/legendary_brick.png'
    };
    
    return imageUrls[brickType];
  }

  /**
   * Get rarity from brick type
   */
  private getRarityFromType(brickType: 'regular' | 'industrial' | 'legendary'): string {
    const rarityMap = {
      regular: 'Common',
      industrial: 'Rare',
      legendary: 'Legendary'
    };
    
    return rarityMap[brickType];
  }

  /**
   * Get brick type statistics
   */
  getBrickTypeStats(): Record<string, BrickType> {
    return this.BRICK_TYPES;
  }
}

import { Injectable } from '@angular/core';
import { NFTMintingService, NFTMintData } from './nft-minting.service';
import { BrickPerkService } from './brick-perk.service';

@Injectable({
  providedIn: 'root'
})
export class NFTTestService {

  constructor(
    private nftMintingService: NFTMintingService,
    private brickPerkService: BrickPerkService
  ) { }

  /**
   * Test the complete NFT minting flow
   * This simulates what happens when a user clicks a brick and mints it
   */
  async testNFTMintingFlow(brickId: number, wallet: any): Promise<any> {
    console.log('🧪 Testing NFT minting flow for brick', brickId);

    try {
      // Step 1: Generate brick metadata with perks
      console.log('📝 Step 1: Generating brick metadata...');
      const metadata = this.brickPerkService.generateBrickMetadata(brickId);
      
      if (!metadata) {
        throw new Error('Failed to generate brick metadata');
      }

      console.log('✅ Brick metadata generated:', {
        name: metadata.name,
        type: metadata.hiddenMetadata.type,
        rarity: metadata.hiddenMetadata.rarity,
        perks: metadata.perks.length,
        coreBenefits: metadata.coreBenefits
      });

      // Step 2: Show what the user would see before minting
      console.log('👀 Step 2: What user sees before minting...');
      console.log('🎁 Perks included:');
      metadata.perks.forEach((perk, index) => {
        console.log(`  ${index + 1}. ${perk.name} (${perk.rarity}) - ${perk.description}`);
      });

      // Step 3: Create mint data
      console.log('📋 Step 3: Creating mint data...');
      const mintData: NFTMintData = {
        walletAddress: wallet.publicKey.toString(),
        brickId: brickId,
        brickName: metadata.name
      };

      // Step 4: Mint the NFT
      console.log('🎨 Step 4: Minting NFT...');
      const mintResult = await this.nftMintingService.mintMetaBrickNFT(mintData, wallet);

      if (mintResult.success) {
        console.log('🎉 NFT minting successful!', {
          signature: mintResult.signature,
          mintAddress: mintResult.mintAddress,
          brickId: brickId,
          brickType: metadata.hiddenMetadata.type,
          rarity: metadata.hiddenMetadata.rarity
        });

        // Step 5: Verify ownership
        console.log('🔍 Step 5: Verifying NFT ownership...');
        const ownershipVerified = await this.nftMintingService.verifyNFTOwnership(
          wallet.publicKey.toString(),
          mintResult.mintAddress!
        );

        console.log('✅ Ownership verification result:', ownershipVerified);

        return {
          success: true,
          metadata: metadata,
          mintResult: mintResult,
          ownershipVerified: ownershipVerified
        };

      } else {
        throw new Error(mintResult.error || 'Unknown minting error');
      }

    } catch (error) {
      console.error('❌ NFT minting flow test failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Test brick type distribution
   */
  testBrickTypeDistribution(): void {
    console.log('🧱 Testing brick type distribution...');
    
    const stats = this.brickPerkService.getBrickTypeStats();
    console.log('📊 Brick type statistics:', stats);

    // Test a few bricks of each type
    const testBricks = [1, 200, 400, 430]; // Regular, Regular, Industrial, Legendary
    
    testBricks.forEach(brickId => {
      const brickType = this.brickPerkService.getBrickType(brickId);
      const metadata = this.brickPerkService.generateBrickMetadata(brickId);
      
      console.log(`Brick ${brickId}:`, {
        type: brickType,
        rarity: metadata.hiddenMetadata.rarity,
        perks: metadata.perks.length,
        airdrop: metadata.coreBenefits.tokenAirdrop,
        discount: metadata.coreBenefits.tgeDiscount
      });
    });
  }

  /**
   * Test perk generation for different brick types
   */
  testPerkGeneration(): void {
    console.log('🎁 Testing perk generation...');
    
    const brickTypes: Array<'regular' | 'industrial' | 'legendary'> = ['regular', 'industrial', 'legendary'];
    
    brickTypes.forEach(brickType => {
      console.log(`\n🧱 ${brickType.toUpperCase()} brick perks:`);
      
      const perks = this.brickPerkService.generateBrickPerks(brickType);
      const coreBenefits = this.brickPerkService.getCoreBenefits(brickType);
      
      console.log(`Core Benefits: ${coreBenefits.tokenAirdrop} tokens, ${coreBenefits.tgeDiscount}% discount`);
      console.log(`Total Perks: ${perks.length}`);
      
      perks.forEach((perk, index) => {
        console.log(`  ${index + 1}. ${perk.name} (${perk.rarity})`);
        console.log(`     Category: ${perk.category}`);
        console.log(`     Description: ${perk.description}`);
      });
    });
  }

  /**
   * Get a sample brick for testing
   */
  getSampleBrick(): any {
    const brickId = Math.floor(Math.random() * 432) + 1;
    const metadata = this.brickPerkService.generateBrickMetadata(brickId);
    
    return {
      brickId: brickId,
      metadata: metadata,
      preview: {
        name: metadata.name,
        type: metadata.hiddenMetadata.type,
        rarity: metadata.hiddenMetadata.rarity,
        perks: metadata.perks.length,
        image: metadata.image
      }
    };
  }
}

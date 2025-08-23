import { Injectable } from '@angular/core';
import { BrickPerkService } from './brick-perk.service';
import { OasisApiService, OASISNFTMintRequest } from './oasis-api.service';

export interface NFTMintData {
  walletAddress: string;
  brickId: number;
  brickName: string;
}

export interface BrickMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  attributes: any[];
  perks: any[];
  coreBenefits: any;
  hiddenMetadata: any;
}

@Injectable({ providedIn: 'root' })
export class NFTMintingService {
  constructor(
    private brickPerkService: BrickPerkService,
    private oasisApiService: OasisApiService
  ) {}

  /**
   * Mint NFT using OASIS Solana API
   */
  async mintNFT(
    mintData: NFTMintData,
    walletAddress: string
  ): Promise<{ success: boolean; signature?: string; error?: string; mintAddress?: string; metadata?: BrickMetadata }> {
    try {
      console.log('🎨 Minting Solana NFT via OASIS API:', mintData);

      // Check if user is authenticated with OASIS
      if (!this.oasisApiService.isAuthenticated()) {
        throw new Error('Please connect your OASIS Avatar first. Click "Connect Avatar" in the header.');
      }

      // Generate brick metadata with perks
      const brickMetadata = await this.brickPerkService.generateBrickMetadata(mintData.brickId);

      // Get avatar ID for minting
      const avatarId = this.oasisApiService.getAvatarId();
      if (!avatarId) {
        throw new Error('No avatar ID available for NFT minting');
      }

      // Prepare OASIS Solana NFT mint request
      const solanaRequest = {
        title: brickMetadata.name,
        description: brickMetadata.description,
        symbol: 'MBRK', // MetaBricks symbol
        price: 0.4, // Default price in SOL
        imageUrl: brickMetadata.image || '',
        thumbnailUrl: brickMetadata.image || '',
        mintedByAvatarId: avatarId,
        mintAuthority: walletAddress, // Phantom wallet address
        cluster: 'mainnet-beta', // or 'devnet' for testing
        memoText: `MetaBricks NFT: ${brickMetadata.name}`,
        metaData: {
          ...brickMetadata,
          brickId: mintData.brickId,
          walletAddress: walletAddress,
          brickName: mintData.brickName,
          mintedAt: new Date().toISOString(),
          attributes: brickMetadata.attributes || [],
          perks: brickMetadata.perks || [],
          coreBenefits: brickMetadata.coreBenefits || {}
        }
      };

      console.log('📝 Solana NFT mint request:', solanaRequest);

      // Mint via OASIS Solana API
      const response = await fetch(`${this.oasisApiService.getBaseUrl()}/api/nft/mint/solana`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(solanaRequest)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Solana NFT minted successfully:', result);
        
        return {
          success: true,
          signature: result.transactionHash || result.signature,
          mintAddress: result.mintAddress || result.nftId,
          metadata: brickMetadata
        };
      } else {
        const errorData = await response.json();
        console.error('❌ Solana NFT minting failed:', errorData);
        throw new Error(errorData.message || `Minting failed: HTTP ${response.status}`);
      }

    } catch (error: any) {
      console.error('❌ OASIS Solana NFT minting failed:', error);
      return {
        success: false,
        error: error.message || 'NFT minting failed'
      };
    }
  }

  /**
   * Get NFT metadata
   */
  async getNFTMetadata(nftId: string): Promise<BrickMetadata | null> {
    try {
      if (!this.oasisApiService.isAuthenticated()) {
        throw new Error('Not authenticated with OASIS API');
      }

      const nftData = await this.oasisApiService.getNFT(nftId);
      return nftData.metadata || null;
    } catch (error) {
      console.error('Failed to get NFT metadata:', error);
      return null;
    }
  }

  /**
   * Get all NFTs for current avatar
   */
  async getAvatarNFTs(): Promise<any[]> {
    try {
      if (!this.oasisApiService.isAuthenticated()) {
        throw new Error('Not authenticated with OASIS API');
      }

      return await this.oasisApiService.getAvatarNFTs();
    } catch (error) {
      console.error('Failed to get avatar NFTs:', error);
      return [];
    }
  }
}

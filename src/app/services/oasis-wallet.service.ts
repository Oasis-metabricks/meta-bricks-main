import { Injectable } from '@angular/core';
import { OasisApiService } from './oasis-api.service';

export interface OasisWallet {
  walletId: string;
  privateKey: string;
  publicKey: string;
  walletAddress: string;
  secretRecoveryPhrase: string;
  providerType: string;
  balance: number;
  isDefaultWallet: boolean;
  avatarId: string;
}

export interface WalletGenerationRequest {
  avatarId: string;
  providerType: string;
  setAsDefault?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class OasisWalletService {
  private readonly SUPPORTED_PROVIDERS = [
    'SolanaOASIS',
    'EthereumOASIS', 
    'ArbitrumOASIS',
    'PolygonOASIS',
    'EOSIOOASIS',
    'TelosOASIS',
    'SEEDSOASIS',
    'TONOASIS',
    'StellarOASIS',
    'HashgraphOASIS',
    'ElrondOASIS',
    'TRONOASIS',
    'CosmosBlockChainOASIS',
    'RootstockOASIS',
    'ChainLinkOASIS'
  ];

  constructor(private oasisApiService: OasisApiService) {}

  /**
   * Auto-generate wallets for all supported chains for a new avatar
   */
  async generateCrossChainWallets(avatarId: string): Promise<OasisWallet[]> {
    try {
      console.log('🔑 Generating cross-chain wallets for avatar:', avatarId);
      
      const wallets: OasisWallet[] = [];
      
      // For now, let's create simulated wallets since the Keys API might not be fully implemented
      // This will give users a preview of the functionality
      console.log('🔑 Creating simulated cross-chain wallets (Keys API integration pending)...');
      
      for (const providerType of this.SUPPORTED_PROVIDERS) {
        try {
          console.log(`🔑 Creating simulated wallet for ${providerType}...`);
          
          // Generate simulated keypair
          const simulatedKeypair = this.generateSimulatedKeypair(providerType);
          
          // Create wallet object
          const wallet: OasisWallet = {
            walletId: crypto.randomUUID(),
            privateKey: simulatedKeypair.privateKey,
            publicKey: simulatedKeypair.publicKey,
            walletAddress: this.generateWalletAddress(providerType, simulatedKeypair.publicKey),
            secretRecoveryPhrase: this.generateRecoveryPhrase(),
            providerType: providerType,
            balance: Math.random() * 10, // Simulated balance
            isDefaultWallet: providerType === 'SolanaOASIS',
            avatarId: avatarId
          };

          wallets.push(wallet);
          console.log(`✅ Created simulated wallet for ${providerType}:`, wallet.walletAddress);
          
          // Add a small delay to show progress
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.warn(`⚠️ Failed to create wallet for ${providerType}:`, error);
        }
      }

      console.log(`🎉 Created ${wallets.length} simulated cross-chain wallets`);
      console.log('💡 Note: These are simulated wallets. Real wallet generation will be available when the OASIS Keys API is fully implemented.');
      
      return wallets;
    } catch (error) {
      console.error('❌ Failed to generate cross-chain wallets:', error);
      throw error;
    }
  }

  /**
   * Get all wallets for an avatar
   */
  async getAvatarWallets(avatarId: string): Promise<OasisWallet[]> {
    try {
      const response = await fetch(
        `${this.oasisApiService.getBaseUrl()}/api/Wallet/load_wallets_by_id/${avatarId}`
      );

      if (response.ok) {
        const wallets = await response.json();
        return wallets.map((w: any) => this.mapToOasisWallet(w));
      }

      return [];
    } catch (error) {
      console.error('❌ Failed to get avatar wallets:', error);
      return [];
    }
  }

  /**
   * Import existing Phantom wallet into OASIS
   */
  async importPhantomWallet(avatarId: string, privateKey: string, walletName?: string): Promise<OasisWallet> {
    try {
      console.log('🔑 Importing Phantom wallet into OASIS...');
      
      // Import private key
      const response = await fetch(
        `${this.oasisApiService.getBaseUrl()}/api/Wallet/import_wallet_private_key_by_id/${avatarId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            privateKey: privateKey,
            providerType: 'SolanaOASIS',
            walletName: walletName || 'Imported Phantom Wallet',
            description: 'Imported from Phantom wallet'
          })
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Phantom wallet imported successfully');
        return this.mapToOasisWallet(result);
      } else {
        throw new Error('Failed to import Phantom wallet');
      }
    } catch (error) {
      console.error('❌ Failed to import Phantom wallet:', error);
      throw error;
    }
  }

  /**
   * Get wallet balance
   */
  async getWalletBalance(walletAddress: string, providerType: string): Promise<number> {
    try {
      // This would integrate with blockchain APIs to get real balance
      // For now, return a placeholder
      return Math.random() * 10; // Placeholder balance
    } catch (error) {
      console.error('❌ Failed to get wallet balance:', error);
      return 0;
    }
  }

  /**
   * Send tokens between wallets
   */
  async sendTokens(
    fromWallet: OasisWallet,
    toAddress: string,
    amount: number,
    memo?: string
  ): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    try {
      const response = await fetch(
        `${this.oasisApiService.getBaseUrl()}/api/Wallet/send_token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fromWalletAddress: fromWallet.walletAddress,
            toWalletAddress: toAddress,
            amount: amount,
            memoText: memo,
            fromProviderType: fromWallet.providerType,
            toProviderType: fromWallet.providerType
          })
        }
      );

      if (response.ok) {
        const result = await response.json();
        return { success: true, transactionHash: result.transactionHash };
      } else {
        const error = await response.json();
        return { success: false, error: error.message };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate simulated keypair for testing
   */
  private generateSimulatedKeypair(providerType: string): { privateKey: string; publicKey: string } {
    const timestamp = Date.now();
    const randomBytes = Math.random().toString(36).substring(2, 15);
    
    return {
      privateKey: `${providerType}_private_${timestamp}_${randomBytes}`,
      publicKey: `${providerType}_public_${timestamp}_${randomBytes}`
    };
  }

  /**
   * Generate wallet address based on provider type
   */
  private generateWalletAddress(providerType: string, publicKey: string): string {
    // This is a simplified address generation
    // In production, you'd use proper address derivation for each blockchain
    const prefix = providerType.replace('OASIS', '').toLowerCase();
    return `${prefix}_${publicKey.substring(0, 8)}...${publicKey.substring(publicKey.length - 8)}`;
  }

  /**
   * Generate recovery phrase (simplified)
   */
  private generateRecoveryPhrase(): string {
    const words = [
      'oasis', 'metabricks', 'blockchain', 'nft', 'wallet', 'secure',
      'digital', 'asset', 'crypto', 'decentralized', 'future', 'innovation'
    ];
    
    const phrase = [];
    for (let i = 0; i < 12; i++) {
      phrase.push(words[Math.floor(Math.random() * words.length)]);
    }
    
    return phrase.join(' ');
  }

  /**
   * Map API response to OasisWallet interface
   */
  private mapToOasisWallet(walletData: any): OasisWallet {
    return {
      walletId: walletData.walletId || crypto.randomUUID(),
      privateKey: walletData.privateKey || '',
      publicKey: walletData.publicKey || '',
      walletAddress: walletData.walletAddress || '',
      secretRecoveryPhrase: walletData.secretRecoveryPhrase || '',
      providerType: walletData.providerType || 'Unknown',
      balance: walletData.balance || 0,
      isDefaultWallet: walletData.isDefaultWallet || false,
      avatarId: walletData.avatarId || ''
    };
  }
}

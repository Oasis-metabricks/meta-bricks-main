import { Component, OnInit } from '@angular/core';
import { OasisWalletService, OasisWallet } from '../../../services/oasis-wallet.service';
import { AvatarService } from '../../../services/avatar.service';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss']
})
export class WalletComponent implements OnInit {
  wallets: OasisWallet[] = [];
  selectedWallet: OasisWallet | null = null;
  isLoading = false;
  showImportModal = false;
  showCreateModal = false;
  importData = {
    privateKey: '',
    walletName: '',
    description: ''
  };

  constructor(
    private oasisWalletService: OasisWalletService,
    private avatarService: AvatarService
  ) {}

  ngOnInit(): void {
    this.loadWallets();
  }

  /**
   * Load wallets for the current avatar
   */
  async loadWallets(): Promise<void> {
    try {
      const currentAvatar = await this.avatarService.getCurrentAvatar();
      
      if (currentAvatar && currentAvatar.id) {
        this.wallets = await this.oasisWalletService.getAvatarWallets(currentAvatar.id);
      } else {
        console.log('No avatar connected');
        this.wallets = [];
      }
    } catch (error) {
      console.error('Failed to load wallets:', error);
      this.wallets = [];
    }
  }

  /**
   * Generate cross-chain wallets for the current avatar
   */
  async generateCrossChainWallets(): Promise<void> {
    try {
      this.isLoading = true;
      const currentAvatar = await this.avatarService.getCurrentAvatar();
      
      if (currentAvatar && currentAvatar.id) {
        console.log('🚀 Generating cross-chain wallets...');
        this.wallets = await this.oasisWalletService.generateCrossChainWallets(currentAvatar.id);
        
        // Set Solana as default
        this.selectedWallet = this.wallets.find(w => w.providerType === 'SolanaOASIS') || this.wallets[0] || null;
        
        console.log('✅ Cross-chain wallets generated successfully');
        
        // Show success message to user
        setTimeout(() => {
          alert('🎉 Cross-chain wallets generated successfully!\n\n💡 Note: These are simulated wallets for demonstration. Real wallet generation will be available when the OASIS Keys API is fully implemented.');
        }, 500);
      } else {
        console.log('No avatar connected');
      }
    } catch (error) {
      console.error('❌ Failed to generate wallets:', error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Import existing Phantom wallet
   */
  async importWallet(): Promise<void> {
    try {
      this.isLoading = true;
      const currentAvatar = await this.avatarService.getCurrentAvatar();
      
      if (currentAvatar && currentAvatar.id && this.importData.privateKey) {
        const importedWallet = await this.oasisWalletService.importPhantomWallet(
          currentAvatar.id,
          this.importData.privateKey,
          this.importData.walletName
        );
        
        this.wallets.push(importedWallet);
        this.selectedWallet = importedWallet;
        this.showImportModal = false;
        this.importData = { privateKey: '', walletName: '', description: '' };
        
        console.log('✅ Phantom wallet imported successfully');
      } else {
        console.log('No avatar connected or missing private key');
      }
    } catch (error) {
      console.error('❌ Failed to import wallet:', error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Select a wallet
   */
  selectWallet(wallet: OasisWallet): void {
    this.selectedWallet = wallet;
  }

  /**
   * Get wallet balance with proper formatting
   */
  getFormattedBalance(balance: number): string {
    return balance.toFixed(4);
  }

  /**
   * Get shortened wallet address
   */
  getShortAddress(address: string): string {
    if (address.length <= 20) return address;
    return `${address.substring(0, 10)}...${address.substring(address.length - 8)}`;
  }

  /**
   * Get provider display name
   */
  getProviderDisplayName(providerType: string): string {
    return providerType.replace('OASIS', '').replace(/([A-Z])/g, ' $1').trim();
  }

  /**
   * Get provider icon
   */
  getProviderIcon(providerType: string): string {
    const icons: { [key: string]: string } = {
      'SolanaOASIS': '🔸',
      'EthereumOASIS': '🔷',
      'ArbitrumOASIS': '🔶',
      'PolygonOASIS': '💎',
      'EOSIOOASIS': '🌟',
      'TelosOASIS': '⭐',
      'SEEDSOASIS': '🌱',
      'TONOASIS': '📱',
      'StellarOASIS': '⭐',
      'HashgraphOASIS': '🌐',
      'ElrondOASIS': '🚀',
      'TRONOASIS': '🔴',
      'CosmosBlockChainOASIS': '🌌',
      'RootstockOASIS': '🟢',
      'ChainLinkOASIS': '🔗'
    };
    
    return icons[providerType] || '🔑';
  }

  /**
   * Copy wallet address to clipboard
   */
  copyAddress(address: string): void {
    navigator.clipboard.writeText(address).then(() => {
      console.log('📋 Address copied to clipboard');
      // You could add a toast notification here
    });
  }

  /**
   * Refresh wallet balances
   */
  async refreshBalances(): Promise<void> {
    try {
      this.isLoading = true;
      
      for (const wallet of this.wallets) {
        wallet.balance = await this.oasisWalletService.getWalletBalance(wallet.walletAddress, wallet.providerType);
      }
      
      console.log('💰 Wallet balances refreshed');
    } catch (error) {
      console.error('❌ Failed to refresh balances:', error);
    } finally {
      this.isLoading = false;
    }
  }
}

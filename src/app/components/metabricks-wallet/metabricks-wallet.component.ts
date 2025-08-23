import { Component, OnInit, OnDestroy } from '@angular/core';
import { OASISWalletService, OASISWalletAvatar, OASISWalletNFT } from './oasis-wallet.service';
import { WalletCoreService, ProviderWallet, CreateWalletRequest } from './wallet-core.service';
import { AvatarWalletService } from './avatar-wallet.service';

@Component({
  selector: 'app-metabricks-wallet',
  templateUrl: './metabricks-wallet.component.html',
  styleUrls: ['./metabricks-wallet.component.scss']
})
export class MetabricksWalletComponent implements OnInit, OnDestroy {
  
  // Wallet state
  public isConnected = false;
  public currentAvatar: OASISWalletAvatar | null = null;
  public wallets: ProviderWallet[] = [];
  public nfts: OASISWalletNFT[] = [];
  public balance = 0;
  public isLoading = false;
  
  // UI state
  public activeTab = 'overview';
  public showCreateWallet = false;
  public showImportWallet = false;
  
  // Form data
  public newWalletData = {
    name: '',
    type: 'ethereum',
    password: ''
  };
  
  constructor(
    private oasisWalletService: OASISWalletService,
    private walletCoreService: WalletCoreService,
    private avatarWalletService: AvatarWalletService
  ) {}
  
  ngOnInit(): void {
    this.initializeWallet();
  }
  
  ngOnDestroy(): void {
    // Cleanup subscriptions
  }
  
  async initializeWallet(): Promise<void> {
    try {
      this.isLoading = true;
      
      // Check if user is already authenticated
      const avatar = await this.avatarWalletService.getCurrentAvatar();
      if (avatar) {
        this.currentAvatar = avatar;
        this.isConnected = true;
        await this.loadWalletData();
      }
      
    } catch (error) {
      console.error('Failed to initialize wallet:', error);
    } finally {
      this.isLoading = false;
    }
  }
  
  async loadWalletData(): Promise<void> {
    if (!this.currentAvatar) return;
    
    try {
      // Load wallets
      const walletResult = await this.walletCoreService.loadWalletsByAvatarId(this.currentAvatar.id);
      if (!walletResult.isError) {
        this.wallets = walletResult.result || [];
      }
      
      // Load NFTs
      const nftResult = await this.oasisWalletService.loadNFTsByAvatarId(this.currentAvatar.id);
      if (!nftResult.isError) {
        this.nfts = nftResult.result || [];
      }
      
      // Calculate total balance
      this.calculateTotalBalance();
      
    } catch (error) {
      console.error('Failed to load wallet data:', error);
    }
  }
  
  async createWallet(): Promise<void> {
    try {
      this.isLoading = true;
      
      if (!this.currentAvatar) {
        console.error('No avatar connected');
        return;
      }
      
      const result = await this.walletCoreService.createWallet({
        avatarId: this.currentAvatar.id,
        name: this.newWalletData.name,
        type: this.newWalletData.type,
        password: this.newWalletData.password
      });
      
      if (!result.isError) {
        this.showCreateWallet = false;
        this.newWalletData = { name: '', type: 'ethereum', password: '' };
        await this.loadWalletData();
      }
      
    } catch (error) {
      console.error('Failed to create wallet:', error);
    } finally {
      this.isLoading = false;
    }
  }
  
  async importWallet(): Promise<void> {
    // Implementation for importing existing wallet
    console.log('Import wallet functionality coming soon...');
  }
  
  async sendTransaction(transaction: any): Promise<void> {
    try {
      this.isLoading = true;
      
      const result = await this.walletCoreService.sendToken(transaction);
      if (!result.isError) {
        await this.loadWalletData();
      }
      
    } catch (error) {
      console.error('Failed to send transaction:', error);
    } finally {
      this.isLoading = false;
    }
  }
  
  private calculateTotalBalance(): void {
    this.balance = this.wallets.reduce((total, wallet) => {
      return total + (wallet.balance || 0);
    }, 0);
  }
  
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
  
  toggleCreateWallet(): void {
    this.showCreateWallet = !this.showCreateWallet;
  }
  
  toggleImportWallet(): void {
    this.showImportWallet = !this.showImportWallet;
  }
  
  async connectWallet(): Promise<void> {
    try {
      this.isLoading = true;
      
      // For demo purposes, create a mock avatar
      // In a real implementation, this would handle actual wallet connection
      const mockAvatar: OASISWalletAvatar = {
        id: 'demo-avatar-123',
        username: 'DemoUser',
        email: 'demo@metabricks.com',
        karma: 100,
        wallets: [],
        nfts: [],
        status: 'active',
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      };
      
      this.currentAvatar = mockAvatar;
      this.isConnected = true;
      
      // Load demo wallet data
      await this.loadWalletData();
      
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      this.isLoading = false;
    }
  }
}

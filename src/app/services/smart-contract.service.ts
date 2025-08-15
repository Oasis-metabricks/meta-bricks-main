import { Injectable } from '@angular/core';
import { Connection, PublicKey } from '@solana/web3.js';
import { BehaviorSubject, Observable } from 'rxjs';

export interface BrickPurchase {
  brickId: number;
  buyer: PublicKey;
  purchaseTimestamp: number;
  priceLamports: number;
  metadataUri: string;
  isSold: boolean;
}

export interface ProgramStats {
  authority: PublicKey;
  totalBricks: number;
  bricksSold: number;
  totalRevenue: number;
}

export interface SmartContractState {
  isInitialized: boolean;
  totalBricks: number;
  bricksSold: number;
  totalRevenue: number;
  lastUpdated: Date;
}

@Injectable({
  providedIn: 'root'
})
export class SmartContractService {
  private connection: Connection | null = null;
  private wallet: any = null;
  
  private stateSubject = new BehaviorSubject<SmartContractState>({
    isInitialized: false,
    totalBricks: 432,
    bricksSold: 0,
    totalRevenue: 0,
    lastUpdated: new Date()
  });
  
  public state$ = this.stateSubject.asObservable();

  constructor() {
    this.initializeConnection();
  }

  /**
   * Initialize Solana connection
   */
  private initializeConnection(): void {
    try {
      this.connection = new Connection('https://api.devnet.solana.com', 'confirmed');
      console.log('🔗 Solana connection initialized');
    } catch (error) {
      console.error('❌ Error initializing Solana connection:', error);
    }
  }

  /**
   * Set wallet for smart contract interactions
   */
  setWallet(wallet: any): void {
    this.wallet = wallet;
    console.log('👛 Wallet set for smart contract interactions');
  }

  /**
   * Initialize the MetaBricks program
   */
  async initializeProgram(): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not connected');
    }

    try {
      console.log('🚀 Initializing MetaBricks program...');
      // For now, return a mock transaction ID
      // In production, this would call the actual smart contract
      const mockTx = 'mock_initialization_' + Date.now();
      
      // Update local state
      this.updateState({
        isInitialized: true,
        totalBricks: 432,
        bricksSold: 0,
        totalRevenue: 0,
        lastUpdated: new Date()
      });
      
      console.log('✅ Program initialized (mock):', mockTx);
      return mockTx;
    } catch (error) {
      console.error('❌ Error initializing program:', error);
      throw error;
    }
  }

  /**
   * Purchase a MetaBrick using smart contract
   */
  async purchaseBrick(
    brickId: number,
    priceSol: number,
    metadataUri: string
  ): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not connected');
    }

    try {
      console.log(`🔨 Purchasing MetaBrick #${brickId}...`);
      
      // For now, create a mock transaction
      // In production, this would call the actual smart contract
      const mockTx = `mock_purchase_${brickId}_${Date.now()}`;
      
      console.log('✅ MetaBrick purchased (mock):', mockTx);
      console.log('   Brick ID:', brickId);
      console.log('   Price:', priceSol, 'SOL');
      
      // Refresh state after purchase
      await this.refreshState();
      
      return mockTx;
    } catch (error) {
      console.error('❌ Error purchasing brick:', error);
      throw error;
    }
  }

  /**
   * Get brick purchase information
   */
  async getBrickInfo(brickId: number): Promise<BrickPurchase | null> {
    try {
      // For now, return null (brick not sold)
      // In production, this would query the smart contract
      console.log(`🔍 Checking brick #${brickId} availability...`);
      return null; // Brick is available
    } catch (error) {
      console.error(`❌ Error getting brick #${brickId} info:`, error);
      return null;
    }
  }

  /**
   * Get program statistics
   */
  async getProgramStats(): Promise<ProgramStats | null> {
    try {
      // For now, return mock stats
      // In production, this would query the smart contract
      return {
        authority: this.wallet?.publicKey || new PublicKey('11111111111111111111111111111111'),
        totalBricks: 432,
        bricksSold: 0,
        totalRevenue: 0
      };
    } catch (error) {
      console.error('❌ Error getting program stats:', error);
      return null;
    }
  }

  /**
   * Get all sold bricks
   */
  async getAllSoldBricks(): Promise<BrickPurchase[]> {
    try {
      // For now, return empty array (no bricks sold)
      // In production, this would query the smart contract
      console.log('📊 Getting all sold bricks...');
      return [];
    } catch (error) {
      console.error('❌ Error getting sold bricks:', error);
      return [];
    }
  }

  /**
   * Get bricks owned by a wallet
   */
  async getWalletBricks(walletAddress: PublicKey): Promise<BrickPurchase[]> {
    try {
      // For now, return empty array
      // In production, this would query the smart contract
      console.log('👛 Getting wallet bricks for:', walletAddress.toString());
      return [];
    } catch (error) {
      console.error('❌ Error getting wallet bricks:', error);
      return [];
    }
  }

  /**
   * Check if a brick is available
   */
  async isBrickAvailable(brickId: number): Promise<boolean> {
    try {
      const brickInfo = await this.getBrickInfo(brickId);
      return !brickInfo || !brickInfo.isSold;
    } catch (error) {
      console.error(`❌ Error checking brick #${brickId} availability:`, error);
      return true; // Assume available if we can't check
    }
  }

  /**
   * Get available bricks count
   */
  async getAvailableBricksCount(): Promise<number> {
    try {
      const stats = await this.getProgramStats();
      if (stats) {
        return stats.totalBricks - stats.bricksSold;
      }
      return 432; // Default fallback
    } catch (error) {
      console.error('❌ Error getting available bricks count:', error);
      return 432;
    }
  }

  /**
   * Refresh program state
   */
  async refreshState(): Promise<void> {
    try {
      const stats = await this.getProgramStats();
      if (stats) {
        this.updateState({
          isInitialized: true,
          totalBricks: stats.totalBricks,
          bricksSold: stats.bricksSold,
          totalRevenue: stats.totalRevenue / 1e9, // Convert lamports to SOL
          lastUpdated: new Date()
        });
      }
    } catch (error) {
      console.error('❌ Error refreshing state:', error);
    }
  }

  /**
   * Update local state
   */
  private updateState(newState: Partial<SmartContractState>): void {
    const currentState = this.stateSubject.value;
    const updatedState = { ...currentState, ...newState };
    this.stateSubject.next(updatedState);
  }

  /**
   * Get current state
   */
  getCurrentState(): SmartContractState {
    return this.stateSubject.value;
  }

  /**
   * Check if program is initialized
   */
  async checkProgramInitialization(): Promise<boolean> {
    try {
      const stats = await this.getProgramStats();
      return stats !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Initialize program if not already initialized
   */
  async ensureProgramInitialized(): Promise<void> {
    const isInitialized = await this.checkProgramInitialization();
    if (!isInitialized) {
      console.log('🚀 Program not initialized, initializing now...');
      await this.initializeProgram();
    } else {
      console.log('✅ Program already initialized');
      await this.refreshState();
    }
  }
}

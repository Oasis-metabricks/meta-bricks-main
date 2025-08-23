import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OASISWalletResult } from './oasis-wallet.service';

export interface WalletTransactionRequest {
  fromAvatarId: string;
  toAvatarId: string;
  amount: number;
  tokenSymbol: string;
  providerType: string;
  walletId: string;
}

export interface ProviderWallet {
  id: string;
  avatarId: string;
  providerType: string;
  publicKey: string;
  walletAddress: string;
  balance: number;
  transactions: WalletTransaction[];
  isDefault: boolean;
  createdAt: string;
}

export interface WalletTransaction {
  id: string;
  fromAddress: string;
  toAddress: string;
  amount: number;
  tokenSymbol: string;
  transactionHash: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: string;
  gasUsed?: number;
  gasPrice?: number;
}

export interface CreateWalletRequest {
  avatarId: string;
  name: string;
  type: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class WalletCoreService {
  
  private baseUrl = 'http://api.oasisplatform.world'; // OASIS API endpoint
  private apiKey = ''; // Add your OASIS API key here
  
  constructor(private http: HttpClient) {}
  
  // Wallet Management
  async createWallet(walletData: CreateWalletRequest): Promise<OASISWalletResult<ProviderWallet>> {
    try {
      const response = await this.http.post<OASISWalletResult<ProviderWallet>>(
        `${this.baseUrl}/api/wallet/create`,
        walletData,
        this.getHeaders()
      ).toPromise();
      
      return response || { result: null, isError: true, message: 'Failed to create wallet' };
    } catch (error: any) {
      return { result: null, isError: true, message: error?.message || 'Failed to create wallet' };
    }
  }
  
  async loadWalletsByAvatarId(avatarId: string, providerType?: string): Promise<OASISWalletResult<ProviderWallet[]>> {
    try {
      let url = `${this.baseUrl}/api/wallet/load_wallets_by_id/${avatarId}`;
      if (providerType) {
        url += `?providerType=${providerType}`;
      }
      
      const response = await this.http.get<OASISWalletResult<ProviderWallet[]>>(
        url,
        this.getHeaders()
      ).toPromise();
      
      return response || { result: [], isError: false, message: 'No wallets found' };
    } catch (error: any) {
      return { result: [], isError: true, message: error?.message || 'Failed to load wallets' };
    }
  }
  
  async loadWalletsByUsername(username: string, providerType?: string): Promise<OASISWalletResult<ProviderWallet[]>> {
    try {
      let url = `${this.baseUrl}/api/wallet/load_wallets_by_username/${username}`;
      if (providerType) {
        url += `?providerType=${providerType}`;
      }
      
      const response = await this.http.get<OASISWalletResult<ProviderWallet[]>>(
        url,
        this.getHeaders()
      ).toPromise();
      
      return response || { result: [], isError: false, message: 'No wallets found' };
    } catch (error: any) {
      return { result: [], isError: true, message: error?.message || 'Failed to load wallets' };
    }
  }
  
  async loadWalletsByEmail(email: string, providerType?: string): Promise<OASISWalletResult<ProviderWallet[]>> {
    try {
      let url = `${this.baseUrl}/api/wallet/load_wallets_by_email/${email}`;
      if (providerType) {
        url += `?providerType=${providerType}`;
      }
      
      const response = await this.http.get<OASISWalletResult<ProviderWallet[]>>(
        url,
        this.getHeaders()
      ).toPromise();
      
      return response || { result: [], isError: false, message: 'No wallets found' };
    } catch (error: any) {
      return { result: [], isError: true, message: error?.message || 'Failed to load wallets' };
    }
  }
  
  async saveWalletsByAvatarId(avatarId: string, wallets: ProviderWallet[], providerType?: string): Promise<OASISWalletResult<boolean>> {
    try {
      let url = `${this.baseUrl}/api/wallet/save_wallets_by_id/${avatarId}`;
      if (providerType) {
        url += `?providerType=${providerType}`;
      }
      
      const response = await this.http.post<OASISWalletResult<boolean>>(
        url,
        wallets,
        this.getHeaders()
      ).toPromise();
      
      return response || { result: false, isError: true, message: 'Failed to save wallets' };
    } catch (error: any) {
      return { result: false, isError: true, message: error?.message || 'Failed to save wallets' };
    }
  }
  
  // Transaction Management
  async sendToken(transaction: WalletTransactionRequest): Promise<OASISWalletResult<any>> {
    try {
      const response = await this.http.post<OASISWalletResult<any>>(
        `${this.baseUrl}/api/wallet/send_token`,
        transaction,
        this.getHeaders()
      ).toPromise();
      
      return response || { result: null, isError: true, message: 'Failed to send token' };
    } catch (error: any) {
      return { result: null, isError: true, message: error?.message || 'Failed to send token' };
    }
  }
  
  async getTransactionHistory(walletId: string): Promise<OASISWalletResult<WalletTransaction[]>> {
    try {
      const response = await this.http.get<OASISWalletResult<WalletTransaction[]>>(
        `${this.baseUrl}/api/wallet/transactions/${walletId}`,
        this.getHeaders()
      ).toPromise();
      
      return response || { result: [], isError: false, message: 'No transactions found' };
    } catch (error: any) {
      return { result: [], isError: true, message: error?.message || 'Failed to get transactions' };
    }
  }
  
  // Wallet Operations
  async getDefaultWallet(avatarId: string, providerType: string): Promise<OASISWalletResult<ProviderWallet>> {
    try {
      const response = await this.http.get<OASISWalletResult<ProviderWallet>>(
        `${this.baseUrl}/api/wallet/default_wallet/${avatarId}?providerType=${providerType}`,
        this.getHeaders()
      ).toPromise();
      
      return response || { result: null, isError: true, message: 'No default wallet found' };
    } catch (error: any) {
      return { result: null, isError: true, message: error?.message || 'Failed to get default wallet' };
    }
  }
  
  async setDefaultWallet(avatarId: string, walletId: string, providerType: string): Promise<OASISWalletResult<boolean>> {
    try {
      const response = await this.http.post<OASISWalletResult<boolean>>(
        `${this.baseUrl}/api/wallet/set_default_wallet`,
        { avatarId, walletId, providerType },
        this.getHeaders()
      ).toPromise();
      
      return response || { result: false, isError: true, message: 'Failed to set default wallet' };
    } catch (error: any) {
      return { result: false, isError: true, message: error?.message || 'Failed to set default wallet' };
    }
  }
  
  async getWalletByPublicKey(publicKey: string, providerType: string): Promise<OASISWalletResult<ProviderWallet>> {
    try {
      const response = await this.http.get<OASISWalletResult<ProviderWallet>>(
        `${this.baseUrl}/api/wallet/wallet_by_public_key/${publicKey}?providerType=${providerType}`,
        this.getHeaders()
      ).toPromise();
      
      return response || { result: null, isError: true, message: 'Wallet not found' };
    } catch (error: any) {
      return { result: null, isError: true, message: error?.message || 'Failed to get wallet' };
    }
  }
  
  // Balance Management
  async getWalletBalance(walletId: string, providerType: string): Promise<OASISWalletResult<number>> {
    try {
      const response = await this.http.get<OASISWalletResult<number>>(
        `${this.baseUrl}/api/wallet/balance/${walletId}?providerType=${providerType}`,
        this.getHeaders()
      ).toPromise();
      
      return response || { result: 0, isError: true, message: 'Failed to get balance' };
    } catch (error: any) {
      return { result: 0, isError: true, message: error?.message || 'Failed to get balance' };
    }
  }
  
  async refreshWalletBalance(walletId: string, providerType: string): Promise<OASISWalletResult<number>> {
    try {
      const response = await this.http.post<OASISWalletResult<number>>(
        `${this.baseUrl}/api/wallet/refresh_balance`,
        { walletId, providerType },
        this.getHeaders()
      ).toPromise();
      
      return response || { result: 0, isError: true, message: 'Failed to refresh balance' };
    } catch (error: any) {
      return { result: 0, isError: true, message: error?.message || 'Failed to refresh balance' };
    }
  }
  
  // Utility Methods
  async clearCache(): Promise<OASISWalletResult<boolean>> {
    try {
      const response = await this.http.post<OASISWalletResult<boolean>>(
        `${this.baseUrl}/api/wallet/clear_cache`,
        {},
        this.getHeaders()
      ).toPromise();
      
      return response || { result: false, isError: true, message: 'Failed to clear cache' };
    } catch (error: any) {
      return { result: false, isError: true, message: error?.message || 'Failed to clear cache' };
    }
  }
  
  // Helper methods
  private getHeaders(): { headers: HttpHeaders } {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    if (this.apiKey) {
      headers.set('Authorization', `Bearer ${this.apiKey}`);
    }
    
    return { headers };
  }
}

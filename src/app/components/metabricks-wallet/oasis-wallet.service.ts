import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

export interface OASISWalletResult<T> {
  result: T | null;
  isError: boolean;
  message: string;
  exception?: any;
}

export interface OASISWalletAvatar {
  id: string;
  username: string;
  email: string;
  karma: number;
  wallets: any[];
  nfts: any[];
  status: string;
  createdAt: string;
  lastActive: string;
}

export interface OASISWalletNFT {
  id: string;
  name: string;
  collection: string;
  tokenId: string;
  blockchain: string;
  avatarId: string;
  metadata: any;
}

@Injectable({
  providedIn: 'root'
})
export class OASISWalletService {
  
  private baseUrl = 'http://api.oasisplatform.world'; // OASIS API endpoint
  private apiKey = ''; // Add your OASIS API key here
  
  constructor(private http: HttpClient) {}
  
  // Avatar Management
  async createAvatar(avatarData: Partial<OASISWalletAvatar>): Promise<OASISWalletResult<OASISWalletAvatar>> {
    try {
      const response = await this.http.post<OASISWalletResult<OASISWalletAvatar>>(
        `${this.baseUrl}/api/avatar/register`,
        avatarData,
        this.getHeaders()
      ).toPromise();
      
      return response || { result: null, isError: true, message: 'Failed to create avatar' };
    } catch (error: any) {
      return { result: null, isError: true, message: error?.message || 'Failed to create avatar' };
    }
  }
  
  async getAvatarById(avatarId: string): Promise<OASISWalletResult<OASISWalletAvatar>> {
    try {
      const response = await this.http.get<OASISWalletResult<OASISWalletAvatar>>(
        `${this.baseUrl}/api/avatar/${avatarId}`,
        this.getHeaders()
      ).toPromise();
      
      return response || { result: null, isError: true, message: 'Failed to get avatar' };
    } catch (error: any) {
      return { result: null, isError: true, message: error?.message || 'Failed to get avatar' };
    }
  }
  
  async getAvatarByUsername(username: string): Promise<OASISWalletResult<OASISWalletAvatar>> {
    try {
      const response = await this.http.get<OASISWalletResult<OASISWalletAvatar>>(
        `${this.baseUrl}/api/avatar/username/${username}`,
        this.getHeaders()
      ).toPromise();
      
      return response || { result: null, isError: true, message: 'Failed to get avatar' };
    } catch (error: any) {
      return { result: null, isError: true, message: error?.message || 'Failed to get avatar' };
    }
  }
  
  async updateAvatar(avatarId: string, avatarData: Partial<OASISWalletAvatar>): Promise<OASISWalletResult<OASISWalletAvatar>> {
    try {
      const response = await this.http.put<OASISWalletResult<OASISWalletAvatar>>(
        `${this.baseUrl}/api/avatar/${avatarId}`,
        avatarData,
        this.getHeaders()
      ).toPromise();
      
      return response || { result: null, isError: true, message: 'Failed to update avatar' };
    } catch (error: any) {
      return { result: null, isError: true, message: error?.message || 'Failed to update avatar' };
    }
  }
  
  // NFT Management
  async loadNFTsByAvatarId(avatarId: string): Promise<OASISWalletResult<OASISWalletNFT[]>> {
    try {
      const response = await this.http.get<OASISWalletResult<OASISWalletNFT[]>>(
        `${this.baseUrl}/api/nft/avatar/${avatarId}`,
        this.getHeaders()
      ).toPromise();
      
      return response || { result: [], isError: false, message: 'No NFTs found' };
    } catch (error: any) {
      return { result: [], isError: true, message: error?.message || 'Failed to load NFTs' };
    }
  }
  
  async createNFT(nftData: Partial<OASISWalletNFT>): Promise<OASISWalletResult<OASISWalletNFT>> {
    try {
      const response = await this.http.post<OASISWalletResult<OASISWalletNFT>>(
        `${this.baseUrl}/api/nft`,
        nftData,
        this.getHeaders()
      ).toPromise();
      
      return response || { result: null, isError: true, message: 'Failed to create NFT' };
    } catch (error: any) {
      return { result: null, isError: true, message: error?.message || 'Failed to create NFT' };
    }
  }
  
  async updateNFT(nftId: string, nftData: Partial<OASISWalletNFT>): Promise<OASISWalletResult<OASISWalletNFT>> {
    try {
      const response = await this.http.put<OASISWalletResult<OASISWalletNFT>>(
        `${this.baseUrl}/api/nft/${nftId}`,
        nftData,
        this.getHeaders()
      ).toPromise();
      
      return response || { result: null, isError: true, message: 'Failed to update NFT' };
    } catch (error: any) {
      return { result: null, isError: true, message: error?.message || 'Failed to update NFT' };
    }
  }
  
  // Karma System
  async updateKarma(avatarId: string, karmaChange: number): Promise<OASISWalletResult<number>> {
    try {
      const response = await this.http.post<OASISWalletResult<number>>(
        `${this.baseUrl}/api/karma/update`,
        { avatarId, karmaChange },
        this.getHeaders()
      ).toPromise();
      
      return response || { result: 0, isError: true, message: 'Failed to update karma' };
    } catch (error: any) {
      return { result: 0, isError: true, message: error?.message || 'Failed to update karma' };
    }
  }
  
  // Data Operations
  async loadHolonData(holonId: string): Promise<OASISWalletResult<any>> {
    try {
      const response = await this.http.get<OASISWalletResult<any>>(
        `${this.baseUrl}/api/data/holon/${holonId}`,
        this.getHeaders()
      ).toPromise();
      
      return response || { result: null, isError: true, message: 'Failed to load holon data' };
    } catch (error: any) {
      return { result: null, isError: true, message: error?.message || 'Failed to load holon data' };
    }
  }
  
  async saveHolonData(holonData: any): Promise<OASISWalletResult<boolean>> {
    try {
      const response = await this.http.post<OASISWalletResult<boolean>>(
        `${this.baseUrl}/api/data/holon`,
        holonData,
        this.getHeaders()
      ).toPromise();
      
      return response || { result: false, isError: true, message: 'Failed to save holon data' };
    } catch (error: any) {
      return { result: false, isError: true, message: error?.message || 'Failed to save holon data' };
    }
  }
  
  // Provider Management
  async getAvailableProviders(): Promise<OASISWalletResult<string[]>> {
    try {
      const response = await this.http.get<OASISWalletResult<string[]>>(
        `${this.baseUrl}/api/providers/available`,
        this.getHeaders()
      ).toPromise();
      
      return response || { result: [], isError: false, message: 'No providers available' };
    } catch (error: any) {
      return { result: [], isError: true, message: error?.message || 'Failed to get providers' };
    }
  }
  
  async setActiveProvider(providerType: string): Promise<OASISWalletResult<boolean>> {
    try {
      const response = await this.http.post<OASISWalletResult<boolean>>(
        `${this.baseUrl}/api/providers/set-active`,
        { providerType },
        this.getHeaders()
      ).toPromise();
      
      return response || { result: false, isError: true, message: 'Failed to set active provider' };
    } catch (error: any) {
      return { result: false, isError: true, message: error?.message || 'Failed to set active provider' };
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

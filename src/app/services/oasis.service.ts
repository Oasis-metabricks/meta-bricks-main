import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface OASISResult<T> {
  result: T | null;
  isError: boolean;
  message: string;
  exception?: any;
}

export interface OASISAvatar {
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

export interface OASISNFT {
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
export class OASISService {
  
  // OASIS API Configuration
  private baseUrl = 'https://localhost:5002/api'; // Local OASIS API endpoint
  private apiKey = ''; // Add your OASIS API key here
  
  constructor(private http: HttpClient) {}
  
  // Avatar Management
  async createAvatar(avatarData: any): Promise<OASISResult<OASISAvatar>> {
    try {
      const response = await this.http.post<OASISResult<OASISAvatar>>(
        `${this.baseUrl}/avatar/register`,
        avatarData,
        this.getHeaders()
      ).toPromise();
      
      return response || { result: null, isError: true, message: 'Failed to create avatar' };
    } catch (error) {
      return { result: null, isError: true, message: this.getErrorMessage(error) };
    }
  }
  
  async getAvatarById(avatarId: string): Promise<OASISResult<OASISAvatar>> {
    try {
      const response = await this.http.get<OASISResult<OASISAvatar>>(
        `${this.baseUrl}/avatar/${avatarId}`,
        this.getHeaders()
      ).toPromise();
      
      return response || { result: null, isError: true, message: 'Failed to get avatar' };
    } catch (error) {
      return { result: null, isError: true, message: this.getErrorMessage(error) };
    }
  }
  
  async getAvatarByUsername(username: string): Promise<OASISResult<OASISAvatar>> {
    try {
      const response = await this.http.get<OASISResult<OASISAvatar>>(
        `${this.baseUrl}/avatar/username/${username}`,
        this.getHeaders()
      ).toPromise();
      
      return response || { result: null, isError: true, message: 'Failed to get avatar' };
    } catch (error) {
      return { result: null, isError: true, message: this.getErrorMessage(error) };
    }
  }
  
  async updateAvatar(avatarId: string, avatarData: Partial<OASISAvatar>): Promise<OASISResult<OASISAvatar>> {
    try {
      const response = await this.http.put<OASISResult<OASISAvatar>>(
        `${this.baseUrl}/avatar/${avatarId}`,
        avatarData,
        this.getHeaders()
      ).toPromise();
      
      return response || { result: null, isError: true, message: 'Failed to update avatar' };
    } catch (error) {
      return { result: null, isError: true, message: this.getErrorMessage(error) };
    }
  }
  
  // NFT Management
  async loadNFTsByAvatarId(avatarId: string): Promise<OASISResult<OASISNFT[]>> {
    try {
      const response = await this.http.get<OASISResult<OASISNFT[]>>(
        `${this.baseUrl}/nft/avatar/${avatarId}`,
        this.getHeaders()
      ).toPromise();
      
      return response || { result: [], isError: false, message: 'No NFTs found' };
    } catch (error) {
      return { result: [], isError: true, message: this.getErrorMessage(error) };
    }
  }
  
  async createNFT(nftData: Partial<OASISNFT>): Promise<OASISResult<OASISNFT>> {
    try {
      const response = await this.http.post<OASISResult<OASISNFT>>(
        `${this.baseUrl}/nft`,
        nftData,
        this.getHeaders()
      ).toPromise();
      
      return response || { result: null, isError: true, message: 'Failed to create NFT' };
    } catch (error) {
      return { result: null, isError: true, message: this.getErrorMessage(error) };
    }
  }
  
  async updateNFT(nftId: string, nftData: Partial<OASISNFT>): Promise<OASISResult<OASISNFT>> {
    try {
      const response = await this.http.put<OASISResult<OASISNFT>>(
        `${this.baseUrl}/nft/${nftId}`,
        nftData,
        this.getHeaders()
      ).toPromise();
      
      return response || { result: null, isError: true, message: 'Failed to update NFT' };
    } catch (error) {
      return { result: null, isError: true, message: this.getErrorMessage(error) };
    }
  }
  
  // Karma System
  async updateKarma(avatarId: string, karmaChange: number): Promise<OASISResult<number>> {
    try {
      const response = await this.http.post<OASISResult<number>>(
        `${this.baseUrl}/karma/update`,
        { avatarId, karmaChange },
        this.getHeaders()
      ).toPromise();
      
      return response || { result: 0, isError: true, message: 'Failed to update karma' };
    } catch (error) {
      return { result: 0, isError: true, message: this.getErrorMessage(error) };
    }
  }
  
  // Data Operations
  async loadHolonData(holonId: string): Promise<OASISResult<any>> {
    try {
      const response = await this.http.get<OASISResult<any>>(
        `${this.baseUrl}/data/holon/${holonId}`,
        this.getHeaders()
      ).toPromise();
      
      return response || { result: null, isError: true, message: 'Failed to load holon data' };
    } catch (error) {
      return { result: null, isError: true, message: this.getErrorMessage(error) };
    }
  }
  
  async saveHolonData(holonData: any): Promise<OASISResult<boolean>> {
    try {
      const response = await this.http.post<OASISResult<boolean>>(
        `${this.baseUrl}/data/holon`,
        holonData,
        this.getHeaders()
      ).toPromise();
      
      return response || { result: false, isError: true, message: 'Failed to save holon data' };
    } catch (error) {
      return { result: false, isError: true, message: this.getErrorMessage(error) };
    }
  }
  
  // Provider Management
  async getAvailableProviders(): Promise<OASISResult<string[]>> {
    try {
      const response = await this.http.get<OASISResult<string[]>>(
        `${this.baseUrl}/providers/available`,
        this.getHeaders()
      ).toPromise();
      
      return response || { result: [], isError: false, message: 'No providers available' };
    } catch (error) {
      return { result: [], isError: true, message: this.getErrorMessage(error) };
    }
  }
  
  async setActiveProvider(providerType: string): Promise<OASISResult<boolean>> {
    try {
      const response = await this.http.post<OASISResult<boolean>>(
        `${this.baseUrl}/providers/set-active`,
        { providerType },
        this.getHeaders()
      ).toPromise();
      
      return response || { result: false, isError: true, message: 'Failed to set active provider' };
    } catch (error) {
      return { result: false, isError: true, message: this.getErrorMessage(error) };
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
  
  // Error handling
  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'An unknown error occurred';
  }
}

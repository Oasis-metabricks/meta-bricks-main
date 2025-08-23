import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface OASISNFTMintRequest {
  title: string;
  description: string;
  mintedByAvatarId: string;
  onChainProvider: string;
  metadata?: any;
}

export interface OASISNFTMintResponse {
  success: boolean;
  nftId?: string;
  mintAddress?: string;
  transactionHash?: string;
  error?: string;
}

export interface OASISAuthResponse {
  success: boolean;
  jwtToken: string;
  refreshToken: string;
  expiresAt: string;
  user: any;
}

@Injectable({
  providedIn: 'root'
})
export class OasisApiService {
  // Updated API configuration to use local OASIS API
  private readonly OASIS_API_CONFIG = {
    BASE_URL: 'https://localhost:5002/api',
    ENDPOINTS: {
      HEALTH: '/health',
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      AVATAR: '/avatar',
      NFT_MINT: '/nft/mint',
      NFT_GET: '/nft',
      NFT_AVATAR: '/nft/avatar'
    }
  };

  private authToken: string | null = null;
  private avatarId: string | null = null;

  constructor(private http: HttpClient) {
    // Try to restore authentication from localStorage
    this.restoreAuth();
  }

  /**
   * Restore authentication from localStorage
   */
  private restoreAuth(): void {
    const token = localStorage.getItem('oasis_token');
    const avatar = localStorage.getItem('oasis_avatar_id');
    
    if (token && avatar) {
      this.authToken = token;
      this.avatarId = avatar;
      console.log('🔐 Restored OASIS authentication');
    }
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.OASIS_API_CONFIG.BASE_URL}${this.OASIS_API_CONFIG.ENDPOINTS.HEALTH}`);
      const health = await response.json();
      console.log('🏥 OASIS API Health:', health);
      return health.status === 'healthy';
    } catch (error) {
      console.error('❌ OASIS API connection failed:', error);
      return false;
    }
  }

  /**
   * Authenticate user with OASIS API
   */
  async authenticate(email: string, password: string): Promise<boolean> {
    try {
      console.log('🔐 Attempting to authenticate with OASIS API:', { email });
      
      // For now, we'll authenticate by checking if the avatar exists and password matches
      // This is a simplified approach - in production you'd want proper JWT authentication
      const response = await fetch(`${this.OASIS_API_CONFIG.BASE_URL}${this.OASIS_API_CONFIG.ENDPOINTS.AVATAR}`);
      
      if (response.ok) {
        const avatars = await response.json();
        const avatar = avatars.find((a: any) => a.email === email && a.password === password);
        
        if (avatar) {
          this.avatarId = avatar.id;
          // Generate a simple token for now (in production, use proper JWT)
          this.authToken = btoa(`${avatar.id}:${Date.now()}`);
          
          // Store in localStorage
          localStorage.setItem('oasis_token', this.authToken);
          if (this.avatarId) {
            localStorage.setItem('oasis_avatar_id', this.avatarId);
          }
          
          console.log('✅ OASIS authentication successful');
          return true;
        }
      }
      
      console.log('❌ OASIS authentication failed: Avatar not found or password incorrect');
      return false;
    } catch (error) {
      console.error('❌ OASIS authentication error:', error);
      return false;
    }
  }

  /**
   * Register new user with OASIS API
   */
  async register(userData: {
    email: string;
    password: string;
    username: string;
    firstName?: string;
    lastName?: string;
  }): Promise<boolean> {
    try {
      console.log('📝 Attempting to register user with OASIS API:', userData);
      
      const response = await fetch(`${this.OASIS_API_CONFIG.BASE_URL}${this.OASIS_API_CONFIG.ENDPOINTS.AVATAR}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...userData,
          firstName: userData.firstName || userData.username,
          lastName: userData.lastName || '',
          description: 'MetaBricks user'
        })
      });

      console.log('📡 OASIS API response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ OASIS registration successful:', result);
        return true;
      } else {
        const errorData = await response.json();
        console.error('❌ OASIS registration failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        
        // Provide more specific error messages
        if (errorData.message) {
          throw new Error(`Registration failed: ${errorData.message}`);
        } else {
          throw new Error(`Registration failed: HTTP ${response.status} - ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error('❌ OASIS registration error:', error);
      throw error;
    }
  }

  /**
   * Mint NFT via OASIS API
   */
  async mintNFT(nftData: OASISNFTMintRequest): Promise<OASISNFTMintResponse> {
    if (!this.authToken) {
      throw new Error('Not authenticated with OASIS API');
    }

    if (!this.avatarId) {
      throw new Error('No avatar ID available');
    }

    try {
      const response = await fetch(`${this.OASIS_API_CONFIG.BASE_URL}${this.OASIS_API_CONFIG.ENDPOINTS.NFT_MINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`
        },
        body: JSON.stringify({
          ...nftData,
          mintedByAvatarId: this.avatarId!
        })
      });

      if (response.status === 401) {
        // Token expired, clear auth
        this.clearAuth();
        throw new Error('Authentication expired. Please login again.');
      }

      if (response.ok) {
        const result: OASISNFTMintResponse = await response.json();
        console.log('🎨 NFT minted successfully via OASIS:', result);
      return result;
      }

      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      console.error('❌ OASIS NFT minting failed:', error);
      throw error;
    }
  }

  /**
   * Get NFT by ID
   */
  async getNFT(nftId: string): Promise<any> {
    if (!this.authToken) {
      throw new Error('Not authenticated with OASIS API');
    }

    try {
      const response = await fetch(`${this.OASIS_API_CONFIG.BASE_URL}${this.OASIS_API_CONFIG.ENDPOINTS.NFT_GET}/${nftId}`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        }
      });

      if (response.ok) {
        return await response.json();
      }
      
      throw new Error(`Failed to get NFT: ${response.status}`);
    } catch (error) {
      console.error('❌ Failed to get NFT:', error);
      throw error;
    }
  }

  /**
   * Get NFTs for current avatar
   */
  async getAvatarNFTs(): Promise<any[]> {
    if (!this.authToken || !this.avatarId) {
      throw new Error('Not authenticated with OASIS API');
    }

    try {
      const response = await fetch(`${this.OASIS_API_CONFIG.BASE_URL}${this.OASIS_API_CONFIG.ENDPOINTS.NFT_AVATAR}/${this.avatarId}`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        }
      });

      if (response.ok) {
        return await response.json();
      }
      
      throw new Error(`Failed to get avatar NFTs: ${response.status}`);
    } catch (error) {
      console.error('❌ Failed to get avatar NFTs:', error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!(this.authToken && this.avatarId);
  }

  /**
   * Get current avatar ID
   */
  getAvatarId(): string | null {
    return this.avatarId;
  }

  /**
   * Get authentication token
   */
  getAuthToken(): string | null {
    return this.authToken;
  }

  /**
   * Clear authentication
   */
  clearAuth(): void {
    this.authToken = null;
    this.avatarId = null;
    localStorage.removeItem('oasis_token');
    localStorage.removeItem('oasis_avatar_id');
    console.log('🔓 OASIS authentication cleared');
  }

  /**
   * Get authentication headers for HTTP requests
   */
  getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authToken}`
    });
  }

  /**
   * Get base URL for API calls
   */
  getBaseUrl(): string {
    return this.OASIS_API_CONFIG.BASE_URL;
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { OASISWalletService, OASISWalletAvatar, OASISWalletResult } from './oasis-wallet.service';

export interface AvatarWalletAuthState {
  isAuthenticated: boolean;
  currentAvatar: OASISWalletAvatar | null;
  token: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AvatarWalletService {
  
  private authState = new BehaviorSubject<AvatarWalletAuthState>({
    isAuthenticated: false,
    currentAvatar: null,
    token: null
  });
  
  public authState$ = this.authState.asObservable();
  
  constructor(private oasisWalletService: OASISWalletService) {
    this.loadStoredAuthState();
  }
  
  // Authentication Methods
  async login(username: string, password: string): Promise<OASISWalletResult<OASISWalletAvatar>> {
    try {
      // First, try to get avatar by username
      const avatarResult = await this.oasisWalletService.getAvatarByUsername(username);
      
      if (avatarResult.isError) {
        return { result: null, isError: true, message: 'Invalid credentials' };
      }
      
      // In a real implementation, you would validate the password here
      // For now, we'll assume the avatar exists and proceed
      const avatar = avatarResult.result;
      
      if (avatar) {
        // Store authentication state
        this.setAuthState({
          isAuthenticated: true,
          currentAvatar: avatar,
          token: this.generateToken(avatar.id)
        });
        
        return { result: avatar, isError: false, message: 'Login successful' };
      } else {
        return { result: null, isError: true, message: 'Avatar not found' };
      }
      
    } catch (error: any) {
      return { result: null, isError: true, message: 'Login failed' };
    }
  }
  
  async register(avatarData: {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): Promise<OASISWalletResult<OASISWalletAvatar>> {
    try {
      const newAvatar: Partial<OASISWalletAvatar> = {
        username: avatarData.username,
        email: avatarData.email,
        karma: 0,
        wallets: [],
        nfts: [],
        status: 'active',
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      };
      
      const result = await this.oasisWalletService.createAvatar(newAvatar);
      
      if (!result.isError && result.result) {
        // Auto-login after successful registration
        this.setAuthState({
          isAuthenticated: true,
          currentAvatar: result.result,
          token: this.generateToken(result.result.id)
        });
      }
      
      return result;
      
    } catch (error: any) {
      return { result: null, isError: true, message: 'Registration failed' };
    }
  }
  
  async logout(): Promise<void> {
    this.setAuthState({
      isAuthenticated: false,
      currentAvatar: null,
      token: null
    });
  }
  
  // Avatar Management
  async getCurrentAvatar(): Promise<OASISWalletAvatar | null> {
    const state = this.authState.value;
    return state.currentAvatar;
  }
  
  async updateAvatar(avatarData: Partial<OASISWalletAvatar>): Promise<OASISWalletResult<OASISWalletAvatar>> {
    const state = this.authState.value;
    
    if (!state.currentAvatar) {
      return { result: null, isError: true, message: 'No avatar logged in' };
    }
    
    try {
      const result = await this.oasisWalletService.updateAvatar(state.currentAvatar.id, avatarData);
      
      if (!result.isError && result.result) {
        // Update local state
        this.setAuthState({
          ...state,
          currentAvatar: result.result
        });
      }
      
      return result;
      
    } catch (error: any) {
      return { result: null, isError: true, message: 'Failed to update avatar' };
    }
  }
  
  async refreshAvatar(): Promise<OASISWalletResult<OASISWalletAvatar>> {
    const state = this.authState.value;
    
    if (!state.currentAvatar) {
      return { result: null, isError: true, message: 'No avatar logged in' };
    }
    
    try {
      const result = await this.oasisWalletService.getAvatarById(state.currentAvatar.id);
      
      if (!result.isError && result.result) {
        // Update local state
        this.setAuthState({
          ...state,
          currentAvatar: result.result
        });
      }
      
      return result;
      
    } catch (error: any) {
      return { result: null, isError: true, message: 'Failed to refresh avatar' };
    }
  }
  
  // Karma Management
  async updateKarma(karmaChange: number): Promise<OASISWalletResult<number>> {
    const state = this.authState.value;
    
    if (!state.currentAvatar) {
      return { result: 0, isError: true, message: 'No avatar logged in' };
    }
    
    try {
      const result = await this.oasisWalletService.updateKarma(state.currentAvatar.id, karmaChange);
      
      if (!result.isError && result.result !== null) {
        // Update local avatar karma
        const updatedAvatar = { ...state.currentAvatar, karma: result.result };
        this.setAuthState({
          ...state,
          currentAvatar: updatedAvatar
        });
      }
      
      return result;
      
    } catch (error: any) {
      return { result: 0, isError: true, message: 'Failed to update karma' };
    }
  }
  
  // Authentication State Management
  isAuthenticated(): boolean {
    return this.authState.value.isAuthenticated;
  }
  
  getAuthToken(): string | null {
    return this.authState.value.token;
  }
  
  private setAuthState(state: AvatarWalletAuthState): void {
    this.authState.next(state);
    this.storeAuthState(state);
  }
  
  private storeAuthState(state: AvatarWalletAuthState): void {
    if (state.isAuthenticated && state.currentAvatar && state.token) {
      localStorage.setItem('metabricks_wallet_auth', JSON.stringify({
        avatar: state.currentAvatar,
        token: state.token,
        timestamp: Date.now()
      }));
    } else {
      localStorage.removeItem('metabricks_wallet_auth');
    }
  }
  
  private loadStoredAuthState(): void {
    try {
      const stored = localStorage.getItem('metabricks_wallet_auth');
      if (stored) {
        const authData = JSON.parse(stored);
        const now = Date.now();
        const tokenAge = now - authData.timestamp;
        
        // Check if token is still valid (24 hours)
        if (tokenAge < 24 * 60 * 60 * 1000) {
          this.setAuthState({
            isAuthenticated: true,
            currentAvatar: authData.avatar,
            token: authData.token
          });
        } else {
          // Token expired, clear storage
          localStorage.removeItem('metabricks_wallet_auth');
        }
      }
    } catch (error) {
      console.error('Failed to load stored auth state:', error);
      localStorage.removeItem('metabricks_wallet_auth');
    }
  }
  
  private generateToken(avatarId: string): string {
    // In a real implementation, this would be a JWT token from the server
    // For now, we'll create a simple token
    return btoa(`${avatarId}:${Date.now()}`);
  }
  
  // Validation Methods
  validateUsername(username: string): boolean {
    return username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9_]+$/.test(username);
  }
  
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  validatePassword(password: string): boolean {
    return password.length >= 8;
  }
}

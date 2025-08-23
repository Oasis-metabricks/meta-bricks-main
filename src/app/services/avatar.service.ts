import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { OASISService, OASISResult, OASISAvatar } from './oasis.service';

// Registration request interface that matches the OASIS API
interface AvatarRegistrationRequest {
  username: string;
  email: string;
  password: string;
  avatarType: string;
  createdOASISType: string;
  firstName?: string;
  lastName?: string;
}

export interface AvatarAuthState {
  isAuthenticated: boolean;
  currentAvatar: OASISAvatar | null;
  token: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AvatarService {
  
  private authState = new BehaviorSubject<AvatarAuthState>({
    isAuthenticated: false,
    currentAvatar: null,
    token: null
  });
  
  public authState$ = this.authState.asObservable();
  
  constructor(
    private http: HttpClient,
    private oasisService: OASISService
  ) {
    this.loadStoredAuthState();
  }
  
  // Authentication Methods - Add the missing methods that existing components expect
  async loginAvatar(username: string, password: string): Promise<OASISResult<OASISAvatar>> {
    try {
      // Try to get avatar by username from OASIS API
      const avatarResult = await this.oasisService.getAvatarByUsername(username);
      
      if (avatarResult.isError || !avatarResult.result) {
        return { result: null, isError: true, message: 'Invalid credentials' };
      }
      
      const avatar = avatarResult.result;
      
      // Store authentication state
      this.setAuthState({
        isAuthenticated: true,
        currentAvatar: avatar,
        token: this.generateToken(avatar.id)
      });
      
      return { result: avatar, isError: false, message: 'Login successful' };
      
    } catch (error: any) {
      return { result: null, isError: true, message: 'Login failed' };
    }
  }
  
  async createAvatar(avatarData: AvatarRegistrationRequest): Promise<OASISResult<OASISAvatar>> {
    try {
      // Call the OASIS API to actually create the avatar
      // Send the registration data directly to the API endpoint
      const result = await this.oasisService.createAvatar(avatarData);
      
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
  
  // Add the missing getAvatarState method
  getAvatarState(): Observable<OASISAvatar | null> {
    return new Observable(observer => {
      const state = this.authState.value;
      observer.next(state.currentAvatar);
      observer.complete();
    });
  }
  
  // Keep existing methods
  async login(username: string, password: string): Promise<OASISResult<OASISAvatar>> {
    return this.loginAvatar(username, password);
  }
  
  async register(avatarData: AvatarRegistrationRequest): Promise<OASISResult<OASISAvatar>> {
    return this.createAvatar(avatarData);
  }
  
  async logout(): Promise<void> {
    this.setAuthState({
      isAuthenticated: false,
      currentAvatar: null,
      token: null
    });
  }
  
  // Avatar Management
  async getCurrentAvatar(): Promise<OASISAvatar | null> {
    const state = this.authState.value;
    return state.currentAvatar;
  }
  
  async updateAvatar(avatarData: Partial<OASISAvatar>): Promise<OASISResult<OASISAvatar>> {
    const state = this.authState.value;
    
    if (!state.currentAvatar) {
      return { result: null, isError: true, message: 'No avatar logged in' };
    }
    
    try {
      // Call OASIS API to update avatar
      const result = await this.oasisService.updateAvatar(state.currentAvatar.id, avatarData);
      
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
  
  async refreshAvatar(): Promise<OASISResult<OASISAvatar>> {
    const state = this.authState.value;
    
    if (!state.currentAvatar) {
      return { result: null, isError: true, message: 'No avatar logged in' };
    }
    
    try {
      // Call OASIS API to refresh avatar data
      const result = await this.oasisService.getAvatarById(state.currentAvatar.id);
      
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
  async updateKarma(karmaChange: number): Promise<OASISResult<number>> {
    const state = this.authState.value;
    
    if (!state.currentAvatar) {
      return { result: 0, isError: true, message: 'No avatar logged in' };
    }
    
    try {
      const newKarma = state.currentAvatar.karma + karmaChange;
      const updatedAvatar = { ...state.currentAvatar, karma: newKarma };
      
      // Update local state
      this.setAuthState({
        ...state,
        currentAvatar: updatedAvatar
      });
      
      return { result: newKarma, isError: false, message: 'Karma updated' };
      
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
  
  private setAuthState(state: AvatarAuthState): void {
    this.authState.next(state);
    this.storeAuthState(state);
  }
  
  private storeAuthState(state: AvatarAuthState): void {
    if (state.isAuthenticated && state.currentAvatar && state.token) {
      localStorage.setItem('metabricks_auth', JSON.stringify({
        avatar: state.currentAvatar,
        token: state.token,
        timestamp: Date.now()
      }));
    } else {
      localStorage.removeItem('metabricks_auth');
    }
  }
  
  private loadStoredAuthState(): void {
    try {
      const stored = localStorage.getItem('metabricks_auth');
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
          localStorage.removeItem('metabricks_auth');
        }
      }
    } catch (error) {
      console.error('Failed to load stored auth state:', error);
      localStorage.removeItem('metabricks_auth');
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

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface MobileWalletInfo {
  publicKey: string;
  connected: boolean;
  isMobile: boolean;
  deepLinkUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MobileWalletService {
  private walletInfoSubject = new BehaviorSubject<MobileWalletInfo | null>(null);
  public walletInfo$ = this.walletInfoSubject.asObservable();

  constructor() {
    this.initializeMobileWallet();
  }

  private initializeMobileWallet(): void {
    if (this.isMobileDevice()) {
      console.log('📱 Mobile device detected, initializing mobile wallet...');
      this.setupUrlChangeListener();
      this.checkUrlForWalletInfo();
    }
  }

  private isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  private setupUrlChangeListener(): void {
    // Listen for URL changes (when returning from mobile wallet)
    window.addEventListener('focus', () => {
      setTimeout(() => {
        this.checkUrlForWalletInfo();
      }, 100);
    });
  }

  private checkUrlForWalletInfo(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const walletInfo = urlParams.get('wallet');
    const publicKey = urlParams.get('publicKey');
    const connected = urlParams.get('connected');

    if (walletInfo && publicKey) {
      console.log('🔗 Wallet info found in URL:', { walletInfo, publicKey, connected });
      
      const mobileWalletInfo: MobileWalletInfo = {
        publicKey: publicKey,
        connected: connected === 'true',
        isMobile: true,
        deepLinkUrl: undefined
      };

      this.storeWalletInfo(mobileWalletInfo);
      this.walletInfoSubject.next(mobileWalletInfo);
      
      // Clean up URL
      this.cleanupUrl();
    }
  }

  private cleanupUrl(): void {
    // Remove wallet parameters from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('wallet');
    url.searchParams.delete('publicKey');
    url.searchParams.delete('connected');
    
    window.history.replaceState({}, document.title, url.toString());
  }

  async connectMobileWallet(): Promise<MobileWalletInfo> {
    if (!this.isMobileDevice()) {
      throw new Error('Mobile wallet only available on mobile devices');
    }

    try {
      console.log('📱 Connecting mobile wallet...');
      
      // Create deep link to Phantom mobile app
      const deepLinkUrl = 'https://phantom.app/ul/browse/' + window.location.origin;
      
      const mobileWalletInfo: MobileWalletInfo = {
        publicKey: '',
        connected: false,
        isMobile: true,
        deepLinkUrl: deepLinkUrl
      };

      // Store wallet info
      this.storeWalletInfo(mobileWalletInfo);
      this.walletInfoSubject.next(mobileWalletInfo);

      // Open Phantom mobile app
      window.location.href = deepLinkUrl;
      
      return mobileWalletInfo;
    } catch (error) {
      console.error('❌ Error connecting mobile wallet:', error);
      throw error;
    }
  }

  disconnectMobileWallet(): void {
    console.log('📱 Disconnecting mobile wallet...');
    this.walletInfoSubject.next(null);
    localStorage.removeItem('mobileWalletInfo');
  }

  getCurrentWalletInfo(): MobileWalletInfo | null {
    return this.walletInfoSubject.value;
  }

  isWalletConnected(): boolean {
    const walletInfo = this.getCurrentWalletInfo();
    return walletInfo?.connected || false;
  }

  getWalletPublicKey(): string | null {
    const walletInfo = this.getCurrentWalletInfo();
    return walletInfo?.publicKey || null;
  }

  private storeWalletInfo(walletInfo: MobileWalletInfo): void {
    localStorage.setItem('mobileWalletInfo', JSON.stringify(walletInfo));
  }

  private getStoredWalletInfo(): MobileWalletInfo | null {
    const stored = localStorage.getItem('mobileWalletInfo');
    return stored ? JSON.parse(stored) : null;
  }

  handleMobileWalletReturn(): MobileWalletInfo | null {
    const storedInfo = this.getStoredWalletInfo();
    if (storedInfo) {
      this.walletInfoSubject.next(storedInfo);
      return storedInfo;
    }
    return null;
  }

  createActionDeepLink(action: string, params: Record<string, string> = {}): string {
    const baseUrl = window.location.origin + window.location.pathname;
    const searchParams = new URLSearchParams();
    
    // Add action parameter
    searchParams.set('action', action);
    
    // Add additional parameters
    Object.entries(params).forEach(([key, value]) => {
      searchParams.set(key, value);
    });
    
    return `${baseUrl}?${searchParams.toString()}`;
  }

  isReturningFromAction(action: string): boolean {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('action') === action;
  }

  getActionParams(): Record<string, string> {
    const urlParams = new URLSearchParams(window.location.search);
    const params: Record<string, string> = {};
    
    urlParams.forEach((value, key) => {
      if (key !== 'action') {
        params[key] = value;
      }
    });
    
    return params;
  }
}

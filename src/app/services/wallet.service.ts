// src/app/services/wallet.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Connection, PublicKey } from '@solana/web3.js';

declare let window: any;

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private apiUrl = 'https://metabricks-backend-api-66e7d2abb038.herokuapp.com';  // Backend API URL
  private connection: Connection;

  constructor(private http: HttpClient) {
    this.connection = new Connection("https://api.devnet.solana.com", 'confirmed');
  }

  // Connect to Phantom wallet (supports both desktop and mobile)
  async connectWallet() {
    console.log('Attempting to connect to wallet...');
    try {
      // Check if we're on mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        console.log('Mobile device detected, using deep link for Phantom...');
        // For mobile, we need to deep link to Phantom
        const phantomDeepLink = 'https://phantom.app/ul/browse/';
        const currentUrl = window.location.href;
        
        // Create a deep link that will return to our app
        const deepLinkUrl = `${phantomDeepLink}${encodeURIComponent(currentUrl)}`;
        
        // Try to open Phantom app
        window.location.href = deepLinkUrl;
        
        // Note: The user will need to manually return to the app after connecting
        // We'll need to handle the return flow
        return { mobile: true, deepLinkUrl };
      } else {
        // Desktop flow
        if (window.solana && window.solana.isPhantom) {
          console.log('Desktop Phantom wallet found, attempting to connect...');
          const response = await window.solana.connect();
          console.log('Wallet connected:', response.publicKey.toString());
          return response;
        } else {
          console.log('Phantom wallet not found.');
          alert('Phantom wallet not found. Please install it from https://phantom.app/');
        }
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  }

  // Check if the wallet is already connected (supports both desktop and mobile)
  async checkWalletConnected() {
    // Check if we're on mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // For mobile, we need to check URL parameters or localStorage for wallet info
      // This is a simplified approach - in a real app you'd want more robust handling
      const walletInfo = localStorage.getItem('phantom_wallet_info');
      if (walletInfo) {
        try {
          const parsed = JSON.parse(walletInfo);
          return parsed.publicKey;
        } catch (e) {
          console.error('Error parsing wallet info:', e);
        }
      }
      return null;
    } else {
      // Desktop flow
      if (window.solana && window.solana.isPhantom && window.solana.isConnected && window.solana.publicKey) {
        return window.solana.publicKey;
      }
      return null;
    }
  }

  // Disconnect the wallet (supports both desktop and mobile)
  async disconnectWallet() {
    console.log('Attempting to disconnect wallet...');
    try {
      // Check if we're on mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Clear stored wallet info
        localStorage.removeItem('phantom_wallet_info');
        console.log('Mobile wallet disconnected');
      } else {
        // Desktop flow
        if (window.solana && window.solana.disconnect) {
          await window.solana.disconnect();
          console.log('Desktop wallet disconnected');
        }
      }
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  }

  // Handle mobile wallet return flow
  handleMobileWalletReturn() {
    // Check URL parameters for wallet info returned from Phantom
    const urlParams = new URLSearchParams(window.location.search);
    const walletInfo = urlParams.get('phantom_encryption_public_key');
    
    if (walletInfo) {
      // Store wallet info for future use
      localStorage.setItem('phantom_wallet_info', JSON.stringify({
        publicKey: walletInfo,
        connected: true
      }));
      
      // Clean up URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      
      console.log('Mobile wallet connected:', walletInfo);
      return walletInfo;
    }
    
    return null;
  }

  // Updated method to mint an NFT via your backend
  mintNFTbackend(data: { walletAddress: string, metadataUri: string }) {
    return this.http.post(`${this.apiUrl}/mint-nft`, data);
  }

  // Fetch the list of minted bricks from the backend
  getMintedBricks() {
    return this.http.get<{ minted: string[] }>(`${this.apiUrl}/minted-bricks`);
  }
}

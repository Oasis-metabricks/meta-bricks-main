// src/app/services/wallet.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Connection, PublicKey } from '@solana/web3.js';


declare let window: any;

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private apiUrl = 'http://localhost:3001';  // Backend API URL
  private connection: Connection;

  constructor(private http: HttpClient) {
    this.connection = new Connection("https://api.devnet.solana.com", 'confirmed');
    // If you have a program ID or other initializations, they would go here.
    // this.programId = new PublicKey("YOUR_SMART_CONTRACT_ADDRESS");
  }

  // Connect to Phantom wallet
 async connectWallet() {
    console.log('Attempting to connect to wallet...');
    try {
      if (window.solana && window.solana.isPhantom) {
        console.log('Phantom wallet found, attempting to connect...');
        // This will prompt the user to connect/log in
        const response = await window.solana.connect();
        console.log('Wallet connected:', response.publicKey.toString());
        return response;
      } else {
        console.log('Phantom wallet not found.');
        alert('Phantom wallet not found. Please install it from https://phantom.app/');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  }

  // Check if the wallet is already connected
  async checkWalletConnected() {
    if (window.solana && window.solana.isPhantom && window.solana.isConnected && window.solana.publicKey) {
      return window.solana.publicKey;
    }
    return null;
  }

  // Disconnect the wallet
  async disconnectWallet() {
    console.log('Attempting to disconnect wallet...');
    try {
      if (window.solana && window.solana.disconnect) {
        await window.solana.disconnect();
        console.log('Wallet disconnected');
      }
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
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

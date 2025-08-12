// src/app/components/mint/mint.component.ts
(window as any).Buffer = (window as any).Buffer || require('buffer').Buffer;
import { Component } from '@angular/core';
import { WalletService } from '../../../services/wallet.service'; // Ensure the path is correct
import { BrickEventsService } from '../../../services/brick-events.service';
import { Connection, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';

import { BsModalRef } from 'ngx-bootstrap/modal';

declare let window: any;

const METABRICKS_WALLET = 'FXD4ebDGGDG3L345MD2DYRQ4rxhuswJFZ1o3EASsQxhS';
const SOL_AMOUNT = 0.1; // Reduced from 1.79 for easier testing
const SOLANA_RPC = 'https://api.devnet.solana.com';

@Component({
  selector: 'app-mint',
  templateUrl: './mint.component.html',
  styleUrls: ['./mint.component.scss']
})
export class MintComponent {
  brick: any;
  selectedPayment: 'phantom' | 'stripe' | null = null;

  constructor(
    private walletService: WalletService,
    private brickEvents: BrickEventsService,
    public modalRef: BsModalRef
  ) {}

  goBack() {
    this.modalRef.hide();
  }

  selectPayment(method: 'phantom' | 'stripe') {
    this.selectedPayment = method;
  }

  async mintWithStripe() {
    if (!this.brick || !this.brick.metadataUri) {
      alert('Brick data is missing.');
      return;
    }
    
    // Check for wallet address (desktop or mobile)
    let walletAddress = window.solana?.publicKey?.toString();
    if (!walletAddress) {
      // Check for mobile wallet
      const walletInfo = localStorage.getItem('phantom_wallet_info');
      if (walletInfo) {
        try {
          const parsed = JSON.parse(walletInfo);
          walletAddress = parsed.publicKey;
        } catch (e) {
          console.error('Error parsing wallet info:', e);
        }
      }
    }
    
    if (!walletAddress) {
      alert('Please connect your wallet first.');
      return;
    }
    try {
      console.log('🔔 Creating Stripe checkout session for:', this.brick.metadataUri);
      
      const response = await fetch('https://metabricks-backend-api-66e7d2abb038.herokuapp.com/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress, metadataUri: this.brick.metadataUri })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ Stripe session created:', data);
      
      if (!data.checkoutUrl) {
        throw new Error('No checkout URL received from backend');
      }
      
      // Open Stripe checkout using the provided URL
      console.log('🌐 Opening Stripe checkout:', data.checkoutUrl);
      window.open(data.checkoutUrl, '_blank');
      
      // Start polling for payment status
      this.checkPaymentStatus(data.id);
      
    } catch (err: any) {
      console.error('❌ Stripe payment error:', err);
      alert('Stripe payment failed: ' + (err.message || err));
    }
  }

  async mintBrick() {
    // Check for wallet (desktop or mobile)
    let provider = window.solana;
    let walletAddress = window.solana?.publicKey?.toString();
    
    if (!walletAddress) {
      // Check for mobile wallet
      const walletInfo = localStorage.getItem('phantom_wallet_info');
      if (walletInfo) {
        try {
          const parsed = JSON.parse(walletInfo);
          walletAddress = parsed.publicKey;
          // For mobile, we'll need to handle transactions differently
          // For now, we'll show an alert that mobile Phantom transactions need special handling
          alert('Mobile Phantom wallet detected. Please use desktop for Phantom transactions or use Stripe payment instead.');
          return;
        } catch (e) {
          console.error('Error parsing wallet info:', e);
        }
      }
    }
    
    if (this.brick && this.brick.metadataUri && walletAddress) {
      try {
        // Step 1: Payment (desktop only for now)
        if (!provider) {
          alert('Please use desktop Phantom wallet for transactions or use Stripe payment instead.');
          return;
        }
        const connection = new Connection(SOLANA_RPC);
        const fromPubkey = new PublicKey(provider.publicKey.toString());
        const toPubkey = new PublicKey(METABRICKS_WALLET);
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey,
            toPubkey,
            lamports: Math.round(SOL_AMOUNT * 1e9),
          })
        );
        transaction.feePayer = fromPubkey;
        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        const signed = await provider.signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signed.serialize());
        await connection.confirmTransaction(signature, 'confirmed');
        alert('Payment successful! Transaction: ' + signature);
        // Step 2: Mint NFT
        this.walletService.mintNFTbackend({
          walletAddress: provider.publicKey.toString(),
          metadataUri: this.brick.metadataUri
        }).subscribe({
          next: (response) => {
            console.log('Minting successful', response);
            alert('Brick minted successfully!');
            this.brickEvents.notifyMinted();
          },
          error: (error) => {
            console.error('Error minting brick:', error);
            alert('Failed to mint brick. Please try again.');
          }
        });
      } catch (err: any) {
        console.error('Payment or minting error:', err);
        alert('Payment failed or cancelled: ' + (err.message || err));
      }
    } else {
      alert('Brick data or wallet is incomplete.');
    }
  }

  // Check payment status by polling the backend
  async checkPaymentStatus(sessionId: string) {
    let attempts = 0;
    const maxAttempts = 30; // Check for up to 1 minute (30 * 2 seconds)
    
    const pollStatus = async () => {
      try {
        const response = await fetch(`https://metabricks-backend-api-66e7d2abb038.herokuapp.com/check-payment-status/${sessionId}`);
        const data = await response.json();
        
        if (data.status === 'paid') {
          alert('Payment completed successfully! Your brick will be minted shortly.');
          this.brickEvents.notifyMinted();
          return;
        } else if (data.status === 'cancelled') {
          console.log('Payment was cancelled');
          return;
        } else {
          // Payment still in progress, check again in 2 seconds
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(pollStatus, 2000);
          } else {
            console.log('Payment status polling timed out');
          }
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(pollStatus, 2000);
        }
      }
    };
    
    // Start polling
    pollStatus();
  }
}  

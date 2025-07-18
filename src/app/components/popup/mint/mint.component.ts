// src/app/components/mint/mint.component.ts
(window as any).Buffer = (window as any).Buffer || require('buffer').Buffer;
import { Component } from '@angular/core';
import { WalletService } from '../../../services/wallet.service'; // Ensure the path is correct
import { BrickEventsService } from '../../../services/brick-events.service';
import { Connection, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { loadStripe } from '@stripe/stripe-js';

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

  constructor(private walletService: WalletService, private brickEvents: BrickEventsService) {}

  selectPayment(method: 'phantom' | 'stripe') {
    this.selectedPayment = method;
  }

  async mintWithStripe() {
    if (!this.brick || !this.brick.metadataUri) {
      alert('Brick data is missing.');
      return;
    }
    const walletAddress = window.solana?.publicKey?.toString();
    if (!walletAddress) {
      alert('Please connect your wallet first.');
      return;
    }
    try {
      const response = await fetch('http://localhost:3001/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress, metadataUri: this.brick.metadataUri })
      });
      const data = await response.json();
      if (!data.id) throw new Error('Failed to create Stripe session');
      const stripe = await loadStripe('pk_test_REPLACE_ME'); // TODO: Replace with your Stripe publishable key
      if (!stripe) throw new Error('Stripe.js failed to load');
      await stripe.redirectToCheckout({ sessionId: data.id });
    } catch (err: any) {
      console.error('Stripe payment error:', err);
      alert('Stripe payment failed: ' + (err.message || err));
    }
  }

  async mintBrick() {
    if (this.brick && this.brick.metadataUri && window.solana?.publicKey) {
      try {
        // Step 1: Payment
        const provider = window.solana;
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
}  

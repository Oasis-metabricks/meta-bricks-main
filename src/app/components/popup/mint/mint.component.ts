// src/app/components/mint/mint.component.ts
(window as any).Buffer = (window as any).Buffer || require('buffer').Buffer;
import { Component, Input, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { WalletService } from '../../../services/wallet.service';
import { BrickEventsService } from '../../../services/brick-events.service';
import { NftMintingService } from '../../../services/nft-minting.service';
import { BrickPerkService } from '../../../services/brick-perk.service';

const SOLANA_RPC = 'https://api.devnet.solana.com';
const METABRICKS_WALLET = 'FXD4ebDGGDG3L345MD2DYRQ4rxhuswJFZ1o3EASsQxhS';
const SOL_AMOUNT = 0.4;

@Component({
  selector: 'app-mint',
  templateUrl: './mint.component.html',
  styleUrls: ['./mint.component.scss']
})
export class MintComponent implements OnInit {
  @Input() brick: any;
  @Input() modalRef?: BsModalRef;

  constructor(
    private walletService: WalletService,
    private brickEvents: BrickEventsService,
    private nftMintingService: NftMintingService,
    private brickPerkService: BrickPerkService
  ) { }

  ngOnInit(): void {
    console.log('Mint component initialized with brick:', this.brick);
  }

  async mintBrick() {
    console.log('🎨 Starting brick minting process...', this.brick);

    if (!this.brick) {
      alert('No brick data available.');
      return;
    }
    
    // Get wallet provider (Phantom)
    const provider = (window as any).solana;
    if (!provider || !provider.isPhantom) {
      alert('Please install Phantom wallet to mint bricks.');
      return;
    }

    if (!provider.isConnected) {
      alert('Please connect your Phantom wallet first.');
      return;
    }

    try {
      // Step 1: Generate brick metadata with perks
      console.log('📝 Step 1: Generating brick metadata with perks...');
      const brickId = this.brick.id || this.brick.brickNumber?.replace('Brick ', '') || 1;
      const metadata = this.brickPerkService.generateBrickMetadata(brickId);
      
      if (!metadata) {
        throw new Error('Failed to generate brick metadata');
      }

      console.log('✅ Brick metadata generated:', {
        name: metadata.name,
        type: metadata.hiddenMetadata.type,
        rarity: metadata.hiddenMetadata.rarity,
        perks: metadata.perks.length,
        coreBenefits: metadata.coreBenefits
      });

      // Step 2: Show perks to user before payment
      console.log('👀 Step 2: Showing perks to user...');
      let perkMessage = `🎁 Your ${metadata.hiddenMetadata.type} brick includes:\n\n`;
      metadata.perks.forEach((perk: any, index: number) => {
        perkMessage += `${index + 1}. ${perk.name}\n`;
      });
      perkMessage += `\n💰 ${metadata.coreBenefits.tokenAirdrop} tokens + ${metadata.coreBenefits.tgeDiscount}% discount\n\n`;
      perkMessage += `Proceed with payment?`;

      if (!confirm(perkMessage)) {
        console.log('User cancelled minting');
        return;
      }

      // Step 3: Process payment
      console.log('💳 Step 3: Processing payment...');
      const connection = new Connection(SOLANA_RPC);
      const fromPubkey = new PublicKey(provider.publicKey.toString());
      const toPubkey = new PublicKey(METABRICKS_WALLET);
      
      let paymentSuccess = false;
      let signature = '';
      let attempts = 0;
      const maxAttempts = 3;
      
      while (!paymentSuccess && attempts < maxAttempts) {
        try {
          attempts++;
          console.log(`Payment attempt ${attempts}/${maxAttempts}...`);
          
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey,
            toPubkey,
            lamports: Math.round(SOL_AMOUNT * 1e9),
          })
        );
          
        transaction.feePayer = fromPubkey;
          
          // Get fresh blockhash right before sending to avoid expiration
          const { blockhash } = await connection.getLatestBlockhash('finalized');
        transaction.recentBlockhash = blockhash;
          
        const signed = await provider.signTransaction(transaction);
          signature = await connection.sendRawTransaction(signed.serialize());
        await connection.confirmTransaction(signature, 'confirmed');
          
          paymentSuccess = true;
          console.log('✅ Payment successful! Transaction:', signature);
          
        } catch (error: any) {
          console.log(`Payment attempt ${attempts} failed:`, error.message);
          
          if (attempts >= maxAttempts) {
            throw new Error(`Payment failed after ${maxAttempts} attempts: ${error.message}`);
          }
          
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      alert(`Payment successful! Now minting your NFT...`);

      // Step 4: Mint NFT using our new service
      console.log('🎨 Step 4: Minting NFT...');
      
      // First test the connection
      console.log('🔍 Testing Solana connection...');
      const connectionTest = await this.nftMintingService.testConnection();
      if (!connectionTest) {
        throw new Error('Solana connection test failed. Please check your wallet connection and try again.');
      }
      console.log('✅ Connection test passed, proceeding with minting...');
      
      // Test basic transaction signing with Phantom
      console.log('🔍 Testing basic transaction signing with Phantom...');
      const basicTransactionTest = await this.nftMintingService.testBasicTransaction();
      if (!basicTransactionTest) {
        throw new Error('Basic transaction signing test failed. Phantom wallet may have issues with transaction signing.');
      }
      console.log('✅ Basic transaction signing test passed, proceeding with minting...');
      
      // Use the new simplified interface - just pass the brick number
      const mintSignature = await this.nftMintingService.mintMetaBrickNFT(brickId);

      if (mintSignature) {
        console.log('🎉 NFT minting successful!', mintSignature);
        
        // Show simplified success message
        const successMessage = `🎉 MetaBrick NFT Minted Successfully!\n\n` +
          `🧱 ${metadata.name}\n` +
          `⭐ ${metadata.hiddenMetadata.type} (${metadata.hiddenMetadata.rarity})\n` +
          `🎁 ${metadata.perks.length} perks included\n\n` +
          `Your NFT is now in your wallet!\n\n` +
          `Transaction: ${mintSignature}`;

        alert(successMessage);
        
        // Notify other components
        this.brickEvents.notifyMinted();
        
        // Close modal if available
        if (this.modalRef) {
          this.modalRef.hide();
        }
      } else {
        throw new Error('NFT minting failed - no signature returned');
      }

    } catch (error: any) {
      console.error('❌ Error during minting process:', error);
      alert(`Minting failed: ${error.message}\n\nPlease try again or contact support.`);
    }
  }

  // Check payment status by polling the backend (keeping for Stripe payments)
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

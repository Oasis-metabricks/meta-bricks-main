// src/app/components/mint/mint.component.ts
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NFTMintingService, NFTMintData } from '../../../services/nft-minting.service';
import { BrickPerkService } from '../../../services/brick-perk.service';
import { OasisApiService, OASISNFTMintRequest } from '../../../services/oasis-api.service';
import { BrickEventsService } from '../../../services/brick-events.service';

export interface BrickMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  attributes: any[];
  perks: any[];
  coreBenefits: any;
  hiddenMetadata: any;
}

@Component({
  selector: 'app-mint',
  templateUrl: './mint.component.html',
  styleUrls: ['./mint.component.scss']
})
export class MintComponent implements OnInit {
  @Input() brick: any;
  @ViewChild('mintModal') modalRef: any;

  constructor(
    private brickEvents: BrickEventsService,
    private nftMintingService: NFTMintingService,
    private brickPerkService: BrickPerkService,
    private oasisApiService: OasisApiService
  ) { }

  ngOnInit(): void {
    console.log('Mint component initialized with brick:', this.brick);
  }

  async mintBrick() {
    console.log('🎨 Starting brick minting process via OASIS API...', this.brick);

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

      // Step 2: Show perks to user before minting
      console.log('👀 Step 2: Showing perks to user...');
      let perkMessage = `🎁 Your ${metadata.hiddenMetadata.type} brick includes:\n\n`;
      metadata.perks.forEach((perk: any, index: number) => {
        perkMessage += `${index + 1}. ${perk.name}\n`;
      });
      perkMessage += `\n💰 ${metadata.coreBenefits.tokenAirdrop} tokens + ${metadata.coreBenefits.tgeDiscount}% discount\n\n`;
      perkMessage += `Proceed with minting?`;

      if (!confirm(perkMessage)) {
        console.log('User cancelled minting');
        return;
      }

      // Step 3: Process payment via Phantom wallet
      console.log('💳 Step 3: Processing payment via Phantom wallet...');
      
      // Use wallet service for payment processing
      const paymentResult = await this.processPayment(provider, 0.4);
      
      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Payment failed');
      }
      
      console.log('✅ Payment successful! Transaction:', paymentResult.signature);
      alert(`Payment successful! Now minting your NFT...`);

      // Step 4: Mint NFT via OASIS API
      console.log('🎨 Step 4: Minting NFT via OASIS API...');
      const mintData: NFTMintData = {
        walletAddress: provider.publicKey.toString(),
        brickId: brickId,
        brickName: metadata.name
      };

      // Use simplified OASIS API flow
      const mintResult = await this.nftMintingService.mintNFT(mintData, provider.publicKey.toString());

      if (mintResult.success) {
        console.log('🎉 NFT minting successful!', mintResult);
        
        // Show success message
        const successMessage = `🎉 MetaBrick NFT Minted Successfully!\n\n` +
          `🧱 ${metadata.name}\n` +
          `⭐ ${metadata.hiddenMetadata.type} (${metadata.hiddenMetadata.rarity})\n` +
          `🎁 ${metadata.perks.length} perks included\n\n` +
          `Your NFT is now in your wallet!`;

        alert(successMessage);
        
        // Notify other components
        this.brickEvents.notifyMinted();
        
        // Close modal if available
        if (this.modalRef) {
          this.modalRef.hide();
        }

    } else {
        throw new Error(mintResult.error || 'Unknown minting error');
      }

    } catch (error: any) {
      console.error('❌ Error during minting process:', error);
      alert(`Minting failed: ${error.message}\n\nPlease try again or contact support.`);
    }
  }

  /**
   * Process payment via wallet
   */
  private async processPayment(wallet: any, amount: number): Promise<{ success: boolean; signature?: string; error?: string }> {
    try {
      // For now, simulate successful payment
      // In a real implementation, this would use the wallet service
      console.log(`Processing payment of ${amount} SOL via wallet`);
        
        return {
          success: true,
        signature: 'simulated-payment-signature-' + Date.now()
        };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Payment processing failed'
      };
    }
  }

  /**
   * Convert Pinata metadata to BrickMetadata format
   */
  private convertToBrickMetadata(pinataMetadata: any): BrickMetadata {
    return {
      name: pinataMetadata.name || 'Unknown Brick',
      symbol: pinataMetadata.symbol || 'MBRK',
      description: pinataMetadata.description || 'A unique MetaBrick',
      image: pinataMetadata.image || '',
      attributes: pinataMetadata.attributes || [],
      perks: pinataMetadata.perks || [],
      coreBenefits: pinataMetadata.coreBenefits || {},
      hiddenMetadata: pinataMetadata.hiddenMetadata || {}
    };
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

import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BulkBuyService, BulkBuyTier, BrickInventory, BulkBuyOrder } from '../../../services/bulk-buy.service';
import { WalletService } from '../../../services/wallet.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-bulk-buy',
  templateUrl: './bulk-buy.component.html',
  styleUrls: ['./bulk-buy.component.scss']
})
export class BulkBuyComponent implements OnInit {
  
  bulkBuyTiers: BulkBuyTier[] = [];
  selectedTier: BulkBuyTier | null = null;
  inventory: BrickInventory | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    public modalRef: BsModalRef, 
    private modalService: BsModalService,
    public bulkBuyService: BulkBuyService,
    private walletService: WalletService
  ) {}

  ngOnInit(): void {
    this.loadBulkBuyData();
  }

  private loadBulkBuyData(): void {
    this.isLoading = true;
    
    // Load tiers and inventory
    this.bulkBuyService.getBulkBuyTiers().subscribe({
      next: (tiers) => {
        this.bulkBuyTiers = tiers;
        this.loadInventory();
      },
      error: (error) => {
        console.error('Error loading tiers:', error);
        this.errorMessage = 'Failed to load bulk buy options';
        this.isLoading = false;
      }
    });
  }

  private loadInventory(): void {
    this.bulkBuyService.getInventory().subscribe({
      next: (inventory) => {
        this.inventory = inventory;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading inventory:', error);
        // Use fallback inventory data
        this.inventory = {
          totalBricks: 432,
          remainingBricks: 432,
          industrialBricks: 57,
          legendaryBricks: 8,
          reservedIndustrial: 0,
          reservedLegendary: 0
        };
        this.isLoading = false;
      }
    });
  }

  selectTier(tier: BulkBuyTier): void {
    this.selectedTier = tier;
    this.errorMessage = '';
    this.successMessage = '';
  }

  clearSelection(): void {
    this.selectedTier = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  async proceedToPurchase(): Promise<void> {
    if (!this.selectedTier || !this.inventory) {
      this.errorMessage = 'Please select a tier first';
      return;
    }

    // Check if wallet is connected
    const walletAddress = await this.walletService.checkWalletConnected();
    if (!walletAddress) {
      this.errorMessage = 'Please connect your wallet first';
      return;
    }

    // Check if tier can be fulfilled
    if (!this.bulkBuyService.canFulfillTier(this.selectedTier.name, this.inventory)) {
      this.errorMessage = 'This tier is currently unavailable due to limited inventory';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      // Reserve bricks for this order
      const walletAddressString = walletAddress.toString();
      const order = await firstValueFrom(this.bulkBuyService.reserveBricks(this.selectedTier.name, walletAddressString));
      
      // Create Stripe checkout session
      await this.createStripeCheckout(order);
      
    } catch (error) {
      console.error('Error in purchase process:', error);
      this.errorMessage = 'Failed to process purchase. Please try again.';
      this.isLoading = false;
    }
  }

  private async createStripeCheckout(order: any): Promise<void> {
    try {
      const checkoutData = {
        orderId: order.orderId,
        tierName: this.selectedTier!.name,
        buyerAddress: order.buyerAddress,
        totalPrice: this.selectedTier!.discountedPrice,
        quantity: this.selectedTier!.quantity
      };

      console.log('Creating Stripe checkout with data:', checkoutData);

      const checkoutSession = await firstValueFrom(
        this.bulkBuyService.createStripeCheckout(checkoutData)
      );
      
      if (checkoutSession.checkoutUrl) {
        // Redirect to Stripe checkout
        console.log('Redirecting to Stripe checkout:', checkoutSession.checkoutUrl);
        window.open(checkoutSession.checkoutUrl, '_blank');
        
        // Show success message
        this.successMessage = `Checkout session created! Redirecting to payment...`;
        
        // Close modal after a delay
        setTimeout(() => {
          this.modalRef.hide();
        }, 3000);
      } else {
        throw new Error('No checkout URL received from Stripe');
      }
      
    } catch (error) {
      console.error('Error creating Stripe checkout:', error);
      this.errorMessage = 'Failed to create checkout session. Please try again.';
      this.isLoading = false;
    }
  }

  private processPurchase(order: BulkBuyOrder): void {
    this.bulkBuyService.processPurchase(order).subscribe({
      next: (result) => {
        if (result.success) {
          this.successMessage = `Purchase successful! Order ID: ${order.orderId}`;
          // Update inventory
          this.bulkBuyService.updateInventoryAfterPurchase(order).subscribe({
            next: (updatedInventory) => {
              this.inventory = updatedInventory;
            },
            error: (error) => {
              console.error('Error updating inventory:', error);
            }
          });
          
          // Close modal after a delay
          setTimeout(() => {
            this.modalRef.hide();
          }, 3000);
        } else {
          this.errorMessage = 'Purchase failed. Please try again.';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error processing purchase:', error);
        this.errorMessage = 'Purchase failed. Please try again.';
        this.isLoading = false;
      }
    });
  }

  closeModal(): void {
    this.modalRef.hide();
  }

  trackByTier(index: number, tier: any): any {
    return tier.name;
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, firstValueFrom } from 'rxjs';

export interface BulkBuyTier {
  name: string;
  quantity: number;
  originalPrice: number;
  discountedPrice: number;
  discount: number;
  guarantee: string;
  savings: number;
  popular: boolean;
  guaranteedIndustrial: number;
  guaranteedLegendary: number;
}

export interface BrickInventory {
  totalBricks: number;
  remainingBricks: number;
  industrialBricks: number;
  legendaryBricks: number;
  reservedIndustrial: number;
  reservedLegendary: number;
}

export interface BulkBuyOrder {
  tier: BulkBuyTier;
  buyerAddress: string;
  totalPrice: number;
  guaranteedBricks: {
    industrial: number[];
    legendary: number[];
  };
  regularBricks: number;
  orderId: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class BulkBuyService {
  
  private readonly API_BASE = 'https://metabricks-backend-api-66e7d2abb038.herokuapp.com/api/bulk-buy'; // Backend API URL
  
  // Updated tiers with specific brick guarantees - $100 per brick base price
  private bulkBuyTiers: BulkBuyTier[] = [
    {
      name: 'Starter Pack',
      quantity: 3,
      originalPrice: 300, // 3 × $100
      discountedPrice: 285, // 5% discount
      discount: 5,
      guarantee: '1 guaranteed Industrial brick',
      savings: 15,
      popular: false,
      guaranteedIndustrial: 1,
      guaranteedLegendary: 0
    },
    {
      name: 'Collector Pack',
      quantity: 5,
      originalPrice: 500, // 5 × $100
      discountedPrice: 450, // 10% discount
      discount: 10,
      guarantee: '1 guaranteed Industrial brick',
      savings: 50,
      popular: false,
      guaranteedIndustrial: 1,
      guaranteedLegendary: 0
    },
    {
      name: 'Investor Pack',
      quantity: 10,
      originalPrice: 1000, // 10 × $100
      discountedPrice: 850, // 15% discount
      discount: 15,
      guarantee: '2 guaranteed Industrial bricks',
      savings: 150,
      popular: true,
      guaranteedIndustrial: 2,
      guaranteedLegendary: 0
    },
    {
      name: 'Whale Pack',
      quantity: 20,
      originalPrice: 2000, // 20 × $100
      discountedPrice: 1600, // 20% discount
      discount: 20,
      guarantee: '3 guaranteed Industrial bricks + 1 guaranteed Legendary brick + Permanent Hall of Fame induction',
      savings: 400,
      popular: false,
      guaranteedIndustrial: 3,
      guaranteedLegendary: 1
    },
    {
      name: 'MetaBricks Master',
      quantity: 50,
      originalPrice: 5000, // 50 × $100
      discountedPrice: 3750, // 25% discount
      discount: 25,
      guarantee: '5 guaranteed Industrial bricks + 2 guaranteed Legendary bricks + Permanent Hall of Fame induction',
      savings: 1250,
      popular: false,
      guaranteedIndustrial: 5,
      guaranteedLegendary: 2
    }
  ];

  constructor(private http: HttpClient) {}

  // Get available tiers
  getBulkBuyTiers(): Observable<BulkBuyTier[]> {
    return of(this.bulkBuyTiers);
  }

  // Get current inventory
  getInventory(): Observable<BrickInventory> {
    // Return mock inventory data since backend endpoints don't exist yet
    const mockInventory: BrickInventory = {
      totalBricks: 432,
      remainingBricks: 432,
      industrialBricks: 57,
      legendaryBricks: 8,
      reservedIndustrial: 0,
      reservedLegendary: 0
    };
    return of(mockInventory);
  }

  // Check if a tier can be fulfilled
  canFulfillTier(tierName: string, inventory: BrickInventory): boolean {
    const tier = this.bulkBuyTiers.find(t => t.name === tierName);
    if (!tier) return false;
    
    const availableIndustrial = inventory.industrialBricks - inventory.reservedIndustrial;
    const availableLegendary = inventory.legendaryBricks - inventory.reservedLegendary;
    
    return availableIndustrial >= tier.guaranteedIndustrial && 
           availableLegendary >= tier.guaranteedLegendary;
  }

  // Reserve bricks for a bulk buy order
  reserveBricks(tierName: string, buyerAddress: string): Observable<BulkBuyOrder> {
    const tier = this.bulkBuyTiers.find(t => t.name === tierName);
    if (!tier) {
      throw new Error('Invalid tier name');
    }

    const order: BulkBuyOrder = {
      tier,
      buyerAddress,
      totalPrice: tier.discountedPrice,
      guaranteedBricks: {
        industrial: this.generateBrickIds(tier.guaranteedIndustrial, 'industrial'),
        legendary: this.generateBrickIds(tier.guaranteedLegendary, 'legendary')
      },
      regularBricks: tier.quantity - tier.guaranteedIndustrial - tier.guaranteedLegendary,
      orderId: this.generateOrderId(),
      timestamp: new Date()
    };

    // Return mock order since backend doesn't exist yet
    return of(order);
  }

  // Process the actual purchase
  processPurchase(order: BulkBuyOrder): Observable<{success: boolean, transactionHash?: string}> {
    // Mock successful purchase since backend doesn't exist yet
    return of({ success: true, transactionHash: 'mock-tx-' + Date.now() });
  }

  // Create Stripe checkout session for bulk buy
  createStripeCheckout(orderData: { orderId: string, tierName: string, buyerAddress: string }): Observable<any> {
    // Mock Stripe checkout response since backend doesn't exist yet
    const mockCheckout = {
      checkoutUrl: `https://checkout.stripe.com/pay/mock_${Date.now()}#fid=test`,
      sessionId: `cs_test_${Date.now()}`
    };
    return of(mockCheckout);
  }

  // Get order status
  getOrderStatus(orderId: string): Observable<{status: string, details?: any}> {
    return this.http.get<{status: string, details?: any}>(`${this.API_BASE}/order/${orderId}`);
  }

  // Cancel reservation (if needed)
  cancelReservation(orderId: string): Observable<{success: boolean}> {
    return this.http.delete<{success: boolean}>(`${this.API_BASE}/reserve/${orderId}`);
  }

  // Generate unique order ID
  private generateOrderId(): string {
    return `BB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Generate brick IDs for guaranteed bricks
  private generateBrickIds(count: number, type: 'industrial' | 'legendary'): number[] {
    // This would integrate with your brick generation system
    // For now, returning placeholder IDs
    const ids: number[] = [];
    for (let i = 0; i < count; i++) {
      ids.push(Math.floor(Math.random() * 1000) + 1);
    }
    return ids;
  }

  // Update inventory after successful purchase
  updateInventoryAfterPurchase(order: BulkBuyOrder): Observable<BrickInventory> {
    return this.http.put<BrickInventory>(`${this.API_BASE}/inventory/update`, order);
  }

  // Get buyer's order history
  getBuyerOrders(buyerAddress: string): Observable<BulkBuyOrder[]> {
    return this.http.get<BulkBuyOrder[]>(`${this.API_BASE}/orders/${buyerAddress}`);
  }
}

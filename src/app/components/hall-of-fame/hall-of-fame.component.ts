import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Supporter {
  walletAddress: string;
  bricksPurchased: number[];
  totalContribution: number;
  firstPurchaseDate: string;
  latestPurchaseDate: string;
  supporterTier: string;
  rank: number;
  rankClass: string;
}

@Component({
  selector: 'app-hall-of-fame',
  templateUrl: './hall-of-fame.component.html',
  styleUrls: ['./hall-of-fame.component.scss']
})
export class HallOfFameComponent implements OnInit {
  supporters: Supporter[] = [];
  loading = true;
  error = '';
  totalSupporters = 0;
  totalRevenue = 0;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchSupporters();
  }

  async fetchSupporters(): Promise<void> {
    try {
      this.loading = true;
      
      // Fetch all bricks to get supporter information
      const response = await this.http.get<{ minted: string[] }>('https://metabricks-backend-api-66e7d2abb038.herokuapp.com/minted-bricks').toPromise();
      
      if (response && response.minted) {
        // Group bricks by wallet address
        const supporterMap = new Map<string, Supporter>();
        
        for (const metadataUri of response.minted) {
          // Extract brick ID from metadata URI
          const match = metadataUri.match(/(\d+)\.json$/);
          if (match) {
            const brickId = parseInt(match[1]);
            
            // For now, we'll use a placeholder wallet address since we need to enhance the backend
            // In the future, this will come from the actual purchase records
            const walletAddress = `Supporter_${brickId.toString().padStart(3, '0')}`;
            
            if (!supporterMap.has(walletAddress)) {
              supporterMap.set(walletAddress, {
                walletAddress,
                bricksPurchased: [],
                totalContribution: 0,
                firstPurchaseDate: new Date().toISOString(),
                latestPurchaseDate: new Date().toISOString(),
                supporterTier: 'Early Supporter',
                rank: 0, // Will be set later
                rankClass: 'metaboss' // Will be updated later
              });
            }
            
            const supporter = supporterMap.get(walletAddress)!;
            supporter.bricksPurchased.push(brickId);
            supporter.totalContribution += 50; // Each brick costs $50
          }
        }
        
        // Convert to array and sort by contribution amount
        this.supporters = Array.from(supporterMap.values())
          .sort((a, b) => b.totalContribution - a.totalContribution);
        
        // Calculate totals
        this.totalSupporters = this.supporters.length;
        this.totalRevenue = this.supporters.reduce((sum, s) => sum + s.totalContribution, 0);
        
        // Assign supporter tiers
        this.assignSupporterTiers();
      }
    } catch (err: any) {
      console.error('Failed to fetch supporters:', err);
      this.error = 'Failed to load supporter data. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  assignSupporterTiers(): void {
    this.supporters.forEach((supporter, index) => {
      if (index === 0) {
        supporter.supporterTier = 'Top MetaBoss';
        supporter.rank = 1;
        supporter.rankClass = 'top-metaboss';
      } else if (index < 3) {
        supporter.supporterTier = 'Elite MetaBoss';
        supporter.rank = index + 1;
        supporter.rankClass = 'elite-metaboss';
      } else if (index < 10) {
        supporter.supporterTier = 'Gold MetaBoss';
        supporter.rank = index + 1;
        supporter.rankClass = 'gold-metaboss';
      } else if (index < 25) {
        supporter.supporterTier = 'Silver MetaBoss';
        supporter.rank = index + 1;
        supporter.rankClass = 'silver-metaboss';
      } else {
        supporter.supporterTier = 'MetaBoss';
        supporter.rank = index + 1;
        supporter.rankClass = 'metaboss';
      }
    });
  }

  getShortWalletAddress(walletAddress: string): string {
    if (walletAddress.startsWith('Supporter_')) {
      return walletAddress;
    }
    return walletAddress.length > 10 
      ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
      : walletAddress;
  }

  getBricksDisplay(bricks: number[]): string {
    if (bricks.length === 1) {
      return `Brick #${bricks[0]}`;
    } else if (bricks.length <= 3) {
      return bricks.map(id => `#${id}`).join(', ');
    } else {
      return `${bricks.length} Bricks (${bricks.slice(0, 2).map(id => `#${id}`).join(', ')}...)`;
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  trackBySupporter(index: number, supporter: Supporter): string {
    return supporter.walletAddress;
  }
}

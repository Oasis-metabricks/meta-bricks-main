import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BrickDetailsComponent } from '../popup/brick-details/brick-details.component';
import { WhatComponent } from '../popup/what/what.component';
import { HowComponent } from '../popup/how/how.component';
import { WhitepaperComponent } from '../popup/whitepaper/whitepaper.component';
import { DeliverableComponent } from '../popup/deliverable/deliverable.component';
import { HttpClient } from '@angular/common/http';
import { BrickEventsService } from '../../services/brick-events.service';
import { WalletService } from '../../services/wallet.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  allBricks: any[] = [];
  mintedBricks: string[] = [];
  modalRef!: BsModalRef;
  walletAddress: string | null = null;
  isOnRightSide: boolean = false;
  isHamburgerOpen: boolean = false;
  
  // Brick count properties
  destroyedCount: number = 0;
  leftCount: number = 432; // Total bricks
  
  // Position tracking for brick count box
  isCountOnLeftSide: boolean = false;
  
  // Position tracking for navigation box
  isNavOnRightSide: boolean = false;

  constructor(
    private modalService: BsModalService, 
    private http: HttpClient, 
    private brickEvents: BrickEventsService,
    private walletService: WalletService
  ) {}

  ngOnInit(): void {
    this.resetWall();
    this.fetchMintedBricks();
    this.checkWalletConnection();
    this.brickEvents.minted$.subscribe(() => {
      // Find the most recently minted brick and trigger explosion
      const lastMinted = this.mintedBricks[this.mintedBricks.length - 1];
      const brick = this.allBricks.find(b => b.metadataUri === lastMinted);
      if (brick) this.triggerExplosion(brick);
      this.fetchMintedBricks();
    });
  }

  async resetMintedBricks(): Promise<void> {
    // Call a backend endpoint to reset mintedBricks.json
    try {
      await this.http.post('https://metabricks-backend-api-66e7d2abb038.herokuapp.com/reset-minted-bricks', {}).toPromise();
    } catch (err) {
      console.error('Failed to reset minted bricks', err);
    }
  }

  resetWall(): void {
    this.allBricks = [];
    const rows = 24;
    const cols = 18;
    // Updated to use the new randomized MetaBricks IPFS hash
    const METADATA_CID = 'bafybeihkspp2kxsz4moylkgjpkdwm4sbafqluqmtzh3hy7x42jhvx6n5ym';
    
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        let isOffsetRow = i % 2 !== 0;
        let offsetAdjustment = isOffsetRow ? 0.5 : 0;
        const id = i * cols + j;
        
        // Enable all 432 bricks with metadata (not just first 30)
        const brickNumber = id + 1;
        const metadataUri = brickNumber <= 432 ? `https://gateway.pinata.cloud/ipfs/${METADATA_CID}/${brickNumber}.json` : null;
        
        this.allBricks.push({
          id: id,
          brickNumber: `Brick ${brickNumber}`,
          mintPrice: '0.4 SOL',
          position: `X${j + offsetAdjustment + 1}, Y${i + 1}`,
          offset: isOffsetRow,
          metadataUri: metadataUri,
          // Add brick number for easy reference
          brickNumberForMetadata: brickNumber <= 432 ? brickNumber : null,
          seriesNumber: brickNumber
        });
      }
    }
  }

  fetchMintedBricks(): void {
    this.http.get<{ minted: string[] }>('https://metabricks-backend-api-66e7d2abb038.herokuapp.com/minted-bricks').subscribe({
      next: (res) => {
        this.mintedBricks = res.minted;
        // Update brick counts
        this.destroyedCount = this.mintedBricks.length;
        this.leftCount = 432 - this.destroyedCount;
      },
      error: (err) => {
        console.error('Failed to fetch minted bricks', err);
      }
    });
  }

  isMinted(brick: any): boolean {
    return !!brick.metadataUri && this.mintedBricks.includes(brick.metadataUri);
  }

  // Call this after a successful mint
  triggerExplosion(brick: any): void {
    brick.exploding = true;
    // Play sound
    const audio = new Audio('assets/explosion.mp3');
    audio.volume = 0.5;
    audio.play();
    setTimeout(() => {
      brick.exploding = false;
    }, 700); // Match animation duration
  }

  // Check wallet connection status
  async checkWalletConnection(): Promise<void> {
    try {
      const publicKey = await this.walletService.checkWalletConnected();
      this.walletAddress = publicKey ? publicKey.toString() : null;
    } catch (error) {
      console.error('Error checking wallet connection:', error);
      this.walletAddress = null;
    }
  }

  // Connect wallet
  async connectWallet(): Promise<void> {
    try {
      const result = await this.walletService.connectWallet();
      if (result) {
        this.walletAddress = result.publicKey.toString();
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  }

  filterBricks(): void {
    if (!this.mintedBricks) this.mintedBricks = [];
    console.log('Minted list:', this.mintedBricks);
    console.log('All wall brick URIs:', this.allBricks.map(b => b.metadataUri));
    // this.bricks = this.allBricks.filter(brick => brick.metadataUri && !this.mintedBricks.includes(brick.metadataUri));
  }

  generateBricks(): void {
    const rows = 24; // 24 rows as mentioned
    const cols = 18; // 18 columns for each row
    // Updated to use the new randomized MetaBricks IPFS hash
    const METADATA_CID = 'bafybeihkspp2kxsz4moylkgjpkdwm4sbafqluqmtzh3hy7x42jhvx6n5ym';
    let index = 0;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        let isOffsetRow = i % 2 !== 0;
        let offsetAdjustment = isOffsetRow ? 0.5 : 0; // Adjust X position by half a brick width on odd rows
        const id = i * cols + j;
        const brickNumber = id + 1;
        
        // Enable all 432 bricks with metadata
        if (brickNumber <= 432) {
          // this.bricks.push({ // This line was removed as per the edit hint
          //   id: id,
          //   brickNumber: `Brick ${brickNumber}`,
          //   mintPrice: '0.4 SOL',
          //   position: `X${j + offsetAdjustment + 1}, Y${i + 1}`,
          //   offset: isOffsetRow, // Adding the offset property for conditional styling
          //   metadataUri: `https://gateway.pinata.cloud/ipfs/${METADATA_CID}/${brickNumber}.json`
          // });
        }
      }
    }
  }
  

  openBrickModal(brick: any): void {
    console.log('Clicked brick metadataUri:', brick.metadataUri);
    this.modalRef = this.modalService.show(BrickDetailsComponent, {
      class: 'modal-dialog-slide-up',
      initialState: {
        brick: brick  // Pass the clicked brick's data to the modal
      }
    });
  }

  openModal(type: string): void {
    let component: any;
    
    switch (type) {
      case 'what':
        component = this.modalService.show(WhatComponent);
        break;
      case 'how':
        component = this.modalService.show(HowComponent);
        break;
      case 'whitepaper':
        component = this.modalService.show(WhitepaperComponent);
        break;
      case 'deliverable':
        component = this.modalService.show(DeliverableComponent);
        break;
    }
  }

  togglePosition(): void {
    this.isOnRightSide = !this.isOnRightSide;
  }

  toggleHamburgerMenu(): void {
    this.isHamburgerOpen = !this.isHamburgerOpen;
  }

  toggleCountPosition(): void {
    this.isCountOnLeftSide = !this.isCountOnLeftSide;
  }

  toggleNavPosition(): void {
    this.isNavOnRightSide = !this.isNavOnRightSide;
  }

  forceRefresh(): void {
    this.fetchMintedBricks();
  }
}

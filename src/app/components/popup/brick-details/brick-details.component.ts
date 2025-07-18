import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ShareReferralsComponent } from '../share-referrals/share-referrals.component'; // Adjust path as necessary
import { MintComponent } from '../mint/mint.component'; // Adjust path as necessary
import { WalletService } from '../../../services/wallet.service';

@Component({
  selector: 'app-brick-details',
  templateUrl: './brick-details.component.html',
  styleUrls: ['./brick-details.component.scss']
})
export class BrickDetailsComponent implements OnInit {
  brick: any;  // Ensure it's ready to receive data
  mintedBricks: string[] = [];
  isMinted: boolean = false;
  attributes: any[] = [];
  loadingAttributes: boolean = false;
  attributesError: string | null = null;

  constructor(public modalRef: BsModalRef, private modalService: BsModalService, private walletService: WalletService) {} // Inject BsModalService

  ngOnInit(): void {
    console.log(this.brick);  // Check what's inside the brick object
    if (!this.brick) {
      console.error('Brick data is not available');
    }
    // Fetch minted bricks
    this.walletService.getMintedBricks().subscribe({
      next: (res) => {
        this.mintedBricks = res.minted;
        this.isMinted = this.brick && this.brick.metadataUri && this.mintedBricks.includes(this.brick.metadataUri);
      },
      error: (err) => {
        console.error('Failed to fetch minted bricks', err);
      }
    });
    // Fetch NFT attributes from metadataUri
    this.fetchAttributes();
  }

  async fetchAttributes() {
    this.loadingAttributes = true;
    this.attributesError = null;
    this.attributes = [];
    if (this.brick && this.brick.metadataUri) {
      try {
        const res = await fetch(this.brick.metadataUri);
        if (!res.ok) throw new Error('Failed to fetch metadata');
        const metadata = await res.json();
        this.attributes = Array.isArray(metadata.attributes) ? metadata.attributes : [];
      } catch (err: any) {
        this.attributesError = err.message || 'Failed to load attributes';
      }
    }
    this.loadingAttributes = false;
  }

  openShareModal(): void {
    // Logic for opening the share modal
    this.modalRef = this.modalService.show(ShareReferralsComponent, {
      class: 'modal-dialog-slide-up' // This class can be adjusted based on your modal CSS
    });
  }

  openMintModal(): void {
    this.modalRef = this.modalService.show(MintComponent, {
      class: 'modal-dialog-slide-up', // This class can be adjusted based on your modal CSS
      initialState: {
        brick: { ...this.brick, metadataUri: this.brick.metadataUri }
      }
    });
  }
}

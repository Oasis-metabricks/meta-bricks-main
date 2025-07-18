import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BrickDetailsComponent } from '../popup/brick-details/brick-details.component';
import { HttpClient } from '@angular/common/http';
import { BrickEventsService } from '../../services/brick-events.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  allBricks: any[] = [];
  mintedBricks: string[] = [];
  modalRef!: BsModalRef;

  constructor(private modalService: BsModalService, private http: HttpClient, private brickEvents: BrickEventsService) {}

  ngOnInit(): void {
    this.resetWall();
    this.fetchMintedBricks();
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
      await this.http.post('http://localhost:3001/reset-minted-bricks', {}).toPromise();
    } catch (err) {
      console.error('Failed to reset minted bricks', err);
    }
  }

  resetWall(): void {
    this.allBricks = [];
    const rows = 24;
    const cols = 18;
    const METADATA_CID = 'bafybeifkewu2rzq7mhit3cw3lhnm3zdfn2c5ijx3zb4t56ued6g5i3msm4';
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        let isOffsetRow = i % 2 !== 0;
        let offsetAdjustment = isOffsetRow ? 0.5 : 0;
        const id = i * cols + j;
        this.allBricks.push({
          id: id,
          brickNumber: `Brick ${id + 1}`,
          mintPrice: '0.4 SOL',
          position: `X${j + offsetAdjustment + 1}, Y${i + 1}`,
          offset: isOffsetRow,
          metadataUri: id < 30 ? `https://gateway.pinata.cloud/ipfs/${METADATA_CID}/${id}.json` : null
        });
      }
    }
  }

  fetchMintedBricks(): void {
    this.http.get<{ minted: string[] }>('http://localhost:3001/minted-bricks').subscribe({
      next: (res) => {
        this.mintedBricks = res.minted;
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

  filterBricks(): void {
    if (!this.mintedBricks) this.mintedBricks = [];
    console.log('Minted list:', this.mintedBricks);
    console.log('All wall brick URIs:', this.allBricks.map(b => b.metadataUri));
    // this.bricks = this.allBricks.filter(brick => brick.metadataUri && !this.mintedBricks.includes(brick.metadataUri));
  }

  generateBricks(): void {
    const rows = 24; // 24 rows as mentioned
    const cols = 18; // 18 columns for each row
    const METADATA_CID = 'bafybeifkewu2rzq7mhit3cw3lhnm3zdfn2c5ijx3zb4t56ued6g5i3msm4';
    let index = 0;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        let isOffsetRow = i % 2 !== 0;
        let offsetAdjustment = isOffsetRow ? 0.5 : 0; // Adjust X position by half a brick width on odd rows
        const id = i * cols + j;
        // this.bricks.push({ // This line was removed as per the edit hint
        //   id: id,
        //   brickNumber: `Brick ${id + 1}`,
        //   mintPrice: '0.4 SOL',
        //   position: `X${j + offsetAdjustment + 1}, Y${i + 1}`,
        //   offset: isOffsetRow, // Adding the offset property for conditional styling
        //   metadataUri: id < 30 ? `https://gateway.pinata.cloud/ipfs/${METADATA_CID}/${id}.json` : null
        // });
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
}

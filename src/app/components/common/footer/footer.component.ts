import { Component } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { WhatComponent } from '../../popup/what/what.component';
import { HowComponent } from '../../popup/how/how.component';
import { WhitepaperComponent } from '../../popup/whitepaper/whitepaper.component';
import { DeliverableComponent } from '../../popup/deliverable/deliverable.component';
import { HttpClient } from '@angular/common/http';
import { BrickEventsService } from 'src/app/services/brick-events.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  modalRef!: BsModalRef;
  destroyedCount: number = 0;
  leftCount: number = 0;
  readonly TOTAL_BRICKS = 24 * 18;

  constructor(private modalService: BsModalService, private http: HttpClient, private brickEvents: BrickEventsService) {
    this.fetchMintedBricks();
    this.brickEvents.minted$.subscribe(() => {
      this.fetchMintedBricks();
    });
  }

  fetchMintedBricks(): void {
    this.http.get<{ minted: string[] }>('https://metabricks-backend-api-66e7d2abb038.herokuapp.com/minted-bricks').subscribe({
      next: (res) => {
        this.destroyedCount = res.minted.length;
        this.leftCount = this.TOTAL_BRICKS - this.destroyedCount;
      },
      error: (err) => {
        console.error('Failed to fetch minted bricks', err);
      }
    });
  }

  openWhatModal() {
    this.modalRef = this.modalService.show(WhatComponent);
  }

  openHowModal() {
    this.modalRef = this.modalService.show(HowComponent);
  }

  openWhitepaperModal() {
    this.modalRef = this.modalService.show(WhitepaperComponent);
  }

  openDeliverableModal() {
    this.modalRef = this.modalService.show(DeliverableComponent);
  }
}

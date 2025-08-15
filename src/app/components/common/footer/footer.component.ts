import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BrickEventsService } from 'src/app/services/brick-events.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  destroyedCount: number = 0;
  leftCount: number = 0;
  readonly TOTAL_BRICKS = 24 * 18;

  constructor(private http: HttpClient, private brickEvents: BrickEventsService) {
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
}

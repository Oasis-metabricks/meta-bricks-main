import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BrickEventsService } from '../../services/brick-events.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
  animations: [
    trigger('brickAnim', [
      transition(':leave', [
        style({ filter: 'none', opacity: 1, transform: 'scale(1)' }),
        animate('500ms ease', style({ filter: 'url(#pixelate)', opacity: 0, transform: 'scale(0.8)' }))
      ])
    ])
  ]
})
export class GalleryComponent implements OnInit {
  allBricks: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Fetch all bricks
    this.http.get<any[]>('https://metabricks-backend-api-66e7d2abb038.herokuapp.com/bricks').subscribe({
      next: (bricks) => {
        this.allBricks = bricks;
      },
      error: (err) => {
        console.error('Failed to fetch bricks', err);
      }
    });
  }

  // Animation helpers
  trackByBrick(index: number, brick: any) {
    return brick.id || brick.metadataUri || index;
  }
}

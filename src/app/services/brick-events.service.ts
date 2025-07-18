import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BrickEventsService {
  private mintedSubject = new Subject<void>();
  minted$ = this.mintedSubject.asObservable();

  notifyMinted() {
    this.mintedSubject.next();
  }
} 
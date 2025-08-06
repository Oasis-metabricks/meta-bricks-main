import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-whitepaper',
  templateUrl: './whitepaper.component.html',
  styleUrls: ['./whitepaper.component.scss']
})
export class WhitepaperComponent {
  constructor(public modalRef: BsModalRef) {}
  
  goBack() {
    this.modalRef.hide();
  }
}

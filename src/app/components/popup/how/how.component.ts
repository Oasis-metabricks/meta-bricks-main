import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-how',
  templateUrl: './how.component.html',
  styleUrls: ['./how.component.scss']
})
export class HowComponent {
  constructor(public modalRef: BsModalRef) {}
  
  goBack() {
    console.log('goBack method called');
    this.modalRef.hide();
  }
}

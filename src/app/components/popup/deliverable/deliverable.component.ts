import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-deliverable',
  templateUrl: './deliverable.component.html',
  styleUrls: ['./deliverable.component.scss']
})
export class DeliverableComponent {
  constructor(public modalRef: BsModalRef) {}
  
  goBack() {
    this.modalRef.hide();
  }
}

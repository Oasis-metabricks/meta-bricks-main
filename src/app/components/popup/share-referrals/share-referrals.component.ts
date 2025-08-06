import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-share-referrals',
  templateUrl: './share-referrals.component.html',
  styleUrls: ['./share-referrals.component.scss']
})
export class ShareReferralsComponent {
  showContent:boolean = true;
  
  constructor(public modalRef: BsModalRef) {}
  
  goBack() {
    this.modalRef.hide();
  }
}

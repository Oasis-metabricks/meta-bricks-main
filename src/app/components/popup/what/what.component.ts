
import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-what',
  templateUrl: './what.component.html',
  styleUrls: ['./what.component.scss']
})
export class WhatComponent {
  constructor(public modalRef: BsModalRef) {}
  
  goBack() {
    this.modalRef.hide();
  }
}

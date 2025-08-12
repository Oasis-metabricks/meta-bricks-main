import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { HomeRoutingModule } from './home-routing.module';
import { GalleryComponent } from '../gallery/gallery.component';
import { LandingComponent } from '../landing/landing.component';
import { HeaderComponent } from '../common/header/header.component';
import { FooterComponent } from '../common/footer/footer.component';

import { ModalModule } from 'ngx-bootstrap/modal';
import { WhatComponent } from '../popup/what/what.component';
import { HowComponent } from '../popup/how/how.component';
import { WhitepaperComponent } from '../popup/whitepaper/whitepaper.component';
import { DeliverableComponent } from '../popup/deliverable/deliverable.component';
import { BrickDetailsComponent } from '../popup/brick-details/brick-details.component';
import { MintComponent } from '../popup/mint/mint.component';
import { ShareReferralsComponent } from '../popup/share-referrals/share-referrals.component';
import { HallOfFameComponent } from '../hall-of-fame/hall-of-fame.component';
import { WalletService } from '../../services/wallet.service'; 


@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    LandingComponent,
    GalleryComponent,
    HallOfFameComponent,
    WhatComponent,
    HowComponent,
    WhitepaperComponent,
    DeliverableComponent,
    BrickDetailsComponent,
    MintComponent,
    ShareReferralsComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    ModalModule.forRoot()
  ],
  providers: [WalletService]

})
export class HomeModule { }

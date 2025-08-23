import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { MetabricksWalletComponent } from './metabricks-wallet.component';
import { OASISWalletService } from './oasis-wallet.service';
import { WalletCoreService } from './wallet-core.service';
import { AvatarWalletService } from './avatar-wallet.service';

@NgModule({
  declarations: [
    MetabricksWalletComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  exports: [
    MetabricksWalletComponent
  ],
  providers: [
    OASISWalletService,
    WalletCoreService,
    AvatarWalletService
  ]
})
export class MetabricksWalletModule { }

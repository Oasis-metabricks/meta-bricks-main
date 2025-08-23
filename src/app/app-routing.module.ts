import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '', redirectTo: 'home', pathMatch: 'full'
  },
  {
    path: 'home', loadChildren: () => import('./components/home/home.module').then(m => m.HomeModule)
  },
  {
    path: 'wallet', loadChildren: () => import('./components/metabricks-wallet/metabricks-wallet.module').then(m => m.MetabricksWalletModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
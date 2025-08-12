import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from '../landing/landing.component';
import { HomeComponent } from './home.component';
import { GalleryComponent } from '../gallery/gallery.component';
import { HallOfFameComponent } from '../hall-of-fame/hall-of-fame.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      {
        path: '',
        component: LandingComponent
      },
      {
        path: 'gallery',
        component: GalleryComponent
      },
      {
        path: 'hall-of-fame',
        component: HallOfFameComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }

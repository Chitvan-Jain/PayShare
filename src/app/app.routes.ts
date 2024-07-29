import { Routes } from '@angular/router';
import { MemberListComponent } from './member-list/member-list.component';
import { HomeComponent } from './home/home.component';
import { FoodListComponent } from './food-list/food-list.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  { path: 'members', component: MemberListComponent },
  {
    path:'foodlist', component:FoodListComponent
  }
];


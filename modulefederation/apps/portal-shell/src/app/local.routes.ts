// DO NOT TOUCH THIS FILE
// GENERATED BY MICROFRONTEND GENERATOR V1.0

import { Routes, RouterModule } from '@angular/router';

import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

import { HomeComponent } from './home/home.component';

export const localRoutes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: HomeComponent,
    children: [],
  },

  {
    path: '**',
    component: PageNotFoundComponent,
  },
];

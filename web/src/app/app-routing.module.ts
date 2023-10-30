import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ComponentsComponent } from './components/components.component';
import { HomeComponent } from './home/home-component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ComponentDetailsComponent } from './components/component-details.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { 
    path: 'components',        
    component: ComponentsComponent,
    children: [
      {
        path: ':component',
        component: ComponentDetailsComponent
      }
    ] 
  },
  { path: '',   redirectTo: '/home', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(
    routes,
    { enableTracing: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
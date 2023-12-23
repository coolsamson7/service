import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { localRoutes } from "./local.routes";

@NgModule({
  imports: [RouterModule.forRoot(localRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}

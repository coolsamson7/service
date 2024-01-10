import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LazyComponent } from "./lazy-child.component";
import { LazyChildRouterModule } from "./lazy-child-router.module";


@NgModule({
  declarations: [LazyComponent],
  imports: [
    CommonModule,
    LazyChildRouterModule
  ],
  providers: [],
})
export class LazyChildModule {
}

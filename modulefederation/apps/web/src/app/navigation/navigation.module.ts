import { NgModule } from "@angular/core";
import { HeaderComponent } from "./header/header.component";
import { SideNavigationComponent } from "./sidenav/sidenav.component";
import { SublevelMenuComponent } from "./sidenav/sublevel-menu.component";
import { MatMenuModule } from "@angular/material/menu";
import { MatIconModule } from "@angular/material/icon";
import { MatToolbarModule } from "@angular/material/toolbar";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { HamburgerComponent } from "./burger/hamburger.component";
import { MatButtonModule } from "@angular/material/button";
import { CurrentFeatureComponent } from "./feature/current-feature.component";
import { CurrentUserComponent } from "./user/user.component";

@NgModule({
  declarations: [
    SideNavigationComponent,
    HeaderComponent,
    HamburgerComponent,
    SublevelMenuComponent,
    CurrentFeatureComponent,
    CurrentUserComponent
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatToolbarModule,
    RouterModule
  ],
  exports: [
    HeaderComponent,
    HamburgerComponent,
    SideNavigationComponent,
    CurrentFeatureComponent,
    CurrentUserComponent
  ]
})
export class NavigationModule {
}

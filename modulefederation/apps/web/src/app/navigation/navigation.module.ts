import { NgModule } from "@angular/core";
import { HeaderComponent } from "./header/header.component";
import { SublevelMenuComponent } from "./features/sublevel-menu.component";
import { MatMenuModule } from "@angular/material/menu";
import { MatIconModule } from "@angular/material/icon";
import { MatToolbarModule } from "@angular/material/toolbar";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { BurgerComponent } from "./burger/burger.component";
import { MatButtonModule } from "@angular/material/button";
import { CurrentFeatureComponent } from "./feature/current-feature.component";
import { CurrentUserComponent } from "./user/user.component";
import { FeatureNavigationComponent } from "./features/feature-navigation.component";

@NgModule({
    declarations: [
        FeatureNavigationComponent,
        HeaderComponent,
        BurgerComponent,
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
        BurgerComponent,
        FeatureNavigationComponent,
        CurrentFeatureComponent,
        CurrentUserComponent
    ]
})
export class NavigationModule {
}

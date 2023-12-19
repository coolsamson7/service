import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {PortalModule} from "@modulefederation/portal";
import { PrivatePortalComponent } from "./private-portal-component";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";
import { RouterLink, RouterOutlet } from "@angular/router";
import { PrivatePortalRouterModule } from "./private-portal-router.module";

@NgModule({
    declarations: [PrivatePortalComponent],
    imports: [
        CommonModule,
        PortalModule,
        MatToolbarModule,
        MatButtonModule,

        RouterOutlet,
        RouterLink,

        PrivatePortalRouterModule
    ],
    providers: [],
})
export class PrivatePortalModule {
}

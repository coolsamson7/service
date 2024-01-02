import { Component } from "@angular/core";
import { Feature } from "@modulefederation/portal";
import { AnalyticsDisableModule } from "@angular/cli/src/commands/analytics/settings/cli";

@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
@Feature({
    id: "home",
    label: "Home", icon: "home",
    visibility: ["public", "private"],
    categories: [],
    tags: ["navigation"],
    permissions: []
})
export class HomeComponent {
  value = 10
  me ="Andi"
  today = new Date()
}

import { Component } from "@angular/core";
import { Feature } from "@modulefederation/portal";
import { PortalAdministrationService } from "../portal/service";

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

  constructor(private portalAdministrationService : PortalAdministrationService) {
  }

  throwString() {
    throw "ouch"
  }

  throwError() {
    throw new Error("aua")
  }

  throwDeclaredServerError() {
    this.portalAdministrationService.throwDeclaredException().subscribe(_ => console.log())
  }

  throwServerError() {
    this.portalAdministrationService.throwException().subscribe(_ => console.log())
  }

  callBadURL() {
    this.portalAdministrationService.callBadURL().subscribe(_ => console.log())
  }
}

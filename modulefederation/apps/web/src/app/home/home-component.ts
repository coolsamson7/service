import { Component } from "@angular/core";
import { Feature, ShortcutManager, Translator } from "@modulefederation/portal";
import { MatDialog } from "@angular/material/dialog";
import { tap } from "rxjs/operators";
import { PreferencesDialog } from "./preferences-dialog";
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

  constructor(private portalAdministrationService : PortalAdministrationService, private dialog : MatDialog, private translator: Translator, private shortcutManager: ShortcutManager) {
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

  preferences() {
    this.shortcutManager.pushLevel()

    let configuration = {
      title: "Preferences"
    }

    const dialogRef = this.dialog.open(PreferencesDialog, {
      height: '40%',
      width: '60%',
      data: configuration
    });

    return dialogRef.afterClosed().pipe(tap(() => this.shortcutManager.popLevel()))

  }
}

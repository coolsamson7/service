import { Component } from "@angular/core";
import { Feature, InputDialog, ShortcutManager, Translator } from "@modulefederation/portal";
import { AnalyticsDisableModule } from "@angular/cli/src/commands/analytics/settings/cli";
import { MatDialog } from "@angular/material/dialog";
import { tap } from "rxjs/operators";
import { PreferencesDialog } from "./preferences-dialog";

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

  constructor(private dialog : MatDialog, private translator: Translator, private shortcutManager: ShortcutManager) {
  }

  throwString() {
    throw "ouch"
  }

  throwError() {
    throw new Error("aua")
  }

  preferences() {
    this.shortcutManager.pushLevel()

    let configuration = {
      title: "Preferences"
    }

    const dialogRef = this.dialog.open(PreferencesDialog, {
      data: configuration
    });

    return dialogRef.afterClosed().pipe(tap(() => this.shortcutManager.popLevel()))

  }
}

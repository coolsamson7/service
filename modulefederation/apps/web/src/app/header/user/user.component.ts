import { Component } from "@angular/core";
import { Dialogs, LocaleManager, Session, SessionManager, ShortcutManager, Ticket } from "@modulefederation/portal";
import { MatButtonModule } from "@angular/material/button";
import { CommonModule } from "@angular/common";
import { MatMenuModule } from "@angular/material/menu";
import { UserProfileAdministrationService } from "../../user/user-profile-administration-service.service";
import { MatDividerModule } from "@angular/material/divider";
import { PreferencesDialog } from "../../home/preferences-dialog";


@Component({
    selector: 'user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss'],
    standalone: true,
  imports: [CommonModule, MatButtonModule, MatMenuModule, MatDividerModule]
})
export class UserComponent {
    // constructor

    constructor(private dialogs : Dialogs, localeManager: LocaleManager, public sessionManager : SessionManager, userProfileAdministrationService : UserProfileAdministrationService) {
      sessionManager.addListener({
        closed(session : Session<any, Ticket>) : void {
        },
        closing(session : Session<any, Ticket>) : void {
        },
        opened(session : Session<any, Ticket>) : void {
          let user = session.user.preferred_username

          userProfileAdministrationService.readProfile(user).subscribe(profile => {
            session.locale = profile.locale

            localeManager.setLocale(profile.locale)
          })
        },
        opening(session : Session<any, Ticket>) : void {
        }
      })
    }

    // public

  openPreferences() {
    let configuration = {
      title: "Preferences"
    }

    return this.dialogs.open(PreferencesDialog, configuration);
  }
}

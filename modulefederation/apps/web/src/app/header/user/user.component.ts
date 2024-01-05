import { Component } from "@angular/core";
import { Dialogs, LocaleManager, Session, SessionManager, ShortcutManager, Ticket } from "@modulefederation/portal";
import { MatButtonModule } from "@angular/material/button";
import { CommonModule } from "@angular/common";
import { MatMenuModule } from "@angular/material/menu";
import { UserProfileAdministrationService } from "../../user/user-profile-administration-service.service";
import { MatDividerModule } from "@angular/material/divider";
import { PreferencesDialog } from "../../home/preferences-dialog";
import { UserProfile } from "../../user/user-profile.interface";


@Component({
    selector: 'user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss'],
    standalone: true,
  imports: [CommonModule, MatButtonModule, MatMenuModule, MatDividerModule]
})
export class UserComponent {
  // instance data

  userProfile?: UserProfile
  locales : string[]

    // constructor
    constructor(private dialogs : Dialogs, private localeManager: LocaleManager, public sessionManager : SessionManager, private userProfileAdministrationService : UserProfileAdministrationService) {
       let outerThis = this
    sessionManager.addListener({
        closed(session : Session<any, Ticket>) : void {
        },
        closing(session : Session<any, Ticket>) : void {
        },
        opened(session : Session<any, Ticket>) : void {
          let user = session.user.preferred_username

          userProfileAdministrationService.readProfile(user).subscribe(userProfile => {
            outerThis.userProfile = userProfile
            session.locale = userProfile.locale

            localeManager.setLocale(userProfile.locale)
          })
        },
        opening(session : Session<any, Ticket>) : void {
        }
      })

      this.locales = localeManager.supportedLocales
    }

    // public

  selectLocale(locale: string) {
    this.localeManager.setLocale(locale)
    this.userProfile!!.locale = locale
    this.userProfileAdministrationService.updateProfile(this.userProfile!!)
  }

  openPreferences() {
    let configuration = {
      title: "Preferences"
    }

    return this.dialogs.open(PreferencesDialog, configuration);
  }
}

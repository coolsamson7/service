import { Component } from "@angular/core";
import { DialogService, LocaleManager, Session, SessionManager, Ticket } from "@modulefederation/portal";
import { MatButtonModule } from "@angular/material/button";
import { CommonModule } from "@angular/common";
import { MatMenuModule } from "@angular/material/menu";
import { UserProfileAdministrationService } from "../../user/user-profile-administration-service.service";
import { MatDividerModule } from "@angular/material/divider";
import { PreferencesDialog } from "../../home/preferences-dialog";
import { UserProfile } from "../../user/user-profile.interface";
import { filter } from "rxjs";


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
    constructor(private dialogs : DialogService, private localeManager: LocaleManager, public sessionManager : SessionManager, private userProfileAdministrationService : UserProfileAdministrationService) {
       sessionManager.events$
       .pipe(filter(event => event.type == "opened"))
       .subscribe(event => {
          const user = event.session.user.preferred_username

          userProfileAdministrationService.readProfile(user).subscribe(userProfile => {
            this.userProfile = userProfile
            event.session.locale = userProfile.locale

            localeManager.setLocale(userProfile.locale)
          })})


        this.locales = localeManager.supportedLocales
      }

    // public

  selectLocale(locale: string) {
    this.localeManager.setLocale(locale)
    this.userProfile!.locale = locale
    this.userProfileAdministrationService.updateProfile(this.userProfile!)
  }

  openPreferences() {
    const configuration = {
      data: {
        title: "Preferences"
      }
    }

    return this.dialogs.openDialog(PreferencesDialog, configuration);
  }
}

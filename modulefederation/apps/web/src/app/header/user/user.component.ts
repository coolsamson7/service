import { Component } from "@angular/core";
import { LocaleManager, Session, SessionManager, Ticket } from "@modulefederation/portal";
import { MatButtonModule } from "@angular/material/button";
import { CommonModule } from "@angular/common";
import { MatMenuModule } from "@angular/material/menu";
import { UserProfileAdministrationService } from "../../user/user-profile-administration-service.service";



@Component({
    selector: 'user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss'],
    standalone: true,
  imports: [CommonModule, MatButtonModule, MatMenuModule]
})
export class UserComponent {
    // constructor

    constructor(private localeManager: LocaleManager, public sessionManager : SessionManager, private userProfileAdministrationService : UserProfileAdministrationService) {
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
}

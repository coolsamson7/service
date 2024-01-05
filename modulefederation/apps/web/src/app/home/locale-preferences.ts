import { Dialogs, Feature, FeatureData, LocaleManager, SessionManager } from "@modulefederation/portal";
import { Component, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatCommonModule } from "@angular/material/core";
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { MatDialogModule } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { FormsModule, NgForm } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatListModule } from "@angular/material/list";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { PreferencesDialog, PreferencesFeature } from "./preferences-dialog";
import { UserProfileAdministrationService } from "../user/user-profile-administration-service.service";
import { UserProfile } from "../user/user-profile.interface";
import { MatSelectModule } from "@angular/material/select";

@Feature({
  i18n: [],
  id: "language-preferences",
  label: "Language",
  tags: ["preferences"]
})
@Component({
  selector: 'language-preferences',
  templateUrl: './locale-preferences.html',
  styleUrls: ['./locale-preferences.scss'],
  standalone: true,
  imports: [CommonModule, MatSelectModule, MatCommonModule, MatInputModule, MatIconModule, MatDialogModule, MatButtonModule, FormsModule, MatFormFieldModule, MatListModule]
})
export class LocalePreferences extends PreferencesFeature {
  // instance data

  @ViewChild('form') public form! : NgForm
  userProfile?: UserProfile
  locales: string[] = []

  // constructor

  constructor(dialog : PreferencesDialog, private localeManager: LocaleManager, private dialogs: Dialogs, private userProfileAdministrationService: UserProfileAdministrationService, private sessionManager: SessionManager) {
    super(dialog, Reflect.get(LocalePreferences, '$$feature') as FeatureData)

    this.locales = localeManager.supportedLocales

    // read user profile

    userProfileAdministrationService.readProfile(sessionManager.getUser().preferred_username)
      .subscribe(profile => {
        this.userProfile = profile
      })
  }

  changed() {
  }

  // override PreferencesFeature

  override save() {
    this.localeManager.setLocale(this.userProfile!!.locale)
    this.userProfileAdministrationService.updateProfile(this.userProfile!!).subscribe()
  }

  override isDirty() : boolean {
    return this.form.dirty == true
  }

  override canSave() : Observable<boolean> {
    return this.dialogs.confirmationDialog()
      .title("Dirty changes")
      .message("Do you want to save?")
      .okCancel()
      .show()
      .pipe(tap(ok => {if (ok) this.save()}))
  }
}
